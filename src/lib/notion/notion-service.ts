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

    const authUrl = new URL('https://api.notion.com/v1/oauth/authorize');
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
    const response = await fetch(`${this.NOTION_API_URL}/pages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: {
          type: 'database_id',
          database_id: await this.getOrCreateDatabase(accessToken),
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: pageData.title,
                },
              },
            ],
          },
          Date: {
            date: {
              start: new Date().toISOString().split('T')[0],
            },
          },
          Block: {
            rich_text: [
              {
                text: {
                  content: pageData.blockName || 'N/A',
                },
              },
            ],
          },
          Cards: {
            rich_text: [
              {
                text: {
                  content: pageData.cardNames?.join(', ') || 'N/A',
                },
              },
            ],
          },
        },
        children: this.formatContentBlocks(pageData),
      }),
    });

    if (!response.ok) {
      throw new Error(`Failed to create Notion page: ${response.statusText}`);
    }

    const data = await response.json();
    return data.url;
  }

  private static async getOrCreateDatabase(
    accessToken: string
  ): Promise<string> {
    // First, try to find existing "Tarot Readings" database
    const searchResponse = await fetch(`${this.NOTION_API_URL}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.NOTION_VERSION,
      },
      body: JSON.stringify({
        query: 'Tarot Readings',
        filter: {
          property: 'object',
          value: 'database',
        },
      }),
    });

    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.results.length > 0) {
        return searchData.results[0].id;
      }
    }

    // Database doesn't exist, create it
    // First get a parent page to create the database in
    const pagesResponse = await fetch(`${this.NOTION_API_URL}/search`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.NOTION_VERSION,
      },
      body: JSON.stringify({
        filter: {
          property: 'object',
          value: 'page',
        },
        page_size: 1,
      }),
    });

    if (!pagesResponse.ok) {
      throw new Error(`Failed to get parent page: ${pagesResponse.statusText}`);
    }

    const pagesData = await pagesResponse.json();
    if (pagesData.results.length === 0) {
      throw new Error(
        'No pages found in workspace. Please create a page first.'
      );
    }

    const parentPageId = pagesData.results[0].id;

    // Create the database
    const createResponse = await fetch(`${this.NOTION_API_URL}/databases`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': this.NOTION_VERSION,
      },
      body: JSON.stringify({
        parent: { type: 'page_id', page_id: parentPageId },
        title: [
          {
            type: 'text',
            text: {
              content: 'Tarot Readings',
            },
          },
        ],
        properties: {
          Title: {
            title: {},
          },
          Date: {
            date: {},
          },
          Block: {
            rich_text: {},
          },
          Cards: {
            rich_text: {},
          },
        },
      }),
    });

    if (!createResponse.ok) {
      throw new Error(
        `Failed to create database: ${createResponse.statusText}`
      );
    }

    const createData = await createResponse.json();
    return createData.id;
  }

  private static formatContentBlocks(pageData: NotionPageData): unknown[] {
    const blocks: unknown[] = [];

    // Add heading
    blocks.push({
      object: 'block',
      type: 'heading_1',
      heading_1: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: '🔮 Tarot Reading Insights',
            },
          },
        ],
      },
    });

    // Add block name if available
    if (pageData.blockName) {
      blocks.push({
        object: 'block',
        type: 'heading_2',
        heading_2: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: `Block: ${pageData.blockName}`,
              },
            },
          ],
        },
      });
    }

    // Add cards if available
    if (pageData.cardNames && pageData.cardNames.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🃏 Cards Drawn',
              },
            },
          ],
        },
      });

      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: pageData.cardNames.join(', '),
              },
            },
          ],
        },
      });
    }

    // Add interpretation
    blocks.push({
      object: 'block',
      type: 'heading_3',
      heading_3: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: '📖 Interpretation',
            },
          },
        ],
      },
    });

    blocks.push({
      object: 'block',
      type: 'paragraph',
      paragraph: {
        rich_text: [
          {
            type: 'text',
            text: {
              content: pageData.content.interpretation,
            },
          },
        ],
      },
    });

    // Add key insights
    if (pageData.content.keyInsights.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '💡 Key Insights',
              },
            },
          ],
        },
      });

      pageData.content.keyInsights.forEach((insight) => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: insight,
                },
              },
            ],
          },
        });
      });
    }

    // Add action steps
    if (pageData.content.actionSteps.length > 0) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🎯 Next Steps',
              },
            },
          ],
        },
      });

      pageData.content.actionSteps.forEach((step) => {
        blocks.push({
          object: 'block',
          type: 'numbered_list_item',
          numbered_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: step,
                },
              },
            ],
          },
        });
      });
    }

    // Add Rob's quip
    if (pageData.content.robQuip) {
      blocks.push({
        object: 'block',
        type: 'callout',
        callout: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: pageData.content.robQuip,
              },
            },
          ],
          icon: {
            type: 'emoji',
            emoji: '🦆',
          },
        },
      });
    }

    // Add reflection prompts if available
    if (
      pageData.content.reflectionPrompts &&
      pageData.content.reflectionPrompts.length > 0
    ) {
      blocks.push({
        object: 'block',
        type: 'heading_3',
        heading_3: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '🤔 Reflection Prompts',
              },
            },
          ],
        },
      });

      pageData.content.reflectionPrompts.forEach((prompt) => {
        blocks.push({
          object: 'block',
          type: 'bulleted_list_item',
          bulleted_list_item: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: prompt,
                },
              },
            ],
          },
        });
      });
    }

    return blocks;
  }
}
