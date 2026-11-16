/**
 * Shared type definitions for Hearken.
 *
 * The provider adapter pattern is anchored by `ProviderAdapter`.
 * Each free-tier provider (AudD, ACRCloud, RapidAPI Shazam wrapper)
 * implements exactly this interface. The UI never calls a provider
 * directly — it goes through `identify()`.
 */

export type SourceType =
  | 'youtube'
  | 'soundcloud'
  | 'tiktok'
  | 'instagram'
  | 'direct-audio'
  | 'direct-video'
  | 'unknown';

/** A normalised recognition result returned by every adapter. */
export interface Track {
  title: string | null;
  artist: string | null;
  album: string | null;
  releaseDate: string | null;
  /** 0–1 confidence, normalised where the provider gives a percentage. */
  confidence: number | null;
  /** Outbound links returned by the provider, if any. */
  links: {
    spotify?: string | null;
    appleMusic?: string | null;
    youtubeMusic?: string | null;
  };
  /** Provider-internal identifier, useful for debugging / history. */
  providerTrackId: string | null;
}

export type IdentifyStatus =
  | 'ok'
  | 'no-match'
  | 'unsupported'
  | 'quota-exceeded'
  | 'invalid-input'
  | 'network-error'
  | 'auth-error'
  | 'unknown-error';

export interface IdentifyResult {
  status: IdentifyStatus;
  track: Track | null;
  /** Plain-language message to show the user. */
  message: string;
  /** When the provider exposes a quota header, the remaining count. */
  remainingQuota: number | null;
  /** Reset window in milliseconds, if known. */
  quotaResetMs: number | null;
}

/** Input classification result — computed client-side before any API call. */
export interface InputClassification {
  sourceType: SourceType;
  /** The URL or file the user pasted/uploaded. */
  raw: string;
  /** Whether the currently selected provider supports this source type. */
  supported: boolean;
  /** Human-readable label. */
  label: string;
}

export interface ProviderInfo {
  id: string;
  name: string;
  /** Free-tier reset window description for the UI. */
  quotaResetDescription: string;
  /** Approximate daily/monthly free quota, for display. */
  quotaLimitDescription: string;
  /** URL where the user gets a free key. */
  freeKeyUrl: string;
  /** Source types this provider actually supports. */
  supportedSources: SourceType[];
  /** How the provider accepts input: URL, file, or both. */
  inputMode: 'url' | 'file' | 'url-and-file';
  /** Help text for the key field placeholder. */
  keyPlaceholder: string;
}

/**
 * The single contract every provider adapter must implement.
 * Adapters are plain modules — no React, no store, no side effects.
 */
export interface ProviderAdapter {
  readonly info: ProviderInfo;
  /**
   * Identify a track from a URL string or a File.
   * Adapters must NOT throw — they must return an IdentifyResult with an
   * appropriate status so the UI can render a graceful failure.
   */
  identify(input: { url?: string; file?: File }, apiKey: string): Promise<IdentifyResult>;
}