"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { loginSchema, signupSchema } from "@/lib/auth/schemas";
import {
  clearSessionCookie,
  setSessionCookie,
} from "@/lib/auth/session";
import { getDb, isDatabaseConfigured } from "@/lib/db";
import { users } from "@/lib/db/schema";

export type AuthActionState = {
  ok: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
};

function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return `${parts[0]![0] ?? ""}${parts[1]![0] ?? ""}`.toUpperCase();
}

function dbUnavailable(): AuthActionState {
  return { ok: false, error: "Database is not configured." };
}

export async function loginAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Check your email and password.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (!user?.passwordHash) {
    return { ok: false, error: "Invalid email or password." };
  }

  const valid = await verifyPassword(parsed.data.password, user.passwordHash);
  if (!valid) {
    return { ok: false, error: "Invalid email or password." };
  }

  await setSessionCookie({ userId: user.id, email: user.email });
  redirect("/dashboard");
}

export async function signupAction(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  if (!isDatabaseConfigured()) return dbUnavailable();
  const db = getDb();
  if (!db) return dbUnavailable();

  const parsed = signupSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    password: formData.get("password"),
    confirmPassword: formData.get("confirmPassword"),
  });

  if (!parsed.success) {
    return {
      ok: false,
      error: "Please fix the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const email = parsed.data.email.toLowerCase();
  const [existing] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  if (existing) {
    return {
      ok: false,
      error: "An account with this email already exists.",
      fieldErrors: { email: ["Email already in use"] },
    };
  }

  const passwordHash = await hashPassword(parsed.data.password);
  const [created] = await db
    .insert(users)
    .values({
      name: parsed.data.name,
      email,
      passwordHash,
      initials: initialsFromName(parsed.data.name),
      tagline: "Turn every assignment into a clear, evidence-based workflow.",
    })
    .returning({ id: users.id, email: users.email });

  await setSessionCookie({ userId: created.id, email: created.email });
  redirect("/dashboard");
}

export async function logoutAction(): Promise<void> {
  await clearSessionCookie();
  redirect("/login");
}
