/**
 * RapidAPI "Shazam" wrapper provider adapter.
 *
 * Many community-hosted Shazam-core APIs live on RapidAPI's free plan.
 * RapidAPI uses the `X-RapidAPI-Key` and `X-RapidAPI-Host` headers.
 *
 * The user pastes their RapidAPI key. The host (default `shazam-core.p.rapidapi.com`)
 * is configurable in settings so different wrappers can be used without code changes.
 */

import type { ProviderAdapter, IdentifyResult, Track } from '../types'

export const DEFAULT_SHAZAM_HOST = 'shazam-core.p.rapidapi.com'

export const rapidApiShazamAdapter: ProviderAdapter = {
  info: {
    id: 'rapidapi-shazam',
    name: 'Shazam (RapidAPI)',
    quotaResetDescription: 'resets monthly (RapidAPI free plan)',
    quotaLimitDescription: 'RapidAPI free plan — monthly request quota',
    freeKeyUrl: 'https://rapidapi.com/marketplace',
    supportedSources: ['youtube', 'soundcloud', 'direct-audio', 'direct-video'],
    inputMode: 'url-and-file',
    keyPlaceholder: 'your RapidAPI key',
  },

  /**
   * The RapidAPI host varies by the specific wrapper the user subscribes to.
   * We expose an override via a second argument so the store can pass the
   * user-chosen host. When omitted, falls back to the default.
   */
  async identify(input, apiKey, extra?: { host?: string }): Promise<IdentifyResult & { host?: string }> {
    const host = extra?.host?.trim() || DEFAULT_SHAZAM_HOST
    const endpoint = `https://${host}`

    if (!apiKey) {
      return {
        status: 'auth-error',
        track: null,
        message: 'No RapidAPI key configured. Subscribe to a Shazam-core API on RapidAPI and paste your key in settings.',
        remainingQuota: null,
        quotaResetMs: null,
        host,
      }
    }

    const headers: Record<string, string> = {
      'X-RapidAPI-Key': apiKey,
      'X-RapidAPI-Host': host,
    }

    let res: Response
    try {
      if (input.file) {
        const form = new FormData()
        form.append('audiofile', input.file)
        res = await fetch(endpoint, { method: 'POST', headers, body: form })
      } else if (input.url) {
        res = await fetch(`${endpoint}/?url=${encodeURIComponent(input.url)}`, { method: 'POST', headers })
      } else {
        return {
          status: 'invalid-input',
          track: null,
          message: 'No URL or file provided to the Shazam API.',
          remainingQuota: null,
          quotaResetMs: null,
          host,
        }
      }
    } catch (err) {
      return {
        status: 'network-error',
        track: null,
        message: `Network error: ${(err as Error)?.message || 'Could not reach the Shazam API.'} Check your connection, RapidAPI key, and host, then try again.`,
        remainingQuota: null,
        quotaResetMs: null,
        host,
      }
    }

    const remaining = parseRemainingHeader(res.headers.get('x-rapidapi-requests-remaining'))

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'auth-error',
        track: null,
        message: 'RapidAPI rejected the key. Check your key and that you are subscribed to the API on that host.',
        remainingQuota: remaining,
        quotaResetMs: null,
        host,
      }
    }

    if (res.status === 429) {
      return {
        status: 'quota-exceeded',
        track: null,
        message: 'RapidAPI free-tier quota exceeded. Try again later or switch provider.',
        remainingQuota: 0,
        quotaResetMs: null,
        host,
      }
    }

    if (!res.ok) {
      return {
        status: 'unknown-error',
        track: null,
        message: `Shazam API request failed (HTTP ${res.status}). The selected host may not support this input. Try another host.`,
        remainingQuota: remaining,
        quotaResetMs: null,
        host,
      }
    }

    let data: any
    try {
      data = await res.json()
    } catch {
      return {
        status: 'unknown-error',
        track: null,
        message: 'The Shazam API returned a response we could not understand.',
        remainingQuota: remaining,
        quotaResetMs: null,
        host,
      }
    }

    // Shazam-core responses vary by wrapper. Try common shapes.
    const section = data.track?.[0] || data.tracks?.[0] || data.result?.[0] || data
    const meta = section?.metadata?.items || section
    const trackAttr = findTrackAttr(meta)
    const songMeta = findSongAttr(meta)

    if (!trackAttr && !songMeta) {
      return {
        status: 'no-match',
        track: null,
        message: 'The Shazam API could not identify this track.',
        remainingQuota: remaining,
        quotaResetMs: null,
        host,
      }
    }

    const track: Track = {
      title: songMeta?.title || trackAttr?.title || section?.title || null,
      artist: songMeta?.artist || trackAttr?.artist || section?.artist || null,
      album: songMeta?.album || trackAttr?.album || null,
      releaseDate: null,
      confidence: null,
      links: {
        spotify: trackAttr?.spotify_link || section?.spotify_link || null,
        appleMusic: trackAttr?.itunes_link || null,
        youtubeMusic: null,
      },
      providerTrackId: section?.id || null,
    }

    return {
      status: 'ok',
      track,
      message: 'Match found.',
      remainingQuota: remaining,
      quotaResetMs: null,
      host,
    }
  },
}

function parseRemainingHeader(v: string | null): number | null {
  if (v == null) return null
  const n = parseInt(v, 10)
  return Number.isFinite(n) ? n : null
}

/** Pick the first metadata item that looks like a track (has a title). */
function findTrackAttr(items: any[]): any {
  if (!Array.isArray(items)) return null
  for (const it of items) {
    if (it && typeof it === 'object' && (it.title || it.artist)) return it
  }
  return items[0] || null
}

/** Pick the first metadata item that looks like a song (has title + artist). */
function findSongAttr(items: any[]): any {
  if (!Array.isArray(items)) return null
  for (const it of items) {
    if (it && typeof it === 'object' && it.title && it.artist) return it
  }
  return items[0] || null
}