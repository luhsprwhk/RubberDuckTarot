import '@testing-library/jest-dom';

// Mock ResizeObserver for HeadlessUI components
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
