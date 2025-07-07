-- Custom SQL migration file, put your code below! --

-- Add comments to track encryption status
COMMENT ON COLUMN public.users.email IS 'Encrypted email address';
COMMENT ON COLUMN public.user_profiles.name IS 'Encrypted user name';
COMMENT ON COLUMN public.user_profiles.birthday IS 'Encrypted birthday';
COMMENT ON COLUMN public.user_profiles.birth_place IS 'Encrypted birth place';
COMMENT ON COLUMN public.insights.user_context IS 'Encrypted user context';
COMMENT ON COLUMN public.insights.reading IS 'Encrypted reading data';
COMMENT ON COLUMN public.user_blocks.name IS 'Encrypted block name';
COMMENT ON COLUMN public.user_blocks.notes IS 'Encrypted block notes';