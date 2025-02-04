CREATE TYPE "public"."jobPostType" AS ENUM('FULLTIME', 'PARTTIME', 'FREELANCE');--> statement-breakpoint
ALTER TABLE "job_finding_post" ADD COLUMN "job_post_type" "jobPostType" NOT NULL;--> statement-breakpoint
ALTER TABLE "job_hiring_post" ADD COLUMN "job_post_type" "jobPostType" NOT NULL;