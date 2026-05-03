import crypto from "crypto";
import { db } from "@workspace/db";
import { appUsers, userRoles, profiles, cleanlinessScores } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function generateDustbinCode() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const DEMO_ACCOUNTS = [
  { email: "citizen@civic.dev",  password: "password123", fullName: "Demo Citizen",       role: "citizen"      },
  { email: "worker@civic.dev",   password: "password123", fullName: "Demo Worker",         role: "worker"       },
  { email: "admin@civic.dev",    password: "password123", fullName: "Demo Admin",           role: "admin"        },
  { email: "ngo@civic.dev",      password: "password123", fullName: "Demo NGO User",        role: "ngo"          },
  { email: "scrap@civic.dev",    password: "password123", fullName: "Demo Scrap Dealer",    role: "scrap_dealer" },
];

export async function seedDemoAccounts() {
  for (const account of DEMO_ACCOUNTS) {
    try {
      const existing = await db
        .select({ id: appUsers.id })
        .from(appUsers)
        .where(eq(appUsers.email, account.email))
        .limit(1);

      if (existing.length > 0) continue;

      const [user] = await db
        .insert(appUsers)
        .values({
          email: account.email,
          passwordHash: hashPassword(account.password),
          fullName: account.fullName,
        })
        .returning({ id: appUsers.id });

      let dustbinCode = generateDustbinCode();
      await db.insert(profiles).values({
        userId: user.id,
        fullName: account.fullName,
        dustbinCode,
      }).onConflictDoNothing();

      await db.insert(userRoles).values({
        userId: user.id,
        role: account.role,
      }).onConflictDoNothing();

      await db.insert(cleanlinessScores).values({ userId: user.id }).onConflictDoNothing();

      logger.info({ email: account.email, role: account.role }, "Demo account created");
    } catch (err: any) {
      if (err?.code === "23505") continue;
      logger.warn({ email: account.email, err: err?.message }, "Could not seed demo account");
    }
  }
}
