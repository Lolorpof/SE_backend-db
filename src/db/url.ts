import "dotenv/config";
import { connStringSchema } from "../schemas/schemas";
import { fromError } from "zod-validation-error";

const pg_superuser = process.env.POSTGRES_SUPERUSER;
const pg_superpassword = process.env.POSTGRES_SUPERPASSWORD;
const pg_user = process.env.POSTGRES_USER;
const pg_password = process.env.POSTGRES_PASSWORD;
const pg_host = process.env.POSTGRES_HOST;
const pg_port = process.env.POSTGRES_PORT;
const pg_db = process.env.POSTGRES_DB;

const pg_object = {
  pg_superuser,
  pg_superpassword,
  pg_user,
  pg_password,
  pg_host,
  pg_port,
  pg_db,
};

// checking template
const parsed = connStringSchema.safeParse(pg_object);
if (!parsed.success) {
  console.log(`>>> ${fromError(parsed.error)} <<<`);
}

const super_url = `postgres://${pg_superuser}:${pg_superpassword}@${pg_host}:${pg_port}/${pg_db}`;
const url = `postgres://${pg_user}:${pg_password}@${pg_host}:${pg_port}/${pg_db}`;

export { url, super_url };
