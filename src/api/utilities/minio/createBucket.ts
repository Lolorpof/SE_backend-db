import {
  jobSeekerResumeImageBucket,
  registrationApprovalImageBucket,
  userProfileImageBucket,
} from "./bucketName";
import { createBucketIfNotExisted } from "./minio";

async function main() {
  await createBucketIfNotExisted(userProfileImageBucket);
  await createBucketIfNotExisted(registrationApprovalImageBucket);
  await createBucketIfNotExisted(jobSeekerResumeImageBucket);
}

main();
