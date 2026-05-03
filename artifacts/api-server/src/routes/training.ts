import { Router } from "express";
import { db } from "@workspace/db";
import { trainingModules, trainingProgress, walletTransactions, cleanlinessScores } from "@workspace/db";
import { eq, asc, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/training/modules", async (req, res, next) => {
  try {
    await requireAuth(req);
    const data = await db.select().from(trainingModules).orderBy(asc(trainingModules.sortOrder));
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/training/progress", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db.select().from(trainingProgress).where(eq(trainingProgress.userId, user.id));
    res.json({ data });
  } catch (err) { next(err); }
});

router.post("/training/progress", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { moduleId, progress, completed } = req.body || {};
    if (!moduleId) { const e: any = new Error("Module ID required"); e.status = 400; throw e; }

    const existing = await db.select().from(trainingProgress)
      .where(eq(trainingProgress.userId, user.id))
      .limit(50);
    const currentProgress = existing.find((p: any) => p.moduleId === moduleId);
    let result: any;

    if (currentProgress) {
      const [updated] = await db.update(trainingProgress).set({
        progress: progress,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
        updatedAt: new Date(),
      } as any).where(eq(trainingProgress.id, currentProgress.id)).returning();
      result = updated;
    } else {
      const [created] = await db.insert(trainingProgress).values({
        userId: user.id, moduleId, progress: progress || 0,
        completed: completed || false,
        completedAt: completed ? new Date() : null,
      }).returning();
      result = created;
    }

    if (completed && !currentProgress?.completed) {
      await db.insert(walletTransactions).values({
        userId: user.id, type: "earned", action: "Training Module Completed", points: 75,
        referenceId: moduleId, referenceType: "training_modules",
      });
      await db.update(cleanlinessScores).set({ score: sql`score + 75`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, user.id));
    }

    res.json({ data: result });
  } catch (err) { next(err); }
});

export default router;
