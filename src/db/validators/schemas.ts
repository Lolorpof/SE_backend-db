import { z } from "zod";

// connection string schema
const connStringSchema = z.object({
  pg_superuser: z.string(),
  pg_superpassword: z.string(),
  pg_user: z.string(),
  pg_password: z.string(),
  pg_host: z.string(),
  pg_port: z.union([z.string(), z.number().int()]),
  pg_db: z.string(),
});

export { connStringSchema };
