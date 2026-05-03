import crypto from "crypto";
import { db } from "@workspace/db";
import { appUsers, userRoles, profiles, cleanlinessScores, trainingModules, redeemItems, communityEvents, scrapPrices } from "@workspace/db";
import { eq, count } from "drizzle-orm";
import { logger } from "./lib/logger";

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function generateDustbinCode() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

const DEMO_ACCOUNTS = [
  { email: "citizen@civic.dev",  password: "password123", fullName: "Demo Citizen",       role: "citizen"      },
  { email: "worker@civic.dev",   password: "password123", fullName: "Demo Worker",         role: "worker"       },
  { email: "admin@civic.dev",    password: "password123", fullName: "Demo Admin",           role: "admin"        },
  { email: "ngo@civic.dev",      password: "password123", fullName: "Demo NGO User",        role: "ngo"          },
  { email: "scrap@civic.dev",    password: "password123", fullName: "Demo Scrap Dealer",    role: "scrap_dealer" },
];

const TRAINING_MODULES_SEED = [
  { title: "Waste Segregation Basics",     description: "Learn India's three-bin color-coded system and why source segregation matters.", icon: "Trash2",     durationMinutes: 20, lessonCount: 4, sortOrder: 0, requiresPrevious: false },
  { title: "Composting at Home",           description: "Turn kitchen waste into nutrient-rich compost. Covers brown/green materials, bin setup, and usage.", icon: "Leaf",       durationMinutes: 25, lessonCount: 5, sortOrder: 1, requiresPrevious: false },
  { title: "Hazardous Waste Disposal",     description: "Safe handling of batteries, paints, pesticides and medicines. Find authorised disposal points near you.", icon: "AlertTriangle", durationMinutes: 30, lessonCount: 5, sortOrder: 2, requiresPrevious: false },
  { title: "Recycling Best Practices",     description: "How to clean and prepare plastics, paper, and metals for recycling. Avoid contamination.", icon: "RefreshCw",  durationMinutes: 12, lessonCount: 3, sortOrder: 3, requiresPrevious: false },
  { title: "E-Waste Management",           description: "India's e-waste rules, toxic materials in electronics, and authorised collection centres.", icon: "Smartphone", durationMinutes: 20, lessonCount: 4, sortOrder: 4, requiresPrevious: false },
  { title: "Water Conservation at Home",   description: "Practical techniques to save water daily — rainwater harvesting, greywater reuse, and low-flow fixtures.", icon: "Droplets",  durationMinutes: 18, lessonCount: 4, sortOrder: 5, requiresPrevious: false },
  { title: "Plastic-Free Living",          description: "Step-by-step guide to eliminating single-use plastic. Discover sustainable alternatives for every room.", icon: "Ban",        durationMinutes: 22, lessonCount: 5, sortOrder: 6, requiresPrevious: false },
  { title: "Terrace & Kitchen Gardening",  description: "Grow your own food in small spaces. Covers containers, soil mixes, organic pest control, and composting integration.", icon: "Sprout",    durationMinutes: 28, lessonCount: 5, sortOrder: 7, requiresPrevious: false },
  { title: "Green Energy & Solar Power",   description: "Understanding solar panels, energy-efficient appliances, and government schemes like PM Surya Ghar.", icon: "Sun",        durationMinutes: 20, lessonCount: 4, sortOrder: 8, requiresPrevious: false },
  { title: "Community Cleanup Leadership", description: "Organise neighbourhood drives, motivate volunteers, and coordinate with local municipal bodies.", icon: "Users",      durationMinutes: 24, lessonCount: 4, sortOrder: 9, requiresPrevious: false },
];

