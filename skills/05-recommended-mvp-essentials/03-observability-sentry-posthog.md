---
name: observability-sentry-posthog
description: Dual-layer observability integrating Sentry for runtime exception tracking and PostHog for product telemetry, funnel analytics, and session replays.
source_repo: https://github.com/posthog/skills
license: MIT
---

# Observability, Crash Tracking & Product Telemetry

Flying without telemetry guarantees you miss user drop-offs and silent errors. Combine Sentry (technical health) with PostHog (user behavioral health).

## Sentry: Zero Swallowed Errors
- **Instrument First**: Sentry must be initialized before any application modules are imported (`instrument.ts`).
- **Contextual Breadcrumbs**: Attach user ID, workspace ID, and release commit hash to errors to diagnose issues in minutes.
- **Capture Handled Exceptions**:
  ```typescript
  try {
    await executePaymentAction();
  } catch (error) {
    Sentry.captureException(error, { extra: { workspaceId, amount } });
    throw error;
  }
  ```

## PostHog: User Funnels & Session Replay
- Enable session replays on error: When an unhandled exception occurs, PostHog links the exact video recording of the user's session to the Sentry issue.
- **Track Core Conversion Events**:
  - `user_signed_up`
  - `core_action_completed` (e.g. `project_created`)
  - `checkout_initiated`
  - `subscription_activated`
