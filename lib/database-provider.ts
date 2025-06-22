import type { DatabaseAdapter, DatabaseType } from './database-adapter';

class DatabaseProvider {
  private adapter: DatabaseAdapter | null = null;
  private initializationPromise: Promise<DatabaseAdapter> | null = null;

  getAdapter(): Promise<DatabaseAdapter> {
    if (!this.initializationPromise) {
      this.initializationPromise = this.initialize();
    }
    return this.initializationPromise;
  }

  private async initialize(): Promise<DatabaseAdapter> {
    const dbType = (import.meta.env.VITE_DATABASE_TYPE ||
      'sqlite') as DatabaseType;

    switch (dbType) {
      case 'supabase': {
        const { SupabaseAdapter } = await import('./supabase/supabase-adapter');
        this.adapter = new SupabaseAdapter();
        break;
      }
      case 'sqlite':
      default:
        if (typeof window === 'undefined') {
          // Only load SQLite on server-side
          const { SQLiteAdapter } = await import('./sqlite/sqlite-adapter');
          this.adapter = new SQLiteAdapter();

          // Seed the database
          const { seed } = await import('../db/sqlite/seed');
          await seed();
        } else {
          throw new Error(
            'SQLite is not supported in browser environment. Use Supabase instead.'
          );
        }
        break;
    }
    return this.adapter!;
  }

  reset() {
    this.adapter = null;
    this.initializationPromise = null;
  }
}

export const databaseProvider = new DatabaseProvider();

// Create async wrapper for database access
export const getDb = () => databaseProvider.getAdapter();
