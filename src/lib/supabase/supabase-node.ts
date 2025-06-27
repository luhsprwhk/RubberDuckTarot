import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load environment variables for Node.js
config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseServiceKey = process.env.VITE_SUPABASE_SERVICE_ROLE_KEY || '';

// Use service role key for seeding to bypass RLS
export const supabase = createClient(supabaseUrl, supabaseServiceKey);
