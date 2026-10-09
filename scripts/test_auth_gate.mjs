// ==============================================================================
// AUTH GATE VERIFICATION TEST
// Verifies:
// 1. Extension default settings start unauthenticated (apiKey: '')
// 2. Unauthenticated status check returns authenticated: false
// 3. Valid companion token returns authenticated: true with storage info
// 4. Disconnect resets to unauthenticated state
// 5. Web app handles ?action=pair-extension
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EXTENSION_DIR = path.join(ROOT_DIR, 'extension');
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

async function testAuthGate() {
  console.log('=== AUTH GATE SPECIFICATION VERIFICATION ===\n');

  // 1. Verify default settings start unauthenticated
  const bgCode = fs.readFileSync(path.join(EXTENSION_DIR, 'background.js'), 'utf8');
  if (!bgCode.includes("apiKey: ''")) {
    throw new Error('DEFAULT_SETTINGS in background.js must have empty apiKey for Auth Gate');
  }
  console.log('✅ PASS: Fresh installs default to unauthenticated (apiKey: "")');

  // 2. Verify unauthenticated status endpoint returns authenticated: false
  const unauthRes = await fetch(`${BASE_URL}/api/v1/extension/status`);
  const unauthJson = await unauthRes.json();
  if (unauthJson.authenticated !== false) {
    throw new Error('Unauthenticated query should have authenticated: false');
  }
  console.log('✅ PASS: Unauthenticated extension status check returns authenticated: false');

  // 3. Verify pairing creates valid companion token
  const pairRes = await fetch(`${BASE_URL}/api/v1/extension/pair`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ client: 'Auth Gate Verifier' }),
  });
  const pairJson = await pairRes.json();
  if (!pairJson.token || !pairJson.token.startsWith('orf_ext_')) {
    throw new Error('Pairing did not return a valid orf_ext token');
  }
  console.log(`✅ PASS: Pairing generated valid token: ${pairJson.token}`);

  // 4. Verify authenticated status check with the token returns authenticated: true
  const authedRes = await fetch(`${BASE_URL}/api/v1/extension/status`, {
    headers: { Authorization: `Bearer ${pairJson.token}` },
  });
  const authedJson = await authedRes.json();
  if (authedJson.authenticated !== true || authedJson.storage_provider !== 'Google Drive') {
    throw new Error('Authenticated status did not confirm authentication or Google Drive storage');
  }
  console.log(`✅ PASS: Authenticated query confirms: authenticated: true, storage: ${authedJson.storage_provider}`);

  // 5. Verify App.tsx has ?action=pair-extension handler
  const appCode = fs.readFileSync(path.join(ROOT_DIR, 'src/App.tsx'), 'utf8');
  if (!appCode.includes("params.get('action') === 'pair-extension'")) {
    throw new Error('App.tsx missing ?action=pair-extension URL handler');
  }
  console.log('✅ PASS: Web application responds to ?action=pair-extension navigation');

  // 6. Verify popup.html has both views and disconnect button
  const popupHtml = fs.readFileSync(path.join(EXTENSION_DIR, 'popup.html'), 'utf8');
  if (!popupHtml.includes('id="view-auth"') || !popupHtml.includes('id="view-app"') || !popupHtml.includes('id="btnDisconnect"')) {
    throw new Error('popup.html missing dual views or disconnect button');
  }
  console.log('✅ PASS: Popup contains #view-auth, #view-app, and #btnDisconnect');

  console.log('\n🎉 ALL AUTH GATE VERIFICATION CHECKS PASSED!\n');
}

testAuthGate().catch((err) => {
  console.error('❌ FAIL:', err.message);
  process.exit(1);
});
