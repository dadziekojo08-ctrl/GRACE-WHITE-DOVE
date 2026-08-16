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
  Unsubscribe
} from 'firebase/firestore';
import { db } from './firebase';

/**
 * High-performance Firestore cloud synchronization helper for school management collections.
 * Handles both individual collection reads/writes and atomic batch commits.
 */

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
  try {
    const colRef = collection(db, collectionName);
    const snap = await getDocs(colRef);
    const items: T[] = [];
    snap.forEach((docSnap) => {
      items.push({ id: docSnap.id, ...docSnap.data() } as unknown as T);
    });
    return items;
  } catch (error) {
    console.warn(`Firestore: Error fetching collection ${collectionName}:`, error);
    return [];
  }
}

export async function saveDocumentToFirestore<T extends { id: string }>(
  collectionName: string,
  docItem: T
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docItem.id);
    await setDoc(docRef, sanitizeForFirestore(docItem), { merge: true });
  } catch (error) {
    console.error(`Firestore: Failed to save document to ${collectionName}/${docItem.id}:`, error);
  }
}

export async function deleteDocumentFromFirestore(
  collectionName: string,
  docId: string
): Promise<void> {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Firestore: Failed to delete document ${collectionName}/${docId}:`, error);
  }
}

export async function batchSaveCollectionToFirestore<T extends { id: string }>(
  collectionName: string,
  items: T[]
): Promise<void> {
  try {
    if (!items || items.length === 0) return;
    
    // Firestore batch supports max 500 operations per batch
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += 400) {
      chunks.push(items.slice(i, i + 400));
    }

    for (const chunk of chunks) {
      const batch = writeBatch(db);
      for (const item of chunk) {
        const docRef = doc(db, collectionName, item.id);
        batch.set(docRef, sanitizeForFirestore(item), { merge: true });
      }
      await batch.commit();
    }
  } catch (error) {
    console.error(`Firestore: Batch save failed on ${collectionName}:`, error);
  }
}

export function subscribeToCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void
): Unsubscribe {
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
      console.warn(`Firestore realtime subscription warning on ${collectionName}:`, error);
    }
  );
}
