import NewReading from '../components/NewReading';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';

const NewReadingPage = () => {
  const { blockTypes } = useBlockTypes();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);

  // Get block data from navigation state if coming from BlockDetails
  const locationState = location.state as {
    selectedBlockTypeId?: string;
    userBlockId?: number;
    blockName?: string;
  } | null;

  // Pre-populate form if coming from a specific block
  useEffect(() => {
    if (locationState?.selectedBlockTypeId) {
      setSelectedBlockType(locationState.selectedBlockTypeId);
    }
    if (locationState?.blockName) {
      setUserContext(`Continue working on: ${locationState.blockName}`);
    }
  }, [locationState]);

  const handleNewReading = () => {
    if (!selectedBlockType || !selectedSpread) return;

    navigate('/reading', {
      state: {
        selectedBlockTypeId: selectedBlockType,
        spreadType: selectedSpread,
        userContext: userContext,
        existingUserBlockId: locationState?.userBlockId, // Pass existing block ID if available
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
