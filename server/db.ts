import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "../shared/schema.js";

const { Pool } = pg;

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error(
    "Set SUPABASE_DATABASE_URL (or DATABASE_URL) to your Postgres connection string. Use Supabase Transaction pooler on Vercel (port 6543).",
  );
}

const connectionString = normalizePostgresUrl(databaseUrl);

/** Direct db host (port 5432) is unreliable from Vercel serverless; use Transaction pooler (6543) instead. */
export function isSupabaseDirectDbUrl(url: string | undefined): boolean {
  if (!url) return false;
  try {
    const u = new URL(normalizePostgresUrl(url));
    const host = u.hostname.toLowerCase();
    if (!/^db\.[a-z0-9-]+\.supabase\.co$/i.test(host)) return false;
    const port = u.port || "5432";
    return port === "5432";
  } catch {
    return false;
  }
}

export function supabasePoolerHint(): string {
  return (
    "Database unreachable from Vercel. In Supabase: Project Settings → Database → Connection string → " +
    "Method: Transaction pooler (host ends with pooler.supabase.com, port 6543). " +
    "Append ?pgbouncer=true if not already present. Put that URI in SUPABASE_DATABASE_URL on Vercel. " +
    "Do not use the direct db.*.supabase.co:5432 URI for serverless."
  );
}

const isVercel = Boolean(process.env.VERCEL);
const useSsl =
  connectionString.includes("supabase.co") ||
  connectionString.includes("pooler.supabase.com") ||
  connectionString.includes("supabase.com");

export const pool = new Pool({
  connectionString,
  ssl: useSsl ? { rejectUnauthorized: false } : undefined,
  // Serverless: one connection per invocation avoids exhausting Supabase connection limits.
  max: isVercel ? 1 : 10,
  idleTimeoutMillis: isVercel ? 10_000 : 30_000,
  connectionTimeoutMillis: isVercel ? 25_000 : 10_000,
  allowExitOnIdle: isVercel,
});

export const db = drizzle(pool, { schema });

function normalizePostgresUrl(value: string) {
  try {
    new URL(value);
    return value;
  } catch {
    const protocolEnd = value.indexOf("://");
    const lastAt = value.lastIndexOf("@");
    if (protocolEnd === -1 || lastAt === -1) return value;
    const protocol = value.slice(0, protocolEnd + 3);
    const credentials = value.slice(protocolEnd + 3, lastAt);
    const hostAndPath = value.slice(lastAt + 1);
    const colon = credentials.indexOf(":");
    if (colon === -1) return value;
    const username = encodeURIComponent(credentials.slice(0, colon));
    const password = encodeURIComponent(credentials.slice(colon + 1));
    return `${protocol}${username}:${password}@${hostAndPath}`;
  }
}
