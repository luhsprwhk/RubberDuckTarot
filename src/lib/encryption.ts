// Encryption configuration
const ALGORITHM = 'AES-GCM';
const KEY_LENGTH = 32; // 256 bits
const IV_LENGTH = 12; // 96 bits for AES-GCM
const SALT_LENGTH = 32; // 256 bits

interface EncryptedData {
  encrypted: string;
  iv: string;
  salt: string;
}

/**
 * Derives an encryption key from a master key and salt using PBKDF2
 */
async function deriveKey(
  masterKey: string,
  salt: Uint8Array
): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    'raw',
    encoder.encode(masterKey),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );

  return crypto.subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt,
      iterations: 100000,
      hash: 'SHA-256',
    },
    keyMaterial,
    { name: ALGORITHM, length: KEY_LENGTH * 8 },
    false,
    ['encrypt', 'decrypt']
  );
}

/**
 * Gets the master encryption key from environment variables
 */
function getMasterKey(): string {
  const masterKey = import.meta.env.VITE_ENCRYPTION_MASTER_KEY;
  if (!masterKey) {
    throw new Error(
      'VITE_ENCRYPTION_MASTER_KEY environment variable is required'
    );
  }
  return masterKey;
}

/**
 * Converts ArrayBuffer to hex string
 */
function arrayBufferToHex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Converts hex string to ArrayBuffer
 */
function hexToArrayBuffer(hex: string): ArrayBuffer {
  const bytes = new Uint8Array(hex.length / 2);
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
  }
  return bytes.buffer;
}

/**
 * Encrypts sensitive data using AES-256-GCM
 */
export async function encrypt(
  plaintext: string | null
): Promise<EncryptedData | null> {
  if (plaintext === null || plaintext === undefined) return null;

  const masterKey = getMasterKey();
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH));
  const iv = crypto.getRandomValues(new Uint8Array(IV_LENGTH));
  const key = await deriveKey(masterKey, salt);

  const encoder = new TextEncoder();
  const data = encoder.encode(plaintext);

  const encryptedBuffer = await crypto.subtle.encrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    data
  );

  return {
    encrypted: arrayBufferToHex(encryptedBuffer),
    iv: arrayBufferToHex(iv),
    salt: arrayBufferToHex(salt),
  };
}

/**
 * Decrypts data encrypted with the encrypt function
 */
export async function decrypt(
  encryptedData: EncryptedData | null
): Promise<string | null> {
  if (!encryptedData) return null;

  const masterKey = getMasterKey();
  const salt = new Uint8Array(hexToArrayBuffer(encryptedData.salt));
  const iv = new Uint8Array(hexToArrayBuffer(encryptedData.iv));
  const key = await deriveKey(masterKey, salt);

  const encryptedBuffer = hexToArrayBuffer(encryptedData.encrypted);

  const decryptedBuffer = await crypto.subtle.decrypt(
    {
      name: ALGORITHM,
      iv,
    },
    key,
    encryptedBuffer
  );

  const decoder = new TextDecoder();
  return decoder.decode(decryptedBuffer);
}

/**
 * Encrypts a string and returns it as a JSON string for database storage
 */
export async function encryptForDatabase(
  plaintext: string | null
): Promise<string | null> {
  if (plaintext === null || plaintext === undefined) return null;
  const encrypted = await encrypt(plaintext);
  return encrypted ? JSON.stringify(encrypted) : null;
}

/**
 * Decrypts a JSON string from database storage
 */
export async function decryptFromDatabase(
  encryptedJson: string | null
): Promise<string | null> {
  if (!encryptedJson) return null;

  try {
    const encryptedData = JSON.parse(encryptedJson) as EncryptedData;
    return await decrypt(encryptedData);
  } catch (error) {
    console.error('Failed to decrypt data:', error);
    return null;
  }
}

/**
 * Encrypts an object by encrypting specific fields
 */
export async function encryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToEncrypt: Array<keyof T>
): Promise<T> {
  const result = { ...obj };

  for (const field of fieldsToEncrypt) {
    const value = obj[field];
    if (typeof value === 'string') {
      result[field] = (await encryptForDatabase(value)) as T[keyof T];
    }
  }

  return result;
}

/**
 * Decrypts an object by decrypting specific fields
 */
export async function decryptObject<T extends Record<string, unknown>>(
  obj: T,
  fieldsToDecrypt: Array<keyof T>
): Promise<T> {
  const result = { ...obj };

  for (const field of fieldsToDecrypt) {
    const value = obj[field];
    if (typeof value === 'string') {
      result[field] = (await decryptFromDatabase(value)) as T[keyof T];
    }
  }

  return result;
}
