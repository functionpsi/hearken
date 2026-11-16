import React from 'react'
import type { IdentifyStatus } from '../types'

const STYLES: Record<IdentifyStatus, { bg: string; text: string; border: string; icon: string }> = {
  ok: { bg: 'bg-emerald-50 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-200 dark:border-emerald-700', icon: '✓' },
  'no-match': { bg: 'bg-amber-50 dark:bg-amber-900/30', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-200 dark:border-amber-700', icon: '?' },
  unsupported: { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700', icon: '!' },
  'quota-exceeded': { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700', icon: '⚠' },
  'invalid-input': { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700', icon: '⚠' },
  'network-error': { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700', icon: '⚠' },
  'auth-error': { bg: 'bg-rose-50 dark:bg-rose-900/30', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-200 dark:border-rose-700', icon: '⚠' },
  'unknown-error': { bg: 'bg-slate-100 dark:bg-slate-700/50', text: 'text-slate-700 dark:text-slate-300', border: 'border-slate-200 dark:border-slate-600', icon: '⚠' },
}

export function StatusMessage({ status, message }: { status: IdentifyStatus; message: string }) {
  const s = STYLES[status]
  return (
    <div className={`mt-4 flex items-start gap-3 rounded-lg border p-4 ${s.bg} ${s.text} ${s.border}`}>
      <span className="mt-0.5 text-lg leading-none">{s.icon}</span>
      <div>
        <p className="font-medium">{message}</p>
      </div>
    </div>
  )
}