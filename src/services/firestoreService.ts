import { db, auth, collection, doc, writeBatch, setDoc, deleteDoc, onSnapshot } from '../lib/firebase';
import { Client } from '../types';

/**
 * Sanitizes object data recursively to ensure it is safe for Firestore:
 * 1. Strips out `undefined` fields which Firestore rejects with an error.
 * 2. Ensures keys and nested values are standard JSON serializable.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as any;
  }
  if (Array.isArray(data)) {
    return data.map((item) => sanitizeForFirestore(item)) as any;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

/**
 * Ensures a document ID satisfies firestore.rules:
 * `id is string && id.size() <= 128 && id.matches('^[a-zA-Z0-9_\\-]+$')`
 */
export function sanitizeDocId(rawId: string): string {
  const clean = rawId.replace(/[^a-zA-Z0-9_\-]/g, '_');
  return clean.slice(0, 128) || `lead_${Date.now()}`;
}

/**
 * Saves multiple leads to Firestore in batches (max 400 per batch).
 * Automatically sanitizes fields and injects team metadata.
 */
export async function saveLeadsToFirestore(
  leads: Client[],
  userId?: string
): Promise<{ success: boolean; count: number; error?: string }> {
  if (!leads || leads.length === 0) {
    return { success: true, count: 0 };
  }

  try {
    const BATCH_SIZE = 400; // Safe margin below Firestore's 500 limit
    const total = leads.length;
    let savedCount = 0;

    for (let i = 0; i < total; i += BATCH_SIZE) {
      const chunk = leads.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);

      for (const lead of chunk) {
        const docId = sanitizeDocId(lead.id);
        const docRef = doc(db, 'clients', docId);
        const payload = sanitizeForFirestore({
          ...lead,
          id: docId,
          userId: userId || auth.currentUser?.uid || 'team',
          updatedAt: new Date().toISOString(),
        });
        batch.set(docRef, payload, { merge: true });
      }

      await batch.commit();
      savedCount += chunk.length;
    }

    return { success: true, count: savedCount };
  } catch (err: any) {
    console.error('Firestore batch save error:', err);
    return { success: false, count: 0, error: err?.message || 'Failed to save leads to Firestore' };
  }
}

/**
 * Saves or updates a single lead in Firestore.
 */
export async function saveLeadToFirestore(lead: Client, userId?: string): Promise<boolean> {
  try {
    const docId = sanitizeDocId(lead.id);
    const docRef = doc(db, 'clients', docId);
    const payload = sanitizeForFirestore({
      ...lead,
      id: docId,
      userId: userId || auth.currentUser?.uid || 'team',
      updatedAt: new Date().toISOString(),
    });
    await setDoc(docRef, payload, { merge: true });
    return true;
  } catch (err) {
    console.error('Firestore save lead error:', err);
    return false;
  }
}

/**
 * Deletes a single lead from Firestore.
 */
export async function deleteLeadFromFirestore(leadId: string): Promise<boolean> {
  try {
    const docId = sanitizeDocId(leadId);
    await deleteDoc(doc(db, 'clients', docId));
    return true;
  } catch (err) {
    console.error('Firestore delete lead error:', err);
    return false;
  }
}

/**
 * Deletes multiple leads from Firestore using batches.
 */
export async function deleteMultipleLeadsFromFirestore(leadIds: string[]): Promise<boolean> {
  if (!leadIds || leadIds.length === 0) return true;

  try {
    const BATCH_SIZE = 400;
    for (let i = 0; i < leadIds.length; i += BATCH_SIZE) {
      const chunk = leadIds.slice(i, i + BATCH_SIZE);
      const batch = writeBatch(db);
      for (const id of chunk) {
        batch.delete(doc(db, 'clients', sanitizeDocId(id)));
      }
      await batch.commit();
    }
    return true;
  } catch (err) {
    console.error('Firestore batch delete error:', err);
    return false;
  }
}

/**
 * Subscribes to real-time updates for all leads in Firestore.
 * Automatically notifies callback whenever any teammate imports or modifies leads.
 */
export function subscribeToFirestoreLeads(
  onLeads: (leads: Client[]) => void,
  onError?: (err: Error) => void
): () => void {
  try {
    const clientsCol = collection(db, 'clients');
    const unsubscribe = onSnapshot(
      clientsCol,
      (snapshot) => {
        const leads: Client[] = [];
        snapshot.forEach((docSnap) => {
          leads.push(docSnap.data() as Client);
        });
        onLeads(leads);
      },
      (error) => {
        console.warn('Firestore onSnapshot listener error:', error);
        if (onError) onError(error);
      }
    );
    return unsubscribe;
  } catch (err: any) {
    console.warn('Could not establish Firestore subscription:', err);
    if (onError) onError(err);
    return () => {};
  }
}
