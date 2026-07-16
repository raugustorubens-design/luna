import "dotenv/config";

import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";

import * as schema from "./schema";

const { Pool } = pg;

// ================= POOL =================
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,

  ssl: {
    rejectUnauthorized: false,
  },
});

pool.on("error", (err) => {
  console.error("PG POOL ERROR:", err);
});

// ================= TESTE RAW =================
(async () => {
  try {
    const client = await pool.connect();

    const result = await client.query("select now()");

    console.log("PG CONNECTED:", result.rows);

    client.release();

  } catch (err) {

    console.error("PG RAW ERROR:", err);
  }
})();

// ================= DB =================
export const db = drizzle(pool, {
  schema,
});

// ================= EXPORTS =================
export * from "./schema";