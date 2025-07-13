-- Add indexes to improve query performance on foreign key columns for user card tables

-- Create index on user_id in user_card_advice
CREATE INDEX "idx_user_card_advice_user_id" ON "public"."user_card_advice" ("user_id");

-- Create index on card_id in user_card_advice
CREATE INDEX "idx_user_card_advice_card_id" ON "public"."user_card_advice" ("card_id");

-- Create index on user_id in user_card_reflections
CREATE INDEX "idx_user_card_reflections_user_id" ON "public"."user_card_reflections" ("user_id");
