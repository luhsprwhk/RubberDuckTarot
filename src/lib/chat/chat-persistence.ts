import { supabase } from '../supabase/supabase';
import { encrypt, decrypt } from '../encryption';

export interface ChatMessageData {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  metadata?: {
    token_count?: number;
    response_time_ms?: number;
    user_sentiment?: 'positive' | 'neutral' | 'negative';
    topics?: string[];
  };
}

export interface ConversationData {
  id: number;
  insight_id: number;
  started_at: Date;
  last_message_at: Date;
  message_count: number;
  is_active: boolean;
  messages: ChatMessageData[];
}

export class ChatPersistenceService {
  /**
   * Creates a new conversation for an insight
   */
  static async createConversation(
    insightId: number,
    userId: string
  ): Promise<number> {
    const { data, error } = await supabase
      .from('insight_conversations')
      .insert({
        insight_id: insightId,
        user_id: userId,
      })
      .select('id')
      .single();

    if (error) {
      console.error('Failed to create conversation:', error);
      throw new Error('Failed to create conversation');
    }

    return data.id;
  }

  /**
   * Gets an existing conversation for an insight, or creates one if none exists
   */
  static async getOrCreateConversation(
    insightId: number,
    userId: string
  ): Promise<number> {
    // First try to find existing conversation
    const { data: existing, error: findError } = await supabase
      .from('insight_conversations')
      .select('id')
      .eq('insight_id', insightId)
      .eq('user_id', userId)
      .eq('is_active', true)
      .maybeSingle();

    if (findError) {
      console.error('Failed to find conversation:', findError);
      throw new Error('Failed to find conversation');
    }

    if (existing) {
      return existing.id;
    }

    // Create new conversation if none exists
    return this.createConversation(insightId, userId);
  }

  /**
   * Saves a chat message to the database (encrypted)
   */
  static async saveMessage(
    conversationId: number,
    userId: string,
    message: ChatMessageData
  ): Promise<void> {
    try {
      // Encrypt the message content
      const encryptedContent = await encrypt(message.content);

      // Save to database
      const { error } = await supabase.from('chat_messages').insert({
        conversation_id: conversationId,
        user_id: userId,
        role: message.role,
        content: encryptedContent,
        metadata: message.metadata || {},
        created_at: message.timestamp.toISOString(),
      });

      if (error) {
        console.error('Failed to save message:', error);
        throw new Error('Failed to save message');
      }

      // Update conversation metadata
      await this.updateConversationMetadata(conversationId);
    } catch (error) {
      console.error('Error saving message:', error);
      throw new Error('Failed to save message');
    }
  }

  /**
   * Updates conversation metadata (last message time, message count)
   */
  private static async updateConversationMetadata(
    conversationId: number
  ): Promise<void> {
    const { error } = await supabase.rpc('update_conversation_metadata', {
      conversation_id: conversationId,
    });

    if (error) {
      console.error('Failed to update conversation metadata:', error);
      // Don't throw here as it's not critical
    }
  }

