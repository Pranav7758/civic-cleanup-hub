import { Router } from "express";
import { db } from "@workspace/db";
import { dustbins, dustbinCollections, appUsers, profiles } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

function genQrCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "ECO-";
  for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

/* ── GET /api/dustbin/my ── */
router.get("/dustbin/my", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    let [bin] = await db.select().from(dustbins).where(eq(dustbins.citizenId, user.id)).limit(1);
    if (!bin) {
      let qrCode = genQrCode();
      for (let i = 0; i < 5; i++) {
        try {
          const [created] = await db.insert(dustbins).values({ citizenId: user.id, qrCode }).returning();
          bin = created;
          break;
        } catch { qrCode = genQrCode(); }
      }
    }
    res.json({ success: true, data: bin });
  } catch (err) { next(err); }
});

/* ── POST /api/dustbin/my/level ── */
router.post("/dustbin/my/level", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { fillLevel } = req.body as { fillLevel: number };
    if (typeof fillLevel !== "number" || fillLevel < 0 || fillLevel > 100) {
      res.status(400).json({ error: "fillLevel must be 0–100" }); return;
    }
    let [bin] = await db.select().from(dustbins).where(eq(dustbins.citizenId, user.id)).limit(1);
    if (!bin) {
      const qrCode = genQrCode();
      [bin] = await db.insert(dustbins).values({ citizenId: user.id, qrCode }).returning();
    }
    const [updated] = await db
      .update(dustbins)
      .set({ fillLevel, lastLevelAt: new Date(), updatedAt: new Date() })
      .where(eq(dustbins.citizenId, user.id))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

/* ── GET /api/dustbin/scan/:qrCode ── */
router.get("/dustbin/scan/:qrCode", async (req, res, next) => {
  try {
    await requireAuth(req);
    const { qrCode } = req.params;
    const [bin] = await db.select().from(dustbins).where(eq(dustbins.qrCode, qrCode.toUpperCase())).limit(1);
    if (!bin) { res.status(404).json({ error: "Dustbin not found. Check the QR code." }); return; }

    const [citizenUser] = await db
      .select({ id: appUsers.id, fullName: appUsers.fullName, email: appUsers.email })
      .from(appUsers).where(eq(appUsers.id, bin.citizenId)).limit(1);

    const [citizenProfile] = await db
      .select({ phone: profiles.phone, address: profiles.address, city: profiles.city, ward: profiles.ward })
      .from(profiles).where(eq(profiles.userId, bin.citizenId)).limit(1);

    const recentCollections = await db
      .select().from(dustbinCollections)
      .where(eq(dustbinCollections.citizenId, bin.citizenId))
      .orderBy(desc(dustbinCollections.createdAt)).limit(5);

    res.json({ success: true, data: { bin, citizen: { ...citizenUser, ...citizenProfile }, recentCollections } });
  } catch (err) { next(err); }
});

/* ── POST /api/dustbin/scan/:qrCode/collect ── */
router.post("/dustbin/scan/:qrCode/collect", async (req, res, next) => {
  try {
    const worker = await requireAuth(req);
    const { qrCode } = req.params;
    const { notes } = req.body as { notes?: string };

    const [bin] = await db.select().from(dustbins).where(eq(dustbins.qrCode, qrCode.toUpperCase())).limit(1);
    if (!bin) { res.status(404).json({ error: "Dustbin not found" }); return; }

    const prevLevel = bin.fillLevel;
    await db.update(dustbins).set({
      fillLevel: 0,
      lastCollectedAt: new Date(),
      collectingWorkerId: worker.id,
      updatedAt: new Date(),
    }).where(eq(dustbins.qrCode, qrCode.toUpperCase()));

    await db.insert(dustbinCollections).values({
      citizenId: bin.citizenId,
      workerId: worker.id,
      fillLevel: prevLevel,
      pointsAwarded: 10,
      notes: notes || null,
    });

    res.json({ success: true, message: "Dustbin marked as collected", prevLevel });
  } catch (err) { next(err); }
});

/* ── GET /api/dustbin/all ── */
router.get("/dustbin/all", async (req, res, next) => {
  try {
    await requireAuth(req);
    const all = await db
      .select({ bin: dustbins, fullName: appUsers.fullName, email: appUsers.email })
      .from(dustbins)
      .leftJoin(appUsers, eq(dustbins.citizenId, appUsers.id))
      .orderBy(desc(dustbins.fillLevel));
    res.json({ success: true, data: all });
  } catch (err) { next(err); }
});

export default router;
