import { Router } from "express";
import { db } from "@workspace/db";
import {
  cleanlinessScores, walletTransactions, wasteReports, donations,
  communityEvents, communityPosts, dustbinCollections, appUsers, userRoles, profiles
} from "@workspace/db";
import { eq, desc, sql, and } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/dashboard/citizen", async (req, res, next) => {
  try {
    const user = await requireAuth(req);

    const [
      scoreRows, transactions, totalPointsResult, recentReports,
      reportCountResult, donationCountResult, upcomingEvents,
      weekReportRows, allTransactionRows,
    ] = await Promise.all([
      db.select().from(cleanlinessScores).where(eq(cleanlinessScores.userId, user.id)).limit(1),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.id)).orderBy(desc(walletTransactions.createdAt)).limit(8),
      db.select({ total: sql<number>`coalesce(sum(points), 0)` }).from(walletTransactions).where(and(eq(walletTransactions.userId, user.id), eq(walletTransactions.type, "earned"))),
      db.select().from(wasteReports).where(eq(wasteReports.citizenId, user.id)).orderBy(desc(wasteReports.createdAt)).limit(5),
      db.select({ count: sql<number>`count(*)` }).from(wasteReports).where(eq(wasteReports.citizenId, user.id)),
      db.select({ count: sql<number>`count(*)` }).from(donations).where(eq(donations.citizenId, user.id)),
      db.select().from(communityEvents).orderBy(communityEvents.startsAt).limit(3),
      db.select({ createdAt: wasteReports.createdAt })
        .from(wasteReports)
        .where(and(
          eq(wasteReports.citizenId, user.id),
          sql`${wasteReports.createdAt} >= NOW() - INTERVAL '7 days'`
        )),
      db.select().from(walletTransactions).where(eq(walletTransactions.userId, user.id)).orderBy(desc(walletTransactions.createdAt)),
    ]);

    /* Weekly report counts Mon(0)→Sun(6) */
    const dailyCounts = Array(7).fill(0);
    for (const r of weekReportRows) {
      const jsDay = new Date(r.createdAt as any).getDay(); // 0=Sun
      const monIdx = jsDay === 0 ? 6 : jsDay - 1;         // remap to Mon=0
      dailyCounts[monIdx]++;
    }

    /* Running balance per day for the last 8 transactions */
    let runningBalance = Number(totalPointsResult[0]?.total || 0);
    const enrichedTx = allTransactionRows.slice(0, 8).map((t: any) => {
      const tx = { ...t, runningBalance };
      runningBalance -= t.type === "earned" ? t.points : -t.points;
      return tx;
    });

    res.json({
      score: scoreRows[0] || null,
      totalPoints: Number(totalPointsResult[0]?.total || 0),
      reportCount: Number(reportCountResult[0]?.count || 0),
      donationCount: Number(donationCountResult[0]?.count || 0),
      recentReports,
      upcomingEvents,
      recentTransactions: enrichedTx,
      weeklyReports: dailyCounts,       /* [mon,tue,wed,thu,fri,sat,sun] */
    });
  } catch (err) { next(err); }
});

router.get("/dashboard/worker", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const assignedReports = await db.select().from(wasteReports)
      .where(and(eq(wasteReports.assignedWorkerId, user.id), eq(wasteReports.status, "assigned")))
      .orderBy(desc(wasteReports.createdAt)).limit(20);
    const pendingReports = await db.select().from(wasteReports).where(eq(wasteReports.status, "pending")).orderBy(desc(wasteReports.createdAt)).limit(10);
    const completedTodayResult = await db.select({ count: sql<number>`count(*)` }).from(wasteReports)
      .where(and(eq(wasteReports.assignedWorkerId, user.id), eq(wasteReports.status, "completed")));
    const recentCollections = await db.select().from(dustbinCollections).where(eq(dustbinCollections.workerId, user.id)).orderBy(desc(dustbinCollections.createdAt)).limit(5);
    res.json({
      assignedReports: [...assignedReports, ...pendingReports],
      completedToday: Number(completedTodayResult[0]?.count || 0),
      pendingCount: pendingReports.length,
      recentCollections,
    });
  } catch (err) { next(err); }
});

router.get("/dashboard/ngo", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const pendingDonations = await db.select().from(donations).where(eq(donations.status, "pending")).orderBy(desc(donations.createdAt)).limit(20);
    const completedResult = await db.select({ count: sql<number>`count(*)` }).from(donations).where(and(eq(donations.ngoId, user.id), eq(donations.status, "completed")));
    const recentFeed = await db.select().from(communityPosts).where(eq(communityPosts.ngoId, user.id)).orderBy(desc(communityPosts.createdAt)).limit(5);
    const totalFeedResult = await db.select({ count: sql<number>`count(*)` }).from(communityPosts).where(eq(communityPosts.ngoId, user.id));
    const enrichedDonations = await Promise.all(pendingDonations.map(async (d: any) => {
      const [p] = await db.select({ fullName: profiles.fullName }).from(profiles).where(eq(profiles.userId, d.citizenId)).limit(1);
      return { ...d, citizenName: p?.fullName || null };
    }));
    res.json({
      pendingDonations: enrichedDonations,
      completedDonations: Number(completedResult[0]?.count || 0),
      totalFeed: Number(totalFeedResult[0]?.count || 0),
      recentFeed: recentFeed.map((p: any) => ({ ...p, ngoName: null, citizenName: null })),
    });
  } catch (err) { next(err); }
});

router.get("/dashboard/admin", async (req, res, next) => {
  try {
    await requireAuth(req);
    const totalUsersResult = await db.select({ count: sql<number>`count(*)` }).from(appUsers);
    const totalReportsResult = await db.select({ count: sql<number>`count(*)` }).from(wasteReports);
    const totalDonationsResult = await db.select({ count: sql<number>`count(*)` }).from(donations);
    const totalEventsResult = await db.select({ count: sql<number>`count(*)` }).from(communityEvents);
    const pendingReportsResult = await db.select({ count: sql<number>`count(*)` }).from(wasteReports).where(eq(wasteReports.status, "pending"));
    const recentActivity = await db.select().from(wasteReports).orderBy(desc(wasteReports.createdAt)).limit(10);
    const topCitizens = await db.select({ userId: cleanlinessScores.userId, score: cleanlinessScores.score, tier: cleanlinessScores.tier, fullName: profiles.fullName })
      .from(cleanlinessScores).innerJoin(profiles, eq(cleanlinessScores.userId, profiles.userId))
      .orderBy(desc(cleanlinessScores.score)).limit(5);
    const ranked = topCitizens.map((c: any, i: number) => ({ ...c, rank: i + 1 }));
    res.json({
      totalUsers: Number(totalUsersResult[0]?.count || 0),
      totalReports: Number(totalReportsResult[0]?.count || 0),
      totalDonations: Number(totalDonationsResult[0]?.count || 0),
      totalEvents: Number(totalEventsResult[0]?.count || 0),
      pendingReports: Number(pendingReportsResult[0]?.count || 0),
      recentActivity,
      topCitizens: ranked,
    });
  } catch (err) { next(err); }
});

export default router;
