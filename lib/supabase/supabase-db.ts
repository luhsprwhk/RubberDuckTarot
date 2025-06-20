import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './supabase-schema';

const connectionString = `postgresql://postgres:${import.meta.env.VITE_SUPABASE_DB_PASSWORD}@db.${import.meta.env.VITE_SUPABASE_URL?.replace('https://', '').replace('.supabase.co', '')}.supabase.co:5432/postgres`;

const client = postgres(connectionString);
export const supabaseDb = drizzle(client, { schema });
