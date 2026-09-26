import { api } from '../../common/api';

export interface TrackingSession {
  active: boolean;
  attendanceId: string | null;
  startedAt: string | null;
  endedAt: string | null;
  sampleIntervalSeconds: number;
  movementThresholdMeters: number;
  minimumIntervalSeconds: number;
  maxBatchSize: number;
}

export interface QueuedLocationSample {
  clientSampleId: string;
  scopeKey: string;
  capturedAt: string;
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  speedKmh: number | null;
  headingDegrees: number | null;
  batteryPercentage: number | null;
  source: 'WEB';
}

export interface LocationSampleResult {
  acceptedIds: string[];
  duplicateIds: string[];
  rejectedIds: string[];
  accepted: number;
  duplicates: number;
  rejected: number;
  unusable: number;
}

export const locationTrackingApi = {
  session: async (): Promise<TrackingSession> =>
    (await api.get('/tenant/crm/maps/tracking-session')).data,
  upload: async (samples: QueuedLocationSample[]): Promise<LocationSampleResult> =>
    (await api.post('/tenant/crm/maps/location-samples', {
      samples: samples.map(({ scopeKey: _scopeKey, ...sample }) => sample),
    })).data,
};
