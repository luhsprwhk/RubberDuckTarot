-- Create user chat privacy settings table
CREATE TABLE user_chat_privacy_settings (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    retention_period_days INTEGER NOT NULL DEFAULT 30, -- -1 means never delete
    automatic_cleanup BOOLEAN NOT NULL DEFAULT true,
    analytics_opt_in BOOLEAN NOT NULL DEFAULT false, -- Privacy-first: opt-in
    export_enabled BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX idx_user_chat_privacy_settings_user_id ON user_chat_privacy_settings(user_id);

-- Create index for automatic cleanup queries
CREATE INDEX idx_user_chat_privacy_settings_cleanup ON user_chat_privacy_settings(automatic_cleanup, retention_period_days) 
WHERE automatic_cleanup = true AND retention_period_days > 0;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_chat_privacy_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER trigger_update_user_chat_privacy_settings_updated_at
    BEFORE UPDATE ON user_chat_privacy_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_user_chat_privacy_settings_updated_at();

-- Grant permissions
GRANT ALL ON user_chat_privacy_settings TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_chat_privacy_settings_id_seq TO authenticated;

-- RLS (Row Level Security) policies
ALTER TABLE user_chat_privacy_settings ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own privacy settings
CREATE POLICY "Users can view own privacy settings" ON user_chat_privacy_settings
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert own privacy settings" ON user_chat_privacy_settings
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update own privacy settings" ON user_chat_privacy_settings
    FOR UPDATE USING (auth.uid()::text = user_id)
    WITH CHECK (auth.uid()::text = user_id);

-- Note: No DELETE policy - privacy settings should not be deleted, only updated