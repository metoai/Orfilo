---
name: postgres-query-connection-tuning
description: Postgres query tuning, missing index identification, connection pool sizing, and N+1 prevention maintained by Supabase.
source_repo: https://github.com/openai/plugins/blob/main/plugins/build-web-apps/skills/supabase-best-practices/SKILL.md
license: MIT
---

# PostgreSQL Query Tuning & Connection Optimization

Slowness in full-stack applications is almost never language execution time; it is database roundtrips, unindexed filters, and starved connection pools.

## Priority Checklist (Ranked by Impact)

### 1. Missing Indexes on Foreign Keys & Filters (CRITICAL)
- Every column appearing in a `WHERE`, `JOIN ... ON`, or `ORDER BY` clause MUST be indexed.
- Columns used in Row-Level Security predicates (e.g. `user_id`, `organization_id`) must have composite indexes.
- **Partial Indexes**: For status-driven tables, index only the active rows:
  ```sql
  create index idx_orders_unfulfilled on orders (created_at desc) where status = 'pending';
  ```

### 2. Connection Pool Management (CRITICAL)
- Serverless functions (Vercel, AWS Lambda) instantiate new processes rapidly, easily exhausting Postgres's connection ceiling (e.g., max 100 connections).
- Always connect serverless runtimes via a Transaction Connection Pooler (PgBouncer or Supavisor on port `6543`), not the direct database connection (port `5432`).
- Disable prepared statements when using transaction poolers (`prepare: false`).

### 3. Eliminating N+1 Query Cascades
- Never run database queries inside a `.map()` or `.forEach()` loop.
- Use SQL `JOIN`, batch fetching (`WHERE id IN (...)`), or Drizzle's relational query API (`with: { items: true }`).
