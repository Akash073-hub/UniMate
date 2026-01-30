// jest.setup.js

// Mock fetch
global.fetch = jest.fn();

// Suppress console logs during tests (optional)
global.console = {
  ...console,
  log: jest.fn(),
  debug: jest.fn(),
  info: jest.fn(),
};
