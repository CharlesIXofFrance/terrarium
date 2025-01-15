import '@testing-library/jest-dom';
import { vi } from 'vitest';
import { TextEncoder, TextDecoder } from 'util';
import { cleanup } from '@testing-library/react';
import { QueryClient } from '@tanstack/react-query';

// Mock environment variables
process.env.VITE_SUPABASE_URL = 'https://test.supabase.co';
process.env.VITE_SUPABASE_ANON_KEY = 'test-key';

// Create a new QueryClient for each test
beforeEach(() => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
});

// Clean up after each test
afterEach(() => {
  cleanup();
  vi.clearAllMocks();
  localStorageMock.clear();
  sessionStorageMock.clear();
});

// Mock fetch
global.fetch = vi.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  } as Response)
);

// Mock TextEncoder/TextDecoder
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock sessionStorage
const sessionStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  clear: vi.fn(),
  removeItem: vi.fn(),
  length: 0,
  key: vi.fn(),
};

Object.defineProperty(window, 'sessionStorage', {
  value: sessionStorageMock,
});

// Mock ResizeObserver
class ResizeObserverMock {
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.ResizeObserver = ResizeObserverMock;

// Mock IntersectionObserver
class IntersectionObserverMock {
  constructor(callback: any) {
    this.callback = callback;
  }
  callback: any;
  observe = vi.fn();
  unobserve = vi.fn();
  disconnect = vi.fn();
}

global.IntersectionObserver = IntersectionObserverMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
