ALTER TABLE "job_find_category" DROP CONSTRAINT "job_find_category_job_finding_post_id_job_finding_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_find_category" DROP CONSTRAINT "job_find_category_job_category_id_job_category_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_matched" DROP CONSTRAINT "job_finding_post_matched_job_finding_post_id_job_finding_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_matched" DROP CONSTRAINT "job_finding_post_matched_employer_id_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_matched" DROP CONSTRAINT "job_finding_post_matched_oauth_employer_id_oauth_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_matched" DROP CONSTRAINT "job_finding_post_matched_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_matched" DROP CONSTRAINT "job_finding_post_matched_oauth_company_id_oauth_company_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_skill" DROP CONSTRAINT "job_finding_post_skill_job_finding_post_id_job_finding_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post_skill" DROP CONSTRAINT "job_finding_post_skill_skill_id_skill_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post" DROP CONSTRAINT "job_finding_post_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_finding_post" DROP CONSTRAINT "job_finding_post_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hire_category" DROP CONSTRAINT "job_hire_category_job_hiring_post_id_job_hiring_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hire_category" DROP CONSTRAINT "job_hire_category_job_category_id_job_category_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_matched_seekers" DROP CONSTRAINT "job_hiring_post_matched_seekers_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_matched_seekers" DROP CONSTRAINT "job_hiring_post_matched_seekers_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_matched_seekers" DROP CONSTRAINT "job_hiring_post_matched_seekers_job_hiring_post_matched_id_job_hiring_post_matched_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_matched" DROP CONSTRAINT "job_hiring_post_matched_job_hiring_post_id_job_hiring_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_skill" DROP CONSTRAINT "job_hiring_post_skill_job_hiring_post_id_job_hiring_post_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post_skill" DROP CONSTRAINT "job_hiring_post_skill_skill_id_skill_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post" DROP CONSTRAINT "job_hiring_post_employer_id_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post" DROP CONSTRAINT "job_hiring_post_oauth_employer_id_oauth_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post" DROP CONSTRAINT "job_hiring_post_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "job_hiring_post" DROP CONSTRAINT "job_hiring_post_oauth_company_id_oauth_company_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_skill" DROP CONSTRAINT "job_seeker_skill_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_skill" DROP CONSTRAINT "job_seeker_skill_skill_id_skill_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_vulnerability" DROP CONSTRAINT "job_seeker_vulnerability_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "job_seeker_vulnerability" DROP CONSTRAINT "job_seeker_vulnerability_vulnerability_type_id_vulnerability_type_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_oauth_employer_id_oauth_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_company_id_company_id_fk";
--> statement-breakpoint
ALTER TABLE "notification" DROP CONSTRAINT "notification_oauth_company_id_oauth_company_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_job_seeker_skill" DROP CONSTRAINT "oauth_job_seeker_skill_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_job_seeker_skill" DROP CONSTRAINT "oauth_job_seeker_skill_skill_id_skill_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_job_seeker_vulnerability" DROP CONSTRAINT "oauth_job_seeker_vulnerability_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "oauth_job_seeker_vulnerability" DROP CONSTRAINT "oauth_job_seeker_vulnerability_vulnerability_type_id_vulnerability_type_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_job_seeker_id_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_oauth_job_seeker_id_oauth_job_seeker_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_oauth_employer_id_oauth_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_oauth_company_id_oauth_company_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_admin_id_admin_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_oauth_admin_id_oauth_admin_id_fk";
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
 ALTER TABLE "job_finding_post_matched" ADD CONSTRAINT "job_finding_post_matched_oauth_company_id_oauth_company_id_fk" FOREIGN KEY ("oauth_company_id") REFERENCES "public"."oauth_company"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "job_hiring_post" ADD CONSTRAINT "job_hiring_post_oauth_company_id_oauth_company_id_fk" FOREIGN KEY ("oauth_company_id") REFERENCES "public"."oauth_company"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "notification" ADD CONSTRAINT "notification_oauth_company_id_oauth_company_id_fk" FOREIGN KEY ("oauth_company_id") REFERENCES "public"."oauth_company"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_oauth_employer_id_oauth_employer_id_fk" FOREIGN KEY ("oauth_employer_id") REFERENCES "public"."oauth_employer"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_oauth_company_id_oauth_company_id_fk" FOREIGN KEY ("oauth_company_id") REFERENCES "public"."oauth_company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_admin_id_admin_id_fk" FOREIGN KEY ("admin_id") REFERENCES "public"."admin"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_oauth_admin_id_oauth_admin_id_fk" FOREIGN KEY ("oauth_admin_id") REFERENCES "public"."oauth_admin"("id") ON DELETE set null ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
