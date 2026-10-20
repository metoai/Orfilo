---
name: hono-edge-routing-zod
description: Type-safe edge APIs with Hono, request validation via @hono/zod-validator, end-to-end RPC client inference, and structured error handling.
source_repo: https://github.com/secondsky/claude-skills/blob/main/plugins/hono-routing/skills/hono-routing/SKILL.md
license: MIT
---

# Type-Safe Edge APIs with Hono & Zod

Hono provides sub-millisecond route handling across Node.js, Bun, Cloudflare Workers, and Vercel Edge with zero dependencies and full TypeScript inference.

## Critical Architectural Rules
1. **Always Return Responses**: In Hono, handlers return the response (`return c.json(...)`), unlike Express which calls `res.send()`.
2. **Access Data via `c.req.valid()`**: Never access raw `await c.req.json()` after applying validation middleware. Always extract typed, sanitized data via `c.req.valid('json')`.
3. **Structured Exceptions**: Throw `HTTPException` from `@hono/http-exception` for early returns inside middleware and domain logic.

```typescript
import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { HTTPException } from 'hono/http-exception';
import { z } from 'zod';

const createWorkspaceSchema = z.object({
  name: z.string().min(2).max(50),
  slug: z.string().regex(/^[a-z0-9-]+$/),
});

const app = new Hono()
  .post('/workspaces', zValidator('json', createWorkspaceSchema), async (c) => {
    const { name, slug } = c.req.valid('json'); // 100% typed & validated
    const user = c.get('user');
    if (!user) {
      throw new HTTPException(401, { message: 'Unauthorized' });
    }
    return c.json({ success: true, workspace: { id: 'ws_123', name, slug } }, 201);
  });

// Export type definition for frontend RPC client consumption
export type AppType = typeof app;
export default app;
```

## Client RPC Consumption
```typescript
import { hc } from 'hono/client';
import type { AppType } from '@/server/api';

const client = hc<AppType>('https://api.domain.com');
const res = await client.workspaces.$post({ json: { name: 'Acme', slug: 'acme' } });
const data = await res.json();
```
