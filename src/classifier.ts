/**
 * Client-side input classification.
 *
 * Runs BEFORE any API call so we can warn the user when the currently
 * selected provider does not support the detected source type. This
 * avoids wasting free-tier quota on unsupported requests.
 *
 * Detection is purely regex/URL-parsing based — no network calls.
 */

import type { InputClassification, SourceType, ProviderInfo } from './types'

/** Regex patterns, ordered most-specific first. */
const PATTERNS: Array<{ test: (s: string) => boolean; source: SourceType; label: string }> = [
  {
    test: (s) => /(?:https?:)?\/\/(?:www\.|m\.)?(?:youtube\.com|youtu\.be)\/.+/i.test(s),
    source: 'youtube',
    label: 'YouTube',
  },
  {
    test: (s) => /(?:https?:)?\/\/(?:www\.|m\.)?soundcloud\.com\/.+/i.test(s),
    source: 'soundcloud',
    label: 'SoundCloud',
  },
  {
    test: (s) => /(?:https?:)?\/\/(?:www\.|m\.)?tiktok\.com\/.+/i.test(s),
    source: 'tiktok',
    label: 'TikTok',
  },
  {
    test: (s) => /(?:https?:)?\/\/(?:www\.|m\.)?instagram\.com\/.+/i.test(s),
    source: 'instagram',
    label: 'Instagram',
  },
  {
    test: (s) => /\.(mp3|wav|ogg|m4a|flac|aac)(\?.*)?$/i.test(s),
    source: 'direct-audio',
    label: 'Direct audio file',
  },
  {
    test: (s) => /\.(mp4|webm|mov|m4v|avi)(\?.*)?$/i.test(s),
    source: 'direct-video',
    label: 'Direct video file',
  },
]

export function classifyInput(raw: string, provider: ProviderInfo | null): InputClassification {
  const trimmed = raw.trim()

  // File objects (from <input type="file">) bypass URL classification.
  if (trimmed === '__FILE__') {
    const fileSource: SourceType = 'direct-audio' // caller should pass file type info
    return {
      sourceType: fileSource,
      raw,
      supported: provider ? provider.supportedSources.includes(fileSource) : false,
      label: 'Local audio file',
    }
  }

  if (!trimmed) {
    return {
      sourceType: 'unknown',
      raw,
      supported: false,
      label: 'Empty input',
    }
  }

  for (const p of PATTERNS) {
    if (p.test(trimmed)) {
      return {
        sourceType: p.source,
        raw: trimmed,
        supported: provider ? provider.supportedSources.includes(p.source) : false,
        label: p.label,
      }
    }
  }

  // Treat anything with a scheme/host as a generic URL — provider decides.
  const looksLikeUrl = /^https?:\/\//i.test(trimmed)
  return {
    sourceType: 'unknown',
    raw: trimmed,
    supported: false,
    label: looksLikeUrl ? 'Unrecognised URL' : 'Not a recognised URL or file',
  }
}

/**
 * Classify a File object by extension. Returns null if it's not audio/video.
 */
export function classifyFile(file: File): InputClassification | null {
  const name = file.name || ''
  const match = name.match(/\.([a-z0-9]+)(?:\?.*)?$/i)
  const ext = match ? match[1].toLowerCase() : ''
  const audioExts = new Set(['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma'])
  const videoExts = new Set(['mp4', 'webm', 'mov', 'm4v', 'avi', 'mkv'])

  let source: SourceType | null = null
  let label = ''
  if (audioExts.has(ext)) {
    source = 'direct-audio'
    label = 'Local audio file'
  } else if (videoExts.has(ext)) {
    source = 'direct-video'
    label = 'Local video file'
  } else {
    return null
  }

  return {
    sourceType: source,
    raw: `__FILE__:${file.name}`,
    supported: false, // caller sets based on provider
    label,
  }
}