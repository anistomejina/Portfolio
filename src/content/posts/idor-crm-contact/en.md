> Write-up · Broken object-level authorization (CWE-639) · August 2026

## Summary

A business-management mobile API returned the internal CRM Contact ID tied to a supplied business-user identifier without checking that the authenticated caller was allowed to see that object. Any logged-in business user could swap in another user's encoded ID and read their internal CRM Contact ID.

The endpoint was, in generalised form:

```http
GET /business_user/{business_user_id}/crm_contact_id/v1
```

Authentication was enforced, but object-level authorization was not. The report was triaged **Medium** (CVSS 5.0) and rewarded after the fix landed. Everything here is generalised with redacted identifiers — the real host, IDs and session tokens never appear.

## Root cause

The server trusted the user-controlled `business_user_id` path parameter to choose which CRM-contact object to return, and then returned it without an ownership check.

It did do *some* validation: it required a session, and it rejected malformed IDs. What it never asked was the question that actually mattered — is *this* caller entitled to *this* object? That gap is the textbook shape of Broken Object Level Authorization (BOLA / IDOR): the identifier comes from the client, and the server hands back the data without confirming the caller's relationship to it.

## Reproduction

The whole proof rests on two unrelated accounts and a single swapped path segment.

1. Set up two business accounts, A and B, with no relationship — not the same business, not team members.
2. Authenticated as A, request B's object by putting B's `business_user_id` in the path.
3. The server returns `200 OK` with B's internal CRM Contact ID.
4. Confirm it is a real cross-user read: A reading A's own ID returns A's contact ID; A reading B's ID returns a *different*, B-specific one. Distinct values prove it is not just echoing the caller's own data.
5. The same works B → A, so the flaw is bidirectional and repeatable.

Two guardrails framed the severity precisely:

```text
No session token          → 401 (authentication required)
Invalid/random ID         → 400 (must be a real encoded ID)
Valid victim ID + any session → 200 before the fix
```

So this was an *authenticated* IDOR needing valid victim IDs — not an anonymous dump.

## Impact

Any authenticated business user could resolve arbitrary other users' internal CRM Contact IDs, given valid `business_user_id` values.

On its own the leaked value was an internal identifier, not direct PII — no name, email or phone in the response. The severity rose to Medium because those business-user IDs were reportedly exposed elsewhere (review responses, message threads, team invites), which made bulk collection and large-scale CRM cross-referencing realistic. It is a good reminder that an "only an internal ID" bug is scored by what the ID unlocks and how easily the inputs are harvested, not by the single response in isolation.

## Remediation and timeline

The fix was exactly the missing check: authorize the caller against the requested object.

After remediation, self-reads still returned `200`, cross-user reads returned `403 Forbidden`, missing auth stayed `401`, and invalid IDs stayed `400` — verified against the same two accounts used in the original report.

| Date | Event |
| --- | --- |
| 2026-07-11 | Report submitted with PoC |
| 2026-07-14 | Triaged |
| 2026-07-22 | Fix shipped, bounty awarded |
| 2026-07-23 | Re-tested; cross-user read now `403` |

The lesson I take from it: authentication tells you *who is calling*; authorization tells you *what they may touch*. BOLA lives entirely in the gap between those two, and every object-ID endpoint needs the second check, not just the first.
