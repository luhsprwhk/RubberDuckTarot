import Anthropic from '@anthropic-ai/sdk';
const anthropic = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
});

export { anthropic };
export { generateUserBlockName } from './generateUserBlockName';
export { generateInsight } from './generate_insight';

import type { UserProfile } from '../interfaces';
import type { Card, BlockType } from '../interfaces';

export interface ReadingRequest {
  cards: (Card & { reversed: boolean })[];
  blockType: BlockType;
  userContext: string;
  userProfile: UserProfile;
  spreadType: 'quick-draw' | 'duck-insight' | 'full-pond';
  previousInsights?: Array<{
    id: number;
    reading: PersonalizedReading;
    user_context: string | null;
    cards_drawn: number[];
    created_at: Date;
    resonated: boolean;
    took_action: boolean;
  }>;
  currentBlock?: {
    id: number;
    name: string;
    status: string;
    progress: number;
    notes: string | null;
    created_at: Date;
    updated_at: Date;
  };
}

export interface PersonalizedReading {
  interpretation: string;
  keyInsights: string[];
  actionSteps: string[];
  robQuip: string;
  reflectionPrompts?: string[]; // For longer spreads
}
