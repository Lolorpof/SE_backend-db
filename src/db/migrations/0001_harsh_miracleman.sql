ALTER TABLE "registration_approval" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "registration_approval" ADD COLUMN "approved_at" timestamp;--> statement-breakpoint
ALTER TABLE "registration_approval" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;