import type { Card, BlockType, Reading } from '../src/modules/interfaces';

export interface DatabaseAdapter {
  // Cards
  getAllCards(): Promise<Card[]>;
  getCardById(id: number): Promise<Card | null>;

  // Block Types
  getAllBlockTypes(): Promise<BlockType[]>;
  getBlockTypeById(id: string): Promise<BlockType | null>;

  // Readings
  createReading(reading: Omit<Reading, 'id' | 'created_at'>): Promise<Reading>;
  getUserReadings(userId?: string): Promise<Reading[]>;
  getReadingById(id: number): Promise<Reading | null>;
}

export type DatabaseType = 'sqlite' | 'supabase';