const REDEEM_ITEMS_SEED = [
  { title: "Electricity Bill Discount 10%",  description: "Get 10% off your next electricity bill. Valid for one billing cycle. Coupon sent via SMS.", imageEmoji: "💡", pointsCost: 150, stock: null, active: true },
  { title: "Water Bill Discount 10%",        description: "Redeem for a 10% discount on your next municipal water bill. Sent directly to your registered mobile.", imageEmoji: "💧", pointsCost: 120, stock: null, active: true },
  { title: "Eco Clean Kit",                  description: "Biodegradable cleaning supplies: natural floor cleaner, scrub brush, compostable bin liners and dish soap.", imageEmoji: "🧹", pointsCost: 200, stock: 100, active: true },
  { title: "Free Plant Sapling",             description: "Choose from tulsi, curry leaf, or aloe vera. Collected from your nearest civic nursery with this voucher.", imageEmoji: "🌱", pointsCost: 80,  stock: 200, active: true },
  { title: "Eco Tote Bag",                   description: "Sturdy reusable cotton tote bag with SwachhSaathi branding. Replaces 500+ plastic carry bags.", imageEmoji: "🛍️", pointsCost: 100, stock: 150, active: true },
  { title: "Organic Vegetable Box",          description: "Weekly box of fresh, locally-grown organic vegetables delivered to your door. One-time redemption.", imageEmoji: "🥦", pointsCost: 250, stock: 50,  active: true },
  { title: "Solar Pocket Lamp",             description: "Compact solar-charged LED lamp. Charges in 6 hours of sunlight, lasts 8 hours. Ideal for power cuts.", imageEmoji: "☀️", pointsCost: 400, stock: 30,  active: true },
  { title: "Cinema Voucher",                description: "One movie ticket at partner PVR / Inox screens. Valid 60 days from redemption. Subject to availability.", imageEmoji: "🎬", pointsCost: 300, stock: 75,  active: true },
  { title: "Eco Book Set",                  description: "Curated set of 2 books on sustainability and zero-waste living. Delivered to your address.", imageEmoji: "📗", pointsCost: 180, stock: 60,  active: true },
  { title: "KSRTC Bus Pass Discount 20%",   description: "20% off a monthly KSRTC / BMTC bus pass. Help the planet by choosing public transport.", imageEmoji: "🚌", pointsCost: 200, stock: null, active: true },
  { title: "Green Cafe Voucher",            description: "Rs 150 off at any partner eco-friendly cafe. Valid at SwachhSaathi partner outlets across the city.", imageEmoji: "☕", pointsCost: 150, stock: null, active: true },
  { title: "Swachh Hero Gift Box",          description: "Exclusive box for our top citizens — bamboo toothbrush set, stainless steel straw kit, seed paper notepad & more!", imageEmoji: "🎁", pointsCost: 500, stock: 20,  active: true },
];

async function seedTrainingModules() {
  const [{ cnt }] = await db.select({ cnt: count() }).from(trainingModules);
  if (Number(cnt) >= TRAINING_MODULES_SEED.length) return;
  for (const mod of TRAINING_MODULES_SEED) {
    await db.insert(trainingModules).values(mod).onConflictDoNothing();
  }
  logger.info({ count: TRAINING_MODULES_SEED.length }, "Training modules seeded");
}

async function seedRedeemItems() {
  const [{ cnt }] = await db.select({ cnt: count() }).from(redeemItems);
  if (Number(cnt) >= REDEEM_ITEMS_SEED.length) return;
  for (const item of REDEEM_ITEMS_SEED) {
    await db.insert(redeemItems).values(item).onConflictDoNothing();
  }
  logger.info({ count: REDEEM_ITEMS_SEED.length }, "Redeem items seeded");
}

async function seedScrapPrices() {
  const [{ cnt }] = await db.select({ cnt: count() }).from(scrapPrices);
  if (Number(cnt) > 0) return;
  const prices = [
    { category: "metal",     itemName: "Iron / Steel",       pricePerKg: 28  },
    { category: "metal",     itemName: "Aluminium",          pricePerKg: 95  },
    { category: "metal",     itemName: "Copper",             pricePerKg: 430 },
    { category: "paper",     itemName: "Newspaper / Books",  pricePerKg: 14  },
    { category: "paper",     itemName: "Cardboard / Boxes",  pricePerKg: 10  },
    { category: "plastic",   itemName: "PET Bottles",        pricePerKg: 18  },
    { category: "plastic",   itemName: "Hard Plastic",       pricePerKg: 12  },
    { category: "ewaste",    itemName: "Mobile / Laptop",    pricePerKg: 120 },
    { category: "ewaste",    itemName: "Wire & Cables",      pricePerKg: 80  },
    { category: "glass",     itemName: "Glass Bottles",      pricePerKg: 4   },
    { category: "cardboard", itemName: "Corrugated Boxes",   pricePerKg: 11  },
  ];
  for (const p of prices) {
    await db.insert(scrapPrices).values(p).onConflictDoNothing();
  }
  logger.info({ count: prices.length }, "Scrap prices seeded");
}

const MIN_EVENTS = 7;
async function seedCommunityEvents() {
  const [{ cnt }] = await db.select({ cnt: count() }).from(communityEvents);
  if (Number(cnt) >= MIN_EVENTS) return;

  /* Use a placeholder organizer id — first admin or just a fixed uuid */
  const [admin] = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, "admin@civic.dev")).limit(1);
  const [ngo]   = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, "ngo@civic.dev")).limit(1);
  if (!admin && !ngo) return; /* accounts not yet seeded */

  const organizerId = (ngo || admin).id;
  const now = Date.now();
  const day = 86400000;

  const events = [
    {
      title: "Yamuna River Cleanup Drive",
      eventType: "cleanup",
      description: "Join us for a mega cleanup drive along Yamuna Ghat. Gloves and bags provided. Bring your enthusiasm!",
      location: "Yamuna Ghat, Delhi",
      startsAt: new Date(now + 3 * day),
      endsAt:   new Date(now + 3 * day + 4 * 3600000),
      maxParticipants: 100,
      rewardPoints: 150,
      organizerId,
    },
    {
      title: "Free Health Camp & Sanitation Drive",
      eventType: "government_camp",
      description: "Government-sponsored free health check-up camp combined with area sanitation drive. Open for all residents.",
      location: "Community Hall, Rohini Sector 7, Delhi",
      startsAt: new Date(now + 5 * day),
      endsAt:   new Date(now + 5 * day + 6 * 3600000),
      maxParticipants: 300,
      rewardPoints: 100,
      organizerId,
    },
    {
      title: "Tree Plantation — 1000 Saplings",
      eventType: "plantation",
      description: "Plant 1000 native saplings across the district. Saplings and tools provided. Earn double points this week!",
      location: "Central Park, Sector 10, Gurugram",
      startsAt: new Date(now + 7 * day),
      endsAt:   new Date(now + 7 * day + 3 * 3600000),
      maxParticipants: 200,
      rewardPoints: 120,
      organizerId,
    },
    {
      title: "Plastic Awareness Workshop",
      eventType: "awareness",
      description: "Interactive workshop on reducing single-use plastics. Experts from CPCB will present alternatives and demos.",
      location: "Delhi Public Library, ITO",
      startsAt: new Date(now + 10 * day),
      endsAt:   new Date(now + 10 * day + 2 * 3600000),
      maxParticipants: 80,
      rewardPoints: 80,
      organizerId,
    },
    {
      title: "Government Vaccination & Hygiene Camp",
      eventType: "government_camp",
      description: "BBMP-organised free vaccination camp with hygiene kit distribution. Supported by SwachhSaathi volunteers.",
      location: "Ward 42 Community Centre, Bengaluru",
      startsAt: new Date(now + 2 * day),
      endsAt:   new Date(now + 2 * day + 8 * 3600000),
      maxParticipants: 500,
      rewardPoints: 100,
      organizerId,
    },
    {
      title: "E-Waste Collection & Recycling Camp",
      eventType: "workshop",
      description: "Bring your old electronics — mobiles, laptops, batteries — for safe disposal. Earn scrap credits on the spot.",
      location: "Electronics Market, Nehru Place, Delhi",
      startsAt: new Date(now + 14 * day),
      endsAt:   new Date(now + 14 * day + 4 * 3600000),
      maxParticipants: 150,
      rewardPoints: 120,
      organizerId,
    },
    {
      title: "Neighbourhood Clean-Up — Sector 12",
      eventType: "cleanup",
      description: "Weekly neighbourhood sweep. Residents of all ages welcome. Tea and snacks provided by local RWA.",
      location: "Sector 12 Park, Noida",
      startsAt: new Date(now + 1 * day),
      endsAt:   new Date(now + 1 * day + 2 * 3600000),
      maxParticipants: 50,
      rewardPoints: 75,
      organizerId,
    },
  ];

  for (const ev of events) {
    await db.insert(communityEvents).values(ev).onConflictDoNothing();
  }
  logger.info({ count: events.length }, "Community events seeded");
}

export async function seedDemoAccounts() {
  await seedTrainingModules();
  await seedRedeemItems();
  await seedScrapPrices();
  for (const account of DEMO_ACCOUNTS) {
    try {
      const existing = await db.select({ id: appUsers.id }).from(appUsers).where(eq(appUsers.email, account.email)).limit(1);
      if (existing.length > 0) continue;
      const [user] = await db.insert(appUsers).values({ email: account.email, passwordHash: hashPassword(account.password), fullName: account.fullName }).returning({ id: appUsers.id });
      let dustbinCode = generateDustbinCode();
      await db.insert(profiles).values({ userId: user.id, fullName: account.fullName, dustbinCode }).onConflictDoNothing();
      await db.insert(userRoles).values({ userId: user.id, role: account.role }).onConflictDoNothing();
      await db.insert(cleanlinessScores).values({ userId: user.id }).onConflictDoNothing();
      logger.info({ email: account.email, role: account.role }, "Demo account created");
    } catch (err: any) {
      if (err?.code === "23505") continue;
      logger.warn({ email: account.email, err: err?.message }, "Could not seed demo account");
    }
  }
  /* Seed events after accounts exist */
  await seedCommunityEvents();
}

