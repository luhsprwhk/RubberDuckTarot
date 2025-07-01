import React, { useState } from 'react';
import { FaThumbsUp } from 'react-icons/fa';

interface SentimentTrackingProps {
  insightId: number;
  initialResonated?: boolean;
  initialTookAction?: boolean;
  onSentimentChange?: (
    insightId: number,
    resonated?: boolean,
    tookAction?: boolean
  ) => void;
}

const SentimentTracking: React.FC<SentimentTrackingProps> = ({
  insightId,
  initialResonated,
  initialTookAction,
  onSentimentChange,
}) => {
  const [resonated, setResonated] = useState<boolean | undefined>(
    initialResonated
  );
  const [tookAction, setTookAction] = useState<boolean | undefined>(
    initialTookAction
  );

  const handleResonatedChange = (value: boolean) => {
    setResonated(value);
    onSentimentChange?.(insightId, value, tookAction);
  };

  const handleActionChange = (value: boolean) => {
    setTookAction(value);
    onSentimentChange?.(insightId, resonated, value);
  };

  return (
    <div className="bg-void-gradient rounded-lg p-4 mt-6">
      <h3 className="text-lg font-semibold text-accent mb-4">
        💭 How was this insight for you?
      </h3>

      <div className="space-y-4">
        {/* Resonance tracking */}
        <div className="flex items-center justify-between">
          <span className="text-primary">
            Did this insight resonate with you?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleResonatedChange(!(resonated === true))}
              className={`p-2 rounded-full transition-all focus:outline-none ${
                resonated === true
                  ? 'bg-breakthrough-400 text-primary scale-110'
                  : 'bg-void-gradient text-secondary text-xs hover:bg-breakthrough-400/20 hover:text-breakthrough-400'
              }`}
              aria-label={
                resonated === true
                  ? 'Undo thumbs up - This insight resonated with me'
                  : 'Thumbs up - This insight resonated with me'
              }
            >
              <FaThumbsUp />
            </button>
          </div>
        </div>

        {/* Action tracking */}
        <div className="flex items-center justify-between">
          <span className="text-primary">
            Did you take action based on this insight?
          </span>
          <div className="flex gap-2">
            <button
              onClick={() => handleActionChange(!(tookAction === true))}
              className={`p-2 rounded-full transition-all focus:outline-none ${
                tookAction === true
                  ? 'bg-breakthrough-400 text-primary scale-110'
                  : 'bg-void-gradient text-secondary text-xs hover:bg-breakthrough-400/20 hover:text-breakthrough-400'
              }`}
              aria-label={
                tookAction === true
                  ? 'Undo thumbs up - I took action based on this insight'
                  : 'Thumbs up - I took action based on this insight'
              }
            >
              <FaThumbsUp />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SentimentTracking;
