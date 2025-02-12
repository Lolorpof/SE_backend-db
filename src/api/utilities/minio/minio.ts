import * as Minio from "minio";
import { minioApiPort, minioAccessKey, minioSecretKey } from "../env";

export const minioClient = new Minio.Client({
  endPoint: "localhost", // or the correct hostname/IP address
  useSSL: false,
  port: minioApiPort,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});

export const createBucketIfNotExisted = async (bucketName: string) => {
  const bucketExists = await minioClient.bucketExists(bucketName);

  // bucket with the name {bucketName} doesn't exist yet
  if (!bucketExists) {
    await minioClient.makeBucket(bucketName);
  }
};
