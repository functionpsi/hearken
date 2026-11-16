import React, { useState, useCallback, useMemo } from 'react'
import { Input } from 'radix-ui'
import { Upload, Loader2 } from 'lucide-react'
import { useSettings } from '@/store/settings'
import { useQuota } from '@/store/quota'
import { providers } from '@/providers/registry'
import { classifyInput, classifyFile } from '@/providers/classifier'
import type { IdentifyInput } from '@/types'
import { StatusMessage } from '@/components/StatusMessage'

export function InputPanel({ onIdentify, isIdentifying }: { onIdentify: (input: IdentifyInput) => void; isIdentifying: boolean }) {
  const { providerId } = useSettings()
  const provider = providers[providerId]
  const { getRemaining, quota } = useQuota()
  const [text, setText] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [pastResult, setPastResult] = useState<{ status: string; message: string } | null>(null)

  const classification = useMemo(() => {
    if (file) return classifyFile(file)
    if (text.trim()) return classifyInput(text, provider)
    return { sourceType: 'unknown' as const, raw: text, supported: false, label: '' }
  }, [text, file, provider])

  const supported = classification.sourceType !== 'unknown' && provider ? provider.config.supportedSources.includes(classification.sourceType) : null

  const onChangeFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]
    if (f) { setFile(f); setText('') }
  }, [])

  const onChangeText = useCallback((val: string) => { setText(val); setFile(null) }, [])

  const handleSubmit = useCallback(() => {
    const trimmed = text.trim()
    if (!trimmed && !file) return
    const input: IdentifyInput = { type: !trimmed ? 'file' : 'url', url: trimmed, file }
    const sourceType = classification.sourceType as const
    const supportedLocal = provider ? provider.config.supportedSources.includes(sourceType) : false
    if (!supportedLocal && sourceType !== 'unknown' && sourceType !== 'localFile') {
      setPastResult({ status: 'unsupported', message: 'Not supported by current provider.' })
      return
    }
    onIdentify(input)
  }, [text, file, provider, onIdentify])

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Paste a URL or upload a file</label>
      <div className="relative">
        <Input
          type="text"
          placeholder="e.g. https://www.youtube.com/watch?v=..."
          value={text}
          onChange={onChangeText}
          disabled={isIdentifying}
          className={`w-full rounded-lg border border-slate-300 px-3 py-2 ${isIdentifying ? 'bg-slate-100' : ''} focus:border-indigo-500 focus:outline-none transition-colors`}
          readOnly={isIdentifying}
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          <button
            variant="ghost"
            size="icon"
            aria-label="Browse"
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-400"
            onClick={() => document.querySelector('input[type="file"]')?.click()
          >
            <Upload className="h-4 w-4" />
          </button>
        </div>
        <Input
          type="file"
          accept="audio/*,video/*"
          style={{ display: 'none' }}
          onChange={onChangeFile}
        />
        {classification.sourceType === 'localFile' && !file && (
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Select an audio/video file</p>
        )}
        {classification.sourceType !== 'unknown' && (
          <div className="mt-2 flex items-center gap-2">
            <span className={supported
              ? 'rounded px-2 py-0.5 text-xs font-medium bg-emerald-100 text-emerald-600 dark:bg-emerald-900/40 dark:text-emerald-300 dark:bg-emerald-100 dark:text-emerald-200'
              : 'rounded px-2 py-0.5 text-xs font-medium bg-rose-100 text-rose-600 dark:bg-rose-900/40 dark:text-rose-300 dark:text-rose-300'
            }>
              {supported ? 'Supported' : 'Not supported'}
            </span>
            {!supported && (
              <button
                variant="ghost"
                size="default"
                className="text-xs px-1.5 py-0.5 text-rose-500 hover:text-rose-400"
                onClick={() => setPastResult({ status: 'unsupported', message: 'Switch provider?' })}
              >
                Change
              </button>
            )}
          </div>
        )}
        {provider && (
          <QuotaBadge
            remaining={getRemaining(provider.config.id) ?? 0}
            resetAt={quota[provider.config.id]?.resetAt ?? null}
            description={provider.config.quotaResetDescription}
          />
        )}
      </div>
      <button
        disabled={isIdentifying || !text.trim() && !file}
        type="button"
        onClick={handleSubmit}
        className={`w-full rounded-lg bg-indigo-600 px-3 py-2 text-white font-medium text-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-300 dark:bg-indigo-500 dark:hover:bg-indigo-400 dark:focus:ring-indigo-400`}
      >
        {isIdentifying ? (<Loader2 className="mr-1 h-4 w-4" /> Identifying…) : 'Identify'}
      </button>
      {pastResult && (
        <StatusMessage status={pastResult.status as any} message={pastResult.message} />
      )}
    </div>
  )
}