-- Add premium flag to users table
ALTER TABLE public.users 
ADD COLUMN premium BOOLEAN NOT NULL DEFAULT FALSE;

-- Add comment for clarity
COMMENT ON COLUMN public.users.premium IS 'Premium subscription status for users';