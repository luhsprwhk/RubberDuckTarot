import type { Card, BlockType, Reading } from '../interfaces';

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

  // Sentiment tracking
  updateInsightSentiment(
    insightId: number,
    resonated?: boolean,
    tookAction?: boolean
  ): Promise<void>;
}
