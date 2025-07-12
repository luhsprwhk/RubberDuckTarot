import { ChatMessageData } from '../chat/chat-persistence';
import { ChatPersistenceService } from '../chat/chat-persistence';
import { supabase } from '../supabase/supabase';

/**
 * Represents a message in an exported conversation.
 */
export interface ExportedMessage {
  id: string;
  content: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: string;
  isSummary?: boolean;
}

/**
 * Represents an exported conversation, including its messages.
 */
export interface ExportedConversation {
  id: string;
  insightId: string;
  startedAt: string;
  lastMessageAt?: string;
  messageCount?: number;
  isActive?: boolean;
  messages: ExportedMessage[];
  error?: string;
}

/**
 * Represents the structure of anonymized data for analytics.
 */
export interface AnonymizedMessageMetadata {
  token_count?: number;
  response_time_ms?: number;
  user_sentiment?: 'positive' | 'neutral' | 'negative';
  topics?: string[];
}

export interface AnonymizedConversation {
  id: string;
  started_at: string;
  last_message_at: string;
  message_count: number;
  chat_messages: {
    role: 'user' | 'assistant' | 'system';
    metadata: AnonymizedMessageMetadata;
    created_at: string;
  }[];
}

export interface ChatPrivacySettings {
  retentionPeriodDays: number; // How long to keep chat data
  automaticCleanup: boolean; // Whether to automatically clean up old data
  analyticsOptIn: boolean; // Whether to include data in analytics
  exportEnabled: boolean; // Whether user can export their chat data
}

export interface ChatDataSummary {
  totalConversations: number;
  totalMessages: number;
  oldestMessageDate: Date | null;
  newestMessageDate: Date | null;
  dataSize: string; // Estimated size
}

export class ChatPrivacyService {
  // Default privacy settings (privacy-first approach)
  static readonly DEFAULT_SETTINGS: ChatPrivacySettings = {
    retentionPeriodDays: 30, // 30 days default
    automaticCleanup: true,
    analyticsOptIn: false, // Opt-in for analytics
    exportEnabled: true,
  };

  static readonly RETENTION_OPTIONS = [
    { days: 7, label: '7 days' },
    { days: 30, label: '30 days' },
    { days: 90, label: '3 months' },
    { days: 365, label: '1 year' },
    { days: -1, label: 'Never delete' }, // -1 means never delete
  ];

  /**
   * Gets privacy settings for a user
   */
  static async getPrivacySettings(
    userId: string
  ): Promise<ChatPrivacySettings> {
    try {
      const { data, error } = await supabase
        .from('user_chat_privacy_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error || !data) {
        // Return default settings if none exist
        return this.DEFAULT_SETTINGS;
      }

      return {
        retentionPeriodDays: data.retention_period_days,
        automaticCleanup: data.automatic_cleanup,
        analyticsOptIn: data.analytics_opt_in,
        exportEnabled: data.export_enabled,
      };
    } catch (error) {
      console.error('Failed to get privacy settings:', error);
      return this.DEFAULT_SETTINGS;
    }
  }

