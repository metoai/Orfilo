---
name: zod-v4-boundary-validation
description: Zod v4 schema design rules, safe parsing contracts, type inference, and boundary architecture by Anivar Aravind.
source_repo: https://github.com/anivar/zod-skill
license: MIT
---

# Zod Schema Design & Ingestion Boundary Validation

Zod ensures that untrusted external payloads (JSON, query params, form inputs, webhook payloads) are parsed and sanitized before reaching domain logic.

## Critical Validation Rules
1. **Use `safeParse()` Over `parse()`**: Never let schema validation throw unhandled runtime errors in API routes. Use `safeParse()` and map errors to HTTP 422 Unprocessable Entity.
2. **Strip Unknown Properties**: Default `z.object({...})` preserves unknown keys in some versions unless strictly checked. Use `.strict()` on sensitive mutation payloads to reject unexpected fields.
3. **Async Validation Calls**: If a schema contains `.refine(async ...)` or `.superRefine(async ...)`, you MUST call `await schema.parseAsync()` or `await schema.safeParseAsync()`.

```typescript
import { z } from 'zod';

export const CreateUserSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2).max(100),
  role: z.enum(['member', 'admin']).default('member'),
}).strict();

export type CreateUserInput = z.infer<typeof CreateUserSchema>;

// Handler usage
const result = CreateUserSchema.safeParse(reqBody);
if (!result.success) {
  return Response.json({ errors: result.error.flatten().fieldErrors }, { status: 422 });
}
const validData = result.data; // Safely typed
```
