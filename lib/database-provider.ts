import type { DatabaseAdapter, DatabaseType } from './database-adapter';

class DatabaseProvider {
  private adapter: DatabaseAdapter | null = null;

  async getAdapter(): Promise<DatabaseAdapter> {
    if (!this.adapter) {
      const dbType = (import.meta.env.VITE_DATABASE_TYPE ||
        'sqlite') as DatabaseType;

      switch (dbType) {
        case 'supabase': {
          const { SupabaseAdapter } = await import(
            './supabase/supabase-adapter'
          );
          this.adapter = new SupabaseAdapter();
          break;
        }
        case 'sqlite':
        default:
          if (typeof window === 'undefined') {
            // Only load SQLite on server-side
            {
              const { SQLiteAdapter } = await import('./sqlite/sqlite-adapter');
              this.adapter = new SQLiteAdapter();
            }
          } else {
            throw new Error(
              'SQLite is not supported in browser environment. Use Supabase instead.'
            );
          }
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

// Create async wrapper for database access
export const getDb = () => databaseProvider.getAdapter();
