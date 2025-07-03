import NewInsightForm from '../components/NewInsightForm';
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';

const NewInsightPage = () => {
  const { blockTypes } = useBlockTypes();
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedBlockType, setSelectedBlockType] = useState<string>('');
  const [userContext, setUserContext] = useState<string>('');
  const [selectedSpread, setSelectedSpread] = useState<string | null>(null);
  const [userContextPlaceholder, setUserContextPlaceholder] =
    useState<string>('');

  // Get block data from navigation state if coming from BlockDetails
  const locationState = location.state as {
    userBlockId?: number;
    blockName?: string;
  } | null;

  // Pre-populate form if coming from a specific block
  useEffect(() => {
    if (locationState?.blockName) {
      setUserContextPlaceholder(
        `Add more details or updates about "${locationState.blockName}". What’s changed, or what else is important?`
      );
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
    <NewInsightForm
      blockTypes={blockTypes}
      selectedBlockType={selectedBlockType}
      userContextPlaceholder={userContextPlaceholder}
      onBlockSelect={setSelectedBlockType}
      onUserContextChange={setUserContext}
      onSpreadSelect={setSelectedSpread}
      onNewReading={handleNewReading}
      selectedSpread={selectedSpread}
      hasUserBlock={Boolean(locationState?.userBlockId)}
      userBlockName={locationState?.blockName}
    />
  );
};

export default NewInsightPage;
