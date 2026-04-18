import "dotenv/config";
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { isSupabaseDirectDbUrl, pool, supabasePoolerHint } from "./db.js";
import Groq from "groq-sdk";
import { createClient } from "@supabase/supabase-js";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

const app = express();

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

// Vercel routes all /api/* to api/index.ts; Express must see full paths like /api/auth/signin.
if (process.env.VERCEL) {
  app.set("trust proxy", 1);
  app.use((req, _res, next) => {
    const raw = req.url ?? "/";
    const q = raw.indexOf("?");
    const pathname = q >= 0 ? raw.slice(0, q) : raw;
    const search = q >= 0 ? raw.slice(q) : "";
    if (!pathname.startsWith("/api")) {
      req.url = `/api${pathname.startsWith("/") ? pathname : `/${pathname}`}${search}`;
    }
    next();
  });
}

// Vercel serverless: only `/tmp` is writable. Local dev can use project folder.
const upload = multer({ dest: process.env.VERCEL ? "/tmp" : "public/uploads" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const port = Number(process.env.PORT || 5000);

const jsonLimit = 2 * 1024 * 1024;

// On Vercel, the request body may already be buffered; running express.json() can consume
// an empty stream and leave req.body empty → 400 on auth. Read JSON once here instead.
if (process.env.VERCEL) {
  app.use(async (req, _res, next) => {
    if (!["POST", "PUT", "PATCH"].includes(req.method || "")) return next();
    const ct = String(req.headers["content-type"] || "");
    if (!ct.includes("application/json")) return next();
    try {
      const chunks: Buffer[] = [];
      let total = 0;
      for await (const chunk of req) {
        const buf = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
        total += buf.length;
        if (total > jsonLimit) {
          const err = new Error("Payload too large");
          (err as any).status = 413;
          return next(err);
        }
        chunks.push(buf);
      }
      const text = Buffer.concat(chunks).toString("utf8");
      (req as express.Request).body = text ? JSON.parse(text) : {};
    } catch {
      const err = new Error("Invalid JSON body");
      (err as any).status = 400;
      return next(err);
    }
    next();
  });
} else {
  app.use(express.json({ limit: "2mb" }));
}

app.use("/uploads", express.static(path.join(rootDir, "public/uploads")));

const tableColumns: Record<string, string[]> = {
  app_users: ["id", "email", "password_hash", "full_name", "created_at"],
  profiles: ["id", "user_id", "full_name", "phone", "avatar_url", "address", "city", "ward", "dustbin_code", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role"],
  cleanliness_scores: ["id", "user_id", "score", "tier", "total_reports", "total_scrap_sold", "total_donations", "total_events", "total_collections", "updated_at"],
  training_modules: ["id", "title", "description", "icon", "duration_minutes", "lesson_count", "sort_order", "requires_previous", "created_at"],
  training_progress: ["id", "user_id", "module_id", "progress", "completed", "completed_at", "updated_at"],
  waste_reports: ["id", "citizen_id", "image_url", "waste_type", "description", "latitude", "longitude", "address", "status", "assigned_worker_id", "completion_image_url", "reward_points", "priority", "completed_at", "created_at", "updated_at"],
  wallet_transactions: ["id", "user_id", "type", "action", "points", "reference_id", "reference_type", "created_at"],
  government_benefits: ["id", "user_id", "benefit_type", "discount_percent", "status", "approved_by", "valid_from", "valid_until", "provider", "coupon_code", "created_at", "updated_at"],
  scrap_prices: ["id", "category", "item_name", "price_per_kg", "dealer_id", "updated_at"],
  scrap_listings: ["id", "citizen_id", "image_url", "status", "dealer_id", "total_estimate", "total_weight", "latitude", "longitude", "address", "completed_at", "created_at", "updated_at"],
  scrap_listing_items: ["id", "listing_id", "item_name", "category", "weight_kg", "price_per_kg", "total_price"],
  donations: ["id", "citizen_id", "ngo_id", "category", "description", "image_url", "status", "proof_image_url", "latitude", "longitude", "address", "reward_points", "scheduled_at", "completed_at", "created_at", "updated_at"],
  community_events: ["id", "title", "description", "event_type", "location", "latitude", "longitude", "starts_at", "ends_at", "max_participants", "reward_points", "image_url", "organizer_id", "created_at"],
  event_registrations: ["id", "event_id", "user_id", "attended", "created_at"],
  notifications: ["id", "user_id", "title", "message", "type", "read", "reference_id", "reference_type", "created_at"],
  messages: ["id", "sender_id", "receiver_id", "content", "read", "created_at"],
  redeem_items: ["id", "title", "description", "points_cost", "stock", "image_emoji", "active", "created_at"],
  dustbin_collections: ["id", "citizen_id", "worker_id", "fill_level", "points_awarded", "notes", "created_at"],
};

const publicReadTables = new Set(["training_modules", "scrap_prices", "redeem_items", "community_events"]);
const userScopedColumns = new Set(["user_id", "citizen_id", "sender_id"]);

type AppUser = { id: string; email: string; full_name: string };

function assertTable(table: string) {
  if (!tableColumns[table]) throw new Error("Table is not allowed");
}

function assertColumn(table: string, column: string) {
  assertTable(table);
  if (!tableColumns[table].includes(column)) throw new Error(`Column ${column} is not allowed`);
}

function ident(name: string) {
  return `"${name}"`;
}

function hashPassword(password: string, salt = crypto.randomBytes(16).toString("hex")) {
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, stored: string) {
  try {
    const parts = stored?.split(":");
    if (!parts || parts.length < 2) return false;
    const [salt, hash] = parts;
    if (!/^[0-9a-f]+$/i.test(hash)) return false;
    return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashPassword(password, salt).split(":")[1], "hex"));
  } catch {
    return false;
  }
}

function userResponse(user: AppUser) {
  return {
    id: user.id,
    email: user.email,
    user_metadata: { full_name: user.full_name },
  };
}

async function getAuthUser(req: express.Request): Promise<AppUser | null> {
  const header = req.header("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return null;
  const { rows } = await pool.query(
    `select u.id, u.email, u.full_name from sessions s join app_users u on u.id = s.user_id where s.token = $1 and s.expires_at > now()`,
    [token],
  );
  return rows[0] || null;
}

async function requireAuth(req: express.Request) {
  const user = await getAuthUser(req);
  if (!user) {
    const error = new Error("Authentication required");
    (error as any).status = 401;
    throw error;
  }
  return user;
}

async function createSession(userId: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 30);
  await pool.query(`insert into sessions (token, user_id, expires_at) values ($1, $2, $3)`, [token, userId, expiresAt]);
  return { access_token: token, expires_at: expiresAt.toISOString() };
}

function generateDustbinCode() {
  return `ECO-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
}

async function hasRole(userId: string, role: string) {
  const { rows } = await pool.query(`select 1 from user_roles where user_id = $1 and role = $2 limit 1`, [userId, role]);
  return rows.length > 0;
}

async function requireWorker(req: express.Request) {
  const user = await requireAuth(req);
  const [isWorker, isAdmin] = await Promise.all([hasRole(user.id, "worker"), hasRole(user.id, "admin")]);
  if (!isWorker && !isAdmin) {
    const error = new Error("Worker access required");
    (error as any).status = 403;
    throw error;
  }
  return user;
}

async function createProfileForUser(userId: string, fullName: string, phone?: string) {
  const makeDustbinCode = () => generateDustbinCode();
  let attempts = 0;
  while (attempts < 5) {
    try {
      await pool.query(
        `insert into profiles (user_id, full_name, phone, dustbin_code) values ($1, $2, $3, $4)
         on conflict (user_id) do update
           set full_name = excluded.full_name,
               phone = coalesce(excluded.phone, profiles.phone),
               dustbin_code = coalesce(profiles.dustbin_code, excluded.dustbin_code),
               updated_at = now()`,
        [userId, fullName, phone || null, makeDustbinCode()],
      );
      break;
    } catch (error: any) {
      if (error?.code === "23505" && String(error?.constraint || "").includes("dustbin_code")) {
        attempts += 1;
        continue;
      }
      throw error;
    }
  }
  if (attempts >= 5) throw new Error("Failed to generate unique dustbin code");
  await pool.query(`insert into cleanliness_scores (user_id) values ($1) on conflict (user_id) do nothing`, [userId]);
}

app.post("/api/auth/signup", async (req, res, next) => {
  try {
    const { email, password, fullName, phone } = req.body || {};
    if (!email || !password || !fullName) throw new Error("Email, password, and full name are required");
    const { rows } = await pool.query(
      `insert into app_users (email, password_hash, full_name) values ($1, $2, $3) returning id, email, full_name`,
      [String(email).toLowerCase(), hashPassword(password), fullName],
    );
    await createProfileForUser(rows[0].id, fullName, phone);
    const session = await createSession(rows[0].id);
    res.json({ user: userResponse(rows[0]), session });
  } catch (error: any) {
    if (error?.code === "23505") error.message = "An account with this email already exists";
    next(error);
  }
});

app.post("/api/auth/signin", async (req, res, next) => {
  try {
    const { email, password } = req.body || {};
    if (!email || !password) throw new Error("Email and password are required");
    const { rows } = await pool.query(`select id, email, full_name, password_hash from app_users where email = $1`, [String(email).toLowerCase()]);
    const user = rows[0];
    if (!user || !verifyPassword(password, user.password_hash)) {
      const error = new Error("Invalid email or password");
      (error as any).status = 401;
      throw error;
    }
    // Backfill profile + dustbin code for legacy users created before dustbin rollout.
    await createProfileForUser(user.id, user.full_name);
    const session = await createSession(user.id);
    res.json({ user: userResponse(user), session });
  } catch (error) {
    next(error);
  }
});

app.post("/api/auth/signout", async (req, res, next) => {
  try {
    const header = req.header("authorization");
    const token = header?.startsWith("Bearer ") ? header.slice(7) : "";
    if (token) await pool.query(`delete from sessions where token = $1`, [token]);
    res.json({ ok: true });
  } catch (error) {
    next(error);
  }
});

app.get("/api/auth/me", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    res.json({ user: userResponse(user) });
  } catch (error) {
    next(error);
  }
});

app.get("/api/scrap-rates/live", async (req, res, next) => {
  try {
    // Copper (HG=F), Aluminum (ALI=F), Steel (HRC=F)
    const map = [
      { ticker: "ALI=F", cat: "metal", item: "Aluminum Scrap" },
      { ticker: "HG=F", cat: "metal", item: "Copper Wire" },
      { ticker: "HRC=F", cat: "metal", item: "Iron/Steel" }
    ];
    const livePrices = [];
    for (const m of map) {
       try {
         const resp = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${m.ticker}`);
         const j = await resp.json();
         const price = j?.chart?.result?.[0]?.meta?.regularMarketPrice;
         if (price) {
            // Very rough formula to convert the raw US Market Price metric scales into an arbitrary ₹/KG INR Scrap context to represent live movement.
            // (Just logic acting as formatting wrapper for the real market price fetched above)
            const factor = m.ticker === 'HG=F' ? 100 : (m.ticker === 'HRC=F' ? 0.05 : 0.04);
            const inrPerKg = Math.round(price * factor * 10) / 10; 
            livePrices.push({ category: m.cat, item_name: m.item, price_per_kg: inrPerKg });
         }
       } catch (err) { }
    }
    // Blend API prices with fallback prices for categories we can't easily fetch via Yahoo Finance tickers
    livePrices.push(
      { category: "paper", item_name: "Newspapers", price_per_kg: 15 },
      { category: "paper", item_name: "Cardboard", price_per_kg: 10 },
      { category: "plastic", item_name: "PET Bottles", price_per_kg: 12 },
      { category: "ewaste", item_name: "Old Laptops", price_per_kg: 250 }
    );
    res.json({ data: livePrices });
  } catch (error) {
    next(error);
  }
});

