---
name: better-auth-session-security
description: Configuration and session hardening for Better Auth in TypeScript full-stack applications. Covers CSRF protection, secure cookie storage, and database adapters.
source_repo: https://github.com/better-auth/skills/blob/main/better-auth/best-practices/SKILL.md
license: MIT
---

# Better Auth Session Security & Best Practices

Better Auth provides TypeScript-first authentication with strict cryptographic defaults.

## Configuration & Secret Hygiene
- **`BETTER_AUTH_SECRET`**: Minimum 32-character high-entropy secret (`openssl rand -base64 32`). Never commit secrets to git.
- **Trusted Origins**: Explicitly list all client URLs in `trustedOrigins` to block Cross-Site Request Forgery (CSRF). Never wildcard `*` with credentials.
- **Cookie Security**:
  ```typescript
  import { betterAuth } from 'better-auth';
  import { drizzleAdapter } from 'better-auth/adapters/drizzle';
  import { db } from '@/db';

  export const auth = betterAuth({
    database: drizzleAdapter(db, { provider: 'pg' }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    session: {
      expiresIn: 60 * 60 * 24 * 7, // 7 days
      updateAge: 60 * 60 * 24, // Refresh token once per day
      cookieCache: { enabled: true, maxAge: 5 * 60 },
    },
    advanced: {
      useSecureCookies: process.env.NODE_ENV === 'production',
    },
  });
  ```

## Session Invalidation
- Changing passwords or updating email MUST revoke all existing sessions in the database (`auth.api.revokeSessions`).
