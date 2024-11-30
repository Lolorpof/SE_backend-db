import { super_url, url } from "./url";
import pg from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "./schema";

const { Pool } = pg;

export const pool = new Pool({ connectionString: url });

export const superPool = new Pool({ connectionString: super_url });

export const drizzlePool = drizzle(pool, { schema: schema, logger: true });

export const drizzleSuperPool = drizzle(superPool, {
  schema: schema,
  logger: true,
});
