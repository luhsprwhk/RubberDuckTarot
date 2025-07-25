-- Add foreign key constraint between insights.user_block_id and user_blocks.id
ALTER TABLE insights 
ADD CONSTRAINT insights_user_block_id_fkey 
FOREIGN KEY (user_block_id) 
REFERENCES user_blocks(id) 
ON DELETE SET NULL;