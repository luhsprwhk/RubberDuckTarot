import type { Insight } from '@/supabase/schema';

// Re-export database types for backward compatibility
export type {
  Card,
  BlockType,
  Insight,
  User,
  UserProfile,
  UserBlock,
} from '@/supabase/schema';

// Legacy alias for backward compatibility
export type Reading = Insight;
