import * as Minio from "minio";
import { minioAccessKey, minioSecretKey, minioApiPort } from "../env";

export const minioClient = new Minio.Client({
  endPoint: "minio",
  useSSL: false,
  port: 9000, // MinIO's internal port in Docker - this must stay as 9000
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

// Note about port configuration:
// - Inside Docker network: MinIO uses port 9000 (fixed internal port)
// - External access: Uses MINIO_API_PORT through nginx reverse proxy
// This client runs inside Docker network, so it must use port 9000

// Test MinIO connection
export const testMinioConnection = async () => {
  try {
    // List buckets as a connection test
    const buckets = await minioClient.listBuckets();
    console.log(
      "MinIO Connection Successful. Available buckets:",
      buckets.map((b) => b.name)
    );
    return true;
  } catch (error) {
    console.error("MinIO Connection Failed:", error);
    return false;
  }
};

export const createBucketIfNotExisted = async (bucketName: string) => {
  const bucketExists = await minioClient.bucketExists(bucketName);

  // bucket with the name {bucketName} doesn't exist yet
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }
};
