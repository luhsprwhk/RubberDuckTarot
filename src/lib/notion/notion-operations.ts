import { createClient } from '@supabase/supabase-js';
import type { NotionIntegration } from './notion-service';

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface NotionIntegrationData {
  accessToken: string;
  workspaceId: string;
}

export class NotionOperations {
  static async saveNotionIntegration(
    userId: string,
    integration: NotionIntegration
  ): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        notion_access_token: integration.accessToken,
        notion_workspace_id: integration.workspaceId,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to save Notion integration: ${error.message}`);
    }
  }

  static async getNotionIntegration(
    userId: string
  ): Promise<NotionIntegrationData | null> {
    const { data, error } = await supabase
      .from('users')
      .select('notion_access_token, notion_workspace_id')
      .eq('id', userId)
      .single();

    if (error) {
      throw new Error(`Failed to get Notion integration: ${error.message}`);
    }

    if (!data?.notion_access_token || !data?.notion_workspace_id) {
      return null;
    }

    return {
      accessToken: data.notion_access_token,
      workspaceId: data.notion_workspace_id,
    };
  }

  static async removeNotionIntegration(userId: string): Promise<void> {
    const { error } = await supabase
      .from('users')
      .update({
        notion_access_token: null,
        notion_workspace_id: null,
      })
      .eq('id', userId);

    if (error) {
      throw new Error(`Failed to remove Notion integration: ${error.message}`);
    }
  }

  static async hasNotionIntegration(userId: string): Promise<boolean> {
    const integration = await this.getNotionIntegration(userId);
    return integration !== null;
  }
}
