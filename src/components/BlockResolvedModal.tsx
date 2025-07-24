import { useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { X, Share2, Trophy } from 'lucide-react';
import Confetti from 'react-confetti';
import robEmoji from '../assets/rob-emoji.png';

interface BlockResolvedModalProps {
  isOpen: boolean;
  onClose: (reflection?: string) => void;
  blockName: string;
  isFirstBlockResolved?: boolean;
}

export const BlockResolvedModal = ({
  isOpen,
  onClose,
  blockName,
  isFirstBlockResolved = false,
}: BlockResolvedModalProps) => {
  const [showConfetti, setShowConfetti] = useState(true);
  const [currentStep, setCurrentStep] = useState<'celebration' | 'reflection'>(
    'celebration'
  );
  const [reflectionAnswer, setReflectionAnswer] = useState('');

  const handleContinue = () => {
    setShowConfetti(false);
    setCurrentStep('reflection');
  };

  const handleFinish = () => {
    const reflection = reflectionAnswer.trim() || undefined;
    onClose(reflection);
    // Reset state for next time
    setTimeout(() => {
      setCurrentStep('celebration');
      setShowConfetti(true);
      setReflectionAnswer('');
    }, 300);
  };

  const handleShare = () => {
    const shareText = `Just resolved my first block on Rubber Duck Tarot! 🦆✨ Getting unstuck one breakthrough at a time.`;

    if (navigator.share) {
      navigator.share({
        text: shareText,
        url: window.location.origin,
      });
    } else {
      // Fallback to copying to clipboard
      navigator.clipboard.writeText(`${shareText} ${window.location.origin}`);
      // Could add a toast notification here
    }
  };

  return (
    <>
      {showConfetti && isOpen && (
        <Confetti
          width={window.innerWidth}
          height={window.innerHeight}
          recycle={false}
          numberOfPieces={200}
          gravity={0.3}
        />
      )}

      <Transition appear show={isOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={() => {}}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="bg-surface rounded-lg max-w-md w-full p-6 text-left align-middle shadow-xl transform transition-all border border-breakthrough-400/20">
                  {currentStep === 'celebration' ? (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={robEmoji} alt="Rob" className="w-12 h-12" />
                          {isFirstBlockResolved && (
                            <div className="bg-breakthrough-400/20 border border-breakthrough-400/40 rounded-full px-3 py-1 flex items-center space-x-2">
                              <Trophy className="w-4 h-4 text-breakthrough-400" />
                              <span className="text-sm font-semibold text-breakthrough-400">
                                First Resolution
                              </span>
                            </div>
                          )}
                        </div>
                        <button
                          onClick={handleFinish}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="text-center mb-6">
                        <h2 className="text-2xl font-bold text-breakthrough-400 mb-2">
                          🎉 Block Resolved! 🎉
                        </h2>
                        <p className="text-primary text-lg mb-4">
                          Congrats on pushing through{' '}
                          <span className="font-semibold text-breakthrough-400">
                            "{blockName}"
                          </span>
                          !
                        </p>

                        <div className="bg-void-900/50 rounded-lg p-4 text-left">
                          <p className="text-secondary text-sm mb-2">
                            <span className="font-semibold text-primary">
                              Rob here.
                            </span>
                          </p>
                          <p className="text-secondary text-sm">
                            Look, I've seen a lot of people get stuck in
                            analysis paralysis, but you? You actually shipped.
                            That's not nothing. Most humans just keep
                            gold-plating their problems instead of fixing them.
                          </p>
                          {isFirstBlockResolved && (
                            <p className="text-breakthrough-400 text-sm mt-3 font-medium">
                              First block resolved - that's your proof of
                              concept right there. The debugging methodology
                              works. Time to scale it up.
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={handleContinue}
                          className="flex-1 bg-breakthrough-500 text-void-950 font-bold py-3 px-4 rounded-md hover:bg-breakthrough-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-surface focus:ring-breakthrough-500 transition-all shadow-glow hover:shadow-pulse"
                        >
                          Continue
                        </button>
                        {isFirstBlockResolved && (
                          <button
                            onClick={handleShare}
                            className="bg-surface border border-breakthrough-400/40 text-breakthrough-400 font-semibold py-3 px-4 rounded-md hover:bg-breakthrough-400/10 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-surface focus:ring-breakthrough-500 transition-all flex items-center space-x-2"
                          >
                            <Share2 className="w-4 h-4" />
                            <span>Share</span>
                          </button>
                        )}
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center space-x-3">
                          <img src={robEmoji} alt="Rob" className="w-12 h-12" />
                          <h2 className="text-xl font-bold text-primary">
                            Quick Reflection
                          </h2>
                        </div>
                        <button
                          onClick={handleFinish}
                          className="text-secondary hover:text-primary transition-colors"
                        >
                          <X className="w-6 h-6" />
                        </button>
                      </div>

                      <div className="mb-6">
                        <div className="bg-void-900/50 rounded-lg p-4 mb-4">
                          <p className="text-secondary text-sm">
                            <span className="font-semibold text-primary">
                              Rob:
                            </span>{' '}
                            Before we archive this block, help me understand
                            what made the difference. What was your breakthrough
                            moment?
                          </p>
                        </div>

                        <textarea
                          value={reflectionAnswer}
                          onChange={(e) => setReflectionAnswer(e.target.value)}
                          placeholder="What helped you push through? What changed your perspective?"
                          className="w-full text-primary p-3 border border-liminal-border rounded-md focus:outline-none focus:ring-2 ring-offset-surface focus:ring-breakthrough-500 bg-void-900 ring-offset-2 resize-none"
                          rows={4}
                        />
                      </div>

                      <div className="flex space-x-3">
                        <button
                          onClick={() => setCurrentStep('celebration')}
                          className="bg-surface border border-liminal-border text-secondary font-semibold py-3 px-4 rounded-md hover:bg-liminal-hover focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-surface focus:ring-breakthrough-500 transition-all"
                        >
                          Back
                        </button>
                        <button
                          onClick={handleFinish}
                          className="flex-1 bg-breakthrough-500 text-void-950 font-bold py-3 px-4 rounded-md hover:bg-breakthrough-400 focus:outline-none focus:ring-2 focus:ring-offset-2 ring-offset-surface focus:ring-breakthrough-500 transition-all shadow-glow hover:shadow-pulse"
                        >
                          {reflectionAnswer.trim()
                            ? 'Save & Archive Block'
                            : 'Archive Block'}
                        </button>
                      </div>
                    </>
                  )}
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </>
  );
};
