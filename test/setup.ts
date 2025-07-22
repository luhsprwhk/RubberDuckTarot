import '@testing-library/jest-dom';

// Mock environment variables
vi.stubGlobal('import.meta.env', {
  VITE_SUPABASE_URL: 'https://mock.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'mock-anon-key',
  VITE_ANTHROPIC_API_KEY: 'mock-anthropic-key',
  VITE_ENCRYPTION_MASTER_KEY: 'mock-encryption-key',
  VITE_HCAPTCHA_SITE_KEY: 'mock-hcaptcha-key',
});

// Mock ResizeObserver for HeadlessUI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
