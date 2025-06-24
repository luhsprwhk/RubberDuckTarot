import { defineConfig } from 'drizzle-kit';
import * as dotenv from 'dotenv';

dotenv.config({
  path: '.env',
});

export default defineConfig({
  dialect: 'postgresql',
  schema: './supabase/schema.ts',
  out: './supabase/migrations',
  dbCredentials: {
    url: process.env.VITE_SUPABASE_DB_URL!,
  },
});
