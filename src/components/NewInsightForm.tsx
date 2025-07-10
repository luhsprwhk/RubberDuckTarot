import React from 'react';
import { cn } from '@/src/lib/utils';
import { type BlockType } from '@/src/interfaces';
import type { UserBlock } from '@/supabase/schema';
import robDivinationPic from '@/src/assets/rob-divination-pic.png';
import useCards from '@/src/lib/cards/useCards';
import BlockAutocomplete from './BlockAutocomplete';
import TextArea from './TextArea';

interface NewReadingProps {
  blockTypes: BlockType[];
  selectedBlockType: string;
  selectedSpread: string | null;
  userContext: string;
  onBlockSelect: (id: string) => void;
  onUserContextChange: (context: string) => void;
  onNewReading: () => void;
  onSpreadSelect: (spread: string) => void;
  hasUserBlock?: boolean;
  userBlockName?: string;
  userContextPlaceholder?: string;
  selectedCardId?: number;
  selectedUserBlock?: UserBlock | null;
  onUserBlockSelect?: (block: UserBlock | null) => void;
}

const NewInsightForm: React.FC<NewReadingProps> = ({
  blockTypes,
  selectedBlockType,
  userContext,
  onBlockSelect,
  onUserContextChange,
  onNewReading,
  onSpreadSelect,
  selectedSpread,
  userContextPlaceholder,
  hasUserBlock = false,
  userBlockName = '',
  selectedCardId,
  selectedUserBlock,
  onUserBlockSelect,
}) => {
  const [blockTypeLocked, setBlockTypeLocked] = React.useState(false);
  const selectedBlock = blockTypes.find((bt) => bt.id === selectedBlockType);
  const { cards } = useCards();
  const selectedCard = cards.find((c) => c.id === selectedCardId);
  const [connectToExistingBlock, setConnectToExistingBlock] =
    React.useState(false);

  const handleBlockSelect = (id: string) => {
    onBlockSelect(id);
    setBlockTypeLocked(true);
  };

  const handleUnlockBlockType = () => {
    onBlockSelect('');
    setBlockTypeLocked(false);
  };

  const connectingBlockPlaceholder = connectToExistingBlock
    ? `Add more details or updates about this block. What’s changed, or what else is important?`
    : null;

  return (
    <div className="p-6">
      <div className="text-center mb-4">
        <div id="rob-divination-pic" className="mb-12 w-28 h-28 mx-auto">
          <img src={robDivinationPic} alt="Rob Divination" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 pt-4">
          {hasUserBlock
            ? 'Get More Insight'
            : 'When youre stuck, consult the duck'}
        </h1>
        <p className="text-accent text-sm">
          {hasUserBlock ? `Block: ${userBlockName}` : "What's blocking you?"}
        </p>
        {selectedCard && (
          <p className="text-accent text-sm">Card: {selectedCard?.name}</p>
        )}
      </div>

      {/* Block Type Selection */}
      {!hasUserBlock && !connectToExistingBlock && (
        <BlockTypeSelector
          blockTypes={blockTypes}
          selectedBlockType={selectedBlockType}
          blockTypeLocked={blockTypeLocked}
          onBlockSelect={handleBlockSelect}
          onUnlock={handleUnlockBlockType}
        />
      )}

      {/* User Block Selection (Optional) */}
      {!hasUserBlock && onUserBlockSelect && (
        <div className="mb-6">
          <h2
            onClick={() => setConnectToExistingBlock(!connectToExistingBlock)}
            className="text-lg font-semibold mb-3 text-primary underline cursor-pointer"
          >
            {connectToExistingBlock
              ? 'Start a new block'
              : 'Or connect to an existing block'}
          </h2>
          <p
            className={cn(
              'text-sm text-secondary mb-3',
              connectToExistingBlock ? 'text-primary' : 'text-secondary'
            )}
          >
            {connectToExistingBlock
              ? 'Link this insight to one of your existing blocks to track progress over time.'
              : 'Link this insight to one of your existing blocks to track progress over time.'}
          </p>
          {connectToExistingBlock && (
            <>
              <BlockAutocomplete
                selectedBlock={selectedUserBlock || null}
                onBlockSelect={(block) => {
                  onUserBlockSelect(block);
                }}
                placeholder="Search your blocks..."
              />
            </>
          )}
        </div>
      )}

      {/* Select Spread */}
      {hasUserBlock || selectedBlockType || selectedUserBlock ? (
        <SpreadSelector
          selectedSpread={selectedSpread}
          onSpreadSelect={onSpreadSelect}
        />
      ) : null}

      {/* Context Input */}
      {selectedSpread && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Tell the duck more:
          </h2>
          <TextArea
            value={userContext}
            onChange={(e) => onUserContextChange(e.target.value)}
            placeholder={
              userContextPlaceholder ||
              connectingBlockPlaceholder ||
              `Describe your ${selectedBlock?.name.toLowerCase()} or ask a question`
            }
            className="bg-liminal-overlay"
            rows={4}
          />
        </div>
      )}

      {/* Draw Button */}
      {(() => {
        const safeUserContext = userContext ?? '';
        return hasUserBlock || selectedUserBlock
          ? safeUserContext.trim() !== '' && (
              <DrawButton onNewReading={onNewReading} />
            )
          : selectedBlockType && safeUserContext.trim() !== '' && (
              <DrawButton onNewReading={onNewReading} />
            );
      })()}
    </div>
  );
};

