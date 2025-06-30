import NewReading from '../components/NewReading';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';

const NewReadingPage = () => {
  const { blockTypes } = useBlockTypes();
  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleNewReading = () => {
    if (!selectedBlockType || !selectedSpread) return;

    navigate('/reading', {
      state: {
        selectedBlockTypeId: selectedBlockType,
        spreadType: selectedSpread,
        userContext: userContext,
      },
    });

    handleReset(); // Reset state after navigating
  };

  const handleReset = () => {
    setSelectedSpread(null);
    setSelectedBlockType('');
    setUserContext('');
  };

  return (
    <NewReading
      blockTypes={blockTypes}
      selectedBlockType={selectedBlockType}
      userContext={userContext}
      onBlockSelect={setSelectedBlockType}
      onUserContextChange={setUserContext}
      onSpreadSelect={setSelectedSpread}
      onNewReading={handleNewReading}
      selectedSpread={selectedSpread}
    />
  );
};

export default NewReadingPage;
