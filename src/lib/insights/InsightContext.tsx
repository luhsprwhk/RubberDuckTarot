import React from 'react';
import type { Insight } from '@/src/interfaces';

export interface InsightContextType {
  insights: (Insight & {
    associatedBlock?: { id: number; name: string; status: string };
  })[];
  loading: boolean;
  error: string | null;
  fetchUserInsights: (userId: string) => Promise<void>;
}

export const InsightContext = React.createContext<
  InsightContextType | undefined
>(undefined);
