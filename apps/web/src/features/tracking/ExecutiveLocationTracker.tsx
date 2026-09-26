import { useEffect } from 'react';
import { locationSampleQueue } from './location-sample-queue';
import { locationTrackingApi, type QueuedLocationSample, type TrackingSession } from './location-tracking.api';

interface Props {
  tenantId: string;
  membershipId: string;
}

function distanceMeters(a: GeolocationCoordinates, b: GeolocationCoordinates) {
  const radians = (value: number) => value * Math.PI / 180;
  const dLat = radians(b.latitude - a.latitude);
  const dLng = radians(b.longitude - a.longitude);
  const lat1 = radians(a.latitude);
  const lat2 = radians(b.latitude);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 6371000 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
}

export function ExecutiveLocationTracker({ tenantId, membershipId }: Props) {
  useEffect(() => {
    if (!('geolocation' in navigator) || !('indexedDB' in window)) return;
    const scopeKey = `${tenantId}:${membershipId}`;
    let disposed = false;
    let watcher: number | null = null;
    let session: TrackingSession | null = null;
    let lastAccepted: { coordinates: GeolocationCoordinates; capturedAt: number } | null = null;
    let flushing = false;

    const flush = async () => {
      if (disposed || flushing || !navigator.onLine) return;
      flushing = true;
      try {
        const samples = await locationSampleQueue.list(scopeKey, session?.maxBatchSize ?? 200);
        if (!samples.length) return;
        const result = await locationTrackingApi.upload(samples);
        await locationSampleQueue.remove([...result.acceptedIds, ...result.duplicateIds, ...result.rejectedIds]);
      } catch {
        // The durable queue retries on the next timer, reconnect, or visibility change.
      } finally {
        flushing = false;
      }
    };

    const stop = () => {
      if (watcher !== null) navigator.geolocation.clearWatch(watcher);
      watcher = null;
      lastAccepted = null;
    };

    const start = () => {
      if (watcher !== null || !session?.active) return;
      watcher = navigator.geolocation.watchPosition((position) => {
        if (disposed || !session?.active) return;
        const now = position.timestamp || Date.now();
        const elapsed = lastAccepted ? (now - lastAccepted.capturedAt) / 1000 : Number.POSITIVE_INFINITY;
        const moved = lastAccepted ? distanceMeters(lastAccepted.coordinates, position.coords) : Number.POSITIVE_INFINITY;
        if (elapsed < session.minimumIntervalSeconds || (elapsed < session.sampleIntervalSeconds && moved < session.movementThresholdMeters)) return;
        lastAccepted = { coordinates: position.coords, capturedAt: now };
        const sample: QueuedLocationSample = {
          clientSampleId: crypto.randomUUID(), scopeKey,
          capturedAt: new Date(now).toISOString(),
          latitude: position.coords.latitude, longitude: position.coords.longitude,
          accuracyMeters: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : null,
          speedKmh: position.coords.speed == null ? null : Math.max(0, position.coords.speed * 3.6),
          headingDegrees: position.coords.heading == null || !Number.isFinite(position.coords.heading) ? null : position.coords.heading,
          batteryPercentage: null, source: 'WEB',
        };
        void locationSampleQueue.put(sample).then(flush).catch(() => undefined);
      }, () => undefined, { enableHighAccuracy: true, maximumAge: 10_000, timeout: 20_000 });
    };

    const refreshSession = async () => {
      try {
        session = await locationTrackingApi.session();
        if (session.active) start(); else stop();
        await flush();
      } catch {
        session = null;
        stop();
      }
    };
    const onVisible = () => { if (document.visibilityState === 'visible') void refreshSession(); else void flush(); };
    const onOnline = () => void flush();
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('online', onOnline);
    void refreshSession();
    const interval = window.setInterval(() => void refreshSession(), 60_000);
    return () => {
      disposed = true;
      window.clearInterval(interval);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('online', onOnline);
      stop();
    };
  }, [membershipId, tenantId]);

  return null;
}
