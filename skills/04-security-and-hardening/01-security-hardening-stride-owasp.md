---
name: security-hardening-stride-owasp
description: Production-grade security engineering standards by Addy Osmani. Covers threat modeling (STRIDE), input trust boundaries, security headers, and OWASP defenses.
source_repo: https://github.com/addyosmani/agent-skills/blob/main/skills/security-and-hardening/SKILL.md
license: MIT
---

# Production Security & Hardening (STRIDE × OWASP)

Security is not a deployment checklist; it is an architectural invariant on every line of code accepting untrusted input.

## The STRIDE Threat Lens
- **Spoofing**: Impersonating users/services → Mitigation: MFA, cryptographic signatures, HTTP-only cookie sessions.
- **Tampering**: Altering data in transit or rest → Mitigation: Zod schemas, parameterized SQL queries, signed webhooks.
- **Repudiation**: Denying performed actions → Mitigation: Append-only audit logs for security and billing events.
- **Information Disclosure**: Data leakage → Mitigation: Strip password hashes, generic error messages, strict field allowlists.
- **Denial of Service**: Resource exhaustion → Mitigation: Distributed rate limiting, payload size limits (< 1MB).
- **Elevation of Privilege**: Unauthorized access → Mitigation: Row-Level Security, strict RBAC, least privilege.

## Non-Negotiable Rules
- **Never Trust Client-Side Validation**: Client validation is UX only; server-side boundary validation is mandatory.
- **HTTP-Only, Secure, SameSite Cookies**: Never store JWTs or session tokens in browser `localStorage` (vulnerable to XSS).
- **Security Headers on Every Response**:
  - `Content-Security-Policy: default-src 'self'; script-src 'self'`
  - `X-Frame-Options: DENY`
  - `X-Content-Type-Options: nosniff`
  - `Strict-Transport-Security: max-age=31536000; includeSubDomains`
