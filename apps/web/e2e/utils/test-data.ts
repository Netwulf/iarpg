/**
 * Test Data Generators
 * Utilities for creating consistent test data
 */

/**
 * Generate unique email for test user
 */
export function generateTestEmail(prefix = 'test'): string {
  const timestamp = Date.now();
  return `${prefix}-${timestamp}@iarpg.local`;
}

/**
 * Generate unique username
 */
export function generateTestUsername(prefix = 'testuser'): string {
  const timestamp = Date.now();
  return `${prefix}${timestamp}`;
}

/**
 * Generate strong password
 */
export function generateTestPassword(): string {
  return 'TestPassword123!';
}

/**
 * Generate test character data
 */
export function generateTestCharacter(overrides: Partial<TestCharacter> = {}): TestCharacter {
  const timestamp = Date.now();
  return {
    name: `TestChar${timestamp}`,
    class: 'fighter',
    race: 'human',
    level: 1,
    strength: 16,
    dexterity: 14,
    constitution: 15,
    intelligence: 10,
    wisdom: 12,
    charisma: 8,
    ...overrides,
  };
}

/**
 * Generate test table data
 */
export function generateTestTable(overrides: Partial<TestTable> = {}): TestTable {
  const timestamp = Date.now();
  return {
    name: `TestTable${timestamp}`,
    description: 'A test table for E2E tests',
    playStyle: 'sync',
    privacy: 'public',
    maxPlayers: 6,
    ...overrides,
  };
}

/**
 * Get test user credentials
 */
export function getTestUser(userNumber: 1 | 2 = 1) {
  if (userNumber === 1) {
    return {
      email: process.env.TEST_USER_EMAIL || 'test1@iarpg.local',
      password: process.env.TEST_USER_PASSWORD || 'TestPassword123!',
    };
  } else {
    return {
      email: process.env.TEST_USER_2_EMAIL || 'test2@iarpg.local',
      password: process.env.TEST_USER_2_PASSWORD || 'TestPassword123!',
    };
  }
}

// Type definitions
export interface TestCharacter {
  name: string;
  class: string;
  race: string;
  level: number;
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface TestTable {
  name: string;
  description: string;
  playStyle: 'sync' | 'async' | 'solo';
  privacy: 'public' | 'private' | 'spectator';
  maxPlayers: number;
}
