/**
 * Input sanitization utilities for user-generated content
 * Provides defense against XSS, SQL injection, and other security threats
 */

// Character limits for different input types
export const INPUT_LIMITS = {
  REFLECTION_TEXT: 10000, // Max characters for reflection text
  BLOCK_TYPE_ID: 50, // Max length for block type IDs
  USER_ID: 255, // Max length for user IDs
  CARD_ID_MAX: 999999, // Max valid card ID
} as const;

// Patterns for validation
const PATTERNS = {
  // Allow alphanumeric, spaces, basic punctuation, and common symbols
  REFLECTION_TEXT: /^[\p{L}\p{N}\p{P}\p{S}\p{Z}\r\n\t]*$/u,
  // Block type IDs should be alphanumeric with underscores/hyphens
  BLOCK_TYPE_ID: /^[a-zA-Z0-9_-]*$/,
  // User IDs should be UUIDs or similar safe formats
  USER_ID: /^[a-zA-Z0-9_-]+$/,
} as const;

// Characters that are completely forbidden
const FORBIDDEN_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, // Script tags
  /javascript:/gi, // JavaScript protocols
  /data:text\/html/gi, // Data URLs with HTML
  /vbscript:/gi, // VBScript protocols
  /on\w+\s*=/gi, // Event handlers
  /<iframe\b/gi, // Iframe tags
  /<object\b/gi, // Object tags
  /<embed\b/gi, // Embed tags
  /<link\b/gi, // Link tags
  /<meta\b/gi, // Meta tags
  /<form\b/gi, // Form tags
] as const;

/**
 * Sanitizes reflection text input from users
 */
export function sanitizeReflectionText(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('Reflection text must be a string');
  }

  // Check length limits
  if (input.length > INPUT_LIMITS.REFLECTION_TEXT) {
    throw new Error(
      `Reflection text exceeds maximum length of ${INPUT_LIMITS.REFLECTION_TEXT} characters`
    );
  }

  // Remove null bytes and other control characters except newlines and tabs
  // eslint-disable-next-line no-control-regex
  let sanitized = input.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');

  // Check for forbidden patterns
  for (const pattern of FORBIDDEN_PATTERNS) {
    if (pattern.test(sanitized)) {
      throw new Error('Reflection text contains forbidden content');
    }
  }

  // Validate against allowed character pattern
  if (!PATTERNS.REFLECTION_TEXT.test(sanitized)) {
    throw new Error('Reflection text contains invalid characters');
  }

  // Normalize whitespace - collapse multiple spaces but preserve intentional line breaks
  sanitized = sanitized
    .replace(/[ \t]+/g, ' ') // Collapse multiple spaces/tabs to single space
    .replace(/\n\s*\n\s*\n/g, '\n\n') // Collapse multiple newlines to max 2
    .replace(/[ \t]+$/gm, '') // Remove trailing spaces/tabs from each line
    .replace(/^\s+|\s+$/g, ''); // Trim leading/trailing whitespace

  return sanitized;
}

/**
 * Validates and sanitizes block type ID
 */
export function sanitizeBlockTypeId(
  input: string | undefined
): string | undefined {
  if (input === undefined || input === null || input === '') {
    return undefined;
  }

  if (typeof input !== 'string') {
    throw new Error('Block type ID must be a string');
  }

  if (input.length > INPUT_LIMITS.BLOCK_TYPE_ID) {
    throw new Error(
      `Block type ID exceeds maximum length of ${INPUT_LIMITS.BLOCK_TYPE_ID} characters`
    );
  }

  // Remove any whitespace
  const sanitized = input.trim();

  if (!PATTERNS.BLOCK_TYPE_ID.test(sanitized)) {
    throw new Error('Block type ID contains invalid characters');
  }

  return sanitized;
}

/**
 * Validates user ID format
 */
export function validateUserId(input: string): string {
  if (typeof input !== 'string') {
    throw new Error('User ID must be a string');
  }

  if (!input.trim()) {
    throw new Error('User ID cannot be empty');
  }

  if (input.length > INPUT_LIMITS.USER_ID) {
    throw new Error(
      `User ID exceeds maximum length of ${INPUT_LIMITS.USER_ID} characters`
    );
  }

  const sanitized = input.trim();

  if (!PATTERNS.USER_ID.test(sanitized)) {
    throw new Error('User ID contains invalid characters');
  }

  return sanitized;
}

/**
 * Validates card ID
 */
export function validateCardId(input: number): number {
  if (typeof input !== 'number' || !Number.isInteger(input)) {
    throw new Error('Card ID must be an integer');
  }

  if (input < 1 || input > INPUT_LIMITS.CARD_ID_MAX) {
    throw new Error(
      `Card ID must be between 1 and ${INPUT_LIMITS.CARD_ID_MAX}`
    );
  }

  return input;
}

/**
 * Validates prompt index
 */
export function validatePromptIndex(input: number): number {
  if (typeof input !== 'number' || !Number.isInteger(input)) {
    throw new Error('Prompt index must be an integer');
  }

  if (input < 0 || input > 99) {
    // Reasonable upper limit for prompt indices
    throw new Error('Prompt index must be between 0 and 99');
  }

  return input;
}

/**
 * Comprehensive validation for reflection save operation
 */
export interface ReflectionInput {
  userId: string;
  cardId: number;
  promptIndex: number;
  reflectionText: string;
  blockTypeId?: string;
}

export interface SanitizedReflectionInput {
  userId: string;
  cardId: number;
  promptIndex: number;
  reflectionText: string;
  blockTypeId?: string;
}

export function sanitizeReflectionInput(
  input: ReflectionInput
): SanitizedReflectionInput {
  return {
    userId: validateUserId(input.userId),
    cardId: validateCardId(input.cardId),
    promptIndex: validatePromptIndex(input.promptIndex),
    reflectionText: sanitizeReflectionText(input.reflectionText),
    blockTypeId: sanitizeBlockTypeId(input.blockTypeId),
  };
}
