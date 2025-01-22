CREATE TYPE "public"."userApprovalStatus" AS ENUM('APPROVED', 'UNAPPROVED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_finding_post_skill" (
	"job_finding_post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring_post_skill" (
	"job_hiring_post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL
);
--> statement-breakpoint
ALTER TABLE "company" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "employer" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "job_seeker" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_company" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_employer" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
ALTER TABLE "oauth_job_seeker" ADD COLUMN "approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_skill" ADD CONSTRAINT "job_finding_post_skill_job_finding_post_id_job_finding_post_id_fk" FOREIGN KEY ("job_finding_post_id") REFERENCES "public"."job_finding_post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_skill" ADD CONSTRAINT "job_finding_post_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_skill" ADD CONSTRAINT "job_hiring_post_skill_job_hiring_post_id_job_hiring_post_id_fk" FOREIGN KEY ("job_hiring_post_id") REFERENCES "public"."job_hiring_post"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_skill" ADD CONSTRAINT "job_hiring_post_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
