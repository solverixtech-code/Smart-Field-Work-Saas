const databaseName = "visiblo-attendance";
const storeName = "installation";

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(databaseName, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(storeName)) {
        request.result.createObjectStore(storeName);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function attendanceInstallationId(): Promise<string> {
  const database = await openDatabase();
  const current = await new Promise<string | undefined>((resolve, reject) => {
    const request = database
      .transaction(storeName, "readonly")
      .objectStore(storeName)
      .get("id");
    request.onsuccess = () =>
      resolve(typeof request.result === "string" ? request.result : undefined);
    request.onerror = () => reject(request.error);
  });
  if (current) return current;
  const created = crypto.randomUUID();
  await new Promise<void>((resolve, reject) => {
    const request = database
      .transaction(storeName, "readwrite")
      .objectStore(storeName)
      .put(created, "id");
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
  return created;
}
