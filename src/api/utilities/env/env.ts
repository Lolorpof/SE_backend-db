import "dotenv/config";

// minio
export const minioApiPort = Number(process.env.MINIO_API_PORT as string);

export const minioWebUiPort = Number(process.env.MINIO_WEBUI_PORT as string);

export const minioAccessKey = process.env.MINIO_ROOT_USER as string;

export const minioSecretKey = process.env.MINIO_ROOT_PASSWORD as string;
