import React from 'react';
import { cn } from '@/src/lib/utils';
import { type BlockType } from '@/src/interfaces';
import robDivinationPic from '@/src/assets/rob-divination-pic.png';

interface NewReadingProps {
  blockTypes: BlockType[];
  selectedBlockType: string;
  selectedSpread: string | null;
  userContext: string;
  onBlockSelect: (id: string) => void;
  onUserContextChange: (context: string) => void;
  onNewReading: () => void;
  onSpreadSelect: (spread: string) => void;
}

const NewReading: React.FC<NewReadingProps> = ({
  blockTypes,
  selectedBlockType,
  userContext,
  onBlockSelect,
  onUserContextChange,
  onNewReading,
  onSpreadSelect,
  selectedSpread,
}) => {
  const [blockTypeLocked, setBlockTypeLocked] = React.useState(false);
  const selectedBlock = blockTypes.find((bt) => bt.id === selectedBlockType);

  const handleBlockSelect = (id: string) => {
    onBlockSelect(id);
    setBlockTypeLocked(true);
  };

  const handleUnlockBlockType = () => {
    onBlockSelect('');
    setBlockTypeLocked(false);
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-liminal-surface min-h-screen">
      <div className="text-center mb-4">
        <div id="rob-divination-pic" className="mb-12 w-28 h-28 mx-auto">
          <img src={robDivinationPic} alt="Rob Divination" />
        </div>
        <h1 className="text-3xl font-bold text-primary mb-2 pt-4">
          What's blocking you?
        </h1>
        <p className="text-accent text-sm">
          When you're stuck, consult the duck
        </p>
      </div>

      {/* Block Type Selection */}
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
              onClick={handleUnlockBlockType}
            >
              Pick a different block type
            </button>
          </>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {blockTypes.map((blockType) => (
              <button
                key={blockType.id}
                onClick={() => handleBlockSelect(blockType.id)}
                className={cn(
                  'p-4 rounded-lg border-2 text-left transition-all hover:shadow-md bg-liminal-overlay',
                  selectedBlockType === blockType.id
                    ? 'border-breakthrough-400 bg-breakthrough-400 shadow-md'
                    : 'border-liminal-border hover:border-liminal-border'
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

      {/* Select Spread */}
      {selectedBlockType && (
        <SpreadSelector
          selectedSpread={selectedSpread}
          onSpreadSelect={onSpreadSelect}
        />
      )}

      {/* Context Input */}
      {selectedSpread && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-primary">
            Tell the duck more:
          </h2>
          <textarea
            value={userContext}
            onChange={(e) => onUserContextChange(e.target.value)}
            placeholder={`Describe your ${selectedBlock?.name.toLowerCase()} or ask a question`}
            className={cn(
              'w-full text-secondary p-4 border border-default rounded-lg resize-none focus:ring-2 focus:ring-breakthrough-400 focus:border-transparent',
              'bg-liminal-overlay'
            )}
            rows={4}
          />
        </div>
      )}

      {/* Draw Button */}
      {selectedBlockType && userContext.trim() !== '' && (
        <DrawButton onNewReading={onNewReading} />
      )}
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

export default NewReading;

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
            : 'bg-liminal-overlay hover:border-breakthrough-400 text-primary',
          'w-full font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors'
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
            : 'bg-liminal-overlay hover:border-breakthrough-400 text-primary',
          'w-full font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors'
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
