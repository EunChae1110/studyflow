import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

export type StudyflowDb = PostgresJsDatabase<typeof schema>;

const globalForDb = globalThis as unknown as {
  studyflowSql?: ReturnType<typeof postgres>;
  studyflowDb?: StudyflowDb;
};

function createClient(url: string) {
  return postgres(url, {
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
    prepare: false,
  });
}

export function getDatabaseUrl(): string | undefined {
  const url = process.env.DATABASE_URL?.trim();
  return url || undefined;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(getDatabaseUrl());
}

export function getDb(): StudyflowDb | null {
  const url = getDatabaseUrl();
  if (!url) return null;

  if (!globalForDb.studyflowDb || !globalForDb.studyflowSql) {
    globalForDb.studyflowSql = createClient(url);
    globalForDb.studyflowDb = drizzle(globalForDb.studyflowSql, { schema });
  }

  return globalForDb.studyflowDb;
}

export { schema };
