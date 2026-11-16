# Security Policy

## Supported Versions

| Version | Supported |
|---------|-----------|
| Latest (main) | ✅ |
| Older versions | ❌ |

## Reporting a Vulnerability

**Please do NOT open a public issue for security vulnerabilities.**

Instead, report security issues privately via:

- **Email**: security@functionpsi.example.com (replace with actual email)
- **GitHub Security Advisories**: Use the "Report a vulnerability" tab on this repository

### What to Include

- Description of the vulnerability
- Steps to reproduce
- Potential impact
- Any suggested fixes (if known)

### Response Timeline

- **Acknowledgment**: Within 48 hours
- **Initial assessment**: Within 7 days
- **Fix timeline**: Depends on severity (typically 30-90 days)

## Security Model

### Threat Model

Hearken is a **static, client-side-only** application. The attack surface is limited to:

1. **Client-side code execution** (XSS, CSP bypass)
2. **API key handling** (localStorage exposure, transmission)
3. **Third-party provider APIs** (data sent to providers)
4. **Supply chain** (npm dependencies, build process)

### Mitigations

| Threat | Mitigation |
|--------|------------|
| XSS | Strict CSP, no `dangerouslySetInnerHTML`, React auto-escaping |
| API key theft | Keys stored in `localStorage` only; never logged, never sent to Hearken |
| Key in transit | HTTPS only; keys sent directly to provider APIs |
| Malicious deps | `npm audit` in CI, pinned dependencies, minimal dependency tree |
| Build tampering | GitHub Actions with pinned action versions, provenance attestation |

### What Hearken Does NOT Do

- ❌ No analytics, tracking, or telemetry
- ❌ No server-side logging or data collection
- ❌ No third-party scripts (except Google Fonts, preconnected)
- ❌ No cookies
- ❌ No API key transmission to Hearken infrastructure
- ❌ No audio file storage or forwarding

## Secure Deployment

### GitHub Pages (Recommended)

- Enable **GitHub Actions** as Pages source (not "Deploy from branch")
- Enforce **HTTPS** (enabled by default)
- Use **custom domain** with CAA records if needed

### Self-Hosted Static Hosting

```bash
npm run build
# Deploy ./dist to any static host (Netlify, Vercel, Cloudflare Pages, etc.)
```

Ensure your host:
- Serves over HTTPS only
- Sets `Content-Security-Policy` header
- Does not inject scripts

## Dependency Security

```bash
# Audit dependencies
npm audit

# Fix vulnerabilities (if any)
npm audit fix

# Check for outdated packages
npm outdated
```

Dependencies are intentionally minimal:
- **Runtime**: React, React DOM, Lucide React, clsx, tailwind-merge
- **Dev**: Vite, TypeScript, Tailwind, Vitest, ESLint, Prettier

## Content Security Policy

The deployed site includes a CSP via GitHub Pages headers. For self-hosting, add:

```html
<meta http-equiv="Content-Security-Policy"
  content="default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self' https://api.audd.io https://*.acrcloud.com https://*.rapidapi.com;">
```

Adjust `connect-src` for your chosen provider(s).

## Privacy Considerations

- **No personal data collected** — Hearken doesn't know who you are
- **API keys are yours** — You provide them, you control them
- **Audio stays local** — Unless you upload to a provider
- **History is local** — `localStorage` only, never synced

## Contact

For security questions or concerns not covered here, open a GitHub Discussion or contact the maintainers directly.