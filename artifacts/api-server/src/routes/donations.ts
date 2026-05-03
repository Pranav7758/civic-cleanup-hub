import { Router } from "express";
import { db } from "@workspace/db";
import { donations, walletTransactions, cleanlinessScores, profiles } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/donations", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { citizenId, ngoId, status } = req.query;
    let query = db.select().from(donations);
    const conditions: any[] = [];
    if (citizenId) conditions.push(eq(donations.citizenId, String(citizenId)));
    if (ngoId) conditions.push(eq(donations.ngoId, String(ngoId)));
    if (status) conditions.push(eq(donations.status, String(status)));
    if (!citizenId && !ngoId) conditions.push(eq(donations.citizenId, user.id));
    if (conditions.length) query = query.where(and(...conditions)) as any;
    const data = await query.orderBy(desc(donations.createdAt)).limit(50);
    const enriched = await Promise.all(data.map(async (d: any) => {
      const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, d.citizenId)).limit(1);
      return { ...d, citizenName: p?.fullName || null };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/donations", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { category, description, imageUrl, address, latitude, longitude, scheduledAt } = req.body || {};
    if (!category) { const e: any = new Error("Category required"); e.status = 400; throw e; }
    const [donation] = await db.insert(donations).values({
      citizenId: user.id,
      category,
      description: description || null,
      imageUrl: imageUrl || null,
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
      scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
    }).returning();
    res.json({ data: donation });
  } catch (err) { next(err); }
});

router.patch("/donations/:id", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { status, ngoId, proofImageUrl, rewardPoints } = req.body || {};
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") updateData.completedAt = new Date();
    }
    if (ngoId !== undefined) updateData.ngoId = ngoId;
    if (proofImageUrl !== undefined) updateData.proofImageUrl = proofImageUrl;
    if (rewardPoints !== undefined) updateData.rewardPoints = rewardPoints;
    const [updated] = await db.update(donations).set(updateData).where(eq(donations.id, req.params.id)).returning();
    if (status === "completed" && updated) {
      const points = rewardPoints || 60;
      await db.insert(walletTransactions).values({
        userId: updated.citizenId, type: "earned", action: "Donation Completed", points,
        referenceId: updated.id, referenceType: "donations",
      });
      await db.update(cleanlinessScores).set({ score: sql`score + ${points}`, totalDonations: sql`total_donations + 1`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, updated.citizenId));
    }
    res.json({ data: updated });
  } catch (err) { next(err); }
});

export default router;