function rowsFromPayload(payload: any) {
  return Array.isArray(payload) ? payload : [payload];
}

function validateRows(table: string, rows: any[], user: AppUser | null) {
  for (const row of rows) {
    for (const key of Object.keys(row)) {
      assertColumn(table, key);
      if (user && userScopedColumns.has(key) && row[key] !== user.id) throw new Error("Cannot write data for another user");
    }
    if (table === "scrap_listing_items" && row.weight_kg && row.price_per_kg) {
      row.total_price = Number(row.weight_kg) * Number(row.price_per_kg);
    }
  }
}

function buildWhere(table: string, filters: any[] = [], orFilter: string | undefined, params: any[]) {
  const clauses: string[] = [];
  for (const filter of filters) {
    if (filter.operator !== "eq") throw new Error("Only equality filters are supported");
    assertColumn(table, filter.column);
    params.push(filter.value);
    clauses.push(`${ident(filter.column)} = $${params.length}`);
  }
  if (orFilter) {
    const orClauses = String(orFilter).split(",").map(part => {
      const [column, operator, ...rest] = part.split(".");
      if (operator !== "eq") throw new Error("Only equality filters are supported");
      assertColumn(table, column);
      params.push(rest.join("."));
      return `${ident(column)} = $${params.length}`;
    });
    clauses.push(`(${orClauses.join(" or ")})`);
  }
  return clauses.length ? ` where ${clauses.join(" and ")}` : "";
}

