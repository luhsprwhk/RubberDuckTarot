import { useState, useEffect } from 'react';
import { getAllBlockTypes } from './blocktype-queries';
import type { BlockType } from '@/src/interfaces';

const useBlockTypes = () => {
  const [blockTypes, setBlockTypes] = useState<BlockType[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let isMounted = true;
    setLoading(true);
    getAllBlockTypes()
      .then((data) => {
        if (isMounted) setBlockTypes(data);
      })
      .catch((err) => {
        if (isMounted) setError(err);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return { blockTypes, loading, error };
};

export default useBlockTypes;
