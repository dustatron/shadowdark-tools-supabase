import "@testing-library/jest-dom";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, vi } from "vitest";
import { config } from "dotenv";
import { resolve } from "path";

// Load .env.local for integration tests
config({ path: resolve(process.cwd(), ".env.local") });

// Mock Next.js environment variables for unit tests
// Integration tests will use actual env vars from .env.local
beforeAll(() => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "http://localhost:54321";
  }
  if (!process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY) {
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY = "test-key";
  }
});

// Cleanup after each test
afterEach(() => {
  cleanup();
});

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  useSearchParams: () => new URLSearchParams(),
  usePathname: () => "/",
}));

// Mock Next.js headers
vi.mock("next/headers", () => ({
  cookies: () => ({
    getAll: () => [],
    get: () => null,
    set: vi.fn(),
  }),
}));
