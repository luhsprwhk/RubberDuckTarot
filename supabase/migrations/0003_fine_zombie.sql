CREATE TABLE "user_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"block_type_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"progress" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "insights" ALTER COLUMN "resonated" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "insights" ALTER COLUMN "resonated" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "insights" ALTER COLUMN "took_action" SET DEFAULT false;--> statement-breakpoint
ALTER TABLE "insights" ALTER COLUMN "took_action" SET NOT NULL;