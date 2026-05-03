import { Router } from "express";
import { db } from "@workspace/db";
import { communityEvents, eventRegistrations, walletTransactions, cleanlinessScores } from "@workspace/db";
import { eq, desc, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/events", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const events = await db.select().from(communityEvents).orderBy(desc(communityEvents.startsAt)).limit(20);
    const enriched = await Promise.all(events.map(async (e: any) => {
      const regCount = await db.select({ count: sql<number>`count(*)` }).from(eventRegistrations).where(eq(eventRegistrations.eventId, e.id));
      const myReg = await db.select().from(eventRegistrations).where(eq(eventRegistrations.eventId, e.id)).limit(20);
      const isRegistered = myReg.some((r: any) => r.userId === user.id);
      return { ...e, registrationCount: Number(regCount[0]?.count || 0), isRegistered };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/events", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { title, description, eventType, location, latitude, longitude, startsAt, endsAt, maxParticipants, rewardPoints, imageUrl } = req.body || {};
    if (!title || !startsAt) { const e: any = new Error("Title and start date required"); e.status = 400; throw e; }
    const [event] = await db.insert(communityEvents).values({
      title, description: description || null, eventType: eventType || "cleanup",
      location: location || null, latitude: latitude || null, longitude: longitude || null,
      startsAt: new Date(startsAt), endsAt: endsAt ? new Date(endsAt) : null,
      maxParticipants: maxParticipants || null, rewardPoints: rewardPoints || 100,
      imageUrl: imageUrl || null, organizerId: user.id,
    }).returning();
    res.json({ data: { ...event, registrationCount: 0, isRegistered: false } });
  } catch (err) { next(err); }
});

router.get("/events/my-registrations", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const regs = await db.select().from(eventRegistrations).where(eq(eventRegistrations.userId, user.id)).orderBy(desc(eventRegistrations.createdAt));
    const enriched = await Promise.all(regs.map(async (r: any) => {
      const [event] = await db.select().from(communityEvents).where(eq(communityEvents.id, r.eventId)).limit(1);
      return { ...r, event };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/events/:id/register", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    await db.insert(eventRegistrations).values({ eventId: req.params.id, userId: user.id }).onConflictDoNothing();
    await db.update(cleanlinessScores).set({ totalEvents: sql`total_events + 1`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, user.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
