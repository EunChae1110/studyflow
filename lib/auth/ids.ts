/** UUID v4-ish (accepts any RFC-4122 variant hex UUID). */
const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function isUserId(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value.trim());
}

export function assertUserId(value: unknown, label = "userId"): string {
  if (!isUserId(value)) {
    throw new Error(`Invalid ${label}: expected a UUID`);
  }
  return value.trim();
}
