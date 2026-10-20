---
name: drizzle-orm-patterns-migrations
description: Drizzle ORM best practices, migration safety, schema inference with drizzle-zod, array column syntax, and zero-cold-start queries.
source_repo: https://github.com/BarisSozen/claude/blob/main/.claude/skills/pitfalls-drizzle-orm/SKILL.md?plain=1
license: MIT
---

# Drizzle ORM Production Patterns & Migration Safety

Drizzle ORM provides maximum type safety with minimal runtime abstraction. Follow these rules to avoid migration lockouts and runtime type desynchronization.

## Schema Modeling Standards
- **Never Change Primary Key Types in Production**: Altering `serial` to `varchar` or `varchar` to `uuid` breaks foreign key constraints and requires full table locks.
- **Array Column Syntax**: In Postgres schemas, always use the chained `.array()` method:
  ```typescript
  // ✅ Correct
  tags: text('tags').array().notNull().default([])
  // ❌ Incorrect (causes runtime compilation errors)
  tags: array(text('tags'))
  ```
- **Type Inference Contract**: Always export `$inferSelect` and `$inferInsert` types next to table definitions.

```typescript
import { pgTable, text, timestamp, uuid } from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';

export const projects = pgTable('projects', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  ownerId: uuid('owner_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export type Project = typeof projects.$inferSelect;
export type NewProject = typeof projects.$inferInsert;

export const insertProjectSchema = createInsertSchema(projects);
export const selectProjectSchema = createSelectSchema(projects);
```

## Migration Workflow
- For development: use `drizzle-kit push` for rapid iteration.
- For staging and production: ALWAYS generate migration files via `drizzle-kit generate` and apply them with `drizzle-kit migrate`. Never run `--force` in production environments without a verified backup.
