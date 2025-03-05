"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const bucketName_1 = require("./bucketName");
const minio_1 = require("./minio");
async function main() {
    await (0, minio_1.createBucketIfNotExisted)(bucketName_1.userProfileImageBucket);
    await (0, minio_1.createBucketIfNotExisted)(bucketName_1.registrationApprovalImageBucket);
    await (0, minio_1.createBucketIfNotExisted)(bucketName_1.jobSeekerResumeImageBucket);
}
main();
