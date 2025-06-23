import type { Insight } from '@/lib/supabase/supabase-schema';

// Re-export database types for backward compatibility
export type {
  Card,
  BlockType,
  Insight,
  User,
} from '@/lib/supabase/supabase-schema';

// Legacy alias for backward compatibility
export type Reading = Insight;
