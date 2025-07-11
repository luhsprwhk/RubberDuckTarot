/**
 * AI prompt sanitization utilities to prevent prompt injection attacks
 * Sanitizes user-provided content before inserting into AI prompts
 */

// Maximum lengths for different types of user input in AI prompts
export const AI_INPUT_LIMITS = {
  USER_NAME: 100,
  CREATIVE_IDENTITY: 200,
  WORK_CONTEXT: 300,
  USER_CONTEXT: 2000,
  REFLECTION_TEXT: 1000,
  BLOCK_NAME: 150,
  BLOCK_NOTES: 500,
  GENERIC_TEXT: 500,
} as const;

// Patterns that could be used for prompt injection
const INJECTION_PATTERNS = [
  // Direct prompt injection attempts
  /ignore\s+(?:previous|all|above|prior)\s+(?:instructions|prompts|commands)/gi,
  /forget\s+(?:previous|all|above|prior)\s+(?:instructions|prompts|commands)/gi,
  /disregard\s+(?:previous|all|above|prior)\s+(?:instructions|prompts|commands)/gi,

  // System prompt manipulation
  /\bsystem\s*[:=]\s*["']?[^"'\n]+["']?/gi,
  /\bassistant\s*[:=]\s*["']?[^"'\n]+["']?/gi,
  /\buser\s*[:=]\s*["']?[^"'\n]+["']?/gi,
  /\brole\s*[:=]\s*["']?(?:system|assistant|user)["']?/gi,

  // Common injection markers
  /\[INST]|\\[/INST]/gi,
  /<\|system\|>|<\|user\|>|<\|assistant\|>/gi,
  /###\s*(?:System|User|Assistant)\s*[:=]/gi,

  // XML/HTML-style injection attempts
  /<(?:system|user|assistant|instruction|prompt)[^>]*>/gi,
  /<\/(?:system|user|assistant|instruction|prompt)>/gi,

  // Jailbreak attempts
  /(?:you\s+are\s+now|now\s+you\s+are|from\s+now\s+on)\s+(?:a|an|the)\s+(?:helpful|harmless|honest|different|new)/gi,
  /(?:pretend|imagine|roleplay|act\s+as|behave\s+like)\s+(?:you\s+are|to\s+be)\s+(?:a|an|the)\s+(?:helpful|harmless|honest|different|new)/gi,

  // Code injection attempts
  /```[^`]*```/gi,
  /`[^`]+`/gi,
  /\$\{[^}]+\}/gi,
  /\{\{[^}]+\}\}/gi,

  // Prompt delimiter confusion
  /"""/gi,
  /'''/gi,
  /---+/gi,
  /===+/gi,
  /###+/gi,

  // Direct instruction override
  /(?:new|different|updated|revised)\s+(?:instructions|prompt|system|rules)/gi,
  /(?:change|update|modify)\s+(?:your|the)\s+(?:instructions|prompt|system|rules)/gi,
] as const;

// Characters that should be escaped or removed
const DANGEROUS_CHARS = [
  '\u0000', // null bytes
  '\u0001',
  '\u0002',
  '\u0003',
  '\u0004',
  '\u0005',
  '\u0006',
  '\u0007', // control chars
  '\u0008',
  '\u000B',
  '\u000C',
  '\u000E',
  '\u000F', // more control chars
  '\u0010',
  '\u0011',
  '\u0012',
  '\u0013',
  '\u0014',
  '\u0015',
  '\u0016',
  '\u0017',
  '\u0018',
  '\u0019',
  '\u001A',
  '\u001B',
  '\u001C',
  '\u001D',
  '\u001E',
  '\u001F',
  '\u007F', // DEL
  '\u0080',
  '\u0081',
  '\u0082',
  '\u0083',
  '\u0084',
  '\u0085',
  '\u0086',
  '\u0087',
  '\u0088',
  '\u0089',
  '\u008A',
  '\u008B',
  '\u008C',
  '\u008D',
  '\u008E',
  '\u008F',
  '\u0090',
  '\u0091',
  '\u0092',
  '\u0093',
  '\u0094',
  '\u0095',
  '\u0096',
  '\u0097',
  '\u0098',
  '\u0099',
  '\u009A',
  '\u009B',
  '\u009C',
  '\u009D',
  '\u009E',
  '\u009F',
] as const;

/**
 * Sanitizes user input for safe inclusion in AI prompts
 */
export function sanitizeForAIPrompt(
  input: string | undefined | null,
  maxLength: number = AI_INPUT_LIMITS.GENERIC_TEXT,
  fieldName: string = 'input'
): string {
  if (!input) return '';

  if (typeof input !== 'string') {
    throw new Error(`${fieldName} must be a string`);
  }

  // Check length limits
  if (input.length > maxLength) {
    console.warn(
      `${fieldName} truncated from ${input.length} to ${maxLength} characters`
    );
    input = input.substring(0, maxLength);
  }

  // Remove dangerous control characters
  let sanitized = input;
  for (const char of DANGEROUS_CHARS) {
    sanitized = sanitized.replace(new RegExp(char, 'g'), '');
  }

  // Check for injection patterns
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(sanitized)) {
      console.warn(
        `Potential prompt injection detected in ${fieldName}:`,
        pattern
      );
      // Replace with safe placeholder
      sanitized = sanitized.replace(pattern, '[FILTERED]');
    }
  }

  // Escape special characters that could be used for prompt manipulation
  sanitized = sanitized
    .replace(/\\/g, '\\\\') // Escape backslashes
    .replace(/"/g, '\\"') // Escape quotes
    .replace(/'/g, "\\'") // Escape single quotes
    .replace(/\r/g, '') // Remove carriage returns
    .replace(/\t/g, ' ') // Replace tabs with spaces
    .replace(/\n{3,}/g, '\n\n') // Collapse excessive newlines
    .replace(/[ ]{2,}/g, ' ') // Collapse excessive spaces
    .replace(/\n /g, '\n') // Remove spaces after newlines
    .replace(/ \n/g, '\n'); // Remove spaces before newlines

  return sanitized.trim();
}

/**
 * Sanitizes user profile data for AI prompts
 */
export function sanitizeUserProfile(
  profile: Record<string, unknown> | null | undefined
): Record<string, string> {
  if (!profile || typeof profile !== 'object') {
    return {};
  }

  return {
    name: sanitizeForAIPrompt(
      String(profile.name || ''),
      AI_INPUT_LIMITS.USER_NAME,
      'name'
    ),
    creative_identity: sanitizeForAIPrompt(
      String(profile.creative_identity || ''),
      AI_INPUT_LIMITS.CREATIVE_IDENTITY,
      'creative_identity'
    ),
    work_context: sanitizeForAIPrompt(
      String(profile.work_context || ''),
      AI_INPUT_LIMITS.WORK_CONTEXT,
      'work_context'
    ),
    debugging_mode: sanitizeForAIPrompt(
      String(profile.debugging_mode || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'debugging_mode'
    ),
    block_pattern: sanitizeForAIPrompt(
      String(profile.block_pattern || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'block_pattern'
    ),
    superpower: sanitizeForAIPrompt(
      String(profile.superpower || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'superpower'
    ),
    kryptonite: sanitizeForAIPrompt(
      String(profile.kryptonite || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'kryptonite'
    ),
    spirit_animal: sanitizeForAIPrompt(
      String(profile.spirit_animal || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'spirit_animal'
    ),
    zodiac_sign: sanitizeForAIPrompt(
      String(profile.zodiac_sign || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'zodiac_sign'
    ),
    birthday: sanitizeForAIPrompt(
      String(profile.birthday || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'birthday'
    ),
    birth_place: sanitizeForAIPrompt(
      String(profile.birth_place || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      'birth_place'
    ),
  };
}

/**
 * Sanitizes user context for AI prompts
 */
export function sanitizeUserContext(
  context: string | undefined | null
): string {
  return sanitizeForAIPrompt(
    context,
    AI_INPUT_LIMITS.USER_CONTEXT,
    'user_context'
  );
}

/**
 * Sanitizes reflection text for AI prompts
 */
export function sanitizeReflectionText(
  text: string | undefined | null
): string {
  return sanitizeForAIPrompt(
    text,
    AI_INPUT_LIMITS.REFLECTION_TEXT,
    'reflection_text'
  );
}

/**
 * Sanitizes block data for AI prompts
 */
export function sanitizeBlockData(
  block: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!block || typeof block !== 'object') {
    return {};
  }

  return {
    name: sanitizeForAIPrompt(
      String(block.name || ''),
      AI_INPUT_LIMITS.BLOCK_NAME,
      'block_name'
    ),
    notes: sanitizeForAIPrompt(
      String(block.notes || ''),
      AI_INPUT_LIMITS.BLOCK_NOTES,
      'block_notes'
    ),
    status: sanitizeForAIPrompt(String(block.status || ''), 50, 'block_status'),
    block_type_id: sanitizeForAIPrompt(
      String(block.block_type_id || ''),
      50,
      'block_type_id'
    ),
    created_at: block.created_at, // Keep dates as-is
    updated_at: block.updated_at, // Keep dates as-is
    id: block.id, // Keep IDs as-is
    user_id: block.user_id, // Keep user IDs as-is
  };
}

/**
 * Sanitizes an array of blocks for AI prompts
 */
export function sanitizeBlocksArray(
  blocks: unknown[]
): Record<string, unknown>[] {
  if (!Array.isArray(blocks)) {
    return [];
  }

  return blocks.map((block) =>
    sanitizeBlockData(block as Record<string, unknown>)
  );
}

/**
 * Sanitizes an array of reflections for AI prompts
 */
export function sanitizeReflectionsArray(
  reflections: unknown[]
): Record<string, unknown>[] {
  if (!Array.isArray(reflections)) {
    return [];
  }

  return reflections.map((reflection) => {
    if (!reflection || typeof reflection !== 'object') {
      return {};
    }
    const r = reflection as Record<string, unknown>;
    return {
      ...r,
      reflection_text: sanitizeReflectionText(String(r.reflection_text || '')),
    };
  });
}

/**
 * Sanitizes insight data for AI prompts
 */
export function sanitizeInsightData(
  insight: Record<string, unknown> | null | undefined
): Record<string, unknown> {
  if (!insight || typeof insight !== 'object') {
    return {};
  }

  return {
    ...insight,
    user_context: sanitizeUserContext(String(insight.user_context || '')),
    // Keep other fields as-is since they're not user-controlled
  };
}

/**
 * Sanitizes an array of insights for AI prompts
 */
export function sanitizeInsightsArray(
  insights: unknown[]
): Record<string, unknown>[] {
  if (!Array.isArray(insights)) {
    return [];
  }

  return insights.map((insight) =>
    sanitizeInsightData(insight as Record<string, unknown>)
  );
}

/**
 * Validates that a string is safe for AI prompt inclusion
 * Throws an error if dangerous patterns are detected
 */
export function validatePromptSafety(
  input: string,
  fieldName: string = 'input'
): void {
  for (const pattern of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      throw new Error(
        `Potential prompt injection detected in ${fieldName}. Please revise your input.`
      );
    }
  }
}

/**
 * Creates a safe prompt template by sanitizing all user inputs
 */
export function createSafePromptTemplate(
  template: string,
  userInputs: Record<string, unknown>
): string {
  let safeTemplate = template;

  // Replace all placeholders with sanitized values
  for (const [key, value] of Object.entries(userInputs)) {
    const sanitizedValue = sanitizeForAIPrompt(
      String(value || ''),
      AI_INPUT_LIMITS.GENERIC_TEXT,
      key
    );
    safeTemplate = safeTemplate.replace(
      new RegExp(`\\$\\{${key}\\}`, 'g'),
      sanitizedValue
    );
  }

  return safeTemplate;
}
