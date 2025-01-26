ALTER TABLE "oauth_admin" ADD COLUMN "provider_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_company" ADD COLUMN "provider_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_employer" ADD COLUMN "provider_id" varchar(255) NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_job_seeker" ADD COLUMN "provider_id" varchar(255) NOT NULL;