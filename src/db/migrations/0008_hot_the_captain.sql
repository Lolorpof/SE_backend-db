ALTER TYPE "public"."oauthType" RENAME TO "providerType";--> statement-breakpoint
ALTER TABLE "oauth_admin" RENAME COLUMN "oauth_type" TO "provider";--> statement-breakpoint
ALTER TABLE "oauth_company" RENAME COLUMN "oauth_type" TO "provider";--> statement-breakpoint
ALTER TABLE "oauth_employer" RENAME COLUMN "oauth_type" TO "provider";--> statement-breakpoint
ALTER TABLE "oauth_job_seeker" RENAME COLUMN "oauth_type" TO "provider";