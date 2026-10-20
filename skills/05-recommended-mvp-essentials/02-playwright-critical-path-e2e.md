---
name: playwright-critical-path-e2e
description: Focused end-to-end testing with Playwright TypeScript. Concentrates strictly on high-value business flows (auth, payment, core action) rather than low-ROI unit tests.
source_repo: https://github.com/fugazi/test-automation-skills-agents/blob/main/skills/playwright-e2e-testing/SKILL.md
license: MIT
---

# Playwright Critical-Path E2E Testing

For early-stage SaaS MVPs, deep unit test suites slow down iteration. E2E smoke tests on the 3 critical money flows protect revenue with minimal maintenance.

## The 3 Critical Flows to Test
1. **Authentication Flow**: Sign up with email/password → Verify session cookie exists → Access dashboard.
2. **Core Value Action**: Create a project/resource → Confirm row appears in list.
3. **Billing Checkout Redirection**: Click upgrade button → Verify redirect to Stripe checkout.

## Locator & Assertion Best Practices
- **Use Role-Based Locators**: Always use `page.getByRole('button', { name: 'Submit' })` or `page.getByLabel('Email')`. Never use brittle CSS or XPath selectors.
- **Web-First Auto-Retrying Assertions**: Use `await expect(page.getByRole('alert')).toBeVisible()`. Never write arbitrary `page.waitForTimeout(2000)` sleeps.

```typescript
import { test, expect } from '@playwright/test';

test.describe('Critical User Path', () => {
  test('User can register, create workspace, and reach billing', async ({ page }) => {
    await test.step('Register account', async () => {
      await page.goto('/signup');
      await page.getByLabel('Work Email').fill('testuser@acme.com');
      await page.getByLabel('Password').fill('SuperSecretPass123!');
      await page.getByRole('button', { name: 'Create Account' }).click();
      await expect(page).toHaveURL(/.*dashboard/);
    });

    await test.step('Create workspace', async () => {
      await page.getByRole('button', { name: 'New Workspace' }).click();
      await page.getByLabel('Workspace Name').fill('Acme Corp');
      await page.getByRole('button', { name: 'Save' }).click();
      await expect(page.getByText('Acme Corp')).toBeVisible();
    });
  });
});
```
