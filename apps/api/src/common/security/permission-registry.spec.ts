import { PERMISSION_REGISTRY } from './permission-registry';

describe('permission registry', () => {
  it('uses unique module and action pairs for database synchronization', () => {
    const keys = PERMISSION_REGISTRY.map(({ moduleKey, action }) => `${moduleKey}:${action}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
