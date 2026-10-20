---
name: upstash-edge-rate-limiting
description: Distributed rate limiting at the edge using Redis and Upstash. Protects auth endpoints, AI completions, and public APIs from abuse.
source_repo: https://github.com/sickn33/antigravity-awesome-skills/blob/main/skills/upstash-ratelimit/SKILL.md
license: MIT
---

# Distributed Edge Rate Limiting with Upstash

In-memory rate limiters fail on serverless architectures because lambdas spin up and down across distributed edge nodes. Use a centralized Redis store with sliding window algorithms.

## Production Implementation
```typescript
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';

// Construct limiter at module scope to reuse ephemeral memory cache
export const authRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, '15 m'), // 5 attempts per 15 minutes
  prefix: 'ratelimit:auth',
  analytics: true,
});

export const apiRateLimiter = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(60, '1 m'), // 60 requests per minute
  prefix: 'ratelimit:api',
});
```

## Route Guard Pattern
```typescript
export async function checkRateLimit(identifier: string) {
  const { success, limit, remaining, reset } = await authRateLimiter.limit(identifier);
  if (!success) {
    return new Response(JSON.stringify({ error: 'Too many requests' }), {
      status: 429,
      headers: {
        'X-RateLimit-Limit': limit.toString(),
        'X-RateLimit-Remaining': remaining.toString(),
        'X-RateLimit-Reset': reset.toString(),
      },
    });
  }
  return null;
}
```
