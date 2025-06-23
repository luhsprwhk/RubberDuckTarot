// Re-export database types for backward compatibility
export type { Card, BlockType, Insight, User } from '../../db/sqlite/schema';

// Legacy alias for backward compatibility
export type Reading = Insight;
