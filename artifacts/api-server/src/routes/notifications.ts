import { Router } from "express";
import { db } from "@workspace/db";
import { notifications, messages, profiles } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/notifications", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db.select().from(notifications).where(eq(notifications.userId, user.id)).orderBy(desc(notifications.createdAt)).limit(50);
    res.json({ data });
  } catch (err) { next(err); }
});

router.patch("/notifications/:id/read", async (req, res, next) => {
  try {
    await requireAuth(req);
    await db.update(notifications).set({ read: true }).where(eq(notifications.id, req.params.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

router.patch("/notifications/read-all", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    await db.update(notifications).set({ read: true }).where(eq(notifications.userId, user.id));
    res.json({ ok: true });
  } catch (err) { next(err); }
});

// Messages
router.get("/messages/:referenceId", async (req, res, next) => {
  try {
    await requireAuth(req);
    const msgs = await db.select().from(messages).where(eq(messages.referenceId, req.params.referenceId)).orderBy(desc(messages.createdAt));
    const enriched = await Promise.all(msgs.map(async (m: any) => {
      const [p] = await db.select({ fullName: profiles.fullName, avatarUrl: profiles.avatarUrl }).from(profiles).where(eq(profiles.userId, m.senderId)).limit(1);
      return { ...m, senderName: p?.fullName || null, senderAvatar: p?.avatarUrl || null };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/messages", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { receiverId, content, referenceId } = req.body || {};
    if (!receiverId || !content) { const e: any = new Error("Missing data"); e.status = 400; throw e; }
    const [msg] = await db.insert(messages).values({
      senderId: user.id, receiverId, content, referenceId: referenceId || null,
    }).returning();
    const [p] = await db.select({ fullName: profiles.fullName, avatarUrl: profiles.avatarUrl }).from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    res.json({ data: { ...msg, senderName: p?.fullName || null, senderAvatar: p?.avatarUrl || null } });
  } catch (err) { next(err); }
});

export default router;
