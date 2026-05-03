import { Router } from "express";
import { db } from "@workspace/db";
import { scrapPrices, scrapListings, scrapListingItems, walletTransactions, cleanlinessScores } from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "./auth";

const router = Router();

router.get("/scrap/prices", async (req, res, next) => {
  try {
    await requireAuth(req);
    const data = await db.select().from(scrapPrices);
    res.json({ data });
  } catch (err) { next(err); }
});

router.get("/scrap/listings", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { citizenId, dealerId, status } = req.query;
    let query = db.select().from(scrapListings);
    const conditions: any[] = [];
    if (citizenId) conditions.push(eq(scrapListings.citizenId, String(citizenId)));
    if (dealerId) conditions.push(eq(scrapListings.dealerId, String(dealerId)));
    /* If no owner filter specified and no status filter, default to current user's listings */
    if (!citizenId && !dealerId && !status) conditions.push(eq(scrapListings.citizenId, user.id));
    if (status) conditions.push(eq(scrapListings.status, String(status)));
    if (conditions.length) query = query.where(and(...conditions)) as any;
    const listings = await query.orderBy(desc(scrapListings.createdAt)).limit(20);
    // Attach items
    const enriched = await Promise.all(listings.map(async (l: any) => {
      const items = await db.select().from(scrapListingItems).where(eq(scrapListingItems.listingId, l.id));
      return { ...l, items };
    }));
    res.json({ data: enriched });
  } catch (err) { next(err); }
});

router.post("/scrap/listings", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { items, address, latitude, longitude } = req.body || {};
    if (!items?.length) { const e: any = new Error("Items required"); e.status = 400; throw e; }
    const totalWeight = items.reduce((s: number, i: any) => s + Number(i.weightKg), 0);
    const totalEstimate = items.reduce((s: number, i: any) => s + Number(i.weightKg) * Number(i.pricePerKg), 0);
    const [listing] = await db.insert(scrapListings).values({
      citizenId: user.id,
      address: address || null,
      latitude: latitude || null,
      longitude: longitude || null,
      totalWeight,
      totalEstimate,
    }).returning();
    await db.insert(scrapListingItems).values(items.map((i: any) => ({
      listingId: listing.id,
      itemName: i.itemName,
      category: i.category,
      weightKg: Number(i.weightKg),
      pricePerKg: Number(i.pricePerKg),
      totalPrice: Number(i.weightKg) * Number(i.pricePerKg),
    })));
    const itemsResult = await db.select().from(scrapListingItems).where(eq(scrapListingItems.listingId, listing.id));
    res.json({ data: { ...listing, items: itemsResult } });
  } catch (err) { next(err); }
});

router.get("/scrap/listings/:id", async (req, res, next) => {
  try {
    await requireAuth(req);
    const [listing] = await db.select().from(scrapListings).where(eq(scrapListings.id, req.params.id)).limit(1);
    if (!listing) { const e: any = new Error("Not found"); e.status = 404; throw e; }
    const items = await db.select().from(scrapListingItems).where(eq(scrapListingItems.listingId, listing.id));
    res.json({ data: { ...listing, items } });
  } catch (err) { next(err); }
});

router.patch("/scrap/listings/:id", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { status, dealerId } = req.body || {};
    const updateData: any = { updatedAt: new Date() };
    if (status !== undefined) {
      updateData.status = status;
      if (status === "completed") updateData.completedAt = new Date();
    }
    if (dealerId !== undefined) updateData.dealerId = dealerId;
    const [updated] = await db.update(scrapListings).set(updateData).where(eq(scrapListings.id, req.params.id)).returning();
    if (status === "completed" && updated) {
      const points = Math.round((updated.totalEstimate || 0) / 10);
      await db.insert(walletTransactions).values({
        userId: updated.citizenId, type: "earned", action: "Scrap Sold", points: Math.max(points, 25),
        referenceId: updated.id, referenceType: "scrap_listings",
      });
      await db.update(cleanlinessScores).set({ score: sql`score + ${Math.max(points, 25)}`, totalScrapSold: sql`total_scrap_sold + 1`, updatedAt: new Date() }).where(eq(cleanlinessScores.userId, updated.citizenId));
    }
    const items = await db.select().from(scrapListingItems).where(eq(scrapListingItems.listingId, updated.id));
    res.json({ data: { ...updated, items } });
  } catch (err) { next(err); }
});

export default router;