async function enrichRows(table: string, rows: any[], select?: string) {
  if (!rows.length || !select) return rows;
  if (table === "scrap_listings" && select.includes("items")) {
    const ids = rows.map(row => row.id);
    const { rows: items } = await pool.query(`select * from scrap_listing_items where listing_id = any($1::varchar[])`, [ids]);
    for (const row of rows) row.items = items.filter(item => item.listing_id === row.id);
  }
  const attachProfile = async (key: string, alias: string) => {
    const ids = [...new Set(rows.map(row => row[key]).filter(Boolean))];
    if (!ids.length) return;
    const { rows: profiles } = await pool.query(`select user_id, full_name, phone, address from profiles where user_id = any($1::varchar[])`, [ids]);
    for (const row of rows) row[alias] = profiles.find(profile => profile.user_id === row[key]) || null;
  };
  if (select.includes("citizen:profiles")) {
    await attachProfile("citizen_id", "citizen");
  }
  if (select.includes("ngo:profiles")) {
    await attachProfile("ngo_id", "ngo");
  }
  if (table === "event_registrations" && select.includes("event:community_events")) {
    const ids = rows.map(row => row.event_id);
    const { rows: events } = await pool.query(`select * from community_events where id = any($1::varchar[])`, [ids]);
    for (const row of rows) row.event = events.find(event => event.id === row.event_id) || null;
  }
  return rows;
}

