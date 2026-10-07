# StudyFlow

**Turn every assignment into a clear, evidence-based workflow.**

StudyFlow is a production-style Next.js App Router web app for university students.
It focuses on learning support workflows (understand, organise, verify, check logic, build evidence)
and intentionally avoids essay-generation actions.

## Stack

- Next.js App Router + React + TypeScript
- Tailwind CSS
- shadcn/ui + Lucide React
- Radix UI primitives (collapsible/dialog usage)
- Framer Motion (subtle transitions)
- Recharts (dashboard chart)
- React Hook Form + Zod (draft planning workflow)
- TanStack Table (references view)

## Local development

```bash
npm install
npm run dev
```

The app will run at the URL printed by Next.js (for example `http://localhost:3000`).

### Production build

```bash
npm run build
npm run start
```

## Main routes

### Workspace shell routes

- `/dashboard`
- `/assignments`
- `/courses`
- `/calendar`
- `/research-library`

### Assignment workspace routes

- `/assignments/database-normalisation-report/brief`
- `/assignments/database-normalisation-report/notes`
- `/assignments/database-normalisation-report/research`
- `/assignments/database-normalisation-report/outline`
- `/assignments/database-normalisation-report/draft`
- `/assignments/database-normalisation-report/references`
- `/assignments/database-normalisation-report/claim-evidence`

## Product guardrails implemented

- Notes-only mode explicitly disables external sources
- Citation badges include source + page
- Source provenance labels distinguish:
  - Lecture notes
  - External research
  - AI summary
  - Source quotes
  - Student content
  - Student-verified evidence
- No "Generate essay" primary workflow anywhere in UI

## Design basis

- Imported HTML/CSS/JS prototype screens from the provided archive
- Styled to match the provided StudyFlow visual tokens and layouts
- Includes responsive shell with:
  - Desktop sidebar + optional right AI panel
  - Mobile drawer navigation + bottom nav + AI bottom sheet
