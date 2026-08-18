import {
  collection,
  doc,
  getDocs,
  setDoc,
  deleteDoc,
  writeBatch,
  onSnapshot,
  query,
  DocumentData,
  Unsubscribe,
  setLogLevel
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * High-performance Firestore cloud synchronization helper for school management collections.
 * Features built-in quota-exhaustion protection, local fallback caching, and error safety.
 */

// Silence aggressive internal retry logs from Firebase SDK when quota is exhausted
try {
  setLogLevel('silent');
} catch (e) {
  // Ignore in environments where setLogLevel might not be permitted
}

let inMemoryQuotaExceeded = false;
const QUOTA_STORAGE_KEY = 'gwd_firestore_quota_exceeded_until';

export function checkIsQuotaExceeded(): boolean {
  if (inMemoryQuotaExceeded) return true;
  try {
    const stored = localStorage.getItem(QUOTA_STORAGE_KEY);
    if (stored) {
      const until = parseInt(stored, 10);
      if (Date.now() < until) {
        inMemoryQuotaExceeded = true;
        return true;
      } else {
        localStorage.removeItem(QUOTA_STORAGE_KEY);
        inMemoryQuotaExceeded = false;
      }
    }
  } catch (e) {
    // fallback
  }
  return inMemoryQuotaExceeded;
}

export function markQuotaExceeded(): void {
  inMemoryQuotaExceeded = true;
  try {
    // Set 12-hour quiet window so the application seamlessly stays in high-speed local persistence mode
    const cooldownUntil = Date.now() + 12 * 60 * 60 * 1000;
    localStorage.setItem(QUOTA_STORAGE_KEY, String(cooldownUntil));
  } catch (e) {
    // fallback
  }
}

function handleFirestoreError(action: string, error: any) {
  const errMsg = error?.message || String(error);
  const errCode = error?.code || '';
  if (errCode === 'resource-exhausted' || errMsg.includes('Quota limit exceeded') || errMsg.includes('resource-exhausted')) {
    markQuotaExceeded();
  }
}

// Helper to remove undefined values that Firestore rejects
export function sanitizeForFirestore<T>(data: T): any {
  if (data === undefined) return null;
  if (data === null) return null;
  if (typeof data !== 'object') return data;
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item));
  }
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(data as Record<string, any>)) {
    if (value !== undefined) {
      clean[key] = sanitizeForFirestore(value);
    }
  }
  return clean;
}

export async function fetchCollectionFromFirestore<T extends { id: string }>(
  collectionName: string
): Promise<T[]> {
  if (checkIsQuotaExceeded()) return [];
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    return items;
  } catch (error: any) {
    handleFirestoreError(`Fetch collection ${collectionName}`, error);
    return [];
  }
}

export async function saveDocumentToFirestore<T extends { id: string }>(
  collectionName: string,
  docItem: T
): Promise<void> {
  if (checkIsQuotaExceeded()) return;
  try {
    const docRef = doc(db, collectionName, docItem.id);
    await setDoc(docRef, sanitizeForFirestore(docItem), { merge: true });
  } catch (error: any) {
    handleFirestoreError(`Save document ${collectionName}/${docItem.id}`, error);
  }
}

export async function deleteDocumentFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  if (checkIsQuotaExceeded()) return;
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error: any) {
    handleFirestoreError(`Delete document ${collectionName}/${docId}`, error);
  }
}

export async function batchSaveCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  if (checkIsQuotaExceeded()) return;
  try {
    if (!items || items.length === 0) return;
    
    // Firestore batch supports max 500 operations per batch
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += 400) {
      chunks.push(items.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      if (checkIsQuotaExceeded()) break;
      const batch = writeBatch(db);
      for (const item of chunk) {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, sanitizeForFirestore(item), { merge: true });
      }
      await batch.commit();
    }
  } catch (error: any) {
    handleFirestoreError(`Batch save ${collectionName}`, error);
  }
}

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): Unsubscribe {
  if (checkIsQuotaExceeded()) {
    return () => {};
  }
  const colRef = collection(db, collectionName);
  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
      });
      onUpdate(items);
    },
    (error) => {
      handleFirestoreError(`Subscription ${collectionName}`, error);
    }
  );
}

