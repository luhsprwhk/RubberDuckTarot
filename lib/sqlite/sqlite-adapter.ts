import {
  cardQueries,
  blockTypeQueries,
  readingQueries,
} from '../../db/sqlite/queries';
import type { DatabaseAdapter } from '../database-adapter';
import type { Card, BlockType, Reading } from '../../src/shared/interfaces';

export class SQLiteAdapter implements DatabaseAdapter {
  async getAllCards(): Promise<Card[]> {
    return cardQueries.getAll();
  }

  async getCardById(id: number): Promise<Card | null> {
    return cardQueries.getById(id) || null;
  }

  async getAllBlockTypes(): Promise<BlockType[]> {
    return blockTypeQueries.getAll();
  }

  async getBlockTypeById(id: string): Promise<BlockType | null> {
    return blockTypeQueries.getById(id) || null;
  }

  async createReading(
    reading: Omit<Reading, 'id' | 'created_at'>
  ): Promise<Reading> {
    return readingQueries.create(reading);
  }

  async getUserReadings(userId?: string): Promise<Reading[]> {
    if (userId) {
      return readingQueries.getByUserId(userId);
    }
    // For anonymous readings, we'd need to modify the SQLite queries
    // For now, return empty array for anonymous users
    return [];
  }

  async getReadingById(id: number): Promise<Reading | null> {
    return readingQueries.getById(id) || null;
  }
}
