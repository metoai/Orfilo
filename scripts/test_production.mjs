// Real Production Verification Suite
import assert from 'node:assert';

const BASE_URL = 'http://127.0.0.1:3000';

async function runTests() {
  console.log('=== ORFILO PRODUCTION INTEGRITY TEST SUITE ===\n');

  // 1. Health check
  console.log('1. Testing /api/health...');
  const healthRes = await fetch(`${BASE_URL}/api/health`);
  assert.strictEqual(healthRes.status, 200);
  const healthData = await healthRes.json();
  assert.strictEqual(healthData.status, 'healthy');
  console.log('   ✅ Health endpoint operational\n');

  // 2. Strict Auth Gating on API routes
  console.log('2. Testing Auth Gating on protected routes (no credentials)...');
  const ungatedEndpoints = [
    { url: `${BASE_URL}/api/v1/auth/me`, method: 'GET' },
    { url: `${BASE_URL}/api/v1/projects`, method: 'GET' },
    { url: `${BASE_URL}/api/v1/artifacts`, method: 'GET' },
    { url: `${BASE_URL}/api/v1/artifacts`, method: 'POST', body: JSON.stringify({ original_name: 'test.png' }) },
    { url: `${BASE_URL}/api/v1/events`, method: 'GET' },
    { url: `${BASE_URL}/api/v1/extension/pair`, method: 'POST' },
    { url: `${BASE_URL}/api/v1/extension/status`, method: 'GET' },
  ];

  for (const ep of ungatedEndpoints) {
    const res = await fetch(ep.url, {
      method: ep.method,
      headers: ep.body ? { 'Content-Type': 'application/json' } : {},
      body: ep.body,
    });
    assert.strictEqual(res.status, 401, `Expected 401 for ${ep.method} ${ep.url}, got ${res.status}`);
  }
  console.log('   ✅ All protected endpoints rejected unauthenticated requests with 401\n');

  // 3. Verify Auth Bypass is permanently ELIMINATED
  console.log('3. Testing that old bypass tokens (orf_live_*, orf_ext_*) are rejected...');
  const bypassTokens = ['orf_live_test_bypass', 'orf_ext_companion_v1', 'orf_dev_master', 'bearer_fake_token'];
  for (const token of bypassTokens) {
    const res = await fetch(`${BASE_URL}/api/v1/projects`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    assert.strictEqual(res.status, 401, `Token ${token} should have been rejected with 401, got ${res.status}`);
  }
  console.log('   ✅ All mock token bypasses successfully eliminated\n');

  // 4. Verify bad login credentials fail with 401
  console.log('4. Testing login endpoint rejection on invalid credentials...');
  const badLoginRes = await fetch(`${BASE_URL}/api/v1/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'nonexistent_test_user@example.com', password: 'WrongPassword123!' }),
  });
  assert.strictEqual(badLoginRes.status, 401);
  const badLoginData = await badLoginRes.json();
  assert.ok(badLoginData.error, 'Response must contain an error message');
  console.log('   ✅ Invalid credentials correctly returned 401 with error\n');

  // 5. Verify Extension Popup has NO hardcoded credentials
  console.log('5. Verifying extension source files for hardcoded credentials...');
  const fs = await import('node:fs');
  const popupHtml = fs.readFileSync('extension/popup.html', 'utf8');
  assert.ok(!popupHtml.includes('Orfilo2026!Secure'), 'popup.html must not contain hardcoded password');
  assert.ok(!popupHtml.includes('metoaipr@gmail.com'), 'popup.html must not contain hardcoded email');
  assert.ok(!popupHtml.includes('BYOS Connected'), 'popup.html must not contain fake BYOS banner');

  const backgroundJs = fs.readFileSync('extension/background.js', 'utf8');
  assert.ok(!backgroundJs.includes('orf_ext_companion_v1'), 'background.js must not contain default bypass key');
  assert.ok(!backgroundJs.includes('1048576'), 'background.js must not hardcode 1MB file size');
  console.log('   ✅ Extension files clean of hardcoded credentials and fake defaults\n');

  // 6. Verify Server Source has NO mock data arrays
  console.log('6. Verifying server.ts has no mock memory stores...');
  const serverCode = fs.readFileSync('server.ts', 'utf8');
  assert.ok(!serverCode.includes('dbProjects = ['), 'server.ts must not contain mock dbProjects array');
  assert.ok(!serverCode.includes('dbArtifacts = ['), 'server.ts must not contain mock dbArtifacts array');
  assert.ok(!serverCode.includes('dbAgents = ['), 'server.ts must not contain mock dbAgents array');
  assert.ok(!serverCode.includes('01234567890123456789012345678901'), 'server.ts must not contain default encryption key');
  console.log('   ✅ server.ts clean of mock arrays and hardcoded keys\n');

  console.log('🎉 ALL PRODUCTION INTEGRITY CHECKS PASSED!\n');
}

runTests().catch((err) => {
  console.error('❌ Test suite failed:', err);
  process.exit(1);
});
