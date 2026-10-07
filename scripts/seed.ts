import { config } from "dotenv";
config({ path: ".env.local" });
config({ path: ".env" });

import { ensureDemoUserAndAssignment } from "../lib/db/queries";

async function main() {
  const result = await ensureDemoUserAndAssignment();
  if (!result) {
    console.error("Seed failed: database unavailable or error.");
    process.exit(1);
  }
  console.log("Seeded demo user + assignment:", result);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
