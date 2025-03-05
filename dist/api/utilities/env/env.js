"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.saltRounds = exports.minioUrlExpire = exports.minioSecretKey = exports.minioAccessKey = exports.minioWebUiPort = exports.minioApiPort = void 0;
require("dotenv/config");
// minio
exports.minioApiPort = Number(process.env.MINIO_API_PORT);
exports.minioWebUiPort = Number(process.env.MINIO_WEBUI_PORT);
exports.minioAccessKey = process.env.MINIO_ROOT_USER;
exports.minioSecretKey = process.env.MINIO_ROOT_PASSWORD;
exports.minioUrlExpire = Number(process.env.MINIO_URL_EXPIRED);
// bcryp
exports.saltRounds = Number(process.env.BCRYPT_SALTROUNDS);
