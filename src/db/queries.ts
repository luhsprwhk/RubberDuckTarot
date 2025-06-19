import { eq, desc } from 'drizzle-orm';
import { db } from './connection';
import { cards, blockTypes, readings, users } from './schema';
import type { Card, BlockType, Reading } from './schema';

// Card queries
export const cardQueries = {
  getAll: (): Card[] => {
    return db.select().from(cards).all();
  },

  getById: (id: number): Card | undefined => {
    return db.select().from(cards).where(eq(cards.id, id)).get();
  },

  getByIds: (ids: number[]): Card[] => {
    return db.select().from(cards).where(eq(cards.id, ids[0])).all(); // Simple version for now
  },

  getRandomCard: (): Card => {
    const allCards = db.select().from(cards).all();
    const randomIndex = Math.floor(Math.random() * allCards.length);
    return allCards[randomIndex];
  },

  getRandomCards: (count: number): Card[] => {
    const allCards = db.select().from(cards).all();
    const result: Card[] = [];
    for (let i = 0; i < count; i++) {
      const randomIndex = Math.floor(Math.random() * allCards.length);
      result.push(allCards[randomIndex]);
    }
    return result;
  },
};

// Block type queries
export const blockTypeQueries = {
  getAll: (): BlockType[] => {
    return db.select().from(blockTypes).all();
  },

  getById: (id: string): BlockType | undefined => {
    return db.select().from(blockTypes).where(eq(blockTypes.id, id)).get();
  },
};

// Reading queries
export const readingQueries = {
  create: (reading: Omit<Reading, 'id' | 'created_at'>): Reading => {
    const result = db
      .insert(readings)
      .values({
        ...reading,
        created_at: new Date(),
      })
      .returning()
      .get();
    return result;
  },

  getByUserId: (userId: string, limit = 10): Reading[] => {
    return db
      .select()
      .from(readings)
      .where(eq(readings.user_id, userId))
      .orderBy(desc(readings.created_at))
      .limit(limit)
      .all();
  },

  getById: (id: number): Reading | undefined => {
    return db.select().from(readings).where(eq(readings.id, id)).get();
  },
};

// User queries
export const userQueries = {
  create: (userId: string): typeof users.$inferSelect => {
    const result = db
      .insert(users)
      .values({
        id: userId,
        created_at: new Date(),
        preferences: {},
      })
      .returning()
      .get();
    return result;
  },

  getById: (id: string): typeof users.$inferSelect | undefined => {
    return db.select().from(users).where(eq(users.id, id)).get();
  },

  updatePreferences: (
    userId: string,
    preferences: NonNullable<typeof users.$inferSelect.preferences>
  ): void => {
    db.update(users).set({ preferences }).where(eq(users.id, userId)).run();
  },
};
