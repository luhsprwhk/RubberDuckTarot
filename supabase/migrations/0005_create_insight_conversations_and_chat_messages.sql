-- Create insight_conversations table
CREATE TABLE IF NOT EXISTS "insight_conversations" (
	"id" serial PRIMARY KEY NOT NULL,
	"insight_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"started_at" timestamp with time zone DEFAULT now() NOT NULL,
	"last_message_at" timestamp with time zone DEFAULT now() NOT NULL,
	"message_count" integer DEFAULT 0 NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL
);

-- Create chat_messages table
CREATE TABLE IF NOT EXISTS "chat_messages" (
	"id" serial PRIMARY KEY NOT NULL,
	"conversation_id" integer NOT NULL,
	"user_id" text NOT NULL,
	"role" text NOT NULL,
	"content" text NOT NULL,
	"metadata" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Add foreign key constraints
ALTER TABLE "insight_conversations" ADD CONSTRAINT "insight_conversations_insight_id_insights_id_fk" FOREIGN KEY ("insight_id") REFERENCES "insights"("id") ON DELETE cascade ON UPDATE no action;
ALTER TABLE "chat_messages" ADD CONSTRAINT "chat_messages_conversation_id_insight_conversations_id_fk" FOREIGN KEY ("conversation_id") REFERENCES "insight_conversations"("id") ON DELETE cascade ON UPDATE no action;