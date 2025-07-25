import React, { useState, useCallback } from 'react';
import type { InsightContextType } from './InsightContext';
import { InsightContext } from './InsightContext';
import type { Insight } from '../../interfaces';
import { getUserInsightsWithBlocks } from './insight-queries';

const InsightProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [insights, setInsights] = useState<
    (Insight & {
      associatedBlock?: { id: number; name: string; status: string };
    })[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUserInsights = useCallback(async (userId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getUserInsightsWithBlocks(userId);
      setInsights(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to fetch insights');
      setInsights([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const contextValue: InsightContextType = {
    insights,
    loading,
    error,
    fetchUserInsights,
  };

  return (
    <InsightContext.Provider value={contextValue}>
      {children}
    </InsightContext.Provider>
  );
};

export default InsightProvider;
