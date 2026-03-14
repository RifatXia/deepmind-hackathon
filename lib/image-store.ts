"use client";

// IndexedDB-based image storage — handles large base64 images
// localStorage has ~5MB limit, IndexedDB has hundreds of MB

const DB_NAME = "chiquest-images";
const STORE_NAME = "postcards";
const DB_VERSION = 1;

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImage(
  key: string,
  imageBase64: string
): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).put(imageBase64, key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to save image to IndexedDB:", e);
  }
}

export async function loadImage(key: string): Promise<string | null> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const request = tx.objectStore(STORE_NAME).get(key);
    return new Promise((resolve, reject) => {
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Failed to load image from IndexedDB:", e);
    return null;
  }
}

export async function loadAllImages(): Promise<Record<string, string>> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const allKeys = store.getAllKeys();
    const allValues = store.getAll();

    return new Promise((resolve, reject) => {
      tx.oncomplete = () => {
        const result: Record<string, string> = {};
        for (let i = 0; i < allKeys.result.length; i++) {
          result[allKeys.result[i] as string] = allValues.result[i];
        }
        resolve(result);
      };
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to load images from IndexedDB:", e);
    return {};
  }
}

export async function deleteImage(key: string): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).delete(key);
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to delete image from IndexedDB:", e);
  }
}

export async function clearAllImages(): Promise<void> {
  try {
    const db = await openDB();
    const tx = db.transaction(STORE_NAME, "readwrite");
    tx.objectStore(STORE_NAME).clear();
    return new Promise((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch (e) {
    console.error("Failed to clear IndexedDB:", e);
  }
}
