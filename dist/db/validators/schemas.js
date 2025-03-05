"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.connStringSchema = void 0;
const zod_1 = require("zod");
// connection string schema
const connStringSchema = zod_1.z.object({
    pg_superuser: zod_1.z.string(),
    pg_superpassword: zod_1.z.string(),
    pg_user: zod_1.z.string(),
    pg_password: zod_1.z.string(),
    pg_host: zod_1.z.string(),
    pg_port: zod_1.z.union([zod_1.z.string(), zod_1.z.number().int()]),
    pg_db: zod_1.z.string(),
});
exports.connStringSchema = connStringSchema;
