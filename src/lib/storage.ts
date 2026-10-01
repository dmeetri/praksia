"use client";

import { openDB, type DBSchema, type IDBPDatabase } from "idb";
import { v4 as uuidv4 } from "uuid";
import type { SavedDocument } from "@/types";

const DB_NAME = "praksia_db";
const DB_VERSION = 1;
const STORE_DOCS = "documents";
const MAX_FREE_DOCS = 10;

interface PraksiaDB extends DBSchema {
  documents: {
    key: string;
    value: SavedDocument;
    indexes: {
      "by-updated": string;
      "by-template": string;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<PraksiaDB>> | null = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<PraksiaDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        const store = db.createObjectStore(STORE_DOCS, { keyPath: "id" });
        store.createIndex("by-updated", "updatedAt");
        store.createIndex("by-template", "templateId");
      },
    });
  }
  return dbPromise;
}

// ─── CRUD ─────────────────────────────────────────────────────────────────────

export async function getAllDocuments(): Promise<SavedDocument[]> {
  const db = await getDB();
  const all = await db.getAllFromIndex(STORE_DOCS, "by-updated");
  return all
    .filter((d) => !d.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getArchivedDocuments(): Promise<SavedDocument[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_DOCS);
  return all
    .filter((d) => d.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getFavoriteDocuments(): Promise<SavedDocument[]> {
  const db = await getDB();
  const all = await db.getAll(STORE_DOCS);
  return all
    .filter((d) => d.isFavorite && !d.isArchived)
    .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
}

export async function getDocument(id: string): Promise<SavedDocument | undefined> {
  const db = await getDB();
  return db.get(STORE_DOCS, id);
}

export async function saveDocument(
  doc: Omit<SavedDocument, "id" | "createdAt" | "updatedAt">
): Promise<SavedDocument> {
  const db = await getDB();

  // Free tier limit check
  const all = await db.getAll(STORE_DOCS);
  const active = all.filter((d) => !d.isArchived);
  if (active.length >= MAX_FREE_DOCS) {
    throw new Error(
      `Достигнут лимит в ${MAX_FREE_DOCS} документов. Обновите подписку для неограниченного хранения.`
    );
  }

  const now = new Date().toISOString();
  const newDoc: SavedDocument = {
    ...doc,
    id: uuidv4(),
    createdAt: now,
    updatedAt: now,
  };
  await db.put(STORE_DOCS, newDoc);
  return newDoc;
}

export async function updateDocument(
  id: string,
  updates: Partial<SavedDocument>
): Promise<SavedDocument | null> {
  const db = await getDB();
  const existing = await db.get(STORE_DOCS, id);
  if (!existing) return null;

  const updated: SavedDocument = {
    ...existing,
    ...updates,
    id,
    updatedAt: new Date().toISOString(),
  };
  await db.put(STORE_DOCS, updated);
  return updated;
}

export async function deleteDocument(id: string): Promise<void> {
  const db = await getDB();
  await db.delete(STORE_DOCS, id);
}

export async function toggleFavorite(id: string): Promise<void> {
  const db = await getDB();
  const doc = await db.get(STORE_DOCS, id);
  if (!doc) return;
  await db.put(STORE_DOCS, { ...doc, isFavorite: !doc.isFavorite });
}

export async function archiveDocument(id: string): Promise<void> {
  const db = await getDB();
  const doc = await db.get(STORE_DOCS, id);
  if (!doc) return;
  await db.put(STORE_DOCS, { ...doc, isArchived: true, updatedAt: new Date().toISOString() });
}

export async function getDocumentCount(): Promise<number> {
  const db = await getDB();
  const all = await db.getAll(STORE_DOCS);
  return all.filter((d) => !d.isArchived).length;
}

export { MAX_FREE_DOCS };
