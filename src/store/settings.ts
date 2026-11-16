/**
 * Settings store — persists to localStorage only.
 *
 * Privacy: the API key is stored in the browser and sent ONLY to the
 * provider's own API over HTTPS. Never committed to the repo, never
 * transmitted anywhere else.
 */

const SETTINGS_KEY = 'hearken.settings.v1'

export interface Settings {
  providerId: string
  /** Per-provider key. */
  keys: Record<string, string>
  /** Optional RapidAPI host override for the Shazam provider. */
  shazamHost: string
  /** Local best-effort quota counters, keyed by provider id. */
  quota: Record<string, QuotaState>
}

export interface QuotaState {
  /** Remaining calls in the current window (best-effort local counter). */
  remaining: number | null
  /** Timestamp (ms) when the window resets. */
  resetAt: number | null
}

const DEFAULT_SETTINGS: Settings = {
  providerId: 'audd',
  keys: {},
  shazamHost: '',
  quota: {},
}

export function loadSettings(): Settings {
  if (typeof window === 'undefined') return { ...DEFAULT_SETTINGS }
  try {
    const raw = window.localStorage.getItem(SETTINGS_KEY)
    if (!raw) return { ...DEFAULT_SETTINGS }
    const parsed = JSON.parse(raw) as Partial<Settings>
    return {
      providerId: parsed.providerId ?? DEFAULT_SETTINGS.providerId,
      keys: parsed.keys ?? {},
      shazamHost: parsed.shazamHost ?? '',
      quota: parsed.quota ?? {},
    }
  } catch {
    return { ...DEFAULT_SETTINGS }
  }
}

export function saveSettings(s: Settings): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(SETTINGS_KEY, JSON.stringify(s))
  } catch {
    // Ignore quota/storage errors.
  }
}

export function resetSettings(): Settings {
  const fresh = { ...DEFAULT_SETTINGS }
  saveSettings(fresh)
  return fresh
}

/** Returns a deep copy safe for mutation. */
export function cloneSettings(s: Settings): Settings {
  return {
    providerId: s.providerId,
    keys: { ...s.keys },
    shazamHost: s.shazamHost,
    quota: Object.fromEntries(
      Object.entries(s.quota).map(([k, v]) => [k, { ...v }]),
    ),
  }
}