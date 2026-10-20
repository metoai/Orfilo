---
name: supabase-architecture-rls
description: Production Supabase guidelines covering Row-Level Security (RLS) anti-patterns, declarative schemas, migration integrity, and secure server-side client configurations.
source_repo: https://github.com/supabase/agent-skills/blob/main/skills/supabase/SKILL.md
license: MIT
---

# Supabase Architecture & Row-Level Security (RLS)

Strict guidelines for database modeling, authorization enforcement, and client usage with Supabase and PostgreSQL.

## Critical Security Guardrails
1. **Never Authorize with `raw_user_meta_data`**: User metadata in `auth.jwt()` is user-editable via the client SDK. Always place trusted roles and billing tiers in `raw_app_meta_data` (`app_metadata`).
2. **Never Rely on `TO authenticated` Alone**: `TO authenticated` is authentication, NOT authorization. It causes Broken Object Level Authorization (BOLA/IDOR). Always pair `TO authenticated` with a row-ownership predicate in `USING`.
3. **UPDATE Policies Require Both `USING` and `WITH CHECK`**: Without `WITH CHECK`, an authorized user can reassign the row's `user_id` to another account.

```sql
-- ✅ Production-Grade RLS Policy
alter table public.workspaces enable row level security;

create policy "Users can update their own workspaces"
on public.workspaces
for update
to authenticated
using ( (select auth.uid()) = owner_id )
with check ( (select auth.uid()) = owner_id );
```

4. **Security Definer Function Traps**: `SECURITY DEFINER` functions execute with the owner's privileges (bypassing RLS). Always set `SECURITY INVOKER` by default. If `SECURITY DEFINER` is required, place it in a private schema and explicitly check `auth.uid()`.
5. **Postgres Views Bypass RLS by Default**: On Postgres 15+, always declare views with `WITH (security_invoker = true)`.

## Declarative vs Imperative Migrations
- Use `supabase migration new <name>` to author reproducible SQL files.
- Run `supabase db advisors` to detect missing indexes, exposed security definer functions, or broken RLS rules prior to deployment.
