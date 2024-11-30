ALTER TABLE "test" ADD PRIMARY KEY ("id");--> statement-breakpoint
ALTER TABLE "test" ALTER COLUMN "id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "test" ALTER COLUMN "name" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "test" ALTER COLUMN "name" SET NOT NULL;