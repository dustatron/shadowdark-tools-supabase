import { beforeAll, afterAll, vi } from "vitest";

// Setup environment variables for API testing
beforeAll(() => {
  // Supabase configuration for testing
  process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "test-anon-key";
  process.env.SUPABASE_SERVICE_ROLE_KEY = "test-service-role-key";

  // API base URL for testing
  process.env.NEXT_PUBLIC_API_BASE = "http://localhost:3000";

  // Database URL for testing
  process.env.DATABASE_URL =
    "postgresql://postgres:postgres@localhost:54322/postgres";

  // JWT secret for testing
  process.env.JWT_SECRET = "test-jwt-secret";

  // Node environment
  process.env.NODE_ENV = "test";
});

// Global error handler for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Increase timeout for API tests
vi.setConfig({
  testTimeout: 10000,
});

// Mock console.error to avoid noise in test output unless explicitly needed
const originalConsoleError = console.error;
beforeAll(() => {
  console.error = vi.fn();
});

// Restore console.error after all tests
afterAll(() => {
  console.error = originalConsoleError;
});

// Ensure fetch is available (Node 18+ has it built-in)
if (!globalThis.fetch) {
  const { fetch, Headers, Request, Response } = require("undici");
  Object.assign(globalThis, { fetch, Headers, Request, Response });
}
