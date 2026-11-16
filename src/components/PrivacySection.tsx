import React from 'react'

export function PrivacySection() {
  return (
    <section className="mt-8 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm dark:border-slate-700 dark:bg-slate-800/50">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900 dark:text-slate-100">
        <ShieldIcon /> Privacy
      </h3>
      <ul className="mt-2 list-disc space-y-1 pl-5 text-slate-700 dark:text-slate-300">
        <li><strong>No tracking.</strong> No analytics, no beacons, no third-party scripts.</li>
        <li><strong>No server logs.</strong> Hearken is a static site served from GitHub Pages. There is no backend to log anything.</li>
        <li><strong>Your key stays in your browser.</strong> API keys are stored only in <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">localStorage</code> on your machine. They are never committed to this repo.</li>
        <li><strong>Keys go only to the provider.</strong> When you identify, the key is sent over HTTPS directly to the provider's own API (AudD.io, ACRCloud, or your RapidAPI host). Nothing is relayed through Hearken.</li>
        <li><strong>History is local.</strong> Your last 10 lookups are cached in <code className="rounded bg-slate-200 px-1 dark:bg-slate-700">localStorage</code> on your device. Nothing is uploaded.</li>
      </ul>
    </section>
  )
}

function ShieldIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  )
}