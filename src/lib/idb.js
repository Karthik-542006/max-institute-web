// Lightweight, zero-dependency IndexedDB storage helper
// Allows storing high-volume data (1000+ images) without hitting browser LocalStorage 5MB quota limits.

const DB_NAME = 'MAX_INSTITUTE_STORAGE';
const DB_VERSION = 1;
const STORE_NAME = 'key_value_store';

function openDB() {
  return new Promise((resolve) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      resolve(null);
      return;
    }
    const req = window.indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = (err) => {
      console.warn('IndexedDB open error:', err);
      resolve(null);
    };
  });
}

export async function idbGet(key, defaultValue = null) {
  try {
    const db = await openDB();
    if (!db) return defaultValue;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const req = store.get(key);
      req.onsuccess = () => resolve(req.result !== undefined ? req.result : defaultValue);
      req.onerror = () => resolve(defaultValue);
    });
  } catch (e) {
    console.warn('idbGet failed:', e);
    return defaultValue;
  }
}

export async function idbSet(key, value) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.put(value, key);
      req.onsuccess = () => resolve(true);
      req.onerror = (err) => {
        console.warn('idbSet error:', err);
        resolve(false);
      };
    });
  } catch (e) {
    console.warn('idbSet failed:', e);
    return false;
  }
}

export async function idbDel(key) {
  try {
    const db = await openDB();
    if (!db) return false;
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const req = store.delete(key);
      req.onsuccess = () => resolve(true);
      req.onerror = () => resolve(false);
    });
  } catch (e) {
    return false;
  }
}
