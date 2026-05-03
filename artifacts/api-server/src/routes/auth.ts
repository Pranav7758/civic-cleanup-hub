import { Router } from "express";
import crypto from "crypto";
import { db } from "@workspace/db";
import { appUsers, sessions, userRoles, profiles, cleanlinessScores } from "@workspace/db";
import { eq, and, gt } from "drizzle-orm";
import { logger } from "../lib/logger";

const router = Router();

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  try {
    const parts = stored?.split(":");
    if (!parts || parts.length < 2) return false;
    const [salt, hash] = parts;
    if (!/^[0-9a-f]+$/i.test(hash)) return false;
    return crypto.timingSafeEqual(
      Buffer.from(hash, "hex"),
      Buffer.from(hashPassword(password, salt).split(":")[1], "hex")
    );
  } catch {
    return false;
  }
}

function generateDustbinCode() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await db.insert(sessions).values({ token, userId, expiresAt });
  return token;
}

async function createProfileForUser(userId: string, fullName: string, phone?: string) {
  let attempts = 0;
  while (attempts < 5) {
    try {
      await db.insert(profiles).values({
        userId,
        fullName,
        phone: phone || null,
        dustbinCode: generateDustbinCode(),
      }).onConflictDoNothing();
      break;
    } catch (err: any) {
      if (err?.code === "23505" && String(err?.constraint || "").includes("dustbin_code")) {
        attempts++;
        continue;
      }
      throw err;
    }
  }
  await db.insert(cleanlinessScores).values({ userId }).onConflictDoNothing();
}

export async function getAuthUser(authHeader?: string) {
  if (!authHeader?.startsWith("Bearer ")) return null;
  const token = authHeader.slice(7);
  const now = new Date();
  const result = await db
    .select({ id: appUsers.id, email: appUsers.email, fullName: appUsers.fullName })
    .from(sessions)
    .innerJoin(appUsers, eq(sessions.userId, appUsers.id))
    .where(and(eq(sessions.token, token), gt(sessions.expiresAt, now)))
    .limit(1);
  return result[0] || null;
}

export async function requireAuth(req: any) {
  const user = await getAuthUser(req.headers.authorization);
  if (!user) {
    const err: any = new Error("Authentication required");
    err.status = 401;
    throw err;
  }
  return user;
}

export async function getUserRoles(userId: string): Promise<string[]> {
  const roles = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, userId));
  return roles.map(r => r.role);
}

export async function hasRole(userId: string, role: string) {
  const roles = await getUserRoles(userId);
  return roles.includes(role) || roles.includes("admin");
}

router.post("/auth/signup", async (req, res, next) => {
  try {
    const { email, password, fullName, role, phone } = req.body || {};
    if (!email || !password || !fullName || !role) {
      const err: any = new Error("Email, password, full name, and role are required");
      err.status = 400;
      throw err;
    }
    const [user] = await db.insert(appUsers).values({
      email: String(email).toLowerCase(),
      passwordHash: hashPassword(password),
      fullName,
    }).returning({ id: appUsers.id, email: appUsers.email, fullName: appUsers.fullName });

    await createProfileForUser(user.id, fullName, phone);
    await db.insert(userRoles).values({ userId: user.id, role }).onConflictDoNothing();

    const token = await createSession(user.id);
    const roles = await getUserRoles(user.id);

    let redirectTo = "/citizen";
    if (role === "admin") redirectTo = "/admin";
    else if (role === "worker") redirectTo = "/worker";
    else if (role === "ngo") redirectTo = "/ngo";
    else if (role === "scrap_dealer") redirectTo = "/scrap";

    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName }, token, roles, redirectTo });
  } catch (err: any) {
    if (err?.code === "23505") {
      err.message = "An account with this email already exists";
      err.status = 400;
    }
    next(err);
  }
});

router.post("/auth/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) {
      const err: any = new Error("Email and password are required");
      err.status = 400;
      throw err;
    }
    const users = await db.select().from(appUsers).where(eq(appUsers.email, String(email).toLowerCase())).limit(1);
    const user = users[0];
    if (!user || !verifyPassword(password, user.passwordHash)) {
      const err: any = new Error("Invalid email or password");
      err.status = 401;
      throw err;
    }

    await createProfileForUser(user.id, user.fullName);
    const token = await createSession(user.id);
    const roles = await getUserRoles(user.id);

    let redirectTo = "/citizen";
    if (roles.includes("admin")) redirectTo = "/admin";
    else if (roles.includes("worker")) redirectTo = "/worker";
    else if (roles.includes("ngo")) redirectTo = "/ngo";
    else if (roles.includes("scrap_dealer")) redirectTo = "/scrap";

    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName }, token, roles, redirectTo });
  } catch (err) {
    next(err);
  }
});

router.post("/auth/signout", async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) await db.delete(sessions).where(eq(sessions.token, token));
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

router.get("/auth/me", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const roles = await getUserRoles(user.id);
    res.json({ user: { id: user.id, email: user.email, fullName: user.fullName }, roles });
  } catch (err) {
    next(err);
  }
});

export default router;
