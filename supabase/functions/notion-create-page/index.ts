/// <reference types="deno.ns" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

/**
 * Generate a short, pretty, descriptive title from a long action step.
 * This is a simple heuristic; you can replace this with an AI call (Claude, OpenAI, etc) later.
 */
function prettyTitle(longText: string): string {
  if (!longText) return 'Untitled';
  // Take first sentence, or first 12 words, whichever is shorter
  let firstSentence = longText.split(/[.!?\n]/)[0];
  const words = firstSentence.split(' ');
  if (words.length > 12) {
    firstSentence = words.slice(0, 12).join(' ');
  }
  // Title case
  return firstSentence
    .replace(
      /\w\S*/g,
      (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    )
    .trim();
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { accessToken, pageData } = await req.json();

    if (!accessToken || !pageData) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields' }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Get or create database
    const databaseId = await getOrCreateDatabase(accessToken);

    // Create page
    const pageResponse = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify({
        parent: {
          type: 'database_id',
          database_id: databaseId,
        },
        properties: {
          Title: {
            title: [
              {
                text: {
                  content: prettyTitle(pageData.title),
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
        },
        children: formatContentBlocks(pageData),
      }),
    });

    if (!pageResponse.ok) {
      const errorText = await pageResponse.text();
      console.error('Failed to create page:', errorText);
      return new Response(JSON.stringify({ error: 'Failed to create page' }), {
        status: pageResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const pageData_response = await pageResponse.json();
    return new Response(JSON.stringify({ url: pageData_response.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function getOrCreateDatabase(accessToken: string): Promise<string> {
  // First, try to find existing "Tarot Readings" database
  const searchResponse = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      query: 'Rubber Duck Insights',
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
  const pagesResponse = await fetch('https://api.notion.com/v1/search', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
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
    throw new Error('No pages found in workspace. Please create a page first.');
  }

  const parentPageId = pagesData.results[0].id;

  // Create the database
  const createResponse = await fetch('https://api.notion.com/v1/databases', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { type: 'page_id', page_id: parentPageId },
      title: [
        {
          type: 'text',
          text: {
            content: 'Rubber Duck Insights',
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
    throw new Error(`Failed to create database: ${createResponse.statusText}`);
  }

  const createData = await createResponse.json();
  return createData.id;
}

export interface PageData {
  blockName?: string;
  cardNames?: string[];
  nextStep?: boolean;
  insightDate?: string;
  insightUrl?: string;
  title?: string;
  content?: {
    robQuip?: string;
    actionStep?: string;
  };
}

function formatContentBlocks(pageData: PageData): unknown[] {
  const blocks: unknown[] = [];

  // If this is a next step export, add minimal context
  if (pageData.nextStep) {
    // Add brief context
    const contextParts = [];
    if (pageData.blockName) {
      contextParts.push(`Block: ${pageData.blockName}`);
    }

    if (pageData.insightDate) {
      contextParts.push(`Date: ${pageData.insightDate}`);
    }

    if (contextParts.length > 0) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: contextParts.join(' • '),
              },
              annotations: {
                italic: true,
              },
            },
          ],
        },
      });
    }

    // add action step
    if (pageData.content?.actionStep) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: pageData.content.actionStep,
              },
            },
          ],
        },
      });
    }

    // Add link to full insight
    if (pageData.insightUrl) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: '→ View full insight',
              },
              annotations: {
                bold: true,
              },
              href: pageData.insightUrl,
            },
          ],
        },
      });
    }

    // add rob quip
    if (pageData.content && pageData.content.robQuip) {
      blocks.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: pageData.content.robQuip,
              },
            },
          ],
        },
      });
    }
    return blocks;
  }

  return blocks;
}
