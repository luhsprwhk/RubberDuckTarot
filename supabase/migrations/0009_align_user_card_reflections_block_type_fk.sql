-- Align user_card_reflections.block_type_id constraint handling with user_card_advice
-- 1. Ensure there are no NULLs in block_type_id (should be safe because feature is new and NOT NULL enforcement is intended)
--    If any rows do have NULL, the following update will fail. Adjust handling if necessary.

-- Drop existing foreign key constraint
ALTER TABLE "public"."user_card_reflections"
  DROP CONSTRAINT IF EXISTS "user_card_reflections_block_type_id_block_types_id_fk";

-- Make block_type_id NOT NULL
ALTER TABLE "public"."user_card_reflections"
  ALTER COLUMN "block_type_id" SET NOT NULL;

-- Add new foreign key with ON DELETE CASCADE to match user_card_advice
ALTER TABLE "public"."user_card_reflections"
  ADD CONSTRAINT "user_card_reflections_block_type_id_block_types_id_fk"
    FOREIGN KEY ("block_type_id")
    REFERENCES "public"."block_types"("id")
    ON DELETE CASCADE
    ON UPDATE NO ACTION;
