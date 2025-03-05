"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const migrator_1 = require("drizzle-orm/node-postgres/migrator");
const node_postgres_1 = require("drizzle-orm/node-postgres");
const conn_1 = require("./conn");
async function main() {
    await (0, migrator_1.migrate)((0, node_postgres_1.drizzle)(conn_1.superPool), {
        migrationsSchema: "drizzle",
        migrationsFolder: "./src/db/migrations",
    });
    await conn_1.superPool.end();
}
main();