  /**
   * Updates privacy settings for a user
   */
  static async updatePrivacySettings(
    userId: string,
    settings: ChatPrivacySettings
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('user_chat_privacy_settings')
        .upsert({
          user_id: userId,
          retention_period_days: settings.retentionPeriodDays,
          automatic_cleanup: settings.automaticCleanup,
          analytics_opt_in: settings.analyticsOptIn,
          export_enabled: settings.exportEnabled,
          updated_at: new Date().toISOString(),
        });

      if (error) {
        throw new Error('Failed to update privacy settings');
      }

      // If retention period was reduced, trigger cleanup
      if (settings.automaticCleanup && settings.retentionPeriodDays > 0) {
        await this.enforceRetentionPolicy(userId, settings.retentionPeriodDays);
      }
    } catch (error) {
      console.error('Failed to update privacy settings:', error);
      throw error;
    }
  }

  /**
   * Gets a summary of user's chat data
   */
  static async getChatDataSummary(userId: string): Promise<ChatDataSummary> {
    try {
      // Get conversation count
      const { data: conversations, error: convError } = await supabase
        .from('insight_conversations')
        .select('id, started_at')
        .eq('user_id', userId);

      if (convError) {
        throw convError;
      }

      // Get message count and date range
      const { data: messages, error: msgError } = await supabase
        .from('chat_messages')
        .select('created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (msgError) {
        throw msgError;
      }

      const totalConversations = conversations?.length || 0;
      const totalMessages = messages?.length || 0;

      const oldestMessageDate =
        messages && messages.length > 0
          ? new Date(messages[0].created_at)
          : null;

      const newestMessageDate =
        messages && messages.length > 0
          ? new Date(messages[messages.length - 1].created_at)
          : null;

      // Estimate data size (rough calculation)
      const estimatedSizeKB = Math.round(totalMessages * 0.5); // Assume ~0.5KB per message on average
      const dataSize =
        estimatedSizeKB < 1024
          ? `${estimatedSizeKB} KB`
          : `${(estimatedSizeKB / 1024).toFixed(1)} MB`;

      return {
        totalConversations,
        totalMessages,
        oldestMessageDate,
        newestMessageDate,
        dataSize,
      };
    } catch (error) {
      console.error('Failed to get chat data summary:', error);
      return {
        totalConversations: 0,
        totalMessages: 0,
        oldestMessageDate: null,
        newestMessageDate: null,
        dataSize: '0 KB',
      };
    }
  }

  /**
   * Exports user's chat data in JSON format
   */
  static async exportUserChatData(userId: string): Promise<string> {
    try {
      // Check if user has export enabled
      const settings = await this.getPrivacySettings(userId);
      if (!settings.exportEnabled) {
        throw new Error('Data export is disabled for this user');
      }

      // Get all conversations
      const { data: conversations, error: convError } = await supabase
        .from('insight_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('started_at', { ascending: true });

      if (convError) {
        throw convError;
      }

      const exportData = {
        exportDate: new Date().toISOString(),
        userId: userId, // Include for user verification
        privacySettings: settings,
        conversations: [] as ExportedConversation[],
      };

      // For each conversation, get the decrypted messages
      for (const conv of conversations || []) {
        try {
          const messages: ChatMessageData[] =
            await ChatPersistenceService.loadConversationHistory(
              conv.id,
              userId,
              1000 // Load up to 1000 messages per conversation
            );

          const exportedMessages: ExportedMessage[] = messages.map((msg) => ({
            id: msg.id,
            content: msg.content,
            role: msg.role,
            timestamp: msg.timestamp.toISOString(),
          }));

          exportData.conversations.push({
            id: conv.id,
            insightId: conv.insight_id,
            startedAt: conv.started_at,
            lastMessageAt: conv.last_message_at,
            messageCount: conv.message_count,
            isActive: conv.is_active,
            messages: exportedMessages,
          });
        } catch (error) {
          console.error(
            `Failed to load messages for conversation ${conv.id}:`,
            error
          );
          // Include conversation metadata even if messages can't be loaded
          exportData.conversations.push({
            id: conv.id,
            insightId: conv.insight_id,
            startedAt: conv.started_at,
            lastMessageAt: conv.last_message_at,
            messageCount: conv.message_count,
            isActive: conv.is_active,
            messages: [],
            error: 'Failed to decrypt messages',
          });
        }
      }

      return JSON.stringify(exportData, null, 2);
    } catch (error) {
      console.error('Failed to export chat data:', error);
      throw error;
    }
  }

  /**
   * Deletes all chat data for a user
   */
  static async deleteAllUserChatData(userId: string): Promise<void> {
    try {
      // Delete messages first (due to foreign key constraints)
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId);

      if (messagesError) {
        throw messagesError;
      }

      // Delete conversations
      const { error: conversationsError } = await supabase
        .from('insight_conversations')
        .delete()
        .eq('user_id', userId);

      if (conversationsError) {
        throw conversationsError;
      }

      console.log(`Deleted all chat data for user ${userId}`);
    } catch (error) {
      console.error('Failed to delete user chat data:', error);
      throw error;
    }
  }

  /**
   * Enforces retention policy by deleting old data
   */
  static async enforceRetentionPolicy(
    userId: string,
    retentionPeriodDays: number
  ): Promise<void> {
    if (retentionPeriodDays <= 0) {
      return; // No retention limit
    }

    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionPeriodDays);

      // Delete old messages
      const { error: messagesError } = await supabase
        .from('chat_messages')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate.toISOString());

      if (messagesError) {
        console.error('Failed to delete old messages:', messagesError);
      }

      // Delete old conversations
      const { error: conversationsError } = await supabase
        .from('insight_conversations')
        .delete()
        .eq('user_id', userId)
        .lt('started_at', cutoffDate.toISOString());

      if (conversationsError) {
        console.error(
          'Failed to delete old conversations:',
          conversationsError
        );
      }

      console.log(
        `Enforced retention policy for user ${userId}: deleted data older than ${retentionPeriodDays} days`
      );
    } catch (error) {
      console.error('Failed to enforce retention policy:', error);
      throw error;
    }
  }

  /**
   * Runs automatic cleanup for all users who have it enabled
   */
  static async runAutomaticCleanup(): Promise<{
    usersProcessed: number;
    errors: string[];
  }> {
    const errors: string[] = [];
    let usersProcessed = 0;

    try {
      // Get all users with automatic cleanup enabled
      const { data: settings, error } = await supabase
        .from('user_chat_privacy_settings')
        .select('user_id, retention_period_days')
        .eq('automatic_cleanup', true)
        .gt('retention_period_days', 0); // Only users with actual retention limits

      if (error) {
        throw error;
      }

      for (const userSetting of settings || []) {
        try {
          await this.enforceRetentionPolicy(
            userSetting.user_id,
            userSetting.retention_period_days
          );
          usersProcessed++;
        } catch (error) {
          const errorMsg = `Failed to clean up data for user ${userSetting.user_id}: ${error}`;
          console.error(errorMsg);
          errors.push(errorMsg);
        }
      }

      return { usersProcessed, errors };
    } catch (error) {
      const errorMsg = `Failed to run automatic cleanup: ${error}`;
      console.error(errorMsg);
      return { usersProcessed, errors: [errorMsg] };
    }
  }

  /**
   * Anonymizes user data for analytics (removes PII while keeping conversation structure)
   */
  static async anonymizeUserDataForAnalytics(
    userId: string
  ): Promise<AnonymizedConversation[]> {
    try {
      const settings = await this.getPrivacySettings(userId);
      if (!settings.analyticsOptIn) {
        return []; // User hasn't opted in to analytics
      }

      // Get anonymized conversation data
      const { data: conversations, error } = await supabase
        .from('insight_conversations')
        .select(
          `
          id,
          started_at,
          last_message_at,
          message_count,
          chat_messages (
            role,
            metadata,
            created_at
          )
        `
        )
        .eq('user_id', userId);

      if (error) {
        throw error;
      }

      // The data from Supabase should already match the AnonymizedConversation structure
      return (conversations || []) as AnonymizedConversation[];
    } catch (error) {
      console.error('Failed to anonymize user data:', error);
      return [];
    }
  }
}
