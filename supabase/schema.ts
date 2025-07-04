import type { PersonalizedReading } from '../src/ai';
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
  perspective_prompts: jsonb('perspective_prompts').$type<string[]>().notNull(),
  block_applications: jsonb('block_applications')
    .$type<{
      creative: string;
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
  user_block_id: integer('user_block_id'),
  user_context: text('user_context'),
  cards_drawn: jsonb('cards_drawn')
    .$type<{ id: number; reversed: boolean }[]>()
    .notNull(),
  reading: jsonb('reading').$type<PersonalizedReading>().notNull(),
  resonated: boolean('resonated').notNull().default(false), // Did the insight resonate with the user?
  took_action: boolean('took_action').notNull().default(false), // Did the user take action based on the insight?
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
  email: text('email').notNull().unique(),
  premium: boolean('premium').notNull().default(false),
  auth_uid: text('auth_uid').notNull().unique(),
});

export const user_profiles = pgTable('user_profiles', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().unique(),
  name: text('name').notNull(),
  birthday: text('birthday').notNull(),
  birth_place: text('birth_place').notNull(),
  creative_identity: text('creative_identity').notNull(),
  work_context: text('work_context').notNull(),
  zodiac_sign: text('zodiac_sign').notNull(),
  debugging_mode: text('debugging_mode').notNull(),
  block_pattern: text('block_pattern').notNull(),
  superpower: text('superpower').notNull(),
  kryptonite: text('kryptonite').notNull(),
  spirit_animal: text('spirit_animal').notNull(),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userBlocks = pgTable('user_blocks', {
  id: serial('id').primaryKey(),
  user_id: text('user_id'),
  block_type_id: text('block_type_id').notNull(),
  name: text('name').notNull(),
  status: text('status').notNull().default('active'), // 'active', 'resolved', 'paused'
  notes: text('notes'),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Card = typeof cards.$inferSelect;
export type BlockType = typeof blockTypes.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof user_profiles.$inferSelect;
export type UserBlock = typeof userBlocks.$inferSelect;