const DrawButton: React.FC<{ onNewReading: () => void }> = ({
  onNewReading,
}) => {
  return (
    <div className="text-center">
      <button
        onClick={onNewReading}
        className="bg-breakthrough-400 hover:bg-breakthrough-400 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
      >
        Send to Rob
      </button>
    </div>
  );
};

const BlockTypeSelector: React.FC<{
  blockTypes: BlockType[];
  selectedBlockType: string;
  blockTypeLocked: boolean;
  onBlockSelect: (id: string) => void;
  onUnlock: () => void;
}> = ({
  blockTypes,
  selectedBlockType,
  blockTypeLocked,
  onBlockSelect,
  onUnlock,
}) => {
  const selectedBlock = blockTypes.find((bt) => bt.id === selectedBlockType);

  return (
    <div className="mb-6">
      {blockTypeLocked && selectedBlock ? (
        <>
          <div className="grid grid-cols-1 mb-4">
            <button
              key={selectedBlock.id}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all shadow-md border-breakthrough-400 bg-liminal-overlay'
              )}
              disabled
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{selectedBlock.emoji}</span>
                <div>
                  <div className="font-medium text-primary">
                    {selectedBlock.name}
                  </div>
                  <div className="text-sm text-secondary">
                    {selectedBlock.description}
                  </div>
                </div>
              </div>
            </button>
          </div>
          <button
            type="button"
            className="mt-2 px-4 py-2 rounded border border-default text-sm text-secondary hover:bg-default transition-colors"
            onClick={onUnlock}
          >
            Pick a different block type
          </button>
        </>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.id}
              onClick={() => onBlockSelect(blockType.id)}
              className={cn(
                'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md bg-liminal-overlay',
                selectedBlockType === blockType.id
                  ? 'border-breakthrough-400 bg-breakthrough-400 shadow-md'
                  : 'border-default hover:border-default'
              )}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{blockType.emoji}</span>
                <div>
                  <div
                    className={cn(
                      'font-medium',
                      selectedBlockType === blockType.id
                        ? 'text-void-800'
                        : 'text-secondary'
                    )}
                  >
                    {blockType.name}
                  </div>
                  <div
                    className={cn(
                      'text-sm',
                      selectedBlockType === blockType.id
                        ? 'text-void-800'
                        : 'text-secondary'
                    )}
                  >
                    {blockType.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default NewInsightForm;

const SpreadSelector: React.FC<{
  selectedSpread: string | null;
  onSpreadSelect: (spread: string) => void;
}> = ({ selectedSpread, onSpreadSelect }) => (
  <div className="mb-6">
    <div className="grid grid-cols-2 gap-x-4">
      <button
        onClick={() => onSpreadSelect('quick-draw')}
        className={cn(
          selectedSpread === 'quick-draw'
            ? 'bg-liminal-overlay border border-breakthrough-400 text-primary'
            : 'bg-liminal-overlay hover:border-breakthrough-400 border border-default text-primary',
          'w-full font-semibold py-3 px-8 rounded-lg transition-colors'
        )}
      >
        Quick Duck Spread
        <br />
        <small className="text-xs text-secondary">
          Single card for immediate perspective shifts
        </small>
      </button>
      <button
        onClick={() => onSpreadSelect('full-pond')}
        className={cn(
          selectedSpread === 'full-pond'
            ? 'bg-liminal-overlay border border-breakthrough-400 text-primary'
            : 'bg-liminal-overlay hover:border-breakthrough-400 border border-default text-primary',
          'w-full font-semibold py-3 px-8 rounded-lg transition-colors'
        )}
      >
        Full Pond Spread
        <br />
        <small className="text-xs text-secondary">
          A comprehensive look at your situation from multiple angles.
        </small>
      </button>
    </div>
  </div>
);
