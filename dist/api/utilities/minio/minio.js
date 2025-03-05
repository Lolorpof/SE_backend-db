"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.createBucketIfNotExisted = exports.testMinioConnection = exports.minioClient = void 0;
const Minio = __importStar(require("minio"));
const env_1 = require("../env");
exports.minioClient = new Minio.Client({
    endPoint: "t10-minio",
    useSSL: false,
    port: 9000, // MinIO's internal port in Docker - this must stay as 9000
    accessKey: env_1.minioAccessKey,
    secretKey: env_1.minioSecretKey,
});
// Note about port configuration:
// - Inside Docker network: MinIO uses port 9000 (fixed internal port)
// - External access: Uses MINIO_API_PORT through nginx reverse proxy
// This client runs inside Docker network, so it must use port 9000
// Test MinIO connection
const testMinioConnection = async () => {
    try {
        // List buckets as a connection test
        const buckets = await exports.minioClient.listBuckets();
        console.log('MinIO Connection Successful. Available buckets:', buckets.map(b => b.name));
        return true;
    }
    catch (error) {
        console.error('MinIO Connection Failed:', error);
        return false;
    }
};
exports.testMinioConnection = testMinioConnection;
const createBucketIfNotExisted = async (bucketName) => {
    const bucketExists = await exports.minioClient.bucketExists(bucketName);
    // bucket with the name {bucketName} doesn't exist yet
    if (!bucketExists) {
        await exports.minioClient.makeBucket(bucketName);
    }
};
exports.createBucketIfNotExisted = createBucketIfNotExisted;