  /**
   * Loads chat history for a conversation (decrypted)
   */
  static async loadConversationHistory(
    conversationId: number,
    userId: string,
    limit: number = 50
  ): Promise<ChatMessageData[]> {
    try {
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) {
        console.error('Failed to load chat history:', error);
        throw new Error('Failed to load chat history');
      }

      // Decrypt and format messages
      const decryptedMessages: ChatMessageData[] = [];

      for (const msg of data) {
        try {
          const decryptedContent = await decrypt(msg.content);
          if (decryptedContent) {
            decryptedMessages.push({
              id: msg.id.toString(),
              role: msg.role as 'user' | 'assistant',
              content: decryptedContent,
              timestamp: new Date(msg.created_at),
              metadata: msg.metadata || {},
            });
          }
        } catch (decryptError) {
          console.error('Failed to decrypt message:', decryptError);
          // Skip messages that can't be decrypted rather than failing entirely
          continue;
        }
      }

      return decryptedMessages;
    } catch (error) {
      console.error('Error loading conversation history:', error);
      throw new Error('Failed to load conversation history');
    }
  }

  /**
   * Loads full conversation data including metadata
   */
  static async loadConversation(
    insightId: number,
    userId: string
  ): Promise<ConversationData | null> {
    try {
      // Get conversation metadata
      const { data: conversation, error: convError } = await supabase
        .from('insight_conversations')
        .select('*')
        .eq('insight_id', insightId)
        .eq('user_id', userId)
        .eq('is_active', true)
        .maybeSingle();

      if (convError) {
        console.error('Failed to load conversation:', convError);
        throw new Error('Failed to load conversation');
      }

      if (!conversation) {
        return null;
      }

      // Load messages
      const messages = await this.loadConversationHistory(
        conversation.id,
        userId
      );

      return {
        id: conversation.id,
        insight_id: conversation.insight_id,
        started_at: new Date(conversation.started_at),
        last_message_at: new Date(conversation.last_message_at),
        message_count: conversation.message_count,
        is_active: conversation.is_active,
        messages,
      };
    } catch (error) {
      console.error('Error loading conversation:', error);
      return null;
    }
  }

  /**
   * Archives a conversation (soft delete)
   */
  static async archiveConversation(
    conversationId: number,
    userId: string
  ): Promise<void> {
    const { error } = await supabase
      .from('insight_conversations')
      .update({ is_active: false })
      .eq('id', conversationId)
      .eq('user_id', userId);

    if (error) {
      console.error('Failed to archive conversation:', error);
      throw new Error('Failed to archive conversation');
    }
  }

  /**
   * Permanently deletes old conversations and messages (for privacy compliance)
   */
  static async cleanupOldConversations(
    userId: string,
    maxAgeHours: number = 24 * 30 // 30 days by default
  ): Promise<void> {
    const cutoffDate = new Date(Date.now() - maxAgeHours * 60 * 60 * 1000);

    // Delete old messages first (due to foreign key constraints)
    const { error: messagesError } = await supabase
      .from('chat_messages')
      .delete()
      .eq('user_id', userId)
      .lt('created_at', cutoffDate.toISOString());

    if (messagesError) {
      console.error('Failed to cleanup old messages:', messagesError);
    }

    // Delete old conversations
    const { error: conversationsError } = await supabase
      .from('insight_conversations')
      .delete()
      .eq('user_id', userId)
      .lt('started_at', cutoffDate.toISOString());

    if (conversationsError) {
      console.error('Failed to cleanup old conversations:', conversationsError);
    }
  }

  /**
   * Gets analytics data for improving insights (anonymized)
   */
  static async getAnalyticsData(
    timeframeHours: number = 24 * 7 // 7 days by default
  ): Promise<{
    totalConversations: number;
    totalMessages: number;
    avgMessagesPerConversation: number;
    commonTopics: string[];
    sentimentDistribution: Record<string, number>;
  }> {
    try {
      const cutoffDate = new Date(Date.now() - timeframeHours * 60 * 60 * 1000);

      // This would typically be done with SQL aggregation functions
      // For now, we'll implement basic analytics
      const { data: conversations, error: convError } = await supabase
        .from('insight_conversations')
        .select('id, message_count')
        .gte('started_at', cutoffDate.toISOString());

      if (convError) {
        throw convError;
      }

      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('metadata')
        .gte('created_at', cutoffDate.toISOString());

      if (msgError) {
        throw msgError;
      }

      const totalConversations = conversations.length;
      const totalMessages = messages.length;
      const avgMessagesPerConversation =
        totalConversations > 0 ? totalMessages / totalConversations : 0;

      // Extract topics and sentiment from metadata
      const topics: string[] = [];
      const sentimentCounts: Record<string, number> = {
        positive: 0,
        neutral: 0,
        negative: 0,
      };

      messages.forEach((msg) => {
        if (msg.metadata?.topics) {
          topics.push(...msg.metadata.topics);
        }
        if (msg.metadata?.user_sentiment) {
          sentimentCounts[msg.metadata.user_sentiment]++;
        }
      });

      // Get most common topics
      const topicCounts = topics.reduce(
        (acc, topic) => {
          acc[topic] = (acc[topic] || 0) + 1;
          return acc;
        },
        {} as Record<string, number>
      );

      const commonTopics = Object.entries(topicCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 10)
        .map(([topic]) => topic);

      return {
        totalConversations,
        totalMessages,
        avgMessagesPerConversation:
          Math.round(avgMessagesPerConversation * 10) / 10,
        commonTopics,
        sentimentDistribution: sentimentCounts,
      };
    } catch (error) {
      console.error('Error getting analytics data:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        avgMessagesPerConversation: 0,
        commonTopics: [],
        sentimentDistribution: { positive: 0, neutral: 0, negative: 0 },
      };
    }
  }
}
