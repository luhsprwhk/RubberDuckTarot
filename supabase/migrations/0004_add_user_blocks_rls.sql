-- Add RLS policies for user_blocks table
-- This fixes the "RLS disabled" warning by securing the user_blocks table

-- Enable Row Level Security on user_blocks table
ALTER TABLE "public"."user_blocks" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own blocks
CREATE POLICY "Users can view their own user_blocks" ON "public"."user_blocks" 
FOR SELECT USING (auth.uid()::text = user_id);

-- Policy: Users can insert their own blocks  
CREATE POLICY "Users can insert their own user_blocks" ON "public"."user_blocks"
FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policy: Users can update their own blocks
CREATE POLICY "Users can update their own user_blocks" ON "public"."user_blocks"
FOR UPDATE USING (auth.uid()::text = user_id);

-- Policy: Users can delete their own blocks
CREATE POLICY "Users can delete their own user_blocks" ON "public"."user_blocks"
FOR DELETE USING (auth.uid()::text = user_id);

-- Policy: Allow anonymous blocks (where user_id is null)
CREATE POLICY "Allow anonymous user_blocks" ON "public"."user_blocks" 
FOR ALL USING (user_id IS NULL);