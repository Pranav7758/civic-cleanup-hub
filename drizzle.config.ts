import { defineConfig } from "drizzle-kit";

const databaseUrl = process.env.SUPABASE_DATABASE_URL || process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("SUPABASE_DATABASE_URL or DATABASE_URL is required");
}

export default defineConfig({
  schema: "./shared/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: normalizePostgresUrl(databaseUrl),
    ssl: databaseUrl.includes("supabase.co") ? "require" : undefined,
  },
});

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