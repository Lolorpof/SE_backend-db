import "dotenv/config";

// minio
export const minioApiPort = Number(process.env.MINIO_API_PORT as string);

export const minioWebUiPort = Number(process.env.MINIO_WEBUI_PORT as string);

export const minioAccessKey = process.env.MINIO_ROOT_USER as string;

export const minioSecretKey = process.env.MINIO_ROOT_PASSWORD as string;

export const minioUrlExpire = Number(process.env.MINIO_URL_EXPIRED as string);

// bcryp
export const saltRounds = Number(process.env.BCRYPT_SALTROUNDS as string);
