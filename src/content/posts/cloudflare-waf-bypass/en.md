> Field notes · Web application security · October 2026

## Why Cloudflare blocks your proxy

When a web application sits behind Cloudflare, an authorised assessment often stalls before it starts: requests from Burp Suite or an automated scanner come back as `403` or a managed challenge, while the same site loads fine in a browser.

The reason is that Cloudflare does not look at a single header. It fingerprints the whole client across several independent layers, and a scanner that fails any one of them gets flagged. Changing the `User-Agent` alone almost never helps, because that is the easiest signal to fake and the least trusted.

## The detection layers

Cloudflare evaluates a request on several axes at once. Understanding which layer is blocking you is the whole game.

| Layer | What it inspects | Why a proxy fails |
| --- | --- | --- |
| TLS fingerprint (JA3) | Cipher suites, extensions, curves | Tools present a non-browser TLS stack |
| HTTP/2 fingerprint | Frame settings, header order | Proxies reorder or downgrade |
| User-Agent | Browser version string | Defaults to the tool name or is missing |
| IP reputation | Historical abuse score | Scanner and cloud IPs score poorly |
| JS challenge | Can the client run JavaScript | Burp cannot execute JS |

The practical takeaway: the block is rarely about content. It is about whether you *look* like a real browser end to end.

## Diagnose before you change anything

The first step is to find which layer is tripping, and `curl` is the cleanest probe because you control exactly what it sends.

1. Send a bare request with no extra headers.
2. Send the same request with a realistic browser `User-Agent`.
3. Send it again with a full browser header set (`Accept`, `Accept-Language`, `Accept-Encoding`).

If step 2 succeeds where step 1 failed, it is a simple `User-Agent` check. If step 3 is needed, the server wants a complete header set. If all three fail but a browser still works, you are looking at TLS or HTTP/2 fingerprinting, which no header edit will fix.

## Fixing it in order of effort

Work from the cheapest fix upward, and stop as soon as traffic flows.

### Match and replace in Burp

If a browser `User-Agent` is enough, a single Burp rule that rewrites `User-Agent` on every request — and strips proxy giveaways like `Via` and `X-Forwarded-For` — is all you need.

### A header sanitiser in front of the proxy

When the issue is header completeness or ordering, placing a small `mitmproxy` script downstream of Burp normalises every request to a consistent browser profile before it leaves your machine:

```python
from mitmproxy import http

BROWSER = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                  "AppleWebKit/537.36 (KHTML, like Gecko) "
                  "Chrome/132.0.0.0 Safari/537.36",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
}

class Normalise:
    def request(self, flow: http.HTTPFlow):
        for h in ("x-forwarded-for", "via", "x-forwarded-host"):
            flow.request.headers.pop(h, None)
        for k, v in BROWSER.items():
            flow.request.headers[k] = v

addons = [Normalise()]
```

### TLS fingerprinting

If the block survives clean headers, the TLS stack is the tell. A browser-impersonating client (for example `curl-impersonate`) confirms it, and a Burp extension that replays a captured browser fingerprint is the heavier fix.

## The real answer: ask first

The most reliable "bypass" is not a bypass at all.

For a legitimate engagement, the right move is to ask the client to allowlist your assessment IP in Cloudflare. It removes every layer above in one step, keeps your testing in scope, and avoids fighting a WAF that is doing exactly what it was bought to do. Reserve the technical workarounds for the cases where allowlisting genuinely is not possible — and only ever against targets you are authorised to test.
