import connectPgSimple from "connect-pg-simple";
import session from "express-session";
import { superPool } from "../../db/conn";

const pgSession = connectPgSimple(session);

export const sessionStore = new pgSession({
  pool: superPool,
  createTableIfMissing: true,
  pruneSessionInterval: 60,
  tableName: "user_sessions",
});
