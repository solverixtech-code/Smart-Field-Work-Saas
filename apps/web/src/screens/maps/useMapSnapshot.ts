import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { mapsApi, type MapSnapshot } from './maps.api';

function dateKey(date: Date) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Kolkata', year: 'numeric', month: '2-digit', day: '2-digit',
  }).format(date);
}

export function mapRange(days: number) {
  const end = new Date();
  const start = new Date(end);
  start.setDate(start.getDate() - Math.max(0, days - 1));
  return { startDate: dateKey(start), endDate: dateKey(end) };
}

export function useMapSnapshot(days = 1) {
  const [data, setData] = useState<MapSnapshot | null>(null);
  const [loading, setLoading] = useState(true);
  const range = mapRange(days);

  const refresh = useCallback(async (showToast = false) => {
    setLoading(true);
    try {
      const snapshot = await mapsApi.snapshot(range);
      setData(snapshot);
      if (showToast) toast.success('Map data refreshed');
    } catch {
      toast.error('Unable to load map data');
    } finally {
      setLoading(false);
    }
  }, [range.startDate, range.endDate]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { data, loading, refresh, range };
}
