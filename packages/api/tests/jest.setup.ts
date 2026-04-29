import { jest } from '@jest/globals';

// Global test timeout
jest.setTimeout(30000);

// Mock console methods to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;

beforeAll(() => {
  // Silence logs during tests unless explicitly needed
  console.log = jest.fn();
  console.error = jest.fn();
  console.warn = jest.fn();
});

afterAll(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
});

// Clean up mocks after each test
afterEach(() => {
  jest.clearAllMocks();
});

// Mock environment variables
process.env.JWT_SECRET = 'test-jwt-secret-key-2024-acadivo';
process.env.JWT_REFRESH_SECRET = 'test-jwt-refresh-secret-key-2024';
process.env.NODE_ENV = 'test';
process.env.SMS_API_KEY = 'test-sms-key';
process.env.EMAIL_API_KEY = 'test-email-key';
process.env.PUSH_API_KEY = 'test-push-key';
process.env.CLOUDINARY_CLOUD_NAME = 'test-cloud';
process.env.CLOUDINARY_API_KEY = 'test-cloud-key';
process.env.CLOUDINARY_API_SECRET = 'test-cloud-secret';
