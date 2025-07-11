import { useState, useRef, useEffect } from 'react';
import { cn } from '@/src/lib/utils';
import {
  FaSpinner,
  FaTimes,
  FaPaperPlane,
  FaTrash,
  FaBroom,
} from 'react-icons/fa';
import robEmoji from '@/src/assets/rob-emoji.png';
import type { PersonalizedReading } from '@/src/ai';
import type { BlockType, UserProfile } from '@/src/interfaces';
import {
  generateInsightChat,
  validateChatMessage,
  CHAT_MESSAGE_LIMITS,
  CONVERSATION_LIMITS,
  cleanupOldMessages,
  trimMessageHistory,
} from '@/src/ai/generate_insight_chat';
import useAuth from '@/src/lib/hooks/useAuth';
import useAlert from '@/src/lib/hooks/useAlert';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface InsightChatProps {
  isOpen: boolean;
  onClose: () => void;
  personalizedReading: PersonalizedReading;
  selectedBlock: BlockType | null;
  userContext: string;
  drawnCards: Array<{ name: string; emoji: string; reversed?: boolean }>;
  userProfile?: UserProfile;
}

export default function InsightChat({
  isOpen,
  onClose,
  personalizedReading,
  selectedBlock,
  userContext,
  drawnCards,
  userProfile,
}: InsightChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const cleanupIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { user } = useAuth();
  const { showError } = useAlert();

  // Initialize with a welcome message from Rob
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const welcomeMessage: Message = {
        id: `rob-${Date.now()}`,
        role: 'assistant',
        content: `Hey there! I see you want to dig deeper into this reading. I'm here to help you debug whatever's still bouncing around in your head. What's your follow-up question?`,
        timestamp: new Date(),
      };
      setMessages([welcomeMessage]);
    }
  }, [isOpen, messages.length]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cleanup old messages periodically
  useEffect(() => {
    if (!isOpen) return;

    const performCleanup = () => {
      setMessages((currentMessages) => {
        const cleaned = cleanupOldMessages(currentMessages);
        const trimmed = trimMessageHistory(cleaned);
        return trimmed;
      });
    };

    // Initial cleanup
    performCleanup();

    // Set up periodic cleanup
    cleanupIntervalRef.current = setInterval(
      performCleanup,
      CONVERSATION_LIMITS.CLEANUP_INTERVAL_MS
    );

    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, [isOpen]);

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (cleanupIntervalRef.current) {
        clearInterval(cleanupIntervalRef.current);
        cleanupIntervalRef.current = null;
      }
    };
  }, []);

  // Reset conversation state when modal is closed
  useEffect(() => {
    if (!isOpen) {
      // Clear state when modal is closed to prevent memory leaks
      setMessages([]);
      setInputMessage('');
      setValidationError(null);
      setIsLoading(false);
    }
  }, [isOpen]);

  // Validate input message in real-time
  const validateInput = (message: string) => {
    const validation = validateChatMessage(message);
    setValidationError(validation.isValid ? null : validation.error || null);
    return validation.isValid;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setInputMessage(value);

    // Clear validation error when user starts typing
    if (validationError && value.trim().length > 0) {
      setValidationError(null);
    }
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading || !user) return;

    // Validate before sending
    if (!validateInput(inputMessage)) {
      return;
    }

    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: inputMessage.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await generateInsightChat({
        userMessage: inputMessage.trim(),
        conversationHistory: messages,
        originalReading: personalizedReading,
        blockType: selectedBlock,
        userContext,
        drawnCards,
        userId: user.id,
        userProfile,
      });

      const assistantMessage: Message = {
        id: `rob-${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      showError('Failed to get response from Rob. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Manual cleanup function
  const handleManualCleanup = () => {
    setMessages((currentMessages) => {
      const cleaned = cleanupOldMessages(currentMessages);
      const trimmed = trimMessageHistory(cleaned);
      return trimmed;
    });
  };

  // Reset conversation function
  const handleResetConversation = () => {
    setMessages([]);
    setInputMessage('');
    setValidationError(null);

    // Re-initialize with welcome message
    const welcomeMessage: Message = {
      id: `rob-${Date.now()}`,
      role: 'assistant',
      content: `Hey there! I see you want to dig deeper into this reading. I'm here to help you debug whatever's still bouncing around in your head. What's your follow-up question?`,
      timestamp: new Date(),
    };
    setMessages([welcomeMessage]);
  };

  // Calculate character count for UI
  const charCount = inputMessage.length;
  const isOverLimit = charCount > CHAT_MESSAGE_LIMITS.MAX_LENGTH;
  const isValid =
    inputMessage.trim().length > 0 && !isOverLimit && !validationError;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-liminal-surface border-liminal-border rounded-lg shadow-breakthrough border w-full max-w-2xl max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-liminal-border">
          <div className="flex items-center gap-2">
            <img src={robEmoji} alt="Rob" className="w-6 h-6" />
            <h3 className="text-lg font-semibold text-accent">Chat with Rob</h3>
            <span className="text-xs text-secondary">
              ({messages.length} messages)
            </span>
          </div>
          <div className="flex items-center gap-2">
            {messages.length > 10 && (
              <button
                onClick={handleManualCleanup}
                className="text-secondary hover:text-primary transition-colors"
                title="Clean up old messages"
              >
                <FaBroom className="w-4 h-4" />
              </button>
            )}
            {messages.length > 1 && (
              <button
                onClick={handleResetConversation}
                className="text-secondary hover:text-primary transition-colors"
                title="Reset conversation"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="text-secondary hover:text-primary transition-colors"
              title="Close chat"
            >
              <FaTimes />
            </button>
          </div>
        </div>

        {/* Memory usage warning */}
        {messages.length > CONVERSATION_LIMITS.MAX_MESSAGES_IN_MEMORY * 0.8 && (
          <div className="bg-yellow-100 dark:bg-yellow-900/20 border-l-4 border-yellow-500 p-3 mx-4 mt-2">
            <div className="flex items-center">
              <div className="ml-3">
                <p className="text-sm text-yellow-700 dark:text-yellow-300">
                  Conversation is getting long ({messages.length} messages).
                  Consider using the cleanup button to improve performance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              <div
                className={cn(
                  'max-w-[80%] rounded-lg p-3',
                  message.role === 'user'
                    ? 'bg-accent text-void-900'
                    : 'bg-liminal-overlay text-primary'
                )}
              >
                {message.role === 'assistant' && (
                  <div className="flex items-center gap-2 mb-1">
                    <img src={robEmoji} alt="Rob" className="w-4 h-4" />
                    <span className="text-xs text-accent font-medium">Rob</span>
                  </div>
                )}
                <p className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content}
                </p>
                <div className="text-xs opacity-60 mt-1">
                  {message.timestamp.toLocaleTimeString()}
                </div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-liminal-overlay rounded-lg p-3 max-w-[80%]">
                <div className="flex items-center gap-2 mb-1">
                  <img src={robEmoji} alt="Rob" className="w-4 h-4" />
                  <span className="text-xs text-accent font-medium">Rob</span>
                </div>
                <div className="flex items-center gap-2">
                  <FaSpinner className="animate-spin text-accent" />
                  <span className="text-sm text-secondary">Thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-liminal-border">
          <div className="flex gap-2">
            <textarea
              value={inputMessage}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Ask Rob anything about your reading..."
              className={cn(
                'flex-1 bg-liminal-overlay border rounded-lg px-3 py-2 text-primary placeholder-secondary resize-none min-h-[2.5rem] max-h-24',
                isOverLimit || validationError
                  ? 'border-red-500 focus:border-red-500'
                  : 'border-liminal-border focus:border-accent'
              )}
              rows={1}
              disabled={isLoading}
              maxLength={CHAT_MESSAGE_LIMITS.MAX_LENGTH}
            />
            <button
              onClick={handleSendMessage}
              disabled={!isValid || isLoading}
              className={cn(
                'px-4 py-2 rounded-lg font-medium transition-colors',
                isValid && !isLoading
                  ? 'bg-accent text-void-900 hover:bg-accent/90'
                  : 'bg-muted text-secondary cursor-not-allowed'
              )}
            >
              <FaPaperPlane />
            </button>
          </div>

          {/* Character count and validation */}
          <div className="flex justify-between items-center mt-2">
            <div className="text-xs text-secondary">
              {validationError ? (
                <span className="text-red-500">{validationError}</span>
              ) : (
                <span>Press Enter to send, Shift+Enter for new line</span>
              )}
            </div>
            <div
              className={cn(
                'text-xs',
                isOverLimit ? 'text-red-500' : 'text-secondary'
              )}
            >
              {charCount}/{CHAT_MESSAGE_LIMITS.MAX_LENGTH}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
