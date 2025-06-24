import type { PersonalizedReading } from '../src/lib/claude-ai';
import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const cards = pgTable('cards', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  traditional_equivalent: text('traditional_equivalent').notNull(),
  core_meaning: text('core_meaning').notNull(),
  duck_question: text('duck_question').notNull(),
  visual_description: text('visual_description').notNull(),
  perspective_prompts: jsonb('perspective_prompts').$type<string[]>().notNull(),
  block_applications: jsonb('block_applications')
    .$type<{
      creative: string;
      decision: string;
      work: string;
      life: string;
      relationship: string;
    }>()
    .notNull(),
  duck_wisdom: text('duck_wisdom').notNull(),
  reversed_meaning: text('reversed_meaning').notNull(),
  tags: jsonb('tags').$type<string[]>().notNull(),
});

export const blockTypes = pgTable('block_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  emoji: text('emoji').notNull(),
});

export const insights = pgTable('insights', {
  id: serial('id').primaryKey(),
  user_id: text('user_id'),
  spread_type: text('spread_type').notNull(), // 'quick-draw' | 'full-pond'
  block_type_id: text('block_type_id').notNull(),
  user_context: text('user_context'),
  cards_drawn: jsonb('cards_drawn').$type<number[]>().notNull(),
  reading: jsonb('reading').$type<PersonalizedReading>().notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  preferences: jsonb('preferences').$type<{
    favorite_block_types?: string[];
    reading_history_enabled?: boolean;
  }>(),
  premium: boolean('premium').notNull().default(false),
});

export type Card = typeof cards.$inferSelect;
export type BlockType = typeof blockTypes.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type User = typeof users.$inferSelect;
