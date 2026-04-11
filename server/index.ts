import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import { pool } from "./db";

const app = express();
const upload = multer({ dest: "public/uploads" });
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = process.cwd();
const port = Number(process.env.PORT || 5000);

app.use(express.json({ limit: "2mb" }));
app.use("/uploads", express.static(path.join(rootDir, "public/uploads")));

const tableColumns: Record<string, string[]> = {
  app_users: ["id", "email", "password_hash", "full_name", "created_at"],
  profiles: ["id", "user_id", "full_name", "phone", "avatar_url", "address", "city", "ward", "created_at", "updated_at"],
  user_roles: ["id", "user_id", "role"],
  cleanliness_scores: ["id", "user_id", "score", "tier", "total_reports", "total_scrap_sold", "total_donations", "total_events", "updated_at"],
  training_modules: ["id", "title", "description", "icon", "duration_minutes", "lesson_count", "sort_order", "requires_previous", "created_at"],
  training_progress: ["id", "user_id", "module_id", "progress", "completed", "completed_at", "updated_at"],
  waste_reports: ["id", "citizen_id", "image_url", "waste_type", "description", "latitude", "longitude", "address", "status", "assigned_worker_id", "completion_image_url", "reward_points", "priority", "completed_at", "created_at", "updated_at"],
  wallet_transactions: ["id", "user_id", "type", "action", "points", "reference_id", "reference_type", "created_at"],
  government_benefits: ["id", "user_id", "benefit_type", "discount_percent", "status", "approved_by", "valid_from", "valid_until", "provider", "created_at", "updated_at"],
  scrap_prices: ["id", "category", "item_name", "price_per_kg", "dealer_id", "updated_at"],
  scrap_listings: ["id", "citizen_id", "image_url", "status", "dealer_id", "total_estimate", "total_weight", "latitude", "longitude", "address", "completed_at", "created_at", "updated_at"],
  scrap_listing_items: ["id", "listing_id", "item_name", "category", "weight_kg", "price_per_kg", "total_price"],
  donations: ["id", "citizen_id", "ngo_id", "category", "description", "image_url", "status", "proof_image_url", "latitude", "longitude", "address", "reward_points", "scheduled_at", "completed_at", "created_at", "updated_at"],
  community_events: ["id", "title", "description", "event_type", "location", "latitude", "longitude", "starts_at", "ends_at", "max_participants", "reward_points", "image_url", "organizer_id", "created_at"],
  event_registrations: ["id", "event_id", "user_id", "attended", "created_at"],
  notifications: ["id", "user_id", "title", "message", "type", "read", "reference_id", "reference_type", "created_at"],
  messages: ["id", "sender_id", "receiver_id", "content", "read", "created_at"],
  redeem_items: ["id", "title", "description", "points_cost", "stock", "image_emoji", "active", "created_at"],
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
  const [salt, hash] = stored.split(":");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(hashPassword(password, salt).split(":")[1], "hex"));
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

async function createProfileForUser(userId: string, fullName: string, phone?: string) {
  await pool.query(
    `insert into profiles (user_id, full_name, phone) values ($1, $2, $3) on conflict (user_id) do update set full_name = excluded.full_name, phone = coalesce(excluded.phone, profiles.phone), updated_at = now()`,
    [userId, fullName, phone || null],
  );
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

app.post("/api/upload", upload.single("file"), (req, res, next) => {
  try {
    if (!req.file) throw new Error("File is required");
    const extension = path.extname(req.file.originalname).toLowerCase();
    const fileName = `${crypto.randomUUID()}${extension}`;
    const bucket = String(req.body.bucket || "uploads").replace(/[^a-z0-9-]/gi, "-").toLowerCase();
    const bucketDir = path.join(rootDir, "public/uploads", bucket);
    fs.mkdirSync(bucketDir, { recursive: true });
    const destination = path.join(bucketDir, fileName);
    fs.renameSync(req.file.path, destination);
    res.json({ publicUrl: `/uploads/${bucket}/${fileName}` });
  } catch (error) {
    next(error);
  }
});

app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  res.status(err.status || 400).json({ error: err.message || "Request failed" });
});

async function start() {
  if (process.env.NODE_ENV === "production") {
    app.use(express.static(path.join(rootDir, "dist")));
    app.get("*", (_req, res) => res.sendFile(path.join(rootDir, "dist/index.html")));
  } else {
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

start().catch(error => {
  console.error(error);
  process.exit(1);
});