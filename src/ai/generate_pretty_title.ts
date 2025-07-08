import { anthropic } from './index';

/**
 * Generate a short, descriptive, pretty title from a long action step using Anthropic Claude.
 * @param longText The long action step text
 * @returns A short, pretty title
 */
export async function generatePrettyTitle(longText: string): Promise<string> {
  if (!longText) return 'Untitled';
  const prompt = `Summarize the following action step as a short, descriptive, pretty title (max 10 words, no punctuation at the end). Do not repeat the word 'step' or 'action'.\n\nAction Step: ${longText}\n\nTitle:`;

  const message = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 32,
    temperature: 0.2,
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
  });

  const response = message.content[0];
  if (response.type !== 'text') {
    throw new Error('Unexpected response type from Claude');
  }
  return response.text.trim().replace(/[.?!]$/, '');
}
