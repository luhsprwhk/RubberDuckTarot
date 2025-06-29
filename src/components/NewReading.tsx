import React from 'react';

// This interface can be moved to a shared types file later
interface BlockType {
  id: string;
  name: string;
  description: string;
  emoji: string;
}

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
  const selectedBlock = blockTypes.find((bt) => bt.id === selectedBlockType);

  return (
    <div className="max-w-2xl mx-auto p-6 bg-void-800 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          What's blocking you?
        </h1>
        <p className="text-accent text-sm">
          When you're stuck, consult the duck
        </p>
      </div>

      {/* Block Type Selection */}
      <div className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {blockTypes.map((blockType) => (
            <button
              key={blockType.id}
              onClick={() => onBlockSelect(blockType.id)}
              className={`p-4 rounded-lg border-2 text-left transition-all hover:shadow-md ${
                selectedBlockType === blockType.id
                  ? 'border-primary bg-primary shadow-md'
                  : 'border-liminal-border hover:border-liminal-border'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{blockType.emoji}</span>
                <div>
                  <div className="font-medium text-primary">
                    {blockType.name}
                  </div>
                  <div className="text-sm text-accent">
                    {blockType.description}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Select Spread */}
      {selectedBlockType && (
        <div className="mb-6">
          <button
            onClick={() => onSpreadSelect('quick-draw')}
            className={`${selectedSpread === 'quick-draw' ? 'bg-green-700' : 'bg-liminal-border hover:bg-liminal-border'} text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors`}
          >
            Quick Duck Spread
          </button>
          <button
            onClick={() => onSpreadSelect('full-pond')}
            className={`${selectedSpread === 'full-pond' ? 'bg-green-700' : 'bg-liminal-border hover:bg-liminal-border'} text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors`}
          >
            Full Pond Spread
          </button>
        </div>
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
            placeholder={`Describe your ${selectedBlock?.name.toLowerCase()} in a few sentences...`}
            className="w-full p-4 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        className="bg-primary hover:bg-primary text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
      >
        🎴 New Reading
      </button>
    </div>
  );
};

export default NewReading;
