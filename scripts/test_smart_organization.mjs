import assert from 'node:assert';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const BASE_URL = 'http://127.0.0.1:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function run() {
  console.log('=== TESTING INTELLIGENT ORGANIZATION ENGINE ===\n');

  const testUserId = 'ac916334-06e2-48a8-b8c7-645a27b40c8d';
  console.log(`Using verified test user: metoaipr@gmail.com (${testUserId})`);

  // Generate a valid extension token
  const rawToken = 'orf_test_' + crypto.randomBytes(16).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  // Insert extension connection directly
  const { data: conn, error: connErr } = await supabase
    .from('integration_connections')
    .insert({
      user_id: testUserId,
      provider: 'browser_extension',
      access_token_hash: tokenHash,
      status: 'connected',
    })
    .select()
    .single();

  if (connErr) throw new Error('Failed to create test extension connection: ' + connErr.message);

  const testSessionUrl = `https://chatgpt.com/c/test-session-${Date.now()}`;
  let firstProjectId = null;
  const createdArtifactIds = [];

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Capture 1 (Auto-Create Project, Intelligent Rename, Subfolder UI Mockups)
    // -------------------------------------------------------------------------
    console.log('\n--- 1. Testing First Capture (New Topic -> Auto-Create Project & Rename) ---');
    const startT1 = Date.now();
    const res1 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'image-1791748063.png',
        mime_type: 'image/png',
        extension: 'png',
        size_bytes: 254120,
        source_name: 'ChatGPT',
        source_url: testSessionUrl,
        conversation_title: 'Fintech Mobile App Redesign - ChatGPT',
        context_prompt: 'Create a modern dark mode banking dashboard UI with balance and spending transactions',
        alt_text: 'A modern dark mode neo-banking dashboard UI with spending charts',
      }),
    });

    const elapsed1 = Date.now() - startT1;
    assert.strictEqual(res1.status, 201, `Expected 201, got ${res1.status}`);
    const json1 = await res1.json();
    const item1 = json1.data;
    const org1 = json1.organization;

    console.log(`   Response status: ${res1.status} in ${elapsed1}ms`);
    console.log(`   Display Name: "${item1.display_name}"`);
    console.log(`   Original File: "${item1.original_name}"`);
    console.log(`   Project Name: "${org1.project_name}" (Created: ${org1.project_created})`);
    console.log(`   Provider Path: "${item1.provider_path}"`);
    console.log(`   Category / Subfolder: ${org1.category} / ${org1.subfolder}`);
    console.log(`   Execution Time: ${org1.execution_time_ms}ms`);

    createdArtifactIds.push(item1.id);
    firstProjectId = org1.project_id;

    assert.ok(org1.project_created, 'Project should have been auto-created');
    assert.strictEqual(org1.project_name, 'Fintech Mobile App Redesign');
    assert.ok(!item1.display_name.includes('image-1791748063'), 'Should NOT be generic image name');
    assert.ok(item1.display_name.toLowerCase().includes('dark mode') || item1.display_name.toLowerCase().includes('banking'), 'Should have semantic name');
    assert.strictEqual(org1.category, 'Visuals');
    assert.strictEqual(org1.subfolder, 'UI Mockups');
    console.log('   ✅ Test 1 Passed: Renamed, Project Auto-Created, Placed in UI Mockups\n');

    // -------------------------------------------------------------------------
    // TEST 2: Capture 2 (Same Conversation URL -> Correlate into Existing Project!)
    // -------------------------------------------------------------------------
    console.log('--- 2. Testing Second Capture from SAME Conversation URL ---');
    const startT2 = Date.now();
    const res2 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'image-1791748099.png',
        mime_type: 'image/png',
        extension: 'png',
        size_bytes: 84320,
        source_name: 'ChatGPT',
        source_url: testSessionUrl,
        conversation_title: 'Fintech Mobile App Redesign - ChatGPT',
        context_prompt: 'Generate an embossed metallic debit card icon for the brand',
        alt_text: 'A sleek titanium debit card icon with embossed logo',
      }),
    });

    const elapsed2 = Date.now() - startT2;
    assert.strictEqual(res2.status, 201, `Expected 201, got ${res2.status}`);
    const json2 = await res2.json();
    const item2 = json2.data;
    const org2 = json2.organization;

    console.log(`   Response status: ${res2.status} in ${elapsed2}ms`);
    console.log(`   Display Name: "${item2.display_name}"`);
    console.log(`   Original File: "${item2.original_name}"`);
    console.log(`   Project Name: "${org2.project_name}" (Created: ${org2.project_created})`);
    console.log(`   Provider Path: "${item2.provider_path}"`);
    console.log(`   Category / Subfolder: ${org2.category} / ${org2.subfolder}`);

    createdArtifactIds.push(item2.id);

    assert.strictEqual(org2.project_created, false, 'Should REUSE existing project, not create duplicate');
    assert.strictEqual(item2.project_id, firstProjectId, 'Should correlate to the EXACT same project ID');
    assert.ok(item2.display_name.toLowerCase().includes('titanium') || item2.display_name.toLowerCase().includes('debit card'), 'Should have semantic icon name');
    assert.strictEqual(org2.category, 'Assets');
    assert.strictEqual(org2.subfolder, 'Brand & Icons');
    console.log('   ✅ Test 2 Passed: Correlated to existing project and placed in Brand & Icons\n');

    // -------------------------------------------------------------------------
    // TEST 3: Capture 3 (Code Component from Claude)
    // -------------------------------------------------------------------------
    console.log('--- 3. Testing Code Snippet Capture from Claude ---');
    const res3 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'code-snippet-1.tsx',
        mime_type: 'text/typescript',
        extension: 'tsx',
        size_bytes: 4200,
        source_name: 'Claude',
        source_url: `https://claude.ai/chat/code-session-${Date.now()}`,
        conversation_title: 'Auth Form Component in React',
        context_prompt: 'Create a reusable password reset form component with validation',
      }),
    });

    assert.strictEqual(res3.status, 201);
    const json3 = await res3.json();
    const item3 = json3.data;
    const org3 = json3.organization;

    console.log(`   Display Name: "${item3.display_name}"`);
    console.log(`   Project Name: "${org3.project_name}"`);
    console.log(`   Provider Path: "${item3.provider_path}"`);
    console.log(`   Category / Subfolder: ${org3.category} / ${org3.subfolder}`);

    createdArtifactIds.push(item3.id);
    if (org3.project_created && org3.project_id) {
      await supabase.from('projects').delete().eq('id', org3.project_id);
    }

    assert.strictEqual(org3.category, 'Code');
    assert.strictEqual(org3.subfolder, 'Components');
    console.log('   ✅ Test 3 Passed: Code deliverable placed in Code / Components\n');

    console.log('🎉 ALL SMART ORGANIZATION TESTS PASSED SUCCESSFULLY!');
  } finally {
    // Cleanup test artifacts
    for (const artId of createdArtifactIds) {
      await supabase.from('artifacts').delete().eq('id', artId);
      await supabase.from('file_events').delete().eq('artifact_id', artId);
    }
    if (firstProjectId) {
      await supabase.from('projects').delete().eq('id', firstProjectId);
    }
    await supabase.from('integration_connections').delete().eq('id', conn.id);
    console.log('🧹 Cleaned up test database rows.');
  }
}

run().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
