import { Router } from "express";
import { db } from "@workspace/db";
import { cleanlinessScores, walletTransactions, governmentBenefits, redeemItems, profiles } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

function getTier(score: number): string {
  if (score >= 800) return "Diamond";
  if (score >= 600) return "Platinum";
  if (score >= 400) return "Gold";
  if (score >= 200) return "Silver";
  return "Bronze";
}

/* Compute true balance from transaction history (source of truth) */
async function computeBalanceFromTx(userId: string): Promise<number> {
  const rows = await db
    .select()
    .from(walletTransactions)
    .where(eq(walletTransactions.userId, userId));
  return rows.reduce((acc, tx) => {
    const pts = Math.abs(tx.points || 0);
    if (tx.type === "earned") return acc + pts;
    if (tx.type === "spent")  return acc - pts;
    return acc;
  }, 0);
}

router.get("/wallet/score", async (req, res, next) => {
  try {
    const user = await requireAuth(req);

    /* Recompute correct score from transactions — fixes mismatches caused
       by silent UPDATE no-ops when the cleanlinessScores row didn't exist. */
    const computed = await computeBalanceFromTx(user.id);
    const tier     = getTier(computed);

    let [score] = await db
      .select()
      .from(cleanlinessScores)
      .where(eq(cleanlinessScores.userId, user.id))
      .limit(1);

    if (!score) {
      /* First time — create the record */
      const inserted = await db
        .insert(cleanlinessScores)
        .values({ userId: user.id, score: computed, tier })
        .returning();
      score = inserted[0];
    } else {
      /* Sync stored score + tier with computed values */
      const updated = await db
        .update(cleanlinessScores)
        .set({ score: computed, tier, updatedAt: new Date() })
        .where(eq(cleanlinessScores.userId, user.id))
        .returning();
      score = updated[0];
    }

    res.json({ data: score });
  } catch (err) { next(err); }
});

router.get("/wallet/transactions", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db
      .select()
      .from(walletTransactions)
      .where(eq(walletTransactions.userId, user.id))
      .orderBy(desc(walletTransactions.createdAt))
      .limit(50);
    /* Normalise: ensure points is always stored as absolute value
       so the frontend +/- display is always correct */
    const normalised = data.map((t: any) => ({ ...t, points: Math.abs(t.points || 0) }));
    res.json({ data: normalised });
  } catch (err) { next(err); }
});

router.get("/wallet/benefits", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const data = await db
      .select()
      .from(governmentBenefits)
      .where(eq(governmentBenefits.userId, user.id))
      .orderBy(desc(governmentBenefits.createdAt));
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/wallet/redeem-items", async (req, res, next) => {
  try {
    await requireAuth(req);
    const data = await db
      .select()
      .from(redeemItems)
      .where(eq(redeemItems.active, true))
      .orderBy(redeemItems.pointsCost);
    res.json({ data });
  } catch (err) { next(err); }
});

router.post("/wallet/redeem", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { itemId } = req.body || {};
    if (!itemId) { const e: any = new Error("Item ID required"); e.status = 400; throw e; }

    const [item] = await db.select().from(redeemItems).where(eq(redeemItems.id, itemId)).limit(1);
    if (!item) { const e: any = new Error("Item not found"); e.status = 404; throw e; }

    /* Use computed balance as source of truth */
    const balance = await computeBalanceFromTx(user.id);
    if (balance < item.pointsCost) {
      const e: any = new Error("Insufficient points"); e.status = 400; throw e;
    }

    await db.insert(walletTransactions).values({
      userId: user.id,
      type: "spent",
      action: `Redeemed: ${item.title}`,
      points: item.pointsCost,
      referenceId: itemId,
      referenceType: "redeem_items",
    });

    /* Sync cleanlinessScores after spend */
    const newBalance = balance - item.pointsCost;
    const tier = getTier(newBalance);
    await db
      .insert(cleanlinessScores)
      .values({ userId: user.id, score: newBalance, tier })
      .onConflictDoUpdate({
        target: cleanlinessScores.userId,
        set: { score: newBalance, tier, updatedAt: new Date() },
      });

    res.json({ ok: true, message: `Successfully redeemed ${item.title}!` });
  } catch (err) { next(err); }
});

router.get("/wallet/leaderboard", async (req, res, next) => {
  try {
    await requireAuth(req);
    const data = await db
      .select({
        userId: cleanlinessScores.userId,
        score:  cleanlinessScores.score,
        tier:   cleanlinessScores.tier,
        fullName: profiles.fullName,
      })
      .from(cleanlinessScores)
      .innerJoin(profiles, eq(cleanlinessScores.userId, profiles.userId))
      .orderBy(desc(cleanlinessScores.score))
      .limit(20);
    const ranked = data.map((entry: any, i: number) => ({ ...entry, rank: i + 1 }));
    res.json({ data: ranked });
  } catch (err) { next(err); }
});

export default router;
