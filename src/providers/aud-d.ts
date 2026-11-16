/**
 * AudD.io provider adapter.
 *
 * Free testing tier: https://audd.io/
 * Docs: https://docs.audd.io/
 *
 * Accepts a `url` parameter (YouTube, SoundCloud, direct audio/video links)
 * or a file upload via multipart/form-data. The API key is sent as `api_key`.
 */

import type { ProviderAdapter, IdentifyResult, Track, ProviderInfo } from '../types'

const ENDPOINT = 'https://api.audd.io/v2/recognize'

export const audDAdapter: ProviderAdapter = {
  info: {
    id: 'audd',
    name: 'AudD.io',
    quotaResetDescription: 'resets daily (free testing tier)',
    quotaLimitDescription: 'free testing tier — limited requests per day',
    freeKeyUrl: 'https://audd.io/',
    supportedSources: ['youtube', 'soundcloud', 'tiktok', 'instagram', 'direct-audio', 'direct-video'],
    inputMode: 'url-and-file',
    keyPlaceholder: 'your AudD.io API key',
  },

  async identify(input, apiKey): Promise<IdentifyResult> {
    if (!apiKey) {
      return {
        status: 'auth-error',
        track: null,
        message: 'No API key configured. Get a free key from AudD.io and enter it in settings.',
        remainingQuota: null,
        quotaResetMs: null,
      }
    }

    const form = new FormData()
    form.append('api_key', apiKey)
    form.append('return', 'spotify,apple_music,youtube_music,release_date')

    if (input.url) {
      form.append('url', input.url)
    } else if (input.file) {
      form.append('file', input.file)
    } else {
      return {
        status: 'invalid-input',
        track: null,
        message: 'No URL or file provided to AudD.io.',
        remainingQuota: null,
        quotaResetMs: null,
      }
    }

    let res: Response
    try {
      res = await fetch(ENDPOINT, { method: 'POST', body: form })
    } catch (err) {
      return networkError(err)
    }

    // Quota headers (best-effort — AudD doesn't publish a quota-check endpoint).
    const remaining = parseRemainingHeader(res.headers.get('X-RateLimit-Remaining'))
    const resetMs = parseResetHeader(res.headers.get('X-RateLimit-Reset'))

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'auth-error',
        track: null,
        message: 'AudD.io rejected the API key. Check your key in settings or get a free one at audd.io.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    if (res.status === 429) {
      return {
        status: 'quota-exceeded',
        track: null,
        message: 'AudD.io free-tier quota exceeded. Try again later, switch provider, or wait for the daily reset.',
        remainingQuota: 0,
        quotaResetMs: resetMs,
      }
    }

    if (!res.ok) {
      return {
        status: 'unknown-error',
        track: null,
        message: `AudD.io request failed (HTTP ${res.status}). Please try again.`,
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    let data: any
    try {
      data = await res.json()
    } catch {
      return {
        status: 'unknown-error',
        track: null,
        message: 'AudD.io returned a response we could not understand.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    if (data.status === 'fail') {
      const reason = data.error?.error_message || data.error?.message || 'No match found.'
      return {
        status: /quota|limit|exceeded/i.test(reason) ? 'quota-exceeded' : 'no-match',
        track: null,
        message: reason,
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    const song = data.result?.[0]
    if (!song) {
      return {
        status: 'no-match',
        track: null,
        message: 'AudD.io could not identify this track.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    const track: Track = {
      title: song.title || null,
      artist: song.artist || song.artist_name || null,
      album: song.album || null,
      releaseDate: song.release_date || null,
      confidence: typeof song.confidence === 'number' ? song.confidence / 100 : null,
      links: {
        spotify: song.spotify?.link || song.spotify_link || null,
        appleMusic: song.apple_music?.link || null,
        youtubeMusic: song.youtube_music?.link || null,
      },
      providerTrackId: song.id || null,
    }

    return {
      status: 'ok',
      track,
      message: 'Match found.',
      remainingQuota: remaining,
      quotaResetMs: resetMs,
    }
  },
}

function networkError(err: unknown): IdentifyResult {
  return {
    status: 'network-error',
    track: null,
    message: `Network error: ${(err as Error)?.message || 'Could not reach AudD.io.'} Check your connection and try again.`,
    remainingQuota: null,
    quotaResetMs: null,
  }
}

function parseRemainingHeader(v: string | null): number | null {
  if (v == null) return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

function parseResetHeader(v: string | null): number | null {
  if (v == null) return null
  // Could be epoch seconds or milliseconds.
  const n = parseInt(v, 10)
  if (!Number.isFinite(n)) return null
  const ms = n > 1e12 ? n : n * 1000
  return ms - Date.now()
}