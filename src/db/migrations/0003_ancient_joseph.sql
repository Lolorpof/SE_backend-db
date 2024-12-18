CREATE TYPE "public"."publicStatus" AS ENUM('SHOWN', 'HIDDEN');--> statement-breakpoint
CREATE TYPE "public"."severityLvl" AS ENUM('LOW', 'MEDIUM', 'HIGH');--> statement-breakpoint
CREATE TYPE "public"."userRole" AS ENUM('MEMBER', 'ADMIN');--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"about" varchar(2048),
	"profile_picture" varchar(255),
	"contact" varchar(255),
	"location" varchar(255),
	"company_id" uuid NOT NULL,
	CONSTRAINT "company_profile_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "company" (
	"id" uuid PRIMARY KEY NOT NULL,
	"company_name" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	CONSTRAINT "company_company_name_unique" UNIQUE("company_name"),
	CONSTRAINT "company_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_category" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(540),
	CONSTRAINT "job_category_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hire_category" (
	"job_hiring_id" uuid NOT NULL,
	"job_category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_hiring" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(540),
	"company_id" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_search_category" (
	"job_searching_id" uuid NOT NULL,
	"job_category_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "job_searching" (
	"id" uuid PRIMARY KEY NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" varchar(540),
	"user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"oauth_user_id" uuid DEFAULT gen_random_uuid() NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_user" (
	"id" uuid PRIMARY KEY NOT NULL,
	"username" varchar(255) NOT NULL,
	"email" varchar(255) DEFAULT 'UNDEFINED' NOT NULL,
	"role" "userRole" DEFAULT 'MEMBER' NOT NULL,
	CONSTRAINT "oauth_user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "oauth_user_vulnerability" (
	"id" uuid PRIMARY KEY NOT NULL,
	"severity" "severityLvl" DEFAULT 'LOW' NOT NULL,
	"public_status" "publicStatus" DEFAULT 'SHOWN' NOT NULL,
	"oauth_user_id" uuid NOT NULL,
	"vulnerability_type_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_profile" (
	"id" uuid PRIMARY KEY NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"about" varchar(2048),
	"profile_picture" varchar(255) NOT NULL,
	"contact" varchar(255) NOT NULL,
	"user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	"oauth_user_id" uuid DEFAULT gen_random_uuid() NOT NULL,
	CONSTRAINT "user_profile_first_name_unique" UNIQUE("first_name"),
	CONSTRAINT "user_profile_last_name_unique" UNIQUE("last_name"),
	CONSTRAINT "user_profile_profile_picture_unique" UNIQUE("profile_picture"),
	CONSTRAINT "user_profile_contact_unique" UNIQUE("contact")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"username" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"role" "userRole" DEFAULT 'MEMBER' NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "user_vulnerability" (
	"id" uuid PRIMARY KEY NOT NULL,
	"severity" "severityLvl" DEFAULT 'LOW' NOT NULL,
	"public_status" "publicStatus" DEFAULT 'SHOWN' NOT NULL,
	"user_id" uuid NOT NULL,
	"vulnerability_type_id" uuid NOT NULL
);
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "vulnerability_type" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"description" varchar(2048),
	CONSTRAINT "vulnerability_type_name_unique" UNIQUE("name")
);
--> statement-breakpoint
DROP TABLE "test" CASCADE;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "company_profile" ADD CONSTRAINT "company_profile_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hire_category" ADD CONSTRAINT "job_hire_category_job_hiring_id_job_hiring_id_fk" FOREIGN KEY ("job_hiring_id") REFERENCES "public"."job_hiring"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hire_category" ADD CONSTRAINT "job_hire_category_job_category_id_job_category_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_hiring" ADD CONSTRAINT "job_hiring_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_search_category" ADD CONSTRAINT "job_search_category_job_searching_id_job_searching_id_fk" FOREIGN KEY ("job_searching_id") REFERENCES "public"."job_searching"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_search_category" ADD CONSTRAINT "job_search_category_job_category_id_job_category_id_fk" FOREIGN KEY ("job_category_id") REFERENCES "public"."job_category"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_searching" ADD CONSTRAINT "job_searching_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "job_searching" ADD CONSTRAINT "job_searching_oauth_user_id_oauth_user_id_fk" FOREIGN KEY ("oauth_user_id") REFERENCES "public"."oauth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_user_vulnerability" ADD CONSTRAINT "oauth_user_vulnerability_oauth_user_id_oauth_user_id_fk" FOREIGN KEY ("oauth_user_id") REFERENCES "public"."oauth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "oauth_user_vulnerability" ADD CONSTRAINT "oauth_user_vulnerability_vulnerability_type_id_vulnerability_type_id_fk" FOREIGN KEY ("vulnerability_type_id") REFERENCES "public"."vulnerability_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_profile" ADD CONSTRAINT "user_profile_oauth_user_id_oauth_user_id_fk" FOREIGN KEY ("oauth_user_id") REFERENCES "public"."oauth_user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_vulnerability" ADD CONSTRAINT "user_vulnerability_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "user_vulnerability" ADD CONSTRAINT "user_vulnerability_vulnerability_type_id_vulnerability_type_id_fk" FOREIGN KEY ("vulnerability_type_id") REFERENCES "public"."vulnerability_type"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
