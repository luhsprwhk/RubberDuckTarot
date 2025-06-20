import { sqliteTable, integer, text } from 'drizzle-orm/sqlite-core';

export const cards = sqliteTable('cards', {
  id: integer('id').primaryKey(),
  name: text('name').notNull(),
  emoji: text('emoji').notNull(),
  traditional_equivalent: text('traditional_equivalent').notNull(),
  core_meaning: text('core_meaning').notNull(),
  duck_question: text('duck_question').notNull(),
  visual_description: text('visual_description').notNull(),
  perspective_prompts: text('perspective_prompts', { mode: 'json' })
    .$type<string[]>()
    .notNull(),
  block_applications: text('block_applications', { mode: 'json' })
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
  tags: text('tags', { mode: 'json' }).$type<string[]>().notNull(),
});

export const blockTypes = sqliteTable('block_types', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description').notNull(),
  emoji: text('emoji').notNull(),
});

export const readings = sqliteTable('readings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  user_id: text('user_id'),
  spread_type: text('spread_type').notNull(), // 'quick-draw' | 'full-pond'
  block_type_id: text('block_type_id').notNull(),
  user_context: text('user_context'),
  cards_drawn: text('cards_drawn', { mode: 'json' })
    .$type<number[]>()
    .notNull(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  created_at: integer('created_at', { mode: 'timestamp' }).notNull(),
  preferences: text('preferences', { mode: 'json' }).$type<{
    favorite_block_types?: string[];
    reading_history_enabled?: boolean;
  }>(),
});

export type Card = typeof cards.$inferSelect;
export type BlockType = typeof blockTypes.$inferSelect;
export type Reading = typeof readings.$inferSelect;
export type User = typeof users.$inferSelect;
