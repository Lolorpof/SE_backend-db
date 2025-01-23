ALTER TABLE "notification" DROP CONSTRAINT "notification_employer_id_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_employer_id_employer_id_fk";
--> statement-breakpoint
ALTER TABLE "registration_approval" DROP CONSTRAINT "registration_approval_company_id_company_id_fk";
--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "notification" ADD CONSTRAINT "notification_employer_id_employer_id_fk" FOREIGN KEY ("employer_id") REFERENCES "public"."employer"("id") ON DELETE cascade ON UPDATE cascade;
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
 ALTER TABLE "registration_approval" ADD CONSTRAINT "registration_approval_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE cascade ON UPDATE cascade;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
