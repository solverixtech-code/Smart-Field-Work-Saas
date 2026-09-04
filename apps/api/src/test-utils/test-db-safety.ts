/**
 * Test Database Safety Shield
 * Prevents destructive test cleanups (e.g. deleteMany) from ever running against a non-test database.
 * NEITHER NODE_ENV=test ALONE NOR AN UNCHECKED DATABASE_URL IS PERMITTED TO AUTHORIZE DESTRUCTIVE OPERATIONS.
 */
export function verifyTestDatabaseSafety(): void {
  const dbUrl = process.env.TEST_DATABASE_URL || process.env.DATABASE_URL || '';
  const lowerUrl = dbUrl.toLowerCase();

  const isExplicitlySafeUrl =
    lowerUrl.includes('test') ||
    lowerUrl.includes('localhost') ||
    lowerUrl.includes('127.0.0.1') ||
    lowerUrl.includes('_test') ||
    lowerUrl.includes('-test');

  if (!isExplicitlySafeUrl) {
    throw new Error(
      `[SAFETY SHIELD REJECTION] Refusing to run destructive DB test cleanup against potential production/staging database! ` +
        `DATABASE_URL / TEST_DATABASE_URL must explicitly identify a test/local environment (containing 'test', 'localhost', or '127.0.0.1'). ` +
        `Current URL: '${dbUrl}'`,
    );
  }
}
