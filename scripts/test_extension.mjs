// ==============================================================================
// ORFILO CHROME EXTENSION (MANIFEST V3) END-TO-END VERIFICATION SUITE
// Tests manifest integrity, file assets, pairing, CORS, and simulated extension ingestion
// ==============================================================================

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, '..');
const EXTENSION_DIR = path.join(ROOT_DIR, 'extension');
const BASE_URL = process.env.APP_URL || 'http://localhost:3000';

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;

function pass(name, detail = '') {
  totalTests++;
  passedTests++;
  console.log(`✅ PASS: ${name}${detail ? ` (${detail})` : ''}`);
}

function fail(name, error) {
  totalTests++;
  failedTests++;
  console.error(`❌ FAIL: ${name} -> ${error}`);
}

async function runExtensionTestSuite() {
  console.log('=== ORFILO CHROME EXTENSION (MANIFEST V3) VERIFICATION SUITE ===\n');

  // ---------------------------------------------------------------------------
  // TEST 1: Manifest V3 Structure & Files Integrity
  // ---------------------------------------------------------------------------
  try {
    const manifestPath = path.join(EXTENSION_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) throw new Error('manifest.json does not exist');

    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

    if (manifest.manifest_version !== 3) {
      throw new Error(`Expected manifest_version: 3, got: ${manifest.manifest_version}`);
    }

    // Required files
    const requiredFiles = [
      manifest.action?.default_popup,
      manifest.background?.service_worker,
      ...(manifest.content_scripts?.[0]?.js || []),
      ...(manifest.content_scripts?.[0]?.css || []),
      manifest.icons?.['16'],
      manifest.icons?.['48'],
      manifest.icons?.['128'],
    ];

    for (const relPath of requiredFiles) {
      if (!relPath) continue;
      const fullPath = path.join(EXTENSION_DIR, relPath);
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Referenced asset missing: ${relPath}`);
      }
    }

    pass('Test 1: Manifest V3 Schema & Asset Integrity', `${manifest.name} v${manifest.version}`);
  } catch (err) {
    fail('Test 1: Manifest V3 Schema & Asset Integrity', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 2: Extension UI Files Validity
  // ---------------------------------------------------------------------------
  try {
    const popupHtml = fs.readFileSync(path.join(EXTENSION_DIR, 'popup.html'), 'utf8');
    const popupJs = fs.readFileSync(path.join(EXTENSION_DIR, 'popup.js'), 'utf8');
    const popupCss = fs.readFileSync(path.join(EXTENSION_DIR, 'popup.css'), 'utf8');
    const bgJs = fs.readFileSync(path.join(EXTENSION_DIR, 'background.js'), 'utf8');
    const contentJs = fs.readFileSync(path.join(EXTENSION_DIR, 'content.js'), 'utf8');

    if (!popupHtml.includes('Orfilo') || !popupHtml.includes('btnCaptureTab')) {
      throw new Error('popup.html missing expected action buttons');
    }
    if (!popupHtml.includes('view-auth') || !popupHtml.includes('btnConnectWorkspace')) {
      throw new Error('popup.html missing Auth Gate elements');
    }
    if (!popupJs.includes('CAPTURE_ARTIFACT')) {
      throw new Error('popup.js missing CAPTURE_ARTIFACT message handler');
    }
    if (!popupJs.includes('DISCONNECT_WORKSPACE') || !popupJs.includes('VALIDATE_AND_CONNECT')) {
      throw new Error('popup.js missing Auth Gate actions');
    }
    if (!bgJs.includes('chrome.downloads.onCreated')) {
      throw new Error('background.js missing download interceptor');
    }
    if (!contentJs.includes('FINALITY_SIGNALS')) {
      throw new Error('content.js missing finality signals detector');
    }

    pass('Test 2: Extension UI & Feature Handlers', 'Popup Auth Gate + Capture + Service Worker + In-page Observer');
  } catch (err) {
    fail('Test 2: Extension UI & Feature Handlers', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 3: Companion Extension Pairing Endpoint (POST /api/v1/extension/pair)
  // ---------------------------------------------------------------------------
  let pairingToken = '';
  try {
    const res = await fetch(`${BASE_URL}/api/v1/extension/pair`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ client: 'Orfilo Test Companion' }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !json.token || !json.token.startsWith('orf_ext_')) {
      throw new Error(`Invalid pairing token returned: ${JSON.stringify(json)}`);
    }

    pairingToken = json.token;
    pass('Test 3: Extension Workspace Pairing Endpoint', `Token: ${pairingToken}`);
  } catch (err) {
    fail('Test 3: Extension Workspace Pairing Endpoint', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 4: Companion Extension Status (GET /api/v1/extension/status)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/extension/status`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || json.status !== 'connected' || json.manifest_version !== 3) {
      throw new Error(`Unexpected status payload: ${JSON.stringify(json)}`);
    }

    pass('Test 4: Extension Status Endpoint', `Status: ${json.status}, MV3: ${json.manifest_version}`);
  } catch (err) {
    fail('Test 4: Extension Status Endpoint', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 5: Extension CORS Preflight (OPTIONS /api/v1/artifacts)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'OPTIONS',
      headers: {
        Origin: 'chrome-extension://orfilo-smart-capture-verifier',
        'Access-Control-Request-Method': 'POST',
        'Access-Control-Request-Headers': 'authorization,content-type',
      },
    });

    if (res.status !== 204 && res.status !== 200) {
      throw new Error(`CORS preflight returned HTTP ${res.status}`);
    }

    const allowOrigin = res.headers.get('access-control-allow-origin');
    if (!allowOrigin || (allowOrigin !== '*' && !allowOrigin.includes('chrome-extension://'))) {
      throw new Error(`Invalid Access-Control-Allow-Origin: ${allowOrigin}`);
    }

    pass('Test 5: Extension CORS Preflight', `Allowed Origin: ${allowOrigin}`);
  } catch (err) {
    fail('Test 5: Extension CORS Preflight', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 6: Code Snippet Capture via Extension Token (POST /api/v1/artifacts)
  // ---------------------------------------------------------------------------
  let artifactId = '';
  try {
    const res = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pairingToken || 'orf_ext_test_runner'}`,
        Origin: 'chrome-extension://orfilo-smart-capture-verifier',
        'x-source-client': 'orfilo-chrome-extension-v1',
      },
      body: JSON.stringify({
        filename: 'meto_defect_classifier.py',
        display_name: 'Meto Defect Classifier',
        source_type: 'browser_extension',
        source_name: 'ChatGPT Web Extension',
        mime_type: 'text/x-python',
        size_bytes: 4096,
        source_url: 'https://chatgpt.com/c/session_meto_qa',
        context_prompt: 'High-speed edge camera defect detection model script',
        content_preview: 'import cv2\nimport numpy as np\ndef detect_defects(): pass',
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success || !json.data?.id) {
      throw new Error(`Invalid ingestion response: ${JSON.stringify(json)}`);
    }

    artifactId = json.data.id;
    pass('Test 6: In-Chat Code Capture', `ID: ${artifactId}, Target: ${json.suggestion?.suggested_location}`);
  } catch (err) {
    fail('Test 6: In-Chat Code Capture', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 7: Download Interceptor Simulation (POST /api/v1/artifacts)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pairingToken || 'orf_ext_test_runner'}`,
        Origin: 'chrome-extension://orfilo-smart-capture-verifier',
      },
      body: JSON.stringify({
        filename: 'image_98231_final.png',
        display_name: 'image_98231_final.png',
        source_type: 'browser_extension',
        source_name: 'Midjourney (Smart Intercept)',
        mime_type: 'image/png',
        size_bytes: 1048576,
        source_url: 'https://cdn.midjourney.com/exports/image_98231.png',
        context_prompt: 'Intercepted raw download filename from Midjourney tab',
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success) throw new Error(`Download intercept failed: ${JSON.stringify(json)}`);
    pass('Test 7: Download Interception Ingestion', `Clean Name: ${json.suggestion?.suggested_name}`);
  } catch (err) {
    fail('Test 7: Download Interception Ingestion', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 8: Finality Signal Deliverable Simulation
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${pairingToken || 'orf_ext_test_runner'}`,
        Origin: 'chrome-extension://orfilo-smart-capture-verifier',
      },
      body: JSON.stringify({
        filename: 'orfilo_smart_capture_spec.ts',
        display_name: 'orfilo_smart_capture_spec.ts',
        source_type: 'browser_extension',
        source_name: 'Claude Extension (Finality Pill)',
        mime_type: 'text/typescript',
        size_bytes: 2048,
        source_url: 'https://claude.ai/chat/orfilo_spec',
        context_prompt: 'Captured via Orfilo Finality Signal detector: "Looks good, use this version"',
      }),
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!json.success) throw new Error(`Finality pill ingestion failed: ${JSON.stringify(json)}`);
    pass('Test 8: Finality Signal Capture', `Organized to: ${json.suggestion?.suggested_location}`);
  } catch (err) {
    fail('Test 8: Finality Signal Capture', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 9: Extension Projects Discovery (GET /api/v1/projects)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/projects`, {
      headers: {
        Authorization: `Bearer ${pairingToken || 'orf_ext_test_runner'}`,
      },
    });

    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    if (!Array.isArray(json.data) || json.data.length === 0) {
      throw new Error(`Expected projects list, got: ${JSON.stringify(json)}`);
    }

    pass('Test 9: Extension Projects Sync', `Discovered ${json.data.length} projects`);
  } catch (err) {
    fail('Test 9: Extension Projects Sync', err.message);
  }

  // ---------------------------------------------------------------------------
  // TEST 10: Inbound Request Log Verification (GET /api/v1/inbound-requests)
  // ---------------------------------------------------------------------------
  try {
    const res = await fetch(`${BASE_URL}/api/v1/inbound-requests`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const extensionLog = json.data?.find((log) => log.source_ai?.includes('EXTENSION') || log.endpoint === '/api/v1/artifacts');
    if (!extensionLog) {
      throw new Error('No extension capture log found in dbInboundRequests');
    }

    pass('Test 10: Extension Traffic Log Verification', `Log ID: ${extensionLog.id}`);
  } catch (err) {
    fail('Test 10: Extension Traffic Log Verification', err.message);
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  console.log('\n=== TEST RUN SUMMARY ===');
  console.log(`Passed: ${passedTests}/${totalTests}`);
  if (failedTests > 0) {
    console.error(`❌ FAILED: ${failedTests} tests failed.`);
    process.exit(1);
  } else {
    console.log('🎉 ALL 10 EXTENSION TEST SUITES PASSED - COMPANION EXTENSION READY FOR PRODUCTION!\n');
    process.exit(0);
  }
}

runExtensionTestSuite().catch((err) => {
  console.error('Fatal test error:', err);
  process.exit(1);
});
