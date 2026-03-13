---
sidebar_position: 2
title: "Security Headers"
---

# Security Headers

OCFCrews sets six security headers on every HTTP response. These headers are defined in `/next.config.js` and applied to all routes via the `headers()` configuration.

## Configuration

The headers are defined as a constant array and applied to the universal route pattern `/(.*)`  so they cover every page, API endpoint, and static asset:

```js title="next.config.js"
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'X-XSS-Protection', value: '1; mode=block' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(self), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
]

const nextConfig = {
  async headers() {
    return [{ source: '/(.*)', headers: securityHeaders }]
  },
  // ...
}
```

## Header Details

### X-Content-Type-Options: nosniff

**Protects against:** MIME type sniffing attacks.

Without this header, browsers may try to "guess" the content type of a response by examining its contents rather than trusting the `Content-Type` header. An attacker could upload a file with a `.txt` extension that actually contains HTML/JavaScript, and the browser might execute it as a web page.

With `nosniff` set, the browser strictly follows the declared `Content-Type` and will not attempt to detect the content type on its own. This prevents uploaded files from being interpreted as executable content.

### X-Frame-Options: DENY

**Protects against:** Clickjacking attacks.

Clickjacking occurs when an attacker embeds the target site in a transparent `<iframe>` on a malicious page, tricking users into clicking buttons or links they cannot see. For example, an attacker could overlay an invisible OCFCrews admin panel over a decoy page, causing the user to unknowingly approve actions.

The `DENY` value completely prevents the page from being embedded in any `<iframe>`, regardless of the origin. This is the strictest setting and is appropriate because OCFCrews has no legitimate reason to be framed by another site.

### X-XSS-Protection: 1; mode=block

**Protects against:** Reflected cross-site scripting (XSS) attacks.

This header activates the browser's built-in XSS filter. When set to `1; mode=block`, the browser will stop rendering the page entirely if a reflected XSS attack is detected, rather than attempting to sanitize the page (which can itself introduce vulnerabilities).

While modern browsers have largely deprecated this filter in favor of Content Security Policy (CSP), it remains a useful defense-in-depth measure for older browsers that still support it.

### Referrer-Policy: strict-origin-when-cross-origin

**Protects against:** Referrer information leakage.

When a user clicks a link from OCFCrews to an external site, the browser normally sends a `Referer` header containing the full URL of the page they came from. This can leak sensitive information embedded in URLs (such as tokens, IDs, or query parameters).

With `strict-origin-when-cross-origin`:
- **Same-origin requests**: The full URL is sent as the referrer (normal behavior)
- **Cross-origin requests over HTTPS**: Only the origin (e.g., `https://ocfcrews.org`) is sent, stripping the path and query string
- **HTTPS to HTTP downgrade**: No referrer is sent at all

### Permissions-Policy: camera=(self), microphone=(), geolocation=()

**Protects against:** Unauthorized access to device hardware APIs.

The Permissions-Policy header (formerly Feature-Policy) controls which browser features and APIs can be used on the page. Camera access is allowed for the same origin via `camera=(self)` (used for barcode scanning in inventory management), while `microphone=()` and `geolocation=()` are set to empty allowlists, disabling those APIs for all origins.

This prevents:
- Third-party embeds or scripts from accessing the camera (only the same origin is allowed)
- Malicious scripts from activating the microphone without the user's knowledge
- Third-party embeds from requesting location data
- Future browser features from being exploitable if an XSS vulnerability were to occur

The camera is restricted to the same origin rather than fully disabled because OCFCrews uses it for barcode scanning in inventory management. Microphone and geolocation are fully disabled as they are not needed.

### Strict-Transport-Security: max-age=31536000; includeSubDomains

**Protects against:** Protocol downgrade attacks and cookie hijacking.

HTTP Strict Transport Security (HSTS) instructs browsers to only connect to the site using HTTPS for the specified duration. Once a browser receives this header:

- All future requests to the domain will automatically be upgraded to HTTPS
- The browser will refuse to connect over plain HTTP, even if the user types `http://` in the address bar
- This protection extends to all subdomains via `includeSubDomains`

The `max-age=31536000` sets this policy for one year (365 days). This prevents:
- Man-in-the-middle attacks during the initial HTTP-to-HTTPS redirect
- Session cookie theft over unencrypted connections
- SSL stripping attacks where an attacker downgrades the connection from HTTPS to HTTP

## Summary

| Header | Value | Threat Mitigated |
|--------|-------|-----------------|
| `X-Content-Type-Options` | `nosniff` | MIME type sniffing |
| `X-Frame-Options` | `DENY` | Clickjacking |
| `X-XSS-Protection` | `1; mode=block` | Reflected XSS |
| `Referrer-Policy` | `strict-origin-when-cross-origin` | URL information leakage |
| `Permissions-Policy` | `camera=(self), microphone=(), geolocation=()` | Restricts device API access (camera allowed for same origin only) |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` | Protocol downgrade / cookie hijacking |