app.post("/api/query", async (req, res, next) => {
  try {
    const { table, op, payload, filters, order, limit, single, maybeSingle, count, head, orFilter, onConflict, select } = req.body || {};
    assertTable(table);
    let user: AppUser | null = null;
    if (!publicReadTables.has(table) || op !== "select") user = await requireAuth(req);
    if (op !== "select" && !user) user = await requireAuth(req);
    const params: any[] = [];
    if (op === "select") {
      const where = buildWhere(table, filters, orFilter, params);
      const orderSql = order?.column ? (assertColumn(table, order.column), ` order by ${ident(order.column)} ${order.ascending === false ? "desc" : "asc"}`) : "";
      const limitSql = limit ? ` limit ${Number(limit)}` : "";
      const projection = count === "exact" && head ? "count(*)::int as count" : "*";
      const { rows } = await pool.query(`select ${projection} from ${ident(table)}${where}${orderSql}${limitSql}`, params);
      if (count === "exact" && head) return res.json({ data: null, count: rows[0]?.count || 0 });
      const data = await enrichRows(table, rows, select);
      if (single || maybeSingle) return res.json({ data: data[0] || null });
      return res.json({ data });
    }
    if (op === "insert" || op === "upsert") {
      const rows = rowsFromPayload(payload);
      validateRows(table, rows, user);
      const inserted = [];
      for (const row of rows) {
        const columns = Object.keys(row);
        const values = columns.map(column => row[column]);
        const placeholders = values.map((_, index) => `$${index + 1}`);
        let conflictSql = "";
        if (op === "upsert" && onConflict) {
          const conflictColumns = String(onConflict).split(",").map(column => column.trim());
          conflictColumns.forEach(column => assertColumn(table, column));
          const updateColumns = columns.filter(column => !conflictColumns.includes(column));
          const updates = updateColumns.map(column => `${ident(column)} = excluded.${ident(column)}`).join(", ");
          conflictSql = ` on conflict (${conflictColumns.map(ident).join(", ")}) do update set ${updates || `${ident(conflictColumns[0])} = excluded.${ident(conflictColumns[0])}`}`;
        }
        const { rows: result } = await pool.query(
          `insert into ${ident(table)} (${columns.map(ident).join(", ")}) values (${placeholders.join(", ")})${conflictSql} returning *`,
          values,
        );
        inserted.push(result[0]);
      }
      return res.json({ data: single || maybeSingle ? inserted[0] : inserted });
    }
    if (op === "update") {
      const row = payload || {};
      validateRows(table, [row], user);
      const columns = Object.keys(row);
      const values = columns.map(column => row[column]);
      const sets = columns.map((column, index) => `${ident(column)} = $${index + 1}`);
      params.push(...values);
      const where = buildWhere(table, filters, orFilter, params);
      if (!where) throw new Error("Update requires a filter");
      const updateSets = tableColumns[table].includes("updated_at") ? [...sets, "updated_at = now()"] : sets;
      const { rows } = await pool.query(`update ${ident(table)} set ${updateSets.join(", ")}${where} returning *`, params);
      return res.json({ data: single || maybeSingle ? rows[0] || null : rows });
    }
    throw new Error("Operation is not supported");
  } catch (error) {
    next(error);
  }
});

