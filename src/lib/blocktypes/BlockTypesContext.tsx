import { createContext } from 'react';
import type { BlockType } from '@/src/interfaces';

interface BlockTypesContextType {
  blockTypes: BlockType[];
  loading: boolean;
  error: string | null;
  refreshBlockTypes: () => Promise<void>;
}

const BlockTypesContext = createContext<BlockTypesContextType | undefined>(
  undefined
);

export default BlockTypesContext;
