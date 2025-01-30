CREATE TYPE "public"."approvalStatus" AS ENUM('ACCEPTED', 'DENIED', 'UNAPPROVED');--> statement-breakpoint
CREATE TYPE "public"."jobHirerType" AS ENUM('EMPLOYER', 'OAUTHEMPLOYER', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."jobMatchedStatus" AS ENUM('INPROGRESS', 'ACCEPTED', 'DENIED');--> statement-breakpoint
CREATE TYPE "public"."jobSeekerType" AS ENUM('NORMAL', 'OAUTH');--> statement-breakpoint
CREATE TYPE "public"."normalUserType" AS ENUM('JOBSEEKER', 'OAUTHJOBSEEKER', 'EMPLOYER', 'OAUTHEMPLOYER', 'COMPANY');--> statement-breakpoint
CREATE TYPE "public"."notificationStatus" AS ENUM('READ', 'UNREAD');--> statement-breakpoint
CREATE TYPE "public"."postStatus" AS ENUM('MATCHED', 'UNMATCHED', 'MATCHED_INPROG');--> statement-breakpoint
CREATE TYPE "public"."providerType" AS ENUM('GOOGLE', 'LINE');--> statement-breakpoint
CREATE TYPE "public"."publicStatus" AS ENUM('SHOWN', 'HIDDEN');--> statement-breakpoint
CREATE TYPE "public"."severityLvl" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."userType" AS ENUM('JOBSEEKER', 'OAUTH_JOBSEEKER', 'EMPLOYER', 'OAUTH_EMPLOYER', 'COMPANY', 'ADMIN');--> statement-breakpoint
CREATE TYPE "public"."userApprovalStatus" AS ENUM('APPROVED', 'UNAPPROVED');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "admin" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255),
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"contact" varchar(255),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "admin_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"official_name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"about_us" varchar(2050),
	"contact" varchar(255),
	"address" varchar(255),
	"approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "company_official_name_unique" UNIQUE("official_name"),
	CONSTRAINT "company_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "employer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"about_me" varchar(2050),
	"contact" varchar(255),
	"address" varchar(255),
	"approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_category" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(540),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_find_category" (
	"job_finding_post_id" uuid NOT NULL,
	"job_category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_finding_post_matched" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_finding_post_id" uuid NOT NULL,
	"status" "jobMatchedStatus" DEFAULT 'INPROGRESS' NOT NULL,
	"job_hirer_type" "jobHirerType" NOT NULL,
	"employer_id" uuid,
	"oauth_employer_id" uuid,
	"company_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_finding_post_skill" (
	"job_finding_post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_finding_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(540),
	"job_location" varchar(255) NOT NULL,
	"expected_salary" integer NOT NULL,
	"work_dates" varchar(1024) NOT NULL,
	"work_hours_range" varchar(255) NOT NULL,
	"status" "postStatus" DEFAULT 'UNMATCHED' NOT NULL,
	"job_seeker_type" "jobSeekerType" NOT NULL,
	"job_seeker_id" uuid,
	"oauth_job_seeker_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hire_category" (
	"job_hiring_post_id" uuid NOT NULL,
	"job_category_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring_post_matched_seekers" (
	"job_seeker_type" "jobSeekerType" NOT NULL,
	"job_seeker_id" uuid,
	"oauth_job_seeker_id" uuid,
	"job_hiring_post_matched_id" uuid NOT NULL,
	"status" "jobMatchedStatus" DEFAULT 'INPROGRESS' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring_post_matched" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"job_hiring_post_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring_post_skill" (
	"job_hiring_post_id" uuid NOT NULL,
	"skill_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring_post" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(540),
	"job_location" varchar(255) NOT NULL,
	"salary" integer NOT NULL,
	"work_dates" varchar(1024) NOT NULL,
	"work_hours_range" varchar(255) NOT NULL,
	"status" "postStatus" DEFAULT 'UNMATCHED' NOT NULL,
	"hired_amount" integer DEFAULT 1 NOT NULL,
	"job_hirer_type" "jobHirerType" NOT NULL,
	"employer_id" uuid,
	"oauth_employer_id" uuid,
	"company_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker_skill" (
	"job_seeker_id" uuid,
	"skill_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"about_me" varchar(2050),
	"contact" varchar(255),
	"resume" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"address" varchar(255),
	"approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "job_seeker_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_seeker_vulnerability" (
	"severity" "severityLvl" DEFAULT 'LOW' NOT NULL,
	"public_status" "publicStatus" DEFAULT 'SHOWN' NOT NULL,
	"job_seeker_id" uuid NOT NULL,
	"vulnerability_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "notification" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "notificationStatus" DEFAULT 'UNREAD' NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(1024) NOT NULL,
	"user_type" "normalUserType" NOT NULL,
	"job_seeker_id" uuid,
	"oauth_job_seeker_id" uuid,
	"employer_id" uuid,
	"oauth_employer_id" uuid,
	"company_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_employer" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"about_me" varchar(2050),
	"contact" varchar(255),
	"provider" "providerType" NOT NULL,
	"address" varchar(255),
	"approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_employer_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_job_seeker_skill" (
	"oauth_job_seeker_id" uuid,
	"skill_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_job_seeker" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"provider_id" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"profile_picture" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"about_me" varchar(2050),
	"contact" varchar(255),
	"resume" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"provider" "providerType" NOT NULL,
	"address" varchar(255),
	"approval_status" "userApprovalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "oauth_job_seeker_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_job_seeker_vulnerability" (
	"severity" "severityLvl" DEFAULT 'LOW' NOT NULL,
	"public_status" "publicStatus" DEFAULT 'SHOWN' NOT NULL,
	"oauth_job_seeker_id" uuid NOT NULL,
	"vulnerability_type_id" uuid NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "registration_approval" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"status" "approvalStatus" DEFAULT 'UNAPPROVED' NOT NULL,
	"user_type" "normalUserType" NOT NULL,
	"job_seeker_id" uuid,
	"oauth_job_seeker_id" uuid,
	"employer_id" uuid,
	"oauth_employer_id" uuid,
	"company_id" uuid,
	"admin_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"approved_at" timestamp,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "skill" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(1024),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "skill_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_sessions" (
	"sid" varchar(255) PRIMARY KEY NOT NULL,
	"sess" json NOT NULL,
	"expire" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vulnerability_type" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2048),
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vulnerability_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_find_category" ADD CONSTRAINT "job_find_category_job_finding_post_id_job_finding_post_id_fk" FOREIGN KEY ("job_finding_post_id") REFERENCES "public"."job_finding_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_find_category" ADD CONSTRAINT "job_find_category_job_category_id_job_category_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_category"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_matched" ADD CONSTRAINT "job_finding_post_matched_job_finding_post_id_job_finding_post_id_fk" FOREIGN KEY ("job_finding_post_id") REFERENCES "public"."job_finding_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_matched" ADD CONSTRAINT "job_finding_post_matched_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_matched" ADD CONSTRAINT "job_finding_post_matched_oauth_employer_id_oauth_employer_id_fk" FOREIGN KEY ("oauth_employer_id") REFERENCES "public"."oauth_employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_matched" ADD CONSTRAINT "job_finding_post_matched_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_skill" ADD CONSTRAINT "job_finding_post_skill_job_finding_post_id_job_finding_post_id_fk" FOREIGN KEY ("job_finding_post_id") REFERENCES "public"."job_finding_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post_skill" ADD CONSTRAINT "job_finding_post_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post" ADD CONSTRAINT "job_finding_post_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_finding_post" ADD CONSTRAINT "job_finding_post_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hire_category" ADD CONSTRAINT "job_hire_category_job_hiring_post_id_job_hiring_post_id_fk" FOREIGN KEY ("job_hiring_post_id") REFERENCES "public"."job_hiring_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hire_category" ADD CONSTRAINT "job_hire_category_job_category_id_job_category_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_category"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_matched_seekers" ADD CONSTRAINT "job_hiring_post_matched_seekers_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_matched_seekers" ADD CONSTRAINT "job_hiring_post_matched_seekers_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_matched_seekers" ADD CONSTRAINT "job_hiring_post_matched_seekers_job_hiring_post_matched_id_job_hiring_post_matched_id_fk" FOREIGN KEY ("job_hiring_post_matched_id") REFERENCES "public"."job_hiring_post_matched"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_matched" ADD CONSTRAINT "job_hiring_post_matched_job_hiring_post_id_job_hiring_post_id_fk" FOREIGN KEY ("job_hiring_post_id") REFERENCES "public"."job_hiring_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_skill" ADD CONSTRAINT "job_hiring_post_skill_job_hiring_post_id_job_hiring_post_id_fk" FOREIGN KEY ("job_hiring_post_id") REFERENCES "public"."job_hiring_post"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post_skill" ADD CONSTRAINT "job_hiring_post_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post" ADD CONSTRAINT "job_hiring_post_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post" ADD CONSTRAINT "job_hiring_post_oauth_employer_id_oauth_employer_id_fk" FOREIGN KEY ("oauth_employer_id") REFERENCES "public"."oauth_employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring_post" ADD CONSTRAINT "job_hiring_post_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_skill" ADD CONSTRAINT "job_seeker_skill_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_skill" ADD CONSTRAINT "job_seeker_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_vulnerability" ADD CONSTRAINT "job_seeker_vulnerability_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_seeker_vulnerability" ADD CONSTRAINT "job_seeker_vulnerability_vulnerability_type_id_vulnerability_type_id_fk" FOREIGN KEY ("vulnerability_type_id") REFERENCES "public"."vulnerability_type"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_oauth_employer_id_oauth_employer_id_fk" FOREIGN KEY ("oauth_employer_id") REFERENCES "public"."oauth_employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_job_seeker_skill" ADD CONSTRAINT "oauth_job_seeker_skill_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_job_seeker_skill" ADD CONSTRAINT "oauth_job_seeker_skill_skill_id_skill_id_fk" FOREIGN KEY ("skill_id") REFERENCES "public"."skill"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_job_seeker_vulnerability" ADD CONSTRAINT "oauth_job_seeker_vulnerability_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_job_seeker_vulnerability" ADD CONSTRAINT "oauth_job_seeker_vulnerability_vulnerability_type_id_vulnerability_type_id_fk" FOREIGN KEY ("vulnerability_type_id") REFERENCES "public"."vulnerability_type"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_job_seeker_id_job_seeker_id_fk" FOREIGN KEY ("job_seeker_id") REFERENCES "public"."job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_oauth_job_seeker_id_oauth_job_seeker_id_fk" FOREIGN KEY ("oauth_job_seeker_id") REFERENCES "public"."oauth_job_seeker"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_oauth_employer_id_oauth_employer_id_fk" FOREIGN KEY ("oauth_employer_id") REFERENCES "public"."oauth_employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
