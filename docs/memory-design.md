# StudyFlow memory design

## Decision (hybrid — do not pick only one)

**Primary working memory = assignment-scoped.**  
Each chat turn injects a context pack built from *this* assignment: brief/question, requirements/rubric, notes, research sources, claims+evidence, outline. Matches task focus and session TTL; prevents stale leakage across unrelated essays.

**Durable layer = course-scoped.**  
Standing preferences, recurring misconceptions/skills, and course-level material notes live under `scope=course` and are hard-filtered by `courseId` (never cross-course).

**Short-term = conversation history.**  
`ai_conversations` / `ai_messages` for the open thread (and resumable history UI). Recent turns already travel in the chat request; DB history is used when resuming.

**Optional user prefs = `scope=user`.**  
Citation style preference, language, coaching tone — account-wide, low volume.

Injection order into `/api/chat` system context:

1. Assignment context pack (working memory)
2. Course memories / prefs for that course
3. User prefs
4. Recent chat messages (request body + optional DB backfill on resume)

## Research summary (product patterns)

| Pattern | Scope | Analogy for StudyFlow |
|---|---|---|
| Cursor `.cursor/rules` | Repo / project contract | Course standing rules (citation style, lecturer expectations) |
| ChatGPT Projects | Project instructions + uploaded files | Course materials + course memories; project ≠ whole account |
| ChatGPT Memory | Account notepad facts | `scope=user` prefs only — keep sparse |
| Notion AI / Perplexity Spaces | Space-bound knowledge | Assignment workspace = space; course = parent space |
| LangChain buffer / summary / entity | Turn buffer, condensed history, extracted facts | Buffer = current conversation; entity-like rows = `memories` table |

Key takeaway from LangChain/agent memory literature: **layer short-term conversation memory with scoped long-term stores**, and namespace hard so facts do not bleed across tasks. Assignment-only would lose course continuity; course-only would pollute every essay with the wrong brief.

## Schema

```
memories
  id uuid PK
  user_id uuid NOT NULL → users
  scope enum('user','course','assignment') NOT NULL
  course_id uuid NULL → courses   -- required when scope=course
  assignment_id uuid NULL → assignments  -- required when scope=assignment
  kind varchar  -- preference | material_note | misconception | skill | fact | note
  content text NOT NULL
  metadata jsonb
  created_at / updated_at
```

Constraints (app-enforced + DB check where possible):

- `user`: course_id and assignment_id null
- `course`: course_id set, assignment_id null
- `assignment`: assignment_id set; course_id optional denormalized for filtering

## What is *not* stored as free-text memory

Working assignment state already lives in first-class tables (`notes`, `research_sources`, `claims`, `outlines`, …). The context pack **reads those tables** rather than duplicating them into `memories`. Use `memories` for durable coaching facts the student (or coach) wants remembered beyond a single field.

## Guardrails

- Always filter by `user_id`
- Course memories filtered by `course_id` of the active assignment
- Never inject another user's or another course's memories
- Still refuse essay generation (system prompt unchanged)
