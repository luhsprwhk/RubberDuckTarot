import type { PersonalizedReading } from '../../ai';

export interface NotionIntegration {
  accessToken: string;
  workspaceId: string;
}

export interface NotionPageData {
  title: string;
  content: PersonalizedReading;
  blockName?: string;
  cardNames?: string[];
}

export class NotionService {
  private static readonly NOTION_API_URL = 'https://api.notion.com/v1';
  private static readonly NOTION_VERSION = '2022-06-28';

  static async initiateOAuth(): Promise<string> {
    const clientId = import.meta.env.VITE_NOTION_CLIENT_ID;
    const redirectUri = import.meta.env.DEV
      ? 'http://localhost:5173/notion-callback'
      : 'https://rubberducktarot.app/notion-callback';

    const authUrl = new URL(`${this.NOTION_API_URL}/oauth/authorize`);
    authUrl.searchParams.set('client_id', clientId);
    authUrl.searchParams.set('response_type', 'code');
    authUrl.searchParams.set('owner', 'user');
    authUrl.searchParams.set('redirect_uri', redirectUri);
    authUrl.searchParams.set('state', crypto.randomUUID()); // Add CSRF protection

    return authUrl.toString();
  }

  static async exchangeCodeForToken(code: string): Promise<NotionIntegration> {
    const redirectUri = `${window.location.origin}/notion-callback`;
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration not found');
    }

    const response = await fetch(`${supabaseUrl}/functions/v1/notion-oauth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        code,
        redirectUri,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to exchange code for token: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();

    return {
      accessToken: data.access_token,
      workspaceId: data.workspace_id,
    };
  }

  static async createPage(
    accessToken: string,
    pageData: NotionPageData
  ): Promise<string> {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase configuration not found');
    }

    const response = await fetch(
      `${supabaseUrl}/functions/v1/notion-create-page`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${supabaseAnonKey}`,
        },
        body: JSON.stringify({
          accessToken,
          pageData,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `Failed to create Notion page: ${errorData.error || response.statusText}`
      );
    }

    const data = await response.json();
    return data.url;
  }
}
