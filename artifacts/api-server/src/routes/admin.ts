import { Router } from "express";
import { db } from "@workspace/db";
import { appUsers, userRoles, cleanlinessScores, trainingModules, redeemItems } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/admin/users", async (req, res, next) => {
  try {
    await requireAuth(req);
    const users = await db.select().from(appUsers).orderBy(desc(appUsers.createdAt)).limit(100);
    const enriched = await Promise.all(users.map(async (u: any) => {
      const roles = await db.select({ role: userRoles.role }).from(userRoles).where(eq(userRoles.userId, u.id));
      const [score] = await db.select({ score: cleanlinessScores.score }).from(cleanlinessScores).where(eq(cleanlinessScores.userId, u.id)).limit(1);
      return { id: u.id, email: u.email, fullName: u.fullName, createdAt: u.createdAt, roles: roles.map(r => r.role), score: score?.score || 0 };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.patch("/admin/users/:id/roles", async (req, res, next) => {
  try {
    await requireAuth(req);
    const { roles } = req.body || {};
    if (!Array.isArray(roles)) { const e: any = new Error("Roles must be an array"); e.status = 400; throw e; }
    await db.delete(userRoles).where(eq(userRoles.userId, req.params.id));
    if (roles.length) {
      await db.insert(userRoles).values(roles.map((role: string) => ({ userId: req.params.id, role }))).onConflictDoNothing();
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.post("/admin/training-modules", async (req, res, next) => {
  try {
    await requireAuth(req);
    const { title, description, icon, durationMinutes, lessonCount, sortOrder, requiresPrevious } = req.body || {};
    if (!title) { const e: any = new Error("Title required"); e.status = 400; throw e; }
    const [module] = await db.insert(trainingModules).values({ title, description: description || null, icon: icon || "BookOpen", durationMinutes: durationMinutes || 15, lessonCount: lessonCount || 3, sortOrder: sortOrder || 0, requiresPrevious: requiresPrevious !== false }).returning();
    res.json({ data: module });
  } catch (err) { next(err); }
});

router.post("/admin/redeem-items", async (req, res, next) => {
  try {
    await requireAuth(req);
    const { title, description, pointsCost, stock, imageEmoji, active } = req.body || {};
    if (!title || !pointsCost) { const e: any = new Error("Title and points cost required"); e.status = 400; throw e; }
    const [item] = await db.insert(redeemItems).values({ title, description: description || null, pointsCost, stock: stock || null, imageEmoji: imageEmoji || "🎁", active: active !== false }).returning();
    res.json({ data: item });
  } catch (err) { next(err); }
});

export default router;
