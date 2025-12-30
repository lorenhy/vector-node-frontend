// ==========================================
// FILE: src/lib/config.ts
// ==========================================
// Configuration for development/testing

// Set to true to use mock data instead of real API calls
// This is useful for testing UI without backend
export const MOCK_MODE = process.env.NEXT_PUBLIC_MOCK_MODE === 'true' || false;

// Mock delay to simulate API calls
export const MOCK_DELAY = 500; // milliseconds





