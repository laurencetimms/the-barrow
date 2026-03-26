import { Fragment } from "./fragments";
import BUNDLED_FRAGMENTS from "./fragments.json";
import NODE_GATED_FRAGMENTS from "./node-gated-fragments.json";

const API_KEY_STORAGE = "barrow-voice-api-key";

export function loadFragments(): Fragment[] {
  return [...BUNDLED_FRAGMENTS, ...NODE_GATED_FRAGMENTS] as Fragment[];
}

export function saveFragments(_fragments: Fragment[]): void {
  // No-op: fragments are bundled from fragments.json, not stored in localStorage.
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
