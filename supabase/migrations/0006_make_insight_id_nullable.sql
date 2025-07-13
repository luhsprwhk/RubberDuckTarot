-- Make insight_id nullable to support block conversations
ALTER TABLE "insight_conversations" ALTER COLUMN "insight_id" DROP NOT NULL;