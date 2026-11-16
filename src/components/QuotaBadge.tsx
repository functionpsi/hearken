import React from 'react'

interface Props {
  remaining: number | null
  resetAt: number | null
  description: string
}

export function QuotaBadge({ remaining, resetAt, description }: Props) {
  if (remaining == null) return null
  const timeStr = resetAt ? formatMs(resetAt - Date.now()) : null
  return (
    <span
      title={`Free-tier quota: ${remaining} left (${description})${timeStr ? `, resets in ${timeStr}` : ''}`}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${
        remaining <= 0
          ? 'bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300'
          : remaining <= 5
          ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300'
          : 'bg-slate-100 text-slate-600 dark:bg-slate-700/50 dark:text-slate-300'
      }`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {remaining} left
    </span>
  )
}

function formatMs(ms: number): string {
  if (ms <= 0) return 'now'
  const s = Math.ceil(ms / 1000)
  if (s < 60) return `${s}s`
  const m = Math.floor(s / 60)
  if (m < 60) return `${m}m`
  const h = Math.floor(m / 60)
  return `${h}h`
}