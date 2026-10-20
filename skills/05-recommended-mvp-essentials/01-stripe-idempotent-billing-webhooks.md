---
name: stripe-idempotent-billing-webhooks
description: Robust Stripe integration guidelines for SaaS subscriptions, customer checkout sessions, and database-persisted idempotent webhook handling.
source_repo: https://github.com/stripe/ai/blob/main/providers/claude/plugin/skills/stripe-projects/SKILL.md
license: MIT
---

# Stripe Subscriptions & Idempotent Webhook Processing

Billing implementations break when duplicate or out-of-order webhooks desynchronize user subscription entitlements.

## Core Architectural Rules
1. **Raw Body Signature Verification**: Never parse the JSON body before verifying the Stripe webhook signature (`stripe.webhooks.constructEvent`). Signature verification requires the raw byte buffer.
2. **Database-Persisted Idempotency**: Stripe retries events for up to 72 hours. Store processed `event.id` in a database table with a unique primary key to guarantee events are processed exactly once.
3. **Handle Only Key Events**:
   - `checkout.session.completed`: Provision new subscription / customer ID.
   - `customer.subscription.updated`: Update plan tier, status (`active`, `past_due`), and billing cycle period.
   - `customer.subscription.deleted`: Revoke premium access upon cancellation.
   - `invoice.payment_failed`: Trigger warning email and update payment status.

```typescript
// ✅ Webhook Handler Pattern
export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature')!;
  
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET!);
  } catch (err) {
    return new Response('Webhook signature verification failed', { status: 400 });
  }

  // Check and record event idempotency in DB
  const alreadyHandled = await db.query.processedEvents.findFirst({ where: eq(processedEvents.id, event.id) });
  if (alreadyHandled) {
    return new Response(JSON.stringify({ received: true }), { status: 200 });
  }

  // Handle business logic...
  await recordProcessedEvent(event.id);
  return new Response(JSON.stringify({ received: true }), { status: 200 });
}
```
