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
    if (!selectedSpread || !userContext) return;

    navigate('/create-insight', {
      state: {
        selectedBlockTypeId: selectedBlockType || null,
        spreadType: selectedSpread,
        userContext: userContext,
        existingUserBlockId: locationState?.userBlockId || null, // Pass existing block ID if available
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
    <div className="min-h-screen bg-liminal-surface text-primary shadow-breakthrough border border-liminal-border max-w-2xl mx-auto">
      <NewInsightForm
        blockTypes={blockTypes}
        selectedBlockType={selectedBlockType}
        userContextPlaceholder={userContextPlaceholder}
        onBlockSelect={setSelectedBlockType}
        onUserContextChange={setUserContext}
        onSpreadSelect={setSelectedSpread}
        onNewReading={handleNewReading}
        selectedSpread={selectedSpread}
        userContext={userContext}
        hasUserBlock={Boolean(locationState?.userBlockId)}
        userBlockName={locationState?.blockName}
      />
    </div>
  );
};

export default NewInsightPage;