app.post("/api/worker/complete-task", async (req, res, next) => {
  try {
    const user = await requireWorker(req);
    const { taskId, completionImageUrl } = req.body || {};

    if (!taskId) throw new Error("Task ID is required");

    // 1. Get the task
    const { rows: tasks } = await pool.query(
      `select * from waste_reports where id = $1`,
      [taskId]
    );
    const task = tasks[0];
    
    if (!task) throw new Error("Task not found");
    if (task.assigned_worker_id !== user.id) throw new Error("You are not assigned to this task");
    if (task.status === "completed") throw new Error("Task is already completed");

    const rewardPoints = task.reward_points || 50;

    // 2. Update task status
    await pool.query(
      `update waste_reports set status = 'completed', completion_image_url = $1, completed_at = now(), updated_at = now() where id = $2`,
      [completionImageUrl || null, taskId]
    );

    // 3. Reward the Citizen (if there is a citizen attached)
    const citizenId = task.citizen_id;
    if (citizenId) {
      // Add to wallet transactions
      await pool.query(
        `insert into wallet_transactions (user_id, type, action, points, reference_id, reference_type) values ($1, 'earned', 'Waste Collected', $2, $3, 'waste_reports')`,
        [citizenId, rewardPoints, taskId]
      );

      // Update cleanliness_score
      const { rows: scores } = await pool.query(
        `update cleanliness_scores set score = score + $1, total_reports = total_reports + 1, updated_at = now() where user_id = $2 returning score`,
        [rewardPoints, citizenId]
      );

      const newScore = scores[0]?.score || 0;

      // 4. Issue Government Benefit if score > threshold
      const grantBenefit = async (type: string, codePrefix: string, percent: number, provider: string) => {
        const { rows: existingBenefits } = await pool.query(
          `select id from government_benefits where user_id = $1 and benefit_type = $2`,
          [citizenId, type]
        );

        if (existingBenefits.length === 0) {
          const couponCode = codePrefix + crypto.randomBytes(3).toString("hex").toUpperCase();
          await pool.query(
            `insert into government_benefits (user_id, benefit_type, discount_percent, status, provider, coupon_code) 
             values ($1, $2, $3, 'active', $4, $5)`,
            [citizenId, type, percent, provider, couponCode]
          );
        }
      };

      if (newScore >= 100) await grantBenefit('light_bill', 'ECO-LGT-', 10, 'City Municipality');
      if (newScore >= 200) await grantBenefit('water_tax', 'ECO-WTR-', 5, 'Water Board');
      if (newScore >= 300) await grantBenefit('property_tax', 'ECO-PRP-', 15, 'Revenue Dept');
    }

    res.json({ success: true, message: "Task completed and citizen rewarded" });
  } catch (error) {
    next(error);
  }
});

