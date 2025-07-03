CREATE TABLE "block_types" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"emoji" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "cards" (
	"id" integer PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"emoji" text NOT NULL,
	"traditional_equivalent" text NOT NULL,
	"core_meaning" text NOT NULL,
	"duck_question" text NOT NULL,
	"perspective_prompts" jsonb NOT NULL,
	"block_applications" jsonb NOT NULL,
	"duck_wisdom" text NOT NULL,
	"reversed_meaning" text NOT NULL,
	"tags" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "insights" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"spread_type" text NOT NULL,
	"block_type_id" text NOT NULL,
	"user_block_id" integer,
	"user_context" text,
	"cards_drawn" jsonb NOT NULL,
	"reading" jsonb NOT NULL,
	"resonated" boolean DEFAULT false NOT NULL,
	"took_action" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user_profiles" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"name" text NOT NULL,
	"birthday" text NOT NULL,
	"birth_place" text NOT NULL,
	"creative_identity" text NOT NULL,
	"work_context" text NOT NULL,
	"zodiac_sign" text NOT NULL,
	"debugging_mode" text NOT NULL,
	"block_pattern" text NOT NULL,
	"superpower" text NOT NULL,
	"kryptonite" text NOT NULL,
	"spirit_animal" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_profiles_user_id_unique" UNIQUE("user_id")
);
--> statement-breakpoint
CREATE TABLE "user_blocks" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" text,
	"block_type_id" text NOT NULL,
	"name" text NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"preferences" jsonb,
	"email" text NOT NULL,
	"premium" boolean DEFAULT false NOT NULL,
	"auth_uid" text NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_auth_uid_unique" UNIQUE("auth_uid")
);
--> statement-breakpoint

-- Add foreign key constraints
ALTER TABLE "insights" ADD CONSTRAINT "insights_block_type_id_block_types_id_fk" FOREIGN KEY ("block_type_id") REFERENCES "public"."block_types"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "insights" ADD CONSTRAINT "insights_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE cascade ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_block_type_id_block_types_id_fk" FOREIGN KEY ("block_type_id") REFERENCES "public"."block_types"("id") ON DELETE no action ON UPDATE no action;
--> statement-breakpoint
ALTER TABLE "user_blocks" ADD CONSTRAINT "user_blocks_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE set null ON UPDATE no action;
--> statement-breakpoint

-- Enable RLS on all tables
ALTER TABLE "public"."cards" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."block_types" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."users" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."user_profiles" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."user_blocks" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint
ALTER TABLE "public"."insights" ENABLE ROW LEVEL SECURITY;
--> statement-breakpoint

-- Create policies for cards and block_types (public read access)
CREATE POLICY "Allow public read access on cards" ON "public"."cards" FOR SELECT USING (true);
--> statement-breakpoint
CREATE POLICY "Allow public read access on block_types" ON "public"."block_types" FOR SELECT USING (true);
--> statement-breakpoint

-- Create policies for users (users can only access their own data)
CREATE POLICY "Users can view their own profile" ON "public"."users" FOR SELECT USING (auth.uid()::text = auth_uid);
--> statement-breakpoint
CREATE POLICY "Users can update their own profile" ON "public"."users" FOR UPDATE USING (auth.uid()::text = auth_uid);
--> statement-breakpoint
CREATE POLICY "Users can insert their own profile" ON "public"."users" FOR INSERT WITH CHECK (auth.uid()::text = auth_uid);
--> statement-breakpoint

-- Create policies for user_profiles (users can only access their own profiles)
CREATE POLICY "Users can view their own user_profile" ON "public"."user_profiles" FOR SELECT USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own user_profile" ON "public"."user_profiles" FOR UPDATE USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own user_profile" ON "public"."user_profiles" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
--> statement-breakpoint

-- Create policies for user_blocks (users can only access their own blocks)
CREATE POLICY "Users can view their own user_blocks" ON "public"."user_blocks" FOR SELECT USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own user_blocks" ON "public"."user_blocks" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own user_blocks" ON "public"."user_blocks" FOR UPDATE USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can delete their own user_blocks" ON "public"."user_blocks" FOR DELETE USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Allow anonymous user_blocks" ON "public"."user_blocks" FOR ALL USING (user_id IS NULL);
--> statement-breakpoint

-- Create policies for insights (users can only access their own insights)
CREATE POLICY "Users can view their own insights" ON "public"."insights" FOR SELECT USING (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can insert their own insights" ON "public"."insights" FOR INSERT WITH CHECK (auth.uid()::text = user_id);
--> statement-breakpoint
CREATE POLICY "Users can update their own insights" ON "public"."insights" FOR UPDATE USING (auth.uid()::text = user_id);
--> statement-breakpoint

-- Allow anonymous insights (where user_id is null)
CREATE POLICY "Allow anonymous insights" ON "public"."insights" FOR ALL USING (user_id IS NULL);
--> statement-breakpoint

-- Create function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, auth_uid, email)
  VALUES (new.id, new.id, new.email);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
--> statement-breakpoint

-- Create trigger to automatically create user record
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
