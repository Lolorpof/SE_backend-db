import * as Minio from "minio";
import { minioApiPort, minioAccessKey, minioSecretKey } from "../env";

export const minioClient = new Minio.Client({
  endPoint: "t10-minio",
  useSSL: false,
  port: minioApiPort,
  accessKey: minioAccessKey,
  secretKey: minioSecretKey,
});
