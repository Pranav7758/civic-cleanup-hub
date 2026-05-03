import { Router } from "express";
import { db } from "@workspace/db";
import { communityPosts, profiles } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/feed", async (req, res, next) => {
  try {
    await requireAuth(req);
    const posts = await db.select().from(communityPosts).orderBy(desc(communityPosts.createdAt)).limit(50);
    const enriched = await Promise.all(posts.map(async (p: any) => {
      let ngoName = null, citizenName = null;
      if (p.ngoId) {
        const [ngo] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, p.ngoId)).limit(1);
        ngoName = ngo?.fullName || null;
      }
      if (p.citizenId) {
        const [cit] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, p.citizenId)).limit(1);
        citizenName = cit?.fullName || null;
      }
      return { ...p, ngoName, citizenName };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/feed", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { content, imageUrl, donationId, citizenId } = req.body || {};
    if (!content) { const e: any = new Error("Content required"); e.status = 400; throw e; }
    const [post] = await db.insert(communityPosts).values({
      content, imageUrl: imageUrl || null,
      ngoId: user.id, citizenId: citizenId || null, donationId: donationId || null,
    }).returning();
    res.json({ data: { ...post, ngoName: null, citizenName: null } });
  } catch (err) { next(err); }
});

export default router;
