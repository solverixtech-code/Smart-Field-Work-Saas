import type { QueuedLocationSample } from './location-tracking.api';

const DB_NAME = 'visiblo-location-tracking';
const STORE_NAME = 'samples';

function database(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE_NAME)) {
        request.result.createObjectStore(STORE_NAME, { keyPath: 'clientSampleId' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transaction<T>(mode: IDBTransactionMode, work: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
  const db = await database();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, mode);
    const request = work(tx.objectStore(STORE_NAME));
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    tx.oncomplete = () => db.close();
    tx.onerror = () => reject(tx.error);
  });
}

export const locationSampleQueue = {
  put: (sample: QueuedLocationSample) => transaction('readwrite', (store) => store.put(sample)),
  async list(scopeKey: string, limit: number): Promise<QueuedLocationSample[]> {
    const rows = await transaction<QueuedLocationSample[]>('readonly', (store) => store.getAll());
    return rows.filter((row) => row.scopeKey === scopeKey).sort((a, b) => a.capturedAt.localeCompare(b.capturedAt)).slice(0, limit);
  },
  async remove(ids: string[]): Promise<void> {
    if (!ids.length) return;
    const db = await database();
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      ids.forEach((id) => store.delete(id));
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
    db.close();
  },
};
