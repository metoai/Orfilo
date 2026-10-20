---
name: production-backend-architecture
description: Layered architectural doctrine for production services. Enforces explicit boundaries between routes, controllers, domain services, and database repositories.
source_repo: https://github.com/agent-skills-hub/agent-skills-hub/blob/main/skills/backend-dev-guidelines/SKILL.md
license: MIT
---

# Layered Backend Architecture Doctrine

Rules for organizing backend codebases to ensure testability, auditability, and zero business logic leakage into HTTP transport layers.

## The 4-Tier Layer Hierarchy
`Routes` → `Controllers` → `Services` → `Repositories` → `Database`

1. **Routes Only Route**: Route handlers map URL patterns and HTTP verbs to controller methods. Zero database queries or domain validation belong in route files.
2. **Controllers Coordinate**: Controllers parse HTTP requests, invoke domain services, handle status code mapping, and return standardized responses.
3. **Services Decide**: All business logic, permission rules, and transaction boundaries live in services. Services are completely agnostic of HTTP (`Request`/`Response`).
4. **Repositories Access Data**: Repositories encapsulate database calls (SQL/ORM), handle connection retries, and provide clean intent-based methods (`findById`, `createWorkspace`).

## Anti-Patterns (Instant Rejection)
- ❌ Direct SQL/ORM calls inside route handlers or React components.
- ❌ Calling `process.env.*` scattered across business logic (use a centralized `env.ts` config validated with Zod).
- ❌ Swallowing exceptions with empty `catch {}` blocks or using `console.log` for production errors (pipe errors to Sentry).
