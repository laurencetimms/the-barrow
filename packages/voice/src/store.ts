import { Fragment, STARTER_FRAGMENTS } from "./fragments";

const STORAGE_KEY = "barrow-voice-fragments";
const API_KEY_STORAGE = "barrow-voice-api-key";

export function loadFragments(): Fragment[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored) as Fragment[];
    } catch { /* fall through */ }
  }
  // First run — seed with starters
  saveFragments(STARTER_FRAGMENTS);
  return [...STARTER_FRAGMENTS];
}

export function saveFragments(fragments: Fragment[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(fragments));
}

export function loadApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}

export function saveApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function exportFragmentsJSON(fragments: Fragment[]): string {
  return JSON.stringify(fragments, null, 2);
}

export function importFragmentsJSON(json: string): Fragment[] | null {
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.every((f: Fragment) => f.id && f.text && f.tags)) {
      return parsed;
    }
  } catch { /* invalid */ }
  return null;
}
