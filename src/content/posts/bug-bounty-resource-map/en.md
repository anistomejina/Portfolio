> Reference · Bug bounty & web security · October 2026

## How I use this map

This is the reference I keep open during web application testing: a by-category index of techniques and tools so that when I hit a given surface, I already know where to look. It is organised by vulnerability class rather than by tool, because on a live target you start from "what is this feature" and work toward "what could go wrong here".

Treat everything below as pointers for authorised testing only. The value is in the structure — knowing that a login page, an upload form and a support ticket each have their own well-worn checklist.

## Reconnaissance and enumeration

Recon decides how much attack surface you ever see, so it is worth doing properly before touching a single parameter.

- **Subdomain discovery:** combine passive sources and brute force — [Subfinder](https://github.com/projectdiscovery/subfinder), [Amass](https://github.com/OWASP/Amass) and [Assetfinder](https://github.com/tomnomnom/assetfinder) cover most ground between them.
- **DNS checks:** look for zone-transfer misconfigurations and stale records that point at takeable infrastructure.
- **JavaScript analysis:** client-side JS leaks endpoints and tokens; [LinkFinder](https://github.com/GerbenJavado/LinkFinder) pulls paths out of bundles and a change monitor catches new ones over time.

## Authentication and account flows

Auth is where logic bugs cluster, and most of them follow repeatable checklists.

- **Login, SSO and password reset** each have their own test path: credential handling, token predictability, host-header poisoning on reset links, and SSO assertion tampering.
- **Two-factor bypass** usually comes down to response manipulation, rate-limit gaps or flows that forget to re-check the second factor.
- **Email verification** is worth probing for cases where an unverified address still gains trust.

## Injection and server-side classes

These are the high-impact findings, and each has a canonical reference worth internalising.

- **SQL injection:** work from a structured checklist rather than firing payloads blindly.
- **SSRF:** [the SSRF bible](https://portswigger.net/web-security/ssrf) and cloud-metadata escalation paths turn a blind request into an account compromise.
- **SSTI:** PortSwigger's [server-side template injection](https://portswigger.net/web-security/server-side-template-injection) guide maps the detection-to-RCE chain cleanly.
- **File upload:** unrestricted uploads lead to stored XSS or RCE depending on how the file is served.

## Client-side and content issues

- **XSS** through file upload, parameter pollution or filter gaps remains the most common reportable class.
- **CSV injection** and **cross-site WebSocket hijacking** are easy to overlook and often out of a team's muscle memory.
- **GraphQL** endpoints deserve their own pass — introspection, batching and authorisation at the resolver level.

## Keeping the map alive

A resource map is only useful if it reflects what you actually reach for.

I prune links that go stale and add write-ups that taught me something new, so the index stays short enough to scan under time pressure. The goal is not completeness — it is that during an engagement I spend my attention on the target, not on remembering where the checklist lives.
