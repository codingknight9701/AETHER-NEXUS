/**
 * Cloud Vault — Firestore-backed note storage
 * Mirrors the API of vault.ts but reads/writes to Firestore per authenticated user.
 */
import {
    collection, doc, getDoc, getDocs, setDoc, deleteDoc, query, orderBy, Timestamp
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { GraphNode } from './vault';

function userNotesRef() {
    const uid = auth.currentUser?.uid;
    if (!uid) throw new Error('Not authenticated');
    return collection(db, 'users', uid, 'notes');
}

/** Save or update a note in Firestore */
export async function saveCloudThought(
    title: string,
    content: string,
    idToUpdate?: string,
): Promise<string> {
    const ref = userNotesRef();
    const id = idToUpdate || `note_${Date.now()}`;
    const noteRef = doc(ref, id);

    const existing = idToUpdate ? (await getDoc(noteRef)).data() : null;
    const now = Date.now();

    await setDoc(noteRef, {
        id,
        title,
        content,
        createdAt: existing?.createdAt ?? now,
        updatedAt: now,
        isArchived: existing?.isArchived ?? false,
    }, { merge: true });

    return id;
}

/** Read one note from Firestore */
export async function readCloudThought(id: string): Promise<GraphNode | null> {
    const ref = doc(userNotesRef(), id);
    const snap = await getDoc(ref);
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
        id: d.id, title: d.title, label: d.title,
        content: d.content, backlinks: [],
        createdAt: d.createdAt, updatedAt: d.updatedAt, isArchived: d.isArchived,
    };
}

/** Read all notes (excludes archived by default) */
export async function readAllCloudThoughts(includeArchived = false): Promise<GraphNode[]> {
    const ref = userNotesRef();
    const snap = await getDocs(query(ref, orderBy('updatedAt', 'desc')));
    const notes: GraphNode[] = [];
    snap.forEach(d => {
        const data = d.data() as any;
        if (!includeArchived && data.isArchived) return;
        notes.push({
            id: data.id, title: data.title, label: data.title,
            content: data.content, backlinks: [],
            createdAt: data.createdAt, updatedAt: data.updatedAt, isArchived: data.isArchived,
        });
    });
    return notes;
}

/** Delete a note from Firestore */
export async function deleteCloudThought(id: string): Promise<void> {
    await deleteDoc(doc(userNotesRef(), id));
}

/** Archive a note in Firestore */
export async function archiveCloudThought(id: string): Promise<void> {
    await setDoc(doc(userNotesRef(), id), { isArchived: true }, { merge: true });
}
