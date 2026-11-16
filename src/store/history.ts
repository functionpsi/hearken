/**
 * History store — last 10 lookups cached in localStorage.
 */

const HISTORY_KEY = 'hearken.history.v1'
const MAX_ENTRIES = 10

export interface HistoryEntry {
  id: string
  ts: number
  input: string
  providerId: string
  status: string
  message: string
  track: {
    title: string | null
    artist: string | null
    album: string | null
  } | null
}

function makeId(): string {
  return `h_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

export function loadHistory(): HistoryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(HISTORY_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as HistoryEntry[]
    if (!Array.isArray(parsed)) return []
    return parsed.slice(0, MAX_ENTRIES)
  } catch {
    return []
  }
}

export function saveHistory(entries: HistoryEntry[]): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(entries.slice(0, MAX_ENTRIES)))
  } catch {
    // Ignore quota/storage errors.
  }
}

export function pushHistory(entry: Omit<HistoryEntry, 'id'>): HistoryEntry {
  const full: HistoryEntry = { ...entry, id: makeId() }
  const next = [full, ...loadHistory()].slice(0, MAX_ENTRIES)
  saveHistory(next)
  return full
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.removeItem(HISTORY_KEY)
  } catch {
    // Ignore.
  }
}