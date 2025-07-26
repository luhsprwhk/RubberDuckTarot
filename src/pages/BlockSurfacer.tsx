import React, { useState, useRef, useEffect } from 'react';
import useAuth from '../lib/hooks/useAuth';
import { Send, User } from 'lucide-react';
import Loading from '../components/Loading';
import ErrorState from '../components/ErrorState';
import { useUserBlocks } from '../lib/blocks/useUserBlocks';
import useBlockTypes from '../lib/blocktypes/useBlockTypes';
import useCards from '../lib/cards/useCards';
import { Card } from '@/src/interfaces';
import robEmoji from '../assets/rob-emoji.png';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'rob';
  timestamp: Date;
  blockData?: unknown;
  cardData?: {
    card: Card;
    isSignificator: boolean;
  };
}

const BlockSurfacer: React.FC = () => {
  const { user } = useAuth();
  const {
    blocks,
    loading: blocksLoading,
    error: blocksError,
    fetchUserBlocks,
  } = useUserBlocks();
  const {
    blockTypes,
    loading: blockTypesLoading,
    error: blockTypesError,
  } = useBlockTypes();
  const { cards, loading: cardsLoading, error: cardsError } = useCards();

  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: "Hey there! I'm Rob, your guide to surfacing unconscious blocks. Let's explore what's beneath the surface together. What's been on your mind lately?",
      sender: 'rob',
      timestamp: new Date(),
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCardOverlay, setShowCardOverlay] = useState(false);
  const [drawnCards, setDrawnCards] = useState<Card[]>([]);
  const [selectedCard, setSelectedCard] = useState<Card | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.id) {
      fetchUserBlocks();
    }
  }, [user?.id, fetchUserBlocks]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText('');
    setIsTyping(true);

    // Check if we should trigger card drawing
    if (messages.length === 1 && inputText.trim().length > 0) {
      setTimeout(() => {
        drawThreeCards();
      }, 1000);
    } else {
      // Simulate Rob's response with block surfacing
      setTimeout(() => {
        const robResponse = generateRobResponse(
          inputText,
          blocks || [],
          selectedCard
        );
        setMessages((prev) => [...prev, robResponse]);
        setIsTyping(false);
      }, 1500);
    }
  };

  const drawThreeCards = () => {
    if (!cards || cards.length === 0) return;

    // Shuffle and draw 3 random cards
    const shuffled = [...cards].sort(() => Math.random() - 0.5);
    const threeCards = shuffled.slice(0, 3);
    setDrawnCards(threeCards);
    setShowCardOverlay(true);

    // Add Rob's message about card selection
    const cardMessage: Message = {
      id: Date.now().toString(),
      text: "Alright, let's debug this. I'm pulling up three cards from the deck. Don't overthink it—just tell me which one gives you that gut-level compiler error. Your unconscious already knows which bug this represents.",
      sender: 'rob',
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, cardMessage]);
    setIsTyping(false);
  };

  const handleCardSelection = (card: Card) => {
    setSelectedCard(card);
    setShowCardOverlay(false);

    // Add confirmation message
    const confirmMessage: Message = {
      id: Date.now().toString(),
      text: `Perfect. ${card.name} - ${card.traditional_equivalent}. This is your significator. Let me break down what this card is telling us about your current block...`,
      sender: 'rob',
      timestamp: new Date(),
      cardData: { card, isSignificator: true },
    };
    setMessages((prev) => [...prev, confirmMessage]);

    // Add detailed card explanation
    setTimeout(() => {
      const explanationMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `${card.core_meaning}\n\n${card.duck_question}\n\n${card.duck_wisdom}`,
        sender: 'rob',
        timestamp: new Date(),
        cardData: { card, isSignificator: true },
      };
      setMessages((prev) => [...prev, explanationMessage]);
    }, 2000);
  };

  const generateRobResponse = (
    userInput: string,
    userBlocks: unknown[],
    significatorCard?: Card | null
  ): Message => {
    const input = userInput.toLowerCase();
    const blockTypeMap =
      blockTypes?.reduce(
        (acc, bt) => {
          acc[bt.id] = bt.name;
          return acc;
        },
        {} as Record<string, string>
      ) || {};

    // Simple pattern matching for demo purposes
    let responseText = '';

    if (input.includes('stuck') || input.includes('blocked')) {
      responseText =
        "I hear you feel stuck. That's often a sign there's something deeper at play. Can you tell me more about what specifically feels blocked? Sometimes our unconscious patterns create these barriers to protect us from discomfort.";
    } else if (input.includes('anxious') || input.includes('anxiety')) {
      responseText =
        'Anxiety is like a messenger from your unconscious. What situations trigger this feeling? Often, anxiety points to underlying fears or unmet needs that want to be acknowledged.';
    } else if (input.includes('relationship') || input.includes('love')) {
      responseText =
        'Relationships are powerful mirrors for our unconscious patterns. What dynamics keep repeating for you? These patterns often stem from early experiences that created protective mechanisms.';
    } else if (input.includes('work') || input.includes('career')) {
      responseText =
        "Work challenges can reveal our deepest beliefs about worth and capability. What's the story you tell yourself about your professional identity? Let's explore what success and failure mean to you.";
    } else if (Array.isArray(userBlocks) && userBlocks.length > 0) {
      const recentBlock = userBlocks[userBlocks.length - 1] as {
        title?: string;
        block_type_id?: string;
      };
      const blockTypeName = recentBlock?.block_type_id
        ? blockTypeMap[recentBlock.block_type_id]
        : 'general';
      responseText = `I notice you've been tracking ${blockTypeName} blocks around "${recentBlock?.title || 'untitled'}". This seems connected to what you're sharing. How does this current experience relate to that pattern?`;
    } else if (significatorCard) {
      responseText = `Now that we've identified ${significatorCard.name} as your significator, let's dig deeper. This card is pointing to ${significatorCard.core_meaning.toLowerCase()}. What's the specific situation where this pattern shows up most strongly?`;
    } else {
      responseText =
        "Thank you for sharing that. I'm here to help you explore what's beneath the surface. What you're experiencing makes sense given your unique journey. Can you tell me more about how this feels in your body? Sometimes our bodies hold wisdom our minds haven't accessed yet.";
    }

    return {
      id: (Date.now() + 1).toString(),
      text: responseText,
      sender: 'rob',
      timestamp: new Date(),
    };
  };

  if (blocksLoading || blockTypesLoading || cardsLoading) {
    return <Loading />;
  }

  if (blocksError || blockTypesError || cardsError) {
    return <ErrorState error={blocksError || blockTypesError || cardsError} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8 h-screen flex flex-col">
        <div className="max-w-4xl mx-auto w-full flex flex-col h-full">
          {/* Context Footer */}
          <div className="mt-4 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Rob helps surface unconscious patterns through gentle exploration
            </p>
          </div>
          {/* Card Selection Overlay */}
          {showCardOverlay && drawnCards.length > 0 && (
            <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
              <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <h2 className="text-2xl font-bold text-center mb-2 text-gray-900 dark:text-white">
                  Choose Your Significator
                </h2>
                <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
                  Which card calls out to you? Trust your gut - your unconscious
                  already knows.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {drawnCards.map((card) => (
                    <div
                      key={card.id}
                      onClick={() => handleCardSelection(card)}
                      className="bg-gray-50 dark:bg-gray-700 rounded-xl p-6 cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900 transition-colors border-2 border-transparent hover:border-purple-500"
                    >
                      <div className="text-center">
                        <div className="text-4xl mb-2">{card.emoji}</div>
                        <h3 className="font-bold text-lg mb-1 text-gray-900 dark:text-white">
                          {card.name}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                          {card.traditional_equivalent}
                        </p>
                        <p className="text-sm text-gray-700 dark:text-gray-300">
                          {card.core_meaning}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => setShowCardOverlay(false)}
                    className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                  >
                    Skip for now
                  </button>
                </div>
              </div>
            </div>
          )}
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex items-center justify-center gap-4 mb-4">
              <img
                src={robEmoji}
                alt="Rob"
                className="w-12 h-12 rounded-full border-2 border-white shadow-lg"
              />
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  Chat with Rob
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  Your guide to surfacing unconscious blocks
                </p>
              </div>
            </div>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden flex flex-col">
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.sender === 'rob' && (
                    <div className="flex-shrink-0">
                      <img
                        src={robEmoji}
                        alt="Rob"
                        className="w-8 h-8 rounded-full"
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                      message.sender === 'user'
                        ? 'bg-purple-600 text-white'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white'
                    }`}
                  >
                    <p className="text-sm">{message.text}</p>
                    <p
                      className={`text-xs mt-1 ${
                        message.sender === 'user'
                          ? 'text-purple-200'
                          : 'text-gray-500 dark:text-gray-400'
                      }`}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                  </div>
                  {message.sender === 'user' && (
                    <div className="flex-shrink-0">
                      <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
                        <User className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0">
                    <img
                      src={robEmoji}
                      alt="Rob"
                      className="w-8 h-8 rounded-full"
                    />
                  </div>
                  <div className="bg-gray-100 dark:bg-gray-700 rounded-2xl px-4 py-3">
                    <div className="flex space-x-1">
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '0ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '150ms' }}
                      ></div>
                      <div
                        className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                        style={{ animationDelay: '300ms' }}
                      ></div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Input Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 p-4">
              <div className="flex gap-3">
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  placeholder="Share what's on your mind..."
                  className="flex-1 resize-none rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={1}
                  style={{ minHeight: '40px', maxHeight: '100px' }}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!inputText.trim()}
                  className="flex-shrink-0 bg-purple-600 text-white rounded-lg px-4 py-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlockSurfacer;