app.post("/api/worker/collect-dustbin", async (req, res, next) => {
  try {
    const worker = await requireWorker(req);
    const { citizenId, fillLevel, notes } = req.body || {};

    if (!citizenId || !fillLevel) throw new Error("Missing required fields");
    if (!["full", "half", "below_half"].includes(fillLevel)) throw new Error("Invalid fill level");

    // Calculate points
    let points = 30; // default below_half
    if (fillLevel === "full") points = 100;
    else if (fillLevel === "half") points = 60;

    // Prevent accidental double submissions for the same citizen by same worker.
    const { rows: recentCollections } = await pool.query(
      `select id from dustbin_collections
       where citizen_id = $1 and worker_id = $2 and created_at > now() - interval '10 minutes'
       limit 1`,
      [citizenId, worker.id],
    );
    if (recentCollections.length > 0) {
      const error = new Error("Collection was already logged recently for this dustbin");
      (error as any).status = 409;
      throw error;
    }

    // 1. Insert collection record
    await pool.query(
      `insert into dustbin_collections (citizen_id, worker_id, fill_level, points_awarded, notes) values ($1, $2, $3, $4, $5)`,
      [citizenId, worker.id, fillLevel, points, notes || null]
    );

    // 2. Add to wallet
    await pool.query(
      `insert into wallet_transactions (user_id, type, action, points, reference_type) values ($1, 'earned', 'Dustbin Collected', $2, 'dustbin_collections')`,
      [citizenId, points]
    );

    // 3. Update Cleanliness Score & total collections
    await pool.query(
      `update cleanliness_scores set score = score + $1, total_collections = total_collections + 1, updated_at = now() where user_id = $2`,
      [points, citizenId]
    );

    res.json({ success: true, pointsAwarded: points });
  } catch (error) {
    next(error);
  }
});

app.post("/api/worker/collect-dustbin-by-code", async (req, res, next) => {
  try {
    const worker = await requireWorker(req);
    const { dustbinCode, fillLevel, notes } = req.body || {};
    const normalizedCode = String(dustbinCode || "").trim().toUpperCase();
    if (!normalizedCode || !fillLevel) throw new Error("Missing required fields");
    if (!["full", "half", "below_half"].includes(fillLevel)) throw new Error("Invalid fill level");

    const { rows: profiles } = await pool.query(
      `select user_id, full_name from profiles where upper(dustbin_code) = $1 limit 1`,
      [normalizedCode],
    );
    const profile = profiles[0];
    if (!profile) {
      const error = new Error("Dustbin code not found");
      (error as any).status = 404;
      throw error;
    }

    let points = 30;
    if (fillLevel === "full") points = 100;
    else if (fillLevel === "half") points = 60;

    const { rows: recentCollections } = await pool.query(
      `select id from dustbin_collections
       where citizen_id = $1 and worker_id = $2 and created_at > now() - interval '10 minutes'
       limit 1`,
      [profile.user_id, worker.id],
    );
    if (recentCollections.length > 0) {
      const error = new Error("Collection was already logged recently for this dustbin");
      (error as any).status = 409;
      throw error;
    }

    await pool.query(
      `insert into dustbin_collections (citizen_id, worker_id, fill_level, points_awarded, notes) values ($1, $2, $3, $4, $5)`,
      [profile.user_id, worker.id, fillLevel, points, notes || null],
    );
    await pool.query(
      `insert into wallet_transactions (user_id, type, action, points, reference_type) values ($1, 'earned', 'Dustbin Collected', $2, 'dustbin_collections')`,
      [profile.user_id, points],
    );
    await pool.query(
      `update cleanliness_scores set score = score + $1, total_collections = total_collections + 1, updated_at = now() where user_id = $2`,
      [points, profile.user_id],
    );

    res.json({ success: true, pointsAwarded: points, citizenName: profile.full_name || null });
  } catch (error) {
    next(error);
  }
});

