/// <reference types="deno.ns" />
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
};

serve(async (req) => {
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

interface PageData {
  blockName?: string;
  cardNames?: string[];
  content: {
    interpretation: string;
    keyInsights?: string[];
    actionSteps?: string[];
    robQuip?: string;
    reflectionPrompts?: string[];
  };
}

function formatContentBlocks(pageData: PageData): unknown[] {
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
            content: '🔮 Rubber Duck Insights',
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
  if (pageData.content.keyInsights && pageData.content.keyInsights.length > 0) {
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

    pageData.content.keyInsights.forEach((insight: string) => {
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
  if (pageData.content.actionSteps && pageData.content.actionSteps.length > 0) {
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

    pageData.content.actionSteps.forEach((step: string) => {
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

    pageData.content.reflectionPrompts.forEach((prompt: string) => {
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
