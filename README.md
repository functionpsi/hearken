# Hearken — Song Identifier

Static, client-only song identifier deployable on GitHub Pages. No backend server required. Bring your own free API key (BYOK).

![Hearken banner](https://img.shields.io/badge/built%20with-Vite%20+%20TypeScript-6E40F1.svg)

## Core Philosophy

- **Static & client-only**: Everything runs in the browser. No server, no backend.
- **BYOK**: You provide your own free API key. Keys never leave your browser.
- **Privacy-first**: No tracking, no server logs, no analytics. Everything is local.
- **Provider-agnostic**: Swap between free-tier providers without touching the UI.

## Free-Tier Providers

Hearken supports three free-tier audio recognition providers. Select one in Settings and paste your free key.

### AudD.io

- Free testing tier: limited requests/day, no card required
- Accepts YouTube, SoundCloud, TikTok, Instagram URLs and direct audio/video links
- Also accepts direct file upload
- Get a free key: [audd.io](https://audd.io/)

### ACRCloud

- Free trial tier: sign up at console, limited recognitions/month
- Accepts direct audio/video URLs and uploaded files
- Requires both `access_key` and `access_secret` (enter as `key:secret`)
- Get a free key: [acrcloud.com](https://www.acrcloud.com/api/creator/api-docs)

### RapidAPI "Shazam" wrappers

- Free monthly quota via RapidAPI's free plan
- Many community-hosted Shazam-core APIs available
- Paste your RapidAPI key and (optionally) override the host
- Get a key: [rapidapi.com](https://rapidapi.com/marketplace)

## UI

![Hearken Screenshot](https://raw.githubusercontent.com/yourusername/hearken/main/screenshots/hearken-dark.png)

### Main Area

- **Single input field**: Paste a URL (YouTube, SoundCloud, TikTok, Instagram) or upload a local audio/video file
- **Input classification**: Client-side regex detects the source type and shows whether the selected provider supports it — avoiding wasted free-tier quota on unsupported calls
- **Provider dropdown**: Choose your provider and see supported source types
- **Quota display**: Best-effort local counter showing remaining calls and reset timer

### Result Card (on success)

- Track title, artist, album, release date
- Confidence score
- Outbound links: Spotify, Apple Music, YouTube Music (if provider returns them)
- Dismiss button to clear

### Graceful Failure States

| Code | Message | Action |
|------|---------|--------|
| `unsupported_source` | The selected provider doesn't support this source type | Switch provider or use a different input type |
| `no_match` | No match found — clip may be too short or quiet | Try a longer/clearer clip |
| `quota_exceeded` | Free-tier quota reached for the day/month | Wait or switch provider |
| `invalid_link` | The link looks invalid or is no longer accessible | Check the URL |
| `private_link` | The link is private or requires sign-in | Use a public link or upload the file |
| `network_error` | Network error or CORS issue | Check connection; if using a provider without browser CORS, use the optional proxy |
| `auth_error` | API key was rejected | Verify your key in Settings |

### History Panel

Last 10 lookups cached in `localStorage`. Click to re-run.

### Settings Panel (BYOK)

- Dropdown to select provider
- Input field for your free API key (stored in `localStorage`)
- "Get a free key" link per provider
- Optionally override the RapidAPI host for Shazam wrappers
- Clear storage button
- Note: keys never transmitted to this repo or any server

### Privacy Section

> **No tracking.** No analytics, no beacons, no third-party scripts.
>
> **No server logs.** Hearken is a static site served from GitHub Pages. There is no backend to log anything.
>
> **Your key stays in your browser.** Stored only in `localStorage` on your machine. Never committed to this repo.
>
> **Keys go only to the provider.** When you identify, the key is sent over HTTPS directly to the provider's own API. Nothing is relayed through Hearken.
>
> **History is local.** Your last 10 lookups are cached in `localStorage` on your device. Nothing is uploaded.

## Optional Companion Proxy

For users who'd rather not paste their key client-side, Hearken includes docs for a companion Cloudflare Worker or Vercel Edge Function. These proxies hold the key server-side, so the key never enters the browser. The proxy repo is a separate independent project.

- [Cloudflare Worker example](docs/companion-proxy/cloudflare-worker.js)
- [Vercel Edge Function example](docs/companion-proxy/vercel-edge-function.ts)

## Deployment

This project is set up for automatic deployment to [GitHub Pages](https://pages.github.com/).

1. Push to the `main` branch
2. The GitHub Actions workflow `.github/workflows/deploy.yml` builds the app and deploys to `https://<username>.github.io/hearken/`
3. (Optional) Create a `CNAME` file in `public/` for a custom domain

## Developing Locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000` to see the app in development mode.

## License

MIT