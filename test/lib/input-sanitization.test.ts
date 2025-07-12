import { describe, it, expect } from 'vitest';
import {
  sanitizeReflectionText,
  sanitizeBlockTypeId,
  validateUserId,
  validateCardId,
  validatePromptIndex,
  sanitizeReflectionInput,
  INPUT_LIMITS,
} from '@/src/lib/input-sanitization';

describe('sanitizeReflectionText', () => {
  it('should allow normal text', () => {
    const input = 'This is a normal reflection about my feelings and thoughts.';
    const result = sanitizeReflectionText(input);
    expect(result).toBe(input);
  });

  it('should allow unicode characters', () => {
    const input = 'I feel 😊 about this. Café naïve résumé';
    const result = sanitizeReflectionText(input);
    expect(result).toBe(input);
  });

  it('should allow basic punctuation and symbols', () => {
    const input = 'Questions: How? Why? When! @#$%^&*()[]{}|\\;:\'"<>,./?';
    const result = sanitizeReflectionText(input);
    expect(result).toBe(input);
  });

  it('should preserve line breaks', () => {
    const input = 'First line\nSecond line\n\nThird line after blank';
    const result = sanitizeReflectionText(input);
    expect(result).toBe('First line\nSecond line\n\nThird line after blank');
  });

  it('should remove control characters except newlines', () => {
    const input = 'Normal text\x00with\x01null\x08bytes\nBut preserve newlines';
    const result = sanitizeReflectionText(input);
    expect(result).toBe('Normal textwithnullbytes\nBut preserve newlines');
  });

  it('should normalize whitespace', () => {
    const input =
      '  \t Multiple   spaces\t\tand   tabs  \n\n\n\nMultiple newlines  ';
    const result = sanitizeReflectionText(input);
    expect(result).toBe('Multiple spaces and tabs\n\nMultiple newlines');
  });

  it('should reject script tags', () => {
    const input = 'Normal text <script>alert("xss")</script> more text';
    expect(() => sanitizeReflectionText(input)).toThrow('forbidden content');
  });

  it('should reject javascript protocols', () => {
    const input = 'Check this link: javascript:alert("xss")';
    expect(() => sanitizeReflectionText(input)).toThrow('forbidden content');
  });

  it('should reject event handlers', () => {
    const input = 'Text with onclick=malicious() content';
    expect(() => sanitizeReflectionText(input)).toThrow('forbidden content');
  });

  it('should reject iframe tags', () => {
    const input = 'Text with <iframe src="evil.com"> content';
    expect(() => sanitizeReflectionText(input)).toThrow('forbidden content');
  });

  it('should reject text exceeding length limit', () => {
    const input = 'a'.repeat(INPUT_LIMITS.REFLECTION_TEXT + 1);
    expect(() => sanitizeReflectionText(input)).toThrow(
      'exceeds maximum length'
    );
  });

  it('should accept text at length limit', () => {
    const input = 'a'.repeat(INPUT_LIMITS.REFLECTION_TEXT);
    const result = sanitizeReflectionText(input);
    expect(result).toBe(input);
  });

  it('should reject non-string input', () => {
    expect(() => sanitizeReflectionText(123 as unknown as string)).toThrow(
      'must be a string'
    );
    expect(() => sanitizeReflectionText(null as unknown as string)).toThrow(
      'must be a string'
    );
    expect(() =>
      sanitizeReflectionText(undefined as unknown as string)
    ).toThrow('must be a string');
  });
});

describe('sanitizeBlockTypeId', () => {
  it('should allow valid block type IDs', () => {
    expect(sanitizeBlockTypeId('creative')).toBe('creative');
    expect(sanitizeBlockTypeId('work-life')).toBe('work-life');
    expect(sanitizeBlockTypeId('type_1')).toBe('type_1');
    expect(sanitizeBlockTypeId('ABC123')).toBe('ABC123');
  });

  it('should handle undefined/null/empty inputs', () => {
    expect(sanitizeBlockTypeId(undefined)).toBeUndefined();
    expect(sanitizeBlockTypeId('')).toBeUndefined();
  });

  it('should trim whitespace', () => {
    expect(sanitizeBlockTypeId('  creative  ')).toBe('creative');
  });

  it('should reject invalid characters', () => {
    expect(() => sanitizeBlockTypeId('invalid space')).toThrow(
      'invalid characters'
    );
    expect(() => sanitizeBlockTypeId('invalid@symbol')).toThrow(
      'invalid characters'
    );
    expect(() => sanitizeBlockTypeId('invalid.dot')).toThrow(
      'invalid characters'
    );
  });

  it('should reject text exceeding length limit', () => {
    const input = 'a'.repeat(INPUT_LIMITS.BLOCK_TYPE_ID + 1);
    expect(() => sanitizeBlockTypeId(input)).toThrow('exceeds maximum length');
  });

  it('should reject non-string input', () => {
    expect(() => sanitizeBlockTypeId(123 as unknown as string)).toThrow(
      'must be a string'
    );
  });
});

describe('validateUserId', () => {
  it('should allow valid user IDs', () => {
    expect(validateUserId('user123')).toBe('user123');
    expect(validateUserId('abc-def_123')).toBe('abc-def_123');
    expect(validateUserId('UUID-like-string')).toBe('UUID-like-string');
  });

  it('should trim whitespace', () => {
    expect(validateUserId('  user123  ')).toBe('user123');
  });

  it('should reject empty input', () => {
    expect(() => validateUserId('')).toThrow('cannot be empty');
    expect(() => validateUserId('   ')).toThrow('cannot be empty');
  });

  it('should reject invalid characters', () => {
    expect(() => validateUserId('user@domain.com')).toThrow(
      'invalid characters'
    );
    expect(() => validateUserId('user with spaces')).toThrow(
      'invalid characters'
    );
  });

  it('should reject text exceeding length limit', () => {
    const input = 'a'.repeat(INPUT_LIMITS.USER_ID + 1);
    expect(() => validateUserId(input)).toThrow('exceeds maximum length');
  });

  it('should reject non-string input', () => {
    expect(() => validateUserId(123 as unknown as string)).toThrow(
      'must be a string'
    );
  });
});

describe('validateCardId', () => {
  it('should allow valid card IDs', () => {
    expect(validateCardId(1)).toBe(1);
    expect(validateCardId(78)).toBe(78);
    expect(validateCardId(999999)).toBe(999999);
  });

  it('should reject invalid numbers', () => {
    expect(() => validateCardId(0)).toThrow('must be between 1');
    expect(() => validateCardId(-1)).toThrow('must be between 1');
    expect(() => validateCardId(1000000)).toThrow('must be between 1');
  });

  it('should reject non-integer input', () => {
    expect(() => validateCardId(1.5)).toThrow('must be an integer');
    expect(() => validateCardId('123' as unknown as number)).toThrow(
      'must be an integer'
    );
    expect(() => validateCardId(null as unknown as number)).toThrow(
      'must be an integer'
    );
  });
});

describe('validatePromptIndex', () => {
  it('should allow valid prompt indices', () => {
    expect(validatePromptIndex(0)).toBe(0);
    expect(validatePromptIndex(5)).toBe(5);
    expect(validatePromptIndex(99)).toBe(99);
  });

  it('should reject invalid indices', () => {
    expect(() => validatePromptIndex(-1)).toThrow('must be between 0 and 99');
    expect(() => validatePromptIndex(100)).toThrow('must be between 0 and 99');
  });

  it('should reject non-integer input', () => {
    expect(() => validatePromptIndex(1.5)).toThrow('must be an integer');
    expect(() => validatePromptIndex('0' as unknown as number)).toThrow(
      'must be an integer'
    );
  });
});

describe('sanitizeReflectionInput', () => {
  it('should sanitize all fields in a reflection input', () => {
    const input = {
      userId: '  user123  ',
      cardId: 42,
      promptIndex: 2,
      reflectionText: '  This is my reflection...\n\nWith multiple lines  ',
      blockTypeId: '  creative  ',
    };

    const result = sanitizeReflectionInput(input);

    expect(result).toEqual({
      userId: 'user123',
      cardId: 42,
      promptIndex: 2,
      reflectionText: 'This is my reflection...\n\nWith multiple lines',
      blockTypeId: 'creative',
    });
  });

  it('should handle undefined blockTypeId', () => {
    const input = {
      userId: 'user123',
      cardId: 42,
      promptIndex: 2,
      reflectionText: 'This is my reflection',
    };

    const result = sanitizeReflectionInput(input);

    expect(result).toEqual({
      userId: 'user123',
      cardId: 42,
      promptIndex: 2,
      reflectionText: 'This is my reflection',
      blockTypeId: undefined,
    });
  });

  it('should propagate validation errors', () => {
    const input = {
      userId: '',
      cardId: 42,
      promptIndex: 2,
      reflectionText: 'This is my reflection',
    };

    expect(() => sanitizeReflectionInput(input)).toThrow('cannot be empty');
  });

  it('should reject malicious content in reflection text', () => {
    const input = {
      userId: 'user123',
      cardId: 42,
      promptIndex: 2,
      reflectionText: 'Normal text <script>alert("xss")</script>',
    };

    expect(() => sanitizeReflectionInput(input)).toThrow('forbidden content');
  });
});
