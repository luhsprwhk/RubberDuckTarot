import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { webcrypto } from 'crypto';

// Polyfill crypto for Node.js environment
if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as Crypto;
}

// Mock environment variables
vi.stubGlobal('import.meta.env', {
  VITE_SUPABASE_URL: 'https://mock.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
  VITE_ANTHROPIC_API_KEY: 'mock-anthropic-key',
  VITE_ENCRYPTION_MASTER_KEY:
    '5500607ff009f88a605de68d6ddc06810c3c05372707d11cc7f6bfe0cb33b72d',
  VITE_HCAPTCHA_SITE_KEY: 'mock-hcaptcha-key',
});

// Mock ResizeObserver for HeadlessUI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
