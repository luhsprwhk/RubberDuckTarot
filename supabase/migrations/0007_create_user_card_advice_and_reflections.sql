-- Create user_card_advice table
CREATE TABLE "user_card_advice" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" integer NOT NULL,
	"block_type_id" text NOT NULL,
	"advice" text NOT NULL,
	"generated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_updated" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create user_card_reflections table
CREATE TABLE "user_card_reflections" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"card_id" integer NOT NULL,
	"prompt_index" integer NOT NULL,
	"reflection_text" text NOT NULL,
	"block_type_id" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint

-- Create unique index for user_card_reflections
CREATE UNIQUE INDEX "user_card_prompt_unique_idx" ON "user_card_reflections" ("user_id","card_id","prompt_index");
--> statement-breakpoint

-- Add foreign key constraints for user_card_advice
ALTER TABLE "user_card_advice" ADD CONSTRAINT "user_card_advice_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_card_advice" ADD CONSTRAINT "user_card_advice_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_card_advice" ADD CONSTRAINT "user_card_advice_block_type_id_block_types_id_fk" FOREIGN KEY ("block_type_id") REFERENCES "public"."block_types"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint

-- Add foreign key constraints for user_card_reflections
ALTER TABLE "user_card_reflections" ADD CONSTRAINT "user_card_reflections_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_card_reflections" ADD CONSTRAINT "user_card_reflections_card_id_cards_id_fk" FOREIGN KEY ("card_id") REFERENCES "public"."cards"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_card_reflections" ADD CONSTRAINT "user_card_reflections_block_type_id_block_types_id_fk" FOREIGN KEY ("block_type_id") REFERENCES "public"."block_types"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Enable RLS on both tables
ALTER TABLE "public"."user_card_advice" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."user_card_reflections" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Create policies for user_card_advice (users can only access their own advice)
CREATE POLICY "Users can view their own card advice" ON "public"."user_card_advice" FOR SELECT USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own card advice" ON "public"."user_card_advice" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own card advice" ON "public"."user_card_advice" FOR UPDATE USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can delete their own card advice" ON "public"."user_card_advice" FOR DELETE USING (auth.uid()::text = user_id);
--> statement-breakpoint

-- Create policies for user_card_reflections (users can only access their own reflections)
CREATE POLICY "Users can view their own card reflections" ON "public"."user_card_reflections" FOR SELECT USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own card reflections" ON "public"."user_card_reflections" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own card reflections" ON "public"."user_card_reflections" FOR UPDATE USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can delete their own card reflections" ON "public"."user_card_reflections" FOR DELETE USING (auth.uid()::text = user_id);