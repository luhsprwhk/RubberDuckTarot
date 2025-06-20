import { SQLiteAdapter } from './sqlite/sqlite-adapter';
import { SupabaseAdapter } from './supabase/supabase-adapter';
import type { DatabaseAdapter, DatabaseType } from './database-adapter';

class DatabaseProvider {
  private adapter: DatabaseAdapter | null = null;

  getAdapter(): DatabaseAdapter {
    if (!this.adapter) {
      const dbType = (import.meta.env.VITE_DATABASE_TYPE ||
        'sqlite') as DatabaseType;

      switch (dbType) {
        case 'supabase':
          this.adapter = new SupabaseAdapter();
          break;
        case 'sqlite':
        default:
          this.adapter = new SQLiteAdapter();
          break;
      }
    }

    return this.adapter;
  }

  reset() {
    this.adapter = null;
  }
}

export const databaseProvider = new DatabaseProvider();
export const db = databaseProvider.getAdapter();
