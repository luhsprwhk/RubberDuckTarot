import { useContext } from 'react';
import BlockTypesContext from './BlockTypesContext';

const useBlockTypes = () => {
  const context = useContext(BlockTypesContext);
  if (context === undefined) {
    throw new Error('useBlockTypes must be used within a BlockTypesProvider');
  }
  return context;
};

export default useBlockTypes;
