/**
 * Seed script to create a user and assign existing applications to them.
 *
 * Usage:
 *   npx tsx scripts/seed-user.ts <email> <password> <name>
 *
 * Example:
 *   npx tsx scripts/seed-user.ts kaif@example.com mypassword "Kaif"
 *
 * This will:
 *   1. Create a user with the given credentials
 *   2. Assign all applications with NULL userId to the new user
 *
 * Requires TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars (use .env.local).
 */

import { createClient } from "@libsql/client";
import { drizzle } from "drizzle-orm/libsql";
import { users, applications } from "../src/db/schema";
import { isNull, eq } from "drizzle-orm";
import * as dotenv from "dotenv";
import * as path from "path";

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function main() {
  const [email, password, name] = process.argv.slice(2);

  if (!email || !password || !name) {
    console.error("Usage: npx tsx scripts/seed-user.ts <email> <password> <name>");
    process.exit(1);
  }

  const client = createClient({
    url: process.env.TURSO_DATABASE_URL!,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  const db = drizzle(client);

  const userId = crypto.randomUUID();
  const passwordHash = await hashPassword(password);

  // Create user
  await db.insert(users).values({
    id: userId,
    email,
    passwordHash,
    name,
    createdAt: new Date().toISOString(),
  });

  console.log(`✓ Created user: ${email} (id: ${userId})`);

  // Backfill existing applications with NULL userId
  const result = await db
    .update(applications)
    .set({ userId })
    .where(isNull(applications.userId));

  console.log(`✓ Assigned orphaned applications to user: ${email}`);
  console.log("\nDone! You can now log in with these credentials.");
}

main().catch((err) => {
  console.error("Error:", err);
  process.exit(1);
});
