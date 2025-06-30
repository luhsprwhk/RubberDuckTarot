import React, { useState, useEffect } from 'react';
import BlockTypesContext from './BlockTypesContext';
import { getAllBlockTypes } from './blocktype-queries';
import type { BlockType } from '@/src/interfaces';

const BlockTypesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBlockTypes = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getAllBlockTypes();
      setBlockTypes(data);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch block types'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlockTypes();
  }, []);

  const value = {
    blockTypes,
    loading,
    error,
    refreshBlockTypes: fetchBlockTypes,
  };

  return (
    <BlockTypesContext.Provider value={value}>
      {children}
    </BlockTypesContext.Provider>
  );
};

export default BlockTypesProvider;
