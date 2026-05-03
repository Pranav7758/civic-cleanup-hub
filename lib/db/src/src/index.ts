import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema";

const { Pool } = pg;

function getConnectionConfig(): pg.PoolConfig {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required.");
  }
  return { connectionString, ssl: false };
}

export const pool = new Pool(getConnectionConfig());
export const db = drizzle(pool, { schema });

export * from "./schema";
