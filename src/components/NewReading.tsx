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
    <div className="max-w-2xl mx-auto p-6 bg-gradient-to-br from-blue-50 to-purple-50 min-h-screen">
      <div className="text-center mb-8">
        <div className="text-6xl mb-4">🦆</div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          What's blocking you?
        </h1>
        <p className="text-gray-600">When you're stuck, consult the duck</p>
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
                  ? 'border-blue-500 bg-blue-50 shadow-md'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{blockType.emoji}</span>
                <div>
                  <div className="font-medium text-gray-800">
                    {blockType.name}
                  </div>
                  <div className="text-sm text-gray-600">
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
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            Quick Duck Spread
          </button>
          <button
            onClick={() => onSpreadSelect('full-pond')}
            className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
          >
            Full Pond Spread
          </button>
        </div>
      )}

      {/* Context Input */}
      {selectedSpread && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-4 text-gray-800">
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
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-8 rounded-lg shadow-lg transition-colors"
      >
        🎴 New Reading
      </button>
    </div>
  );
};

export default NewReading;
