import { Router } from "express";
import { db } from "@workspace/db";
import { profiles } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/profiles/me", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, user.id)).limit(1);
    res.json({ data: profile || null });
  } catch (err) { next(err); }
});

router.patch("/profiles/me", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { fullName, phone, avatarUrl, address, city, ward } = req.body || {};
    const updateData: any = { updatedAt: new Date() };
    if (fullName !== undefined) updateData.fullName = fullName;
    if (phone !== undefined) updateData.phone = phone;
    if (avatarUrl !== undefined) updateData.avatarUrl = avatarUrl;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (ward !== undefined) updateData.ward = ward;

    const [updated] = await db.update(profiles).set(updateData).where(eq(profiles.userId, user.id)).returning();
    res.json({ data: updated });
  } catch (err) { next(err); }
});

router.get("/profiles/:userId", async (req, res, next) => {
  try {
    await requireAuth(req);
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, req.params.userId)).limit(1);
    if (!profile) {
      const err: any = new Error("Profile not found"); err.status = 404; throw err;
    }
    res.json({ data: profile });
  } catch (err) { next(err); }
});

export default router;
