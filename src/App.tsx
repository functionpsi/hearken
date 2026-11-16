import React, { useState, useEffect, useCallback } from 'react'
import { useSettings } from '@/store/settings'
import { useQuota } from '@/store/quota'
import { useHistory } from '@/store/history'
import { PROVIDERS, getProviderInfo } from '@/providers/index'
import { InputPanel } from '@/components/InputPanel'
import { ResultCard } from '@/components/ResultCard'
import { PrivacySection } from '@/components/PrivacySection'
import type { IdentifyResult } from '@/types'
import { cn } from '@/lib/utils'

export default function App() {
  const { providerId } = useSettings()
  const provider = PROVIDERS.find((p) => p.info.id === providerId)!
  const providerInfo = getProviderInfo(providerId)!
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleIdentify = useCallback(async (input: any) => {
    setIsIdentifying(true)
    setError(null)
    setResult(null)
    try {
      const res = await provider.identify(input, '')
      if (res.status === 'ok') {
        setResult(res.track)
      } else {
        setError(res.message)
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setIsIdentifying(false)
    }
  }, [provider])

  const handleKeyChange = useCallback((newKey: string) => {
    // ...
  }, [])

  const apiKey = ''

  useEffect(() => {
    const timeout = setTimeout(() => {
      setResult(null)
      setError(null)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [result, error])

  return (
    <div className="min-h-screen bg-background text-text font-sans">
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm dark:bg-slate-900/20">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="32" height="32" rx="8" fill="#6366f1" />
              <path d="M8 18 L14 12 L18 17 L21 13 L24 17" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="27" cy="24" r="2.5" fill="white" />
              <circle cx="27" cy="24" r="4.2" fill="none" stroke="white" strokeWidth="1.2" />
            </svg>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hearken</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} aria-label="Settings" className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19 21l-4-4L9 3" />
              </svg>
            </button>
            {showSettings && (
              <button onClick={() => setShowSettings(false)} aria-label="Close" className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            )}
            <button onClick={() => setShowPrivacy(true)} aria-label="Privacy" className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </button>
          </div>
        </div>
      </header>
      <main className="py-4 px-4">
        <div>
          <InputPanel onIdentify={() => {}} isIdentifying={isIdentifying} />
          {result && <ResultCard track={result} onDismiss={() => setResult(null)} />}
          {error && (
            <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-100 dark:bg-rose-900/30 p-3 text-sm">
              <p className="font-medium text-rose-700 dark:text-rose-300">{error}</p>
            </div>
          )}
        </div>
      </main>
      <footer className="mt-auto border-t py-6">
        <PrivacySection />
      </footer>
    </div>
  )
}
import { QuotaBadge } from '@/components/QuotaBadge'

export default function App() {
  const { providerId } = useSettings()
  const provider = PROVIDERS.find((p) => p.info.id === providerId)!
  const providerInfo = getProviderInfo(providerId)!
  const [isIdentifying, setIsIdentifying] = useState(false)
  const [result, setResult] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [showPrivacy, setShowPrivacy] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleIdentify = useCallback(async (input: any) => {
    setIsIdentifying(true)
    setError(null)
    setResult(null)
    try {
      const res = await provider.identify(input, apiKey!)
      if (res.status === 'ok') {
        setResult(res.track)
      } else {
        setError(res.message)
      }
    } catch (e) {
      setError('Network error')
    } finally {
      setIsIdentifying(false)
    }
  }, [provider, apiKey])

  const handleKeyChange = useCallback((newKey: string) => {
    setSettings(prev => ({ ...prev, keys: { ...prev.keys, [providerId]: newKey } }))
  }, [providerId])

  const apiKey = keys[providerId] || ''

  useEffect(() => {
    const timeout = setTimeout(() => {
      setResult(null)
      setError(null)
    }, 5000)
    return () => clearTimeout(timeout)
  }, [result, error])

  return (
    <div className="min-h-screen bg-background text-text font-sans antialiased">
      <header className="border-b bg-white/80 backdrop-blur-sm shadow-sm dark:bg-slate-900/20 dark:border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="32"
              height="32"
              viewBox="0 0 32 32"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="32" height="32" rx="8" fill="#6366f1" />
              <path d="M8 18 L14 12 L18 17 L21 13 L24 17" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              <circle cx="27" cy="24" r="2.5" fill="white" />
              <circle cx="27" cy="24" r="4.2" fill="none" stroke="white" strokeWidth="1.2" />
            </svg>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-slate-100">Hearken</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => setShowSettings(true)} aria-label="Settings" className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19 21l-4-4L9 3" />
              </svg>
            </button>
            {showSettings && (
              <button onClick={() => setShowSettings(false)} aria-label="Close" className="absolute right-2 top-2 rounded-md p-1.5 text-slate-400 dark:text-slate-400">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="18" x2="18" y2="6" />
                </svg>
              </button>
            )}
            <button onClick={() => setShowPrivacy(true)} aria-label="Privacy" className="rounded-md p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <main className="py-4 px-4">
        <div className="grid md:grid-cols-12 gap-4">
          <div className="md:col-span-8 space-y-4">
            <InputPanel onIdentify={handleIdentify} isIdentifying={isIdentifying} />
            {result && <ResultCard track={result} onDismiss={() => setResult(null)} />}
            {error && (
              <div className="mt-2 rounded-lg border-l-4 border-rose-500 bg-rose-100 dark:bg-rose-900/30 p-3 text-sm">
                <p className="font-medium text-rose-700 dark:text-rose-300">{error}</p>
              </div>
            )}
          </div>
          <aside className="md:col-span-4 space-y-4">
            <div>
              <h2 className="text-sm font-medium text-slate-600 dark:text-slate-400 border-b border-slate-200 pb-2">
                {providerInfo.name} Info
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {providerInfo.quotaLimitDescription} {providerInfo.quotaResetDescription === 'resets daily' ? '(resets daily)' : providerInfo.quotaResetDescription === 'resets monthly' ? '(resets monthly)' : ''}
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Free key: <a href={providerInfo.freeKeyUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 text-slate-600 dark:text-slate-400">
                  {providerInfo.freeKeyUrl}
                </a>
              </p>
            </div>
            {showPrivacy && <PrivacySection />}
          </aside>
        </div>
      </main>

      <footer className="mt-auto border-t bg-white/80 backdrop-blur-sm dark:bg-slate-900/20 py-6">
        {showPrivacy && <PrivacySection />}
      </footer>
    </div>
  )
}