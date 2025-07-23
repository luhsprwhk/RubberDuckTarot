import { describe, it, expect } from 'vitest';
import {
  encrypt,
  decrypt,
  encryptForDatabase,
  decryptFromDatabase,
  encryptObject,
  decryptObject,
} from '@/src/lib/encryption';

// The encryption master key is already set in test/setup.ts

describe('Encryption', () => {
  it('should encrypt and decrypt a string correctly', async () => {
    const plaintext = 'Hello, World!';

    const encrypted = await encrypt(plaintext);
    expect(encrypted).toBeTruthy();
    expect(encrypted!.encrypted).toBeTruthy();
    expect(encrypted!.iv).toBeTruthy();
    expect(encrypted!.salt).toBeTruthy();

    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe(plaintext);
  });

  it('should handle null values', async () => {
    const encrypted = await encrypt(null);
    expect(encrypted).toBeNull();

    const decrypted = await decrypt(null);
    expect(decrypted).toBeNull();
  });

  it('should encrypt for database storage', async () => {
    const plaintext = 'test@example.com';

    const encryptedJson = await encryptForDatabase(plaintext);
    expect(encryptedJson).toBeTruthy();
    expect(typeof encryptedJson).toBe('string');

    const decrypted = await decryptFromDatabase(encryptedJson);
    expect(decrypted).toBe(plaintext);
  });

  it('should encrypt and decrypt object fields', async () => {
    const obj = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com',
      public_field: 'public data',
    };

    const encrypted = await encryptObject(obj, ['name', 'email']);

    // Check that sensitive fields are encrypted (should be JSON strings)
    expect(encrypted.name).not.toBe(obj.name);
    expect(encrypted.email).not.toBe(obj.email);
    expect(encrypted.public_field).toBe(obj.public_field); // Should remain unchanged
    expect(encrypted.id).toBe(obj.id); // Should remain unchanged

    const decrypted = await decryptObject(encrypted, ['name', 'email']);
    expect(decrypted.name).toBe(obj.name);
    expect(decrypted.email).toBe(obj.email);
    expect(decrypted.public_field).toBe(obj.public_field);
    expect(decrypted.id).toBe(obj.id);
  });

  it('should handle empty strings', async () => {
    const encrypted = await encrypt('');
    expect(encrypted).toBeTruthy();

    const decrypted = await decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle special characters and unicode', async () => {
    const plaintext = 'Special chars: àáâãäå ñ 中文 🎯 💎';

    const encrypted = await encrypt(plaintext);
    const decrypted = await decrypt(encrypted);

    expect(decrypted).toBe(plaintext);
  });
});
