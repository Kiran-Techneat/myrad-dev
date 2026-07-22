import {
  seedCenters,
  seedPeople,
  seedProviders,
  seedRequests,
  seedShares,
  seedStudies,
} from '@/data/seed';
import type {
  Center,
  ImagingRequest,
  Person,
  Provider,
  Share,
  Study,
} from '@/types';

/**
 * Persisted mock database. Mirrors the localStorage persistence from the
 * original app, but sits behind the mock axios adapter so the UI only ever
 * talks to it through the API/TanStack Query layer.
 */

export interface Db {
  people: Person[];
  providers: Provider[];
  centers: Center[];
  studies: Study[];
  selfUploads: Study[];
  requests: ImagingRequest[];
  shares: Share[];
}

const PERSIST_KEY = 'myrad_web_persisted_v2';
// These slices carry user edits and are persisted across reloads.
const PERSIST_KEYS: (keyof Db)[] = [
  'people',
  'providers',
  'centers',
  'selfUploads',
  'requests',
  'shares',
];

function freshDb(): Db {
  return {
    people: structuredClone(seedPeople),
    providers: structuredClone(seedProviders),
    centers: structuredClone(seedCenters),
    studies: structuredClone(seedStudies),
    selfUploads: [],
    requests: structuredClone(seedRequests),
    shares: structuredClone(seedShares),
  };
}

let db: Db = load();

function load(): Db {
  const base = freshDb();
  try {
    const raw = localStorage.getItem(PERSIST_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<Db>;
      for (const k of PERSIST_KEYS) {
        const val = saved[k];
        if (Array.isArray(val)) {
          // @ts-expect-error index write of matching array type
          base[k] = val;
        }
      }
    }
  } catch {
    /* ignore corrupt storage */
  }
  return base;
}

function persist(): void {
  try {
    const data: Partial<Db> = {};
    for (const k of PERSIST_KEYS) {
      // @ts-expect-error index read
      data[k] = db[k];
    }
    localStorage.setItem(PERSIST_KEY, JSON.stringify(data));
  } catch {
    /* storage may be unavailable */
  }
}

/** Read a snapshot of the whole DB. */
export function getDb(): Db {
  return db;
}

/** Apply a mutation to the DB and persist the user-editable slices. */
export function mutateDb(fn: (draft: Db) => void): Db {
  fn(db);
  persist();
  return db;
}

/** Reset to seed data (used by tests / a hard reset). */
export function resetDb(): void {
  db = freshDb();
  persist();
}
