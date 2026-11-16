import React from 'react'
import type { Track } from '../types'

interface Props {
  track: Track
  onDismiss?: () => void
}

export function ResultCard({ track, onDismiss }: Props) {
  const hasLinks = track.links.spotify || track.links.appleMusic || track.links.youtubeMusic
  const confidencePct = track.confidence == null ? null : Math.round(track.confidence * 100)

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {track.title || 'Unknown title'}
          </h3>
          <p className="text-slate-700 dark:text-slate-300">
            {track.artist || 'Unknown artist'}
          </p>
          {track.album && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Album: {track.album}
            </p>
          )}
          {track.releaseDate && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Released: {track.releaseDate}
            </p>
          )}
          {confidencePct != null && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Confidence {confidencePct}%
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <XIcon />
          </button>
        )}
      </div>

      {hasLinks && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4 dark:border-slate-700">
          {track.links.spotify && <LinkButton href={track.links.spotify} label="Spotify" />}
          {track.links.appleMusic && <LinkButton href={track.links.appleMusic} label="Apple Music" />}
          {track.links.youtubeMusic && <LinkButton href={track.links.youtubeMusic} label="YouTube Music" />}
        </div>
      )}
    </div>
  )
}

function LinkButton({ href, label }: { href: string | null; label: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
    >
      {label}
      <ExternalIcon />
    </a>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17l9-9M7 7h10v10" />
    </svg>
  )
}
import type { Track } from '../types'

interface Props {
  track: Track
  onDismiss?: () => void
}

export function ResultCard({ track, onDismiss }: Props) {
  const hasLinks = track.links.spotify || track.links.appleMusic || track.links.youtubeMusic
  const confidencePct = track.confidence == null ? null : Math.round(track.confidence * 100)

  return (
    <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-800">
      <div className="flex items-start justify-between gap-3 p-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
            {track.title || 'Unknown title'}
          </h3>
          <p className="text-slate-700 dark:text-slate-300">
            {track.artist || 'Unknown artist'}
          </p>
          {track.album && (
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Album: {track.album}
            </p>
          )}
          {track.releaseDate && (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Released: {track.releaseDate}
            </p>
          )}
          {confidencePct != null && (
            <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300">
              Confidence {confidencePct}%
            </p>
          )}
        </div>
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss"
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700"
          >
            <XIcon />
          </button>
        )}
      </div>

      {hasLinks && (
        <div className="flex flex-wrap gap-2 border-t border-slate-100 p-4 dark:border-slate-700">
          {track.links.spotify && <LinkButton href={track.links.spotify} label="Spotify" />}
          {track.links.appleMusic && <LinkButton href={track.links.appleMusic} label="Apple Music" />}
          {track.links.youtubeMusic && <LinkButton href={track.links.youtubeMusic} label="YouTube Music" />}
        </div>
      )}
    </div>
  )
}

function LinkButton({ href, label }: { href: string | null; label: string }) {
  if (!href) return null
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-md bg-slate-900 px-3 py-1.5 text-xs font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-300"
    >
      {label}
      <ExternalIcon />
    </a>
  )
}

function XIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  )
}

function ExternalIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 17l9-9M7 7h10v10" />
    </svg>
  )
}