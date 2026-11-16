# Hearken — Song Identifier

**Static, client-only song identifier deployable on GitHub Pages.** No backend server required. Bring your own free API key (BYOK).

[![Built with Vite + TypeScript](https://img.shields.io/badge/built%20with-Vite%20+%20TypeScript-6E40F1.svg)](https://vitejs.dev/)
[![Deployed on GitHub Pages](https://img.shields.io/badge/deployed%20on-GitHub%20Pages-222222.svg)](https://pages.github.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![Security Policy](https://img.shields.io/badge/Security-Policy-blue.svg)](SECURITY.md)

---

## Why Hearken?

Most song identification services require you to upload audio to their servers or use proprietary apps. **Hearken is different:**

- **Your audio, your keys, your browser** — Audio never leaves your machine unless you explicitly send it to a provider you choose
- **No vendor lock-in** — Switch between free-tier providers (AudD.io, ACRCloud, RapidAPI Shazam) without changing code
- **Zero infrastructure cost** — Runs entirely on GitHub Pages (free static hosting)
- **Privacy by design** — No analytics, no tracking, no server logs, no third-party scripts
- **Open source** — Audit the code, fork it, self-host it, improve it

## How It Works

```
┌─────────────────────────────────────────────────────────────────┐
│                        YOUR BROWSER                             │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────────┐  │
│  │  Input URL   │───▶│  Classifier  │───▶│  Provider Adapter │  │
│  │  or File     │    │  (regex)     │    │  (AudD/ACRCloud/ │  │
│  └──────────────┘    └──────────────┘    │   RapidAPI)      │  │
│                                          └────────┬─────────┘  │
│                                                   │            │
│                              ┌────────────────────┘            │
│                              ▼                                 │
│                     ┌──────────────────┐                       │
│                     │  Provider API    │                       │
│                     │  (HTTPS, your    │                       │
│                     │   API key)       │                       │
│                     └────────┬─────────┘                       │
│                              │                                 │
│                              ▼                                 │
│                     ┌──────────────────┐                       │
│                     │  Result Card     │                       │
│                     │  (title, artist, │                       │
│                     │   links, etc.)   │                       │
│                     └──────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
```

1. **Paste a URL** (YouTube, SoundCloud, TikTok, Instagram) or **upload a local audio/video file**
2. **Client-side classifier** detects the source type and warns if the selected provider doesn't support it
3. **Provider adapter** sends the request to your chosen free-tier API using **your API key** (stored only in `localStorage`)
4. **Results displayed** — title, artist, album, release date, confidence, and streaming links (Spotify, Apple Music, YouTube Music)
5. **History cached locally** — Last 10 lookups in `localStorage`, never uploaded

---

## Free-Tier Providers

| Provider | Free Tier | Input Types | Key Format |
|----------|-----------|-------------|------------|
| **AudD.io** | ~20 requests/day, no card | YouTube, SoundCloud, TikTok, Instagram, direct audio/video links, file upload | Single API key |
| **ACRCloud** | 100 recognitions/month trial | Direct audio/video URLs, file upload | `access_key:access_secret` |
| **RapidAPI Shazam** | Varies by wrapper (typically 100–500/mo) | YouTube, SoundCloud, direct audio/video | RapidAPI key + optional host |

> **Get your free key:** Each provider has a "Get a free key" link in the Settings panel.

---

## Quick Start (Local Development)

```bash
# 1. Clone the repo
git clone https://github.com/functionpsi/hearken.git
cd hearken

# 2. Install dependencies
npm install

# 3. Start dev server
npm run dev

# 4. Open http://localhost:3000
```

### Build for Production

```bash
npm run build
# Output in ./dist — ready for any static host
```

---

## Deploy to GitHub Pages (Free Hosting)

### Option A: Fork & Deploy (Recommended)

1. **Fork this repo** to your GitHub account
2. **Enable GitHub Pages:**
   - Go to Settings → Pages
   - Source: "GitHub Actions"
3. **Push to main** — the workflow (`.github/workflows/deploy.yml`) builds and deploys automatically
4. **Your site:** `https://<your-username>.github.io/hearken/`

### Option B: Deploy from this Repo

```bash
# If you have write access to this repo
git push origin main
# GitHub Actions handles the rest
```

### Custom Domain (Optional)

Create `public/CNAME` with your domain:
```
music.yourdomain.com
```
Then configure DNS: `CNAME music your-username.github.io`

---

## Project Structure

```
hearken/
├── .github/workflows/deploy.yml   # GitHub Actions → GitHub Pages
├── docs/
│   └── companion-proxy/           # Optional server-side key proxy
│       ├── cloudflare-worker.js
│       └── vercel-edge-function.ts
├── public/
│   ├── favicon.svg
│   └── (CNAME for custom domain)
├── src/
│   ├── main.tsx                   # App entry point
│   ├── App.tsx                    # Root component
│   ├── types.ts                   # Core types (ProviderAdapter, Track, etc.)
│   ├── classifier.ts              # Client-side URL/file classification
│   ├── components/
│   │   ├── InputPanel.tsx         # URL/file input + classification badge
│   │   ├── ResultCard.tsx         # Track display with streaming links
│   │   ├── StatusMessage.tsx      # Graceful failure states
│   │   ├── QuotaBadge.tsx         # Remaining quota display
│   │   └── PrivacySection.tsx     # Privacy guarantees
│   ├── providers/
│   │   ├── index.ts               # Provider registry
│   │   ├── aud-d.ts               # AudD.io adapter
│   │   ├── acrcloud.ts            # ACRCloud adapter (HMAC-SHA1)
│   │   └── rapidapi-shazam.ts     # RapidAPI Shazam adapter
│   ├── store/
│   │   ├── settings.ts            # localStorage: provider + API keys
│   │   ├── history.ts             # localStorage: last 10 lookups
│   │   └── quota.ts               # In-memory quota tracking
│   └── lib/
│       └── utils.ts               # Helpers (cn for classnames)
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
├── tailwind.config.js
└── postcss.config.js
```

---

## Provider Adapter Pattern (Extending with New Providers)

Adding a new free-tier provider = **one new file** in `src/providers/`:

```typescript
// src/providers/my-new-provider.ts
import type { ProviderAdapter, ProviderInfo, IdentifyResult } from '../types'

export const myNewProviderAdapter: ProviderAdapter = {
  info: {
    id: 'my-new-provider',
    name: 'My New Provider',
    freeKeyUrl: 'https://example.com/get-key',
    supportedSources: ['youtube', 'soundcloud', 'direct-audio'],
    quotaResetDescription: 'resets daily',
    quotaLimitDescription: '100 requests/day',
  },
  async identify(input, apiKey): Promise<IdentifyResult> {
    // Your fetch() logic here
    // Return { status: 'ok', track: {...} } or error status
  }
}
```

Then add to `src/providers/index.ts`:
```typescript
export const PROVIDERS = [audDAdapter, acrCloudAdapter, rapidApiShazamAdapter, myNewProviderAdapter]
```

---

## Privacy & Security

| Aspect | Implementation |
|--------|----------------|
| **Analytics** | None — no Google Analytics, no Mixpanel, no beacons |
| **Server logs** | None — GitHub Pages serves static files only |
| **API keys** | Stored in `localStorage` only; never committed, never sent to this repo |
| **Key transmission** | HTTPS directly to provider's API; never relayed through Hearken |
| **History** | Last 10 lookups in `localStorage` on your device; never uploaded |
| **Third-party scripts** | Only Google Fonts (preconnected, no tracking) |

See [SECURITY.md](SECURITY.md) for vulnerability reporting.

---

## Optional: Companion Proxy (Server-Side Keys)

If you prefer **not** to paste your API key in the browser, deploy a tiny proxy that holds the key server-side:

| Platform | File | Deploy Time |
|----------|------|-------------|
| **Cloudflare Workers** (free) | `docs/companion-proxy/cloudflare-worker.js` | ~1 min |
| **Vercel Edge Functions** (free) | `docs/companion-proxy/vercel-edge-function.ts` | ~1 min |

The proxy receives requests from your browser, adds the API key server-side, forwards to the provider, and returns the result. Your key never touches the browser.

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| **404 on `/hearken/`** | Ensure `base: '/hearken/'` in `vite.config.ts` matches your repo name |
| **CORS errors** | Use the companion proxy, or choose a provider with browser CORS support |
| **Quota exceeded** | Switch providers in Settings; each has independent free tier |
| **No match** | Try a longer clip (≥10s), ensure audio is clear, check provider supports the source type |
| **Build fails** | Run `npm install` locally first; check Node.js ≥18 |

---

## Contributing

1. Fork the repo
2. Create a feature branch: `git checkout -b feat/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push: `git push origin feat/amazing-feature`
5. Open a Pull Request

### Development Guidelines

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **Provider adapters** — keep them pure: no React, no side effects, just `fetch()`
- **UI components** — use Tailwind + Radix primitives, prefer composition
- **Privacy first** — no new network requests without user consent

---

## License

MIT License — see [LICENSE](LICENSE) for details.

```
MIT License

Copyright (c) 2024 Hearken Contributors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## Acknowledgments

- **AudD.io**, **ACRCloud**, **RapidAPI** — for providing free-tier audio recognition APIs
- **Vite**, **React**, **TypeScript**, **Tailwind CSS** — excellent tooling
- **GitHub Pages** — free static hosting with custom domains
- **Radix UI** — accessible component primitives

---

**Made with ❤️ for music lovers who value privacy and open source.**