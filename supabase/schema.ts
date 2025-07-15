import type { PersonalizedReading } from '../src/ai';
import {
  pgTable,
  serial,
  text,
  integer,
  jsonb,
  timestamp,
  boolean,
  uniqueIndex,
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
  notion_access_token: text('notion_access_token'),
  notion_workspace_id: text('notion_workspace_id'),
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

export const userCardAdvice = pgTable('user_card_advice', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull(),
  card_id: integer('card_id').notNull(),
  block_type_id: text('block_type_id').notNull(),
  advice: text('advice').notNull(),
  generated_at: timestamp('generated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  last_updated: timestamp('last_updated', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export const userCardReflections = pgTable(
  'user_card_reflections',
  {
    id: serial('id').primaryKey(),
    user_id: text('user_id').notNull(),
    card_id: integer('card_id').notNull(),
    prompt_index: integer('prompt_index').notNull(), // Which reflection question (0, 1, 2, etc.)
    reflection_text: text('reflection_text').notNull(),
    block_type_id: text('block_type_id'), // Optional: which block type this reflection relates to
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
    updated_at: timestamp('updated_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => ({
    // Unique constraint to ensure one reflection per user, card, and prompt index
    userCardPromptUnique: uniqueIndex('user_card_prompt_unique_idx').on(
      table.user_id,
      table.card_id,
      table.prompt_index
    ),
  })
);

// Chat conversations linked to specific insights
export const insightConversations = pgTable('insight_conversations', {
  id: serial('id').primaryKey(),
  insight_id: integer('insight_id'), // Foreign key to insights table (nullable for block conversations)
  user_id: text('user_id').notNull(), // For easier querying and permission checks
  started_at: timestamp('started_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  last_message_at: timestamp('last_message_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  message_count: integer('message_count').notNull().default(0),
  is_active: boolean('is_active').notNull().default(true), // Can be set to false to archive
});

// Individual chat messages (encrypted for privacy)
export const chatMessages = pgTable('chat_messages', {
  id: serial('id').primaryKey(),
  conversation_id: integer('conversation_id').notNull(), // Foreign key to insight_conversations
  user_id: text('user_id').notNull(), // For easier permission checks
  role: text('role').notNull(), // 'user' | 'assistant'
  content: text('content').notNull(), // Encrypted message content
  metadata: jsonb('metadata').$type<{
    // Optional metadata for analytics (not encrypted)
    token_count?: number;
    response_time_ms?: number;
    user_sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[]; // Extracted topics for analytics
  }>(),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type Card = typeof cards.$inferSelect;
export type BlockType = typeof blockTypes.$inferSelect;
export type Insight = typeof insights.$inferSelect;
export type User = typeof users.$inferSelect;
export type UserProfile = typeof user_profiles.$inferSelect;
export type UserBlock = typeof userBlocks.$inferSelect;
export type UserCardAdvice = typeof userCardAdvice.$inferSelect;
export type UserCardReflection = typeof userCardReflections.$inferSelect;
export type InsightConversation = typeof insightConversations.$inferSelect;
export type ChatMessage = typeof chatMessages.$inferSelect;

// User privacy settings for chat data
export const userChatPrivacySettings = pgTable('user_chat_privacy_settings', {
  id: serial('id').primaryKey(),
  user_id: text('user_id').notNull().unique(), // Foreign key to users table
  retention_period_days: integer('retention_period_days').notNull().default(30), // -1 means never delete
  automatic_cleanup: boolean('automatic_cleanup').notNull().default(true),
  analytics_opt_in: boolean('analytics_opt_in').notNull().default(false), // Privacy-first: opt-in
  export_enabled: boolean('export_enabled').notNull().default(true),
  created_at: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type UserChatPrivacySettings =
  typeof userChatPrivacySettings.$inferSelect;

// Intelligence Engine Analysis Results
export const intelligenceAnalysisResults = pgTable(
  'intelligence_analysis_results',
  {
    id: serial('id').primaryKey(),
    user_id: text('user_id').notNull(),
    analysis_data: text('analysis_data').notNull(), // Encrypted JSON of AnalysisResult
    created_at: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  }
);

// Individual Epistemological Blockers (for Rob's dashboard)
export const epistemologicalBlockers = pgTable('epistemological_blockers', {
  id: text('id').primaryKey(),
  user_id: text('user_id').notNull(),
  blocker_type: text('blocker_type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  severity: text('severity').notNull(), // 'low' | 'medium' | 'high' | 'critical'
  confidence: integer('confidence').notNull(), // 0-100
  patterns_data: text('patterns_data').notNull(), // Encrypted JSON of patterns
  occurrences: integer('occurrences').notNull().default(1),
  block_type_ids: jsonb('block_type_ids').$type<string[]>().notNull(),
  insight_ids: jsonb('insight_ids').$type<number[]>().notNull(),
  conversation_ids: jsonb('conversation_ids').$type<number[]>().notNull(),
  recommendations: jsonb('recommendations').$type<string[]>().notNull(),
  status: text('status').notNull().default('active'), // 'active' | 'acknowledged' | 'resolved' | 'archived'
  admin_notes: text('admin_notes'), // Rob's notes
  first_detected: timestamp('first_detected', { withTimezone: true })
    .notNull()
    .defaultNow(),
  last_detected: timestamp('last_detected', { withTimezone: true })
    .notNull()
    .defaultNow(),
  updated_at: timestamp('updated_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type IntelligenceAnalysisResult =
  typeof intelligenceAnalysisResults.$inferSelect;
export type EpistemologicalBlockerRecord =
  typeof epistemologicalBlockers.$inferSelect;