app.get("/api/healthz", (_req, res) => {
  res.json({ ok: true, service: "civic-cleanup-hub", time: new Date().toISOString() });
});

app.post("/api/analyze-waste", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new Error("File is required");

    const fileData = fs.readFileSync(req.file.path);
    const base64Image = fileData.toString("base64");
    const mimeType = req.file.mimetype;

    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this image containing waste/garbage. Return a JSON object ONLY, with the following format: {\"waste_type\": \"dry\" | \"wet\" | \"hazardous\" | \"mixed\", \"confidence\": <number between 0-100>, \"sub_categories\": [\"string list of items like 'cardboard', 'apple cores'\"], \"estimated_weight_kg\": <estimated number>, \"recyclability_score\": <number between 0-10>}."
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${mimeType};base64,${base64Image}`,
              },
            },
          ],
        },
      ],
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      temperature: 0.2,
      max_completion_tokens: 512,
      response_format: { type: "json_object" },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) throw new Error("AI failed to return an analysis");

    const analysis = JSON.parse(content);
    
    // Clean up temporary image file
    try {
      fs.unlinkSync(req.file.path);
    } catch (e) {}

    res.json({ analysis });
  } catch (error) {
    next(error);
  }
});

app.post("/api/upload", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) throw new Error("File is required");

    const extension = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${crypto.randomUUID()}${extension || ""}`;
    const folder = String(req.body.bucket || "uploads").replace(/[^a-z0-9-]/gi, "-").toLowerCase();

    // Vercel serverless filesystem is ephemeral/read-only for persistence. Use Supabase Storage instead.
    if (process.env.VERCEL) {
      const supabase = getSupabaseAdmin();
      if (!supabase) {
        const err = new Error("Uploads are not configured on Vercel. Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY.");
        (err as any).status = 500;
        throw err;
      }

      const bucketName = process.env.SUPABASE_STORAGE_BUCKET || "uploads";
      const objectPath = `${folder}/${fileName}`;
      const fileBuffer = fs.readFileSync(req.file.path);

      const { error: uploadError } = await supabase.storage
        .from(bucketName)
        .upload(objectPath, fileBuffer, {
          contentType: req.file.mimetype,
          upsert: false,
        });
      try { fs.unlinkSync(req.file.path); } catch {}

      if (uploadError) {
        const err = new Error(uploadError.message || "Upload failed");
        (err as any).status = 500;
        throw err;
      }

      const { data } = supabase.storage.from(bucketName).getPublicUrl(objectPath);
      res.json({ publicUrl: data.publicUrl });
      return;
    }

    // Local/dev: store under public/uploads so it can be served by /uploads static.
    const bucketDir = path.join(rootDir, "public/uploads", folder);
    fs.mkdirSync(bucketDir, { recursive: true });
    const destination = path.join(bucketDir, fileName);
    fs.renameSync(req.file.path, destination);
    res.json({ publicUrl: `/uploads/${folder}/${fileName}` });
  } catch (error) {
    next(error);
  }
});

app.get("/api/reports/pending-verification", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    // Get reports that are pending and NOT created by the current user
    const { rows } = await pool.query(
      `select wr.*, p.full_name as reporter_name 
       from waste_reports wr 
       left join profiles p on wr.citizen_id = p.user_id
       where wr.status = 'pending' 
       and wr.citizen_id != $1 
       and wr.image_url is not null 
       order by wr.created_at desc limit 10`,
      [user.id]
    );
    res.json({ data: rows });
  } catch (error) { next(error); }
});

