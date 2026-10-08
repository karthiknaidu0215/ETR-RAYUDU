import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "./schema/index.js";

const { Pool } = pg;

let pool: any = null;
let db: any = null;

export async function initDatabaseTables() {
  if (!pool) return;
  try {
    const client = await pool.connect();
    try {
      await client.query(`
        CREATE TABLE IF NOT EXISTS uploaded_images (
          id TEXT PRIMARY KEY,
          file_name TEXT NOT NULL,
          content_type TEXT NOT NULL,
          size INTEGER NOT NULL,
          url TEXT NOT NULL,
          storage_provider TEXT NOT NULL,
          data TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS plants (
          id TEXT PRIMARY KEY,
          name TEXT NOT NULL,
          short_name TEXT,
          category TEXT,
          description TEXT,
          image TEXT NOT NULL,
          spacing TEXT,
          plants_per_acre INTEGER,
          growth TEXT,
          fertilizer TEXT,
          maintenance TEXT,
          price INTEGER,
          size_prices JSONB,
          size_availability JSONB,
          size_details JSONB,
          expected_yield_per_plant INTEGER,
          yield_unit TEXT,
          expected_selling_price_per_kg INTEGER,
          harvests_per_year INTEGER,
          color TEXT,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );

        CREATE TABLE IF NOT EXISTS app_state (
          key TEXT PRIMARY KEY,
          data JSONB NOT NULL,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
        );
      `);
      console.log("[ETR DB] Initialized PostgreSQL database tables successfully");
    } finally {
      client.release();
    }
  } catch (err) {
    console.error("[ETR DB] Failed to verify/initialize database tables:", err);
  }
}

try {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: process.env.DATABASE_URL.includes("localhost") || process.env.DATABASE_URL.includes("127.0.0.1")
        ? false
        : { rejectUnauthorized: false }
    });
    db = drizzle(pool, { schema });
    // Run initialization in background
    initDatabaseTables().catch(() => {});
  } else {
    throw new Error("DATABASE_URL not set");
  }
} catch {
  console.warn("[ETR DB] DATABASE_URL not set — database layer running in fallback mode");
  const noOp = {
    findMany: async () => [],
    findFirst: async () => null,
    findUnique: async () => null,
    create: async (d: any) => d?.data ?? {},
    update: async (d: any) => d?.data ?? {},
    delete: async () => ({}),
  };
  db = new Proxy(
    {},
    {
      get: (_, prop) =>
        prop === "query" ? new Proxy({}, { get: () => noOp }) : async () => [],
    },
  );
}

export { pool, db };
export * from "./schema/index.js";
