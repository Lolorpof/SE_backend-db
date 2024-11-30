import { defineConfig } from "drizzle-kit";
import { url } from "./src/db/url";

export default defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dbCredentials: { url: url },
  verbose: true,
  strict: true,
});