app.post("/api/reports/verify", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { reportId, isLegit } = req.body;
    if (!reportId) throw new Error("Report ID required");
    
    // Award 10 points for verification
    await pool.query(
      `insert into wallet_transactions (user_id, type, action, points, reference_id, reference_type) values ($1, 'earned', 'Peer Verification', 10, $2, 'waste_reports')`,
      [user.id, reportId]
    );
    await pool.query(
      `update cleanliness_scores set score = score + 10, updated_at = now() where user_id = $1`,
      [user.id]
    );
    
    res.json({ success: true, message: isLegit ? "Report verified as genuine!" : "Report flagged. Thank you for your input.", pointsEarned: 10 });
  } catch (error) { next(error); }
});

app.get("/api/community-feed", async (req, res, next) => {
  try {
    const { rows } = await pool.query(
      `select cp.*, 
        ngo.full_name as ngo_name, ngo.avatar_url as ngo_avatar,
        cit.full_name as citizen_name
      from community_posts cp
      left join profiles ngo on cp.ngo_id = ngo.user_id
      left join profiles cit on cp.citizen_id = cit.user_id
      order by cp.created_at desc limit 50`
    );
    res.json({ data: rows });
  } catch (error) { next(error); }
});

app.post("/api/ngo/create-post", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { donation_id, citizen_id, content, image_url } = req.body;
    if (!content || !image_url) throw new Error("Missing content or image");
    const { rows } = await pool.query(
      `insert into community_posts (donation_id, ngo_id, citizen_id, content, image_url) values ($1, $2, $3, $4, $5) returning *`,
      [donation_id || null, user.id, citizen_id, content, image_url]
    );
    res.json({ data: rows[0] });
  } catch (error) { next(error); }
});

app.get("/api/messages/:reference_id", async (req, res, next) => {
  try {
    await requireAuth(req);
    const { reference_id } = req.params;
    const { rows } = await pool.query(
      `select m.*, p.full_name as sender_name, p.avatar_url as sender_avatar 
       from messages m
       left join profiles p on m.sender_id = p.user_id
       where reference_id = $1 
       order by created_at asc`,
      [reference_id]
    );
    res.json({ data: rows });
  } catch (err) { next(err); }
});

app.post("/api/messages", async (req, res, next) => {
  try {
    const user = await requireAuth(req);
    const { receiver_id, content, reference_id } = req.body;
    if (!receiver_id || !content) throw new Error("Missing data");
    
    const { rows } = await pool.query(
      `insert into messages (sender_id, receiver_id, content, reference_id) values ($1, $2, $3, $4) returning *`,
      [user.id, receiver_id, content, reference_id || null]
    );
    
    // Quick trick to append sender data so UI can immediately append
    const { rows: fullRows } = await pool.query(
      `select m.*, p.full_name as sender_name, p.avatar_url as sender_avatar 
       from messages m
       left join profiles p on m.sender_id = p.user_id
       where m.id = $1`,
       [rows[0].id]
    );
    res.json({ data: fullRows[0] });
  } catch (err) { next(err); }
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const connCodes = new Set([
    "ECONNREFUSED",
    "ETIMEDOUT",
    "ENOTFOUND",
    "ECONNRESET",
    "EPIPE",
    "EAI_AGAIN",
  ]);
  const isConn = typeof err?.code === "string" && connCodes.has(err.code);
  const status =
    typeof err?.status === "number"
      ? err.status
      : isConn
        ? 503
        : typeof err?.statusCode === "number"
          ? err.statusCode
          : 400;
  const dbUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;
  const hint =
    status === 503 && process.env.VERCEL && isConn
      ? isSupabaseDirectDbUrl(dbUrl)
        ? supabasePoolerHint()
        : "Database connection failed from Vercel. Prefer Supabase Transaction pooler (port 6543), confirm SUPABASE_DATABASE_URL, and check project network / IP settings."
      : undefined;
  res.status(status).json({
    error: err?.message || "Request failed",
    ...(hint ? { hint } : {}),
  });
});

async function start() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(rootDir, "dist")));
    app.get("*", (_req, res) => res.sendFile(path.join(rootDir, "dist/index.html")));
  } else {
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  }
  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
}

if (!process.env.VERCEL) {
  start().catch(error => {
    console.error(error);
    process.exit(1);
  });
}

export default app;
