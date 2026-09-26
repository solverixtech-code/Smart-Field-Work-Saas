// @vitest-environment jsdom
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { ExecutiveLocationTracker } from './ExecutiveLocationTracker';

(globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }).IS_REACT_ACT_ENVIRONMENT = true;

const trackingMocks = vi.hoisted(() => ({
  session: vi.fn(),
  upload: vi.fn(),
  put: vi.fn(),
  list: vi.fn(),
  remove: vi.fn(),
}));

vi.mock('./location-tracking.api', () => ({
  locationTrackingApi: {
    session: trackingMocks.session,
    upload: trackingMocks.upload,
  },
}));

vi.mock('./location-sample-queue', () => ({
  locationSampleQueue: {
    put: trackingMocks.put,
    list: trackingMocks.list,
    remove: trackingMocks.remove,
  },
}));

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

describe('ExecutiveLocationTracker', () => {
  let container: HTMLDivElement;
  let root: Root;
  let positionHandler: PositionCallback | undefined;
  const clearWatch = vi.fn();

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    root = createRoot(container);
    positionHandler = undefined;
    Object.defineProperty(window, 'indexedDB', { configurable: true, value: {} });
    Object.defineProperty(navigator, 'onLine', { configurable: true, value: true });
    Object.defineProperty(navigator, 'geolocation', {
      configurable: true,
      value: {
        watchPosition: vi.fn((success: PositionCallback) => {
          positionHandler = success;
          return 7;
        }),
        clearWatch,
      },
    });
    vi.stubGlobal('crypto', { randomUUID: vi.fn(() => '11111111-1111-4111-8111-111111111111') });
    trackingMocks.session.mockResolvedValue({
      active: true,
      attendanceId: 'attendance-1',
      startedAt: '2026-09-26T04:00:00.000Z',
      endedAt: null,
      sampleIntervalSeconds: 30,
      movementThresholdMeters: 10,
      minimumIntervalSeconds: 5,
      maxBatchSize: 200,
    });
    trackingMocks.upload.mockResolvedValue({
      acceptedIds: ['11111111-1111-4111-8111-111111111111'],
      duplicateIds: [],
      rejectedIds: [],
      accepted: 1,
      duplicates: 0,
      rejected: 0,
      unusable: 0,
    });
    trackingMocks.put.mockResolvedValue(undefined);
    trackingMocks.list.mockImplementation(async () => trackingMocks.put.mock.calls.map(([sample]) => sample));
    trackingMocks.remove.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await act(async () => root.unmount());
    container.remove();
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  it('samples the first point, applies the time and movement thresholds, and stops on scope change', async () => {
    await act(async () => {
      root.render(<ExecutiveLocationTracker tenantId="tenant-a" membershipId="member-a" />);
      await flush();
    });
    expect(positionHandler).toBeTypeOf('function');

    const send = async (timestamp: number, latitude: number) => {
      await act(async () => {
        positionHandler?.({
          timestamp,
          coords: {
            latitude,
            longitude: 72.8,
            accuracy: 8,
            altitude: null,
            altitudeAccuracy: null,
            heading: null,
            speed: 2,
            toJSON: () => ({}),
          },
          toJSON: () => ({}),
        });
        await flush();
      });
    };

    const start = Date.parse('2026-09-26T04:00:00.000Z');
    await send(start, 19.1);
    await send(start + 2_000, 19.1002);
    await send(start + 6_000, 19.10001);
    await send(start + 31_000, 19.10001);

    expect(trackingMocks.put).toHaveBeenCalledTimes(2);
    expect(trackingMocks.put).toHaveBeenNthCalledWith(1, expect.objectContaining({
      scopeKey: 'tenant-a:member-a',
      speedKmh: 7.2,
    }));
    expect(trackingMocks.upload).toHaveBeenCalled();
    expect(trackingMocks.remove).toHaveBeenCalledWith(['11111111-1111-4111-8111-111111111111']);

    await act(async () => {
      root.render(<ExecutiveLocationTracker tenantId="tenant-b" membershipId="member-b" />);
      await flush();
    });
    expect(clearWatch).toHaveBeenCalledWith(7);
  });
});
