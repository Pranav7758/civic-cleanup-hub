import { Router } from "express";
import { db } from "@workspace/db";
import { wasteReports, walletTransactions, cleanlinessScores, profiles, dustbinCollections } from "@workspace/db";
import { eq, ne, and, desc, sql, isNull } from "drizzle-orm";
import { requireAuth, hasRole } from "./auth";

const router = Router();

router.get("/reports", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { status, citizenId } = req.query;
    let query = db.select().from(wasteReports);
    const conditions: any[] = [];
    if (status) conditions.push(eq(wasteReports.status, String(status)));
    if (citizenId) conditions.push(eq(wasteReports.citizenId, String(citizenId)));
    if (conditions.length) query = query.where(and(...conditions)) as any;
    const data = await query.orderBy(desc(wasteReports.createdAt)).limit(50);
    // Enrich with reporter name
    const enriched = await Promise.all(data.map(async (r: any) => {
      const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, r.citizenId)).limit(1);
      return { ...r, reporterName: p?.fullName || null };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/reports", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { imageUrl, wasteType, description, latitude, longitude, address, priority } = req.body || {};
    const [report] = await db.insert(wasteReports).values({
      citizenId: user.id,
      imageUrl: imageUrl || null,
      wasteType: wasteType || "mixed",
      description: description || null,
      latitude: latitude || null,
      longitude: longitude || null,
      address: address || null,
      priority: priority || "normal",
    }).returning();

    // Award points for reporting
    await db.insert(walletTransactions).values({
      userId: user.id,
      type: "earned",
      action: "Waste Report",
      points: 50,
      referenceId: report.id,
      referenceType: "waste_reports",
    });
    await db.update(cleanlinessScores).set({
      score: sql`score + 50`,
      totalReports: sql`total_reports + 1`,
      updatedAt: new Date(),
    }).where(eq(cleanlinessScores.userId, user.id));

    res.json({ data: report });
  } catch (err) { next(err); }
});

router.get("/reports/pending-verification", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db.select().from(wasteReports)
      .where(and(eq(wasteReports.status, "pending"), ne(wasteReports.citizenId, user.id)))
      .orderBy(desc(wasteReports.createdAt))
      .limit(10);
    const enriched = await Promise.all(data.map(async (r: any) => {
      const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, r.citizenId)).limit(1);
      return { ...r, reporterName: p?.fullName || null };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/reports/verify", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { reportId, isLegit } = req.body;
    if (!reportId) { const e: any = new Error("Report ID required"); e.status = 400; throw e; }
    await db.insert(walletTransactions).values({
      userId: user.id, type: "earned", action: "Peer Verification", points: 10,
      referenceId: reportId, referenceType: "waste_reports",
    });
    await db.update(cleanlinessScores).set({ score: sql`score + 10`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, user.id));
    res.json({ ok: true, message: isLegit ? "Report verified!" : "Report flagged.", pointsEarned: 10 });
  } catch (err) { next(err); }
});

/* ── GET /api/reports/worker-tasks ── available + my assigned ── */
router.get("/reports/worker-tasks", async (req, res, next) => {
  try {
    const worker = await requireAuth(req);

    const available = await db.select().from(wasteReports)
      .where(and(eq(wasteReports.status, "pending"), isNull(wasteReports.assignedWorkerId)))
      .orderBy(desc(wasteReports.createdAt)).limit(30);

    const myTasks = await db.select().from(wasteReports)
      .where(and(eq(wasteReports.assignedWorkerId, worker.id), ne(wasteReports.status, "completed")))
      .orderBy(desc(wasteReports.createdAt)).limit(30);

    const [completedRow] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(wasteReports)
      .where(and(eq(wasteReports.assignedWorkerId, worker.id), eq(wasteReports.status, "completed")));

    const enrich = async (rows: any[]) =>
      Promise.all(rows.map(async (r) => {
        const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, r.citizenId)).limit(1);
        return { ...r, reporterName: p?.fullName || null };
      }));

    res.json({
      success: true,
      data: {
        available: await enrich(available),
        myTasks:   await enrich(myTasks),
        stats: { assigned: myTasks.length, completedTotal: completedRow?.count || 0 },
      },
    });
  } catch (err) { next(err); }
});

