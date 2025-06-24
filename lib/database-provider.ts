import type { DatabaseAdapter } from './database-adapter';

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
    const { SupabaseAdapter } = await import('./supabase/supabase-adapter');
    this.adapter = new SupabaseAdapter();
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
