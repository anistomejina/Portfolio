> Tutorial · Web security assessment · October 2026

## What a TLS review is looking for

Transport security is easy to wave through because "the padlock is there", but the certificate being valid says nothing about whether the negotiation behind it is sound. A proper review asks three questions: which protocol versions the server still accepts, which cipher suites it will negotiate, and whether the certificate itself is healthy.

The fastest way to answer all three on the command line is `sslscan`, which connects to a service and enumerates exactly what it is willing to speak.

## Running sslscan

A single command gives you the full picture of a host's TLS posture.

```bash
sslscan example.com:443
```

The output walks through supported protocols (SSLv2/3, TLS 1.0–1.3), the cipher suites accepted for each, and the certificate's key size, signature algorithm and validity dates. Colour coding flags the obvious problems, but it is worth reading every section rather than trusting the highlights alone.

## Reading the protocol section

The protocol list is where legacy risk hides.

- **SSLv2 and SSLv3** should never be enabled; both are broken and their presence is an immediate finding.
- **TLS 1.0 and 1.1** are deprecated and fail most modern compliance baselines, so flag them even though browsers may still connect.
- **TLS 1.2** is acceptable when paired with strong ciphers, and **TLS 1.3** is the target state.

A server that still offers an old protocol alongside a new one is vulnerable to downgrade pressure, so "it supports 1.3" is not sufficient on its own — what matters is what it still *also* accepts.

## Reading the cipher section

Even on a modern protocol, weak ciphers undermine the whole connection.

Watch for anything offering `NULL`, `EXPORT`, `RC4`, `DES`/`3DES` or plain `CBC` suites without forward secrecy. The healthy pattern is ECDHE key exchange with AES-GCM or ChaCha20-Poly1305, which gives forward secrecy and authenticated encryption. The server's cipher *ordering* matters too: it should prefer its strong suites rather than letting the client pick.

## Turning output into a report

Findings are only useful when they map to a fix.

| Observation | Risk | Recommendation |
| --- | --- | --- |
| SSLv3 / TLS 1.0 enabled | Known protocol weaknesses | Disable; require TLS 1.2+ |
| RC4 / 3DES offered | Weak ciphers | Remove from the suite list |
| No forward secrecy | Past traffic exposed if key leaks | Prefer ECDHE suites |
| Expiring certificate | Outage and trust risk | Renew and automate rotation |

Close each item with the concrete server-config change, not just the label — a report that says "disable TLS 1.0" and names the directive is one the team can act on the same day.
