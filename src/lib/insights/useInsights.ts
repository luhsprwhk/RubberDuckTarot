import { useContext } from 'react';
import { InsightContext } from './InsightContext';

export function useInsights() {
  const context = useContext(InsightContext);
  if (context === undefined) {
    throw new Error('useInsights must be used within an InsightProvider');
  }
  return context;
}