/* ── POST /api/reports/:id/claim ── worker accepts a pending report ── */
router.post("/reports/:id/claim", async (req, res, next) => {
  try {
    const worker = await requireAuth(req);
    const [report] = await db.select().from(wasteReports).where(eq(wasteReports.id, req.params.id)).limit(1);
    if (!report) { res.status(404).json({ error: "Report not found" }); return; }
    if (report.status !== "pending" || report.assignedWorkerId) {
      res.status(400).json({ error: "Report is no longer available" }); return;
    }
    const [updated] = await db.update(wasteReports)
      .set({ status: "assigned", assignedWorkerId: worker.id, updatedAt: new Date() })
      .where(eq(wasteReports.id, req.params.id))
      .returning();
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

/* ── POST /api/reports/:id/complete ── worker marks done with proof photo ── */
router.post("/reports/:id/complete", async (req, res, next) => {
  try {
    const worker = await requireAuth(req);
    const { completionImageUrl } = req.body || {};
    const [report] = await db.select().from(wasteReports).where(eq(wasteReports.id, req.params.id)).limit(1);
    if (!report) { res.status(404).json({ error: "Report not found" }); return; }
    if (report.assignedWorkerId !== worker.id) { res.status(403).json({ error: "Not your task" }); return; }

    const [updated] = await db.update(wasteReports)
      .set({ status: "completed", completionImageUrl: completionImageUrl || null, completedAt: new Date(), updatedAt: new Date() })
      .where(eq(wasteReports.id, req.params.id))
      .returning();

    const pts = report.rewardPoints || 50;
    await db.insert(walletTransactions).values({
      userId: report.citizenId, type: "earned", action: "Report Resolved",
      points: pts, referenceId: report.id, referenceType: "waste_reports",
    });
    await db.update(cleanlinessScores)
      .set({ score: sql`score + ${pts}`, updatedAt: new Date() })
      .where(eq(cleanlinessScores.userId, report.citizenId));

    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
});

/* ── GET /api/reports/:id ── fetch single report ── */
router.get("/reports/:id", async (req, res, next) => {
  try {
    await requireAuth(req);
    const [report] = await db.select().from(wasteReports).where(eq(wasteReports.id, req.params.id)).limit(1);
    if (!report) { const e: any = new Error("Not found"); e.status = 404; throw e; }
    const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, report.citizenId)).limit(1);
    res.json({ data: { ...report, reporterName: p?.fullName || null } });
  } catch (err) { next(err); }
});

/* ── PATCH /api/reports/:id ── update report fields ── */
router.patch("/reports/:id", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { status, assignedWorkerId, completionImageUrl, priority } = req.body || {};
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") updateData.completedAt = new Date();
    }
    if (assignedWorkerId !== undefined) updateData.assignedWorkerId = assignedWorkerId;
    if (completionImageUrl !== undefined) updateData.completionImageUrl = completionImageUrl;
    if (priority !== undefined) updateData.priority = priority;
    const [updated] = await db.update(wasteReports).set(updateData).where(eq(wasteReports.id, req.params.id)).returning();
    res.json({ data: updated });
  } catch (err) { next(err); }
});

// Dustbin collections
router.get("/dustbin/collections", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db.select().from(dustbinCollections).where(eq(dustbinCollections.citizenId, user.id)).orderBy(desc(dustbinCollections.createdAt)).limit(20);
    res.json({ data });
  } catch (err) { next(err); }
});

router.post("/dustbin/collections", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { citizenId, fillLevel, notes } = req.body || {};
    const points = fillLevel > 75 ? 30 : fillLevel > 50 ? 20 : 10;
    await db.insert(dustbinCollections).values({
      citizenId: citizenId || user.id,
      workerId: user.id,
      fillLevel: fillLevel || 50,
      pointsAwarded: points,
      notes: notes || null,
    });
    if (citizenId) {
      await db.insert(walletTransactions).values({
        userId: citizenId, type: "earned", action: "Dustbin Collection", points,
      });
      await db.update(cleanlinessScores).set({ score: sql`score + ${points}`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, citizenId));
    }
    res.json({ ok: true });
  } catch (err) { next(err); }
});

export default router;
