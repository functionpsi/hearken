/**
 * ACRCloud provider adapter.
 *
 * Free trial tier: https://www.acrcloud.com/
 * Docs: https://www.acrcloud.com/api/creator/api-docs
 *
 * ACRCloud uses HMAC-SHA1 signature auth with a key pair (access_key +
 * access_secret). We accept the pair as a single "KEY:SECRET" string the
 * user pastes in settings, so the UI still only has one field per provider.
 *
 * Primarily supports file uploads (audio/video) and direct media URLs.
 */

import type { ProviderAdapter, IdentifyResult, Track } from '../types'

const ENDPOINT = 'https://api.acrcloud.com/api/v1/recognize'

export const acrCloudAdapter: ProviderAdapter = {
  info: {
    id: 'acrcloud',
    name: 'ACRCloud',
    quotaResetDescription: 'resets monthly (free trial tier)',
    quotaLimitDescription: 'free trial tier — limited recognitions per month',
    freeKeyUrl: 'https://www.acrcloud.com/api/creator/api-docs',
    supportedSources: ['direct-audio', 'direct-video'],
    inputMode: 'url-and-file',
    keyPlaceholder: 'your ACRCloud access_key:access_secret',
  },

  async identify(input, apiKey): Promise<IdentifyResult> {
    if (!apiKey) {
      return {
        status: 'auth-error',
        track: null,
        message: 'No API key configured. Get an ACRCloud trial key pair and enter "access_key:access_secret" in settings.',
        remainingQuota: null,
        quotaResetMs: null,
      }
    }

    const colon = apiKey.indexOf(':')
    if (colon < 0) {
      return {
        status: 'auth-error',
        track: null,
        message: 'ACRCloud needs both an access key and a secret. Enter them as "access_key:access_secret".',
        remainingQuota: null,
        quotaResetMs: null,
      }
    }
    const accessKey = apiKey.slice(0, colon).trim()
    const accessSecret = apiKey.slice(colon + 1).trim()

    const timestamp = Math.floor(Date.now() / 1000).toString()
    const signature = await hmacSha1(accessSecret, `${accessKey}|${timestamp}`)

    const form = new FormData()
    form.append('access_key', accessKey)
    form.append('timestamp', timestamp)
    form.append('signature', signature)

    if (input.file) {
      form.append('audiofile', input.file)
      form.append('audio_format', guessFormat(input.file))
      form.append('sample_rate', '44100')
      form.append('sample_bytes', String(input.file.size))
      form.append('audio_channels', '2')
    } else if (input.url) {
      form.append('url', input.url)
      form.append('data_type', 'audio')
    } else {
      return {
        status: 'invalid-input',
        track: null,
        message: 'No URL or file provided to ACRCloud.',
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

    const remaining = parseRemainingHeader(res.headers.get('X-Acrlimit-Remaining'))
    const resetMs = parseResetHeader(res.headers.get('X-Acrlimit-Reset'))

    if (res.status === 401 || res.status === 403) {
      return {
        status: 'auth-error',
        track: null,
        message: 'ACRCloud rejected the credentials. Verify your access_key:access_secret pair.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    if (res.status === 429) {
      return {
        status: 'quota-exceeded',
        track: null,
        message: 'ACRCloud free-trial quota exceeded. Try again later or switch provider.',
        remainingQuota: 0,
        quotaResetMs: resetMs,
      }
    }

    if (!res.ok) {
      return {
        status: 'unknown-error',
        track: null,
        message: `ACRCloud request failed (HTTP ${res.status}). Please try again.`,
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
        message: 'ACRCloud returned a response we could not understand.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    if (data.status !== 'success') {
      const code = data.error?.code
      const msg = data.error?.msg || 'No match found.'
      if (code === 3001 || /not found|no match|no_result/i.test(msg)) {
        return { status: 'no-match', track: null, message: msg, remainingQuota: remaining, quotaResetMs: resetMs }
      }
      if (code === 3004 || /quota|limit/i.test(msg)) {
        return { status: 'quota-exceeded', track: null, message: msg, remainingQuota: remaining, quotaResetMs: resetMs }
      }
      if (code === 3002 || code === 3003 || /invalid|unsupported/i.test(msg)) {
        return { status: 'invalid-input', track: null, message: msg, remainingQuota: remaining, quotaResetMs: resetMs }
      }
      return { status: 'unknown-error', track: null, message: msg, remainingQuota: remaining, quotaResetMs: resetMs }
    }

    const meta = data.result?.metadata?.track
    const music = data.result?.metadata?.music
    if (!meta && !music) {
      return {
        status: 'no-match',
        track: null,
        message: 'ACRCloud could not identify this track.',
        remainingQuota: remaining,
        quotaResetMs: resetMs,
      }
    }

    const track: Track = {
      title: meta?.title || music?.title || null,
      artist: meta?.artist || music?.artist || null,
      album: music?.album || null,
      releaseDate: music?.release_date || null,
      confidence: typeof data.result?.score === 'number' ? data.result.score : null,
      links: {
        spotify: music?.spotify || null,
        appleMusic: music?.apple_music || null,
        youtubeMusic: music?.youtube_music || null,
      },
      providerTrackId: data.result?.metadata?.track?.acr_id || null,
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

/**
 * HMAC-SHA1 via Web Crypto. Returns a lowercase hex string.
 */
async function hmacSha1(key: string, message: string): Promise<string> {
  const enc = new TextEncoder()
  const keyData = await crypto.subtle.importKey('raw', enc.encode(key), { name: 'HMAC', hash: 'SHA-1' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', keyData, enc.encode(message))
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

function guessFormat(file: File): string {
  const name = file.name || ''
  const m = name.match(/\.([a-z0-9]+)$/i)
  if (m) return m[1].toLowerCase()
  return file.type.replace('audio/', '') || 'mp3'
}

function networkError(err: unknown): IdentifyResult {
  return {
    status: 'network-error',
    track: null,
    message: `Network error: ${(err as Error)?.message || 'Could not reach ACRCloud.'} Check your connection and try again.`,
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
  const n = parseInt(v, 10)
  if (!Number.isFinite(n)) return null
  const ms = n > 1e12 ? n : n * 1000
  return ms - Date.now()
}