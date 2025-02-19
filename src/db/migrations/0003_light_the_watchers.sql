ALTER TABLE "company" ADD COLUMN "province_address" varchar(64);--> statement-breakpoint
ALTER TABLE "employer" ADD COLUMN "province_address" varchar(64);--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "province_address" varchar(64);--> statement-breakpoint
ALTER TABLE "oauth_employer" ADD COLUMN "province_address" varchar(64);--> statement-breakpoint
ALTER TABLE "oauth_job_seeker" ADD COLUMN "province_address" varchar(64);