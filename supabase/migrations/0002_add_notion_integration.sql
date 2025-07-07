-- Add Notion integration fields to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_access_token TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS notion_workspace_id TEXT;