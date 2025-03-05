"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sessionStore = void 0;
const connect_pg_simple_1 = __importDefault(require("connect-pg-simple"));
const express_session_1 = __importDefault(require("express-session"));
const conn_1 = require("../../db/conn");
const pgSession = (0, connect_pg_simple_1.default)(express_session_1.default);
exports.sessionStore = new pgSession({
    pool: conn_1.superPool,
    createTableIfMissing: true,
    pruneSessionInterval: 60,
    tableName: "user_sessions",
});
