/**
 * Test Database Safety Shield
 * Prevents destructive test cleanups (e.g. deleteMany) from ever running against a non-test database.
 * NEITHER NODE_ENV=test ALONE NOR AN UNCHECKED DATABASE_URL IS PERMITTED TO AUTHORIZE DESTRUCTIVE OPERATIONS.
 */
export function verifyTestDatabaseSafety(): void {
  const testDbUrl = (process.env.TEST_DATABASE_URL || '').trim();

  if (!testDbUrl) {
    throw new Error(
      `[SAFETY SHIELD REJECTION] TEST_DATABASE_URL environment variable must exist and be configured to run tests! ` +
        `Refusing to initialize test suite against default DATABASE_URL.`,
    );
  }

  process.env.DATABASE_URL = testDbUrl;
  const lowerUrl = testDbUrl.toLowerCase();

  // Extract database name from URL (after last slash before parameters)
  const dbNameMatch = lowerUrl.match(/\/([a-z0-9_-]+)(?:\?|$)/);
  const dbName = dbNameMatch ? dbNameMatch[1] : '';

  const hasApprovedTestMarker =
    dbName.includes('test') ||
    dbName.includes('_test') ||
    dbName.includes('-test') ||
    dbName.includes('smart_field_work_test') ||
    dbName.includes('sfw_test');

  if (!hasApprovedTestMarker) {
    throw new Error(
      `[SAFETY SHIELD REJECTION] Refusing to run tests against database '${dbName || 'NONE'}'! ` +
        `TEST_DATABASE_URL database name MUST contain an explicit approved test marker ('_test', '-test', 'smart_field_work_test', or 'sfw_test'). ` +
        `Current URL: '${testDbUrl}'`,
    );
  }
}
