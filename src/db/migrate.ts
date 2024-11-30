import { migrate } from "drizzle-orm/node-postgres/migrator";
import { drizzle } from "drizzle-orm/node-postgres";
import { superPool } from "./conn";

async function main() {
  await migrate(drizzle(superPool), {
    migrationsSchema: "drizzle",
    migrationsFolder: "./src/db/migrations",
  });
  await superPool.end();
}

main();
