-- Make age field nullable since it can be computed from birthday
ALTER TABLE user_profiles ALTER COLUMN age DROP NOT NULL;