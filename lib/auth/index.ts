import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { isUserId } from "@/lib/auth/ids";
import {
  clearSessionCookie,
  getSession,
  type SessionPayload,
} from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { StudentProfile } from "@/lib/types";

export type AuthUser = {
  id: string;
  name: string;
  email: string;
  initials: string;
  tagline: string | null;
};

export async function getSessionPayload(): Promise<SessionPayload | null> {
  return getSession();
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getSession();
  if (!session || !isUserId(session.userId)) {
    return null;
  }

  const db = getDb();
  if (!db) return null;

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      initials: users.initials,
      tagline: users.tagline,
    })
    .from(users)
    .where(eq(users.id, session.userId))
    .limit(1);

  if (!user || !isUserId(user.id)) return null;

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    initials: user.initials?.trim() || user.name.slice(0, 2).toUpperCase(),
    tagline: user.tagline,
  };
}

export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user || !isUserId(user.id)) {
    // Drop corrupt / expired cookies so proxy + RSC agree on logged-out state.
    try {
      await clearSessionCookie();
    } catch {
      // ignore — redirect still sends the user to login
    }
    redirect("/login");
  }
  return user;
}

export function toStudentProfile(user: AuthUser): StudentProfile {
  return {
    id: user.id,
    name: user.name,
    initials: user.initials,
    tagline: user.tagline,
  };
}

export {
  loginAction,
  signupAction,
  logoutAction,
  type AuthActionState,
} from "@/lib/auth/actions";
