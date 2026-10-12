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
    assert.strictEqual(org1.subfolder, 'UI Mockups');
    assert.ok(
      item1.provider_path.startsWith('ChatGPT / Fintech Mobile App Redesign / UI Mockups /'),
      `Provider path should be 'ChatGPT / Fintech Mobile App Redesign / UI Mockups / ...', got '${item1.provider_path}'`
    );
    console.log('   ✅ Test 1 Passed: Renamed, Project Auto-Created, Placed in ChatGPT / Project / UI Mockups\n');

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
    assert.strictEqual(org2.subfolder, 'Brand & Icons');
    assert.ok(
      item2.provider_path.startsWith('ChatGPT / Fintech Mobile App Redesign / Brand & Icons /'),
      `Provider path should be 'ChatGPT / Fintech Mobile App Redesign / Brand & Icons / ...', got '${item2.provider_path}'`
    );
    console.log('   ✅ Test 2 Passed: Correlated to existing project and placed in ChatGPT / Project / Brand & Icons\n');

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

    assert.strictEqual(org3.subfolder, 'Components');
    assert.ok(
      item3.provider_path.startsWith('Claude / Auth Form Component in React / Components /'),
      `Provider path should be 'Claude / Auth Form Component in React / Components / ...', got '${item3.provider_path}'`
    );
    console.log('   ✅ Test 3 Passed: Code deliverable placed in Claude / Project / Components\n');

    // -------------------------------------------------------------------------
    // TEST 4: Extension Download Endpoint
    // -------------------------------------------------------------------------
    console.log('--- 4. Testing Extension Download Endpoint ---');
    const dlRes = await fetch(`${BASE_URL}/api/v1/extension/download`);
    assert.strictEqual(dlRes.status, 200, `Expected 200 from download endpoint, got ${dlRes.status}`);
    assert.strictEqual(dlRes.headers.get('content-type'), 'application/zip');
    const dlBuffer = await dlRes.arrayBuffer();
    assert.ok(dlBuffer.byteLength > 10000, `Downloaded zip should be >10KB, got ${dlBuffer.byteLength} bytes`);
    console.log(`   ✅ Test 4 Passed: Extension ZIP downloaded successfully (${dlBuffer.byteLength} bytes)\n`);

    // -------------------------------------------------------------------------
    // TEST 5: Single Chat Multi-Topic Scenario (User's Exact Benchmark)
    // Turn 1: "generate habeshan model only face"
    // Turn 2 (same chat URL): "another project ui" -> Topic shift! Must create separate project!
    // Turn 3 (same chat URL): "habeshan model traditional dress" -> Must correlate back to Habeshan!
    // -------------------------------------------------------------------------
    console.log('--- 5. Testing Single Chat Multi-Topic Scenario (User Benchmark) ---');
    const multiTopicChatUrl = `https://chatgpt.com/c/user-scenario-${Date.now()}`;
    const tinyPngBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==';

    // Turn 1
    console.log('   Turn 1: "generate habeshan model only face"');
    const resH1 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'DALL·E 2026-10-11.png',
        mime_type: 'image/png',
        extension: 'png',
        size_bytes: 85,
        source_name: 'ChatGPT',
        source_url: multiTopicChatUrl,
        conversation_title: 'ChatGPT',
        context_prompt: 'generate habeshan model only face',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resH1.status, 201);
    const jsonH1 = await resH1.json();
    const itemH1 = jsonH1.data;
    const orgH1 = jsonH1.organization;
    createdArtifactIds.push(itemH1.id);
    const habeshanProjectId = orgH1.project_id;

    console.log(`     Display Name: "${itemH1.display_name}"`);
    console.log(`     Project: "${orgH1.project_name}"`);
    console.log(`     Provider Path: "${itemH1.provider_path}"`);
    console.log(`     Thumbnail URL: "${itemH1.metadata?.thumbnail_url}"`);

    assert.strictEqual(itemH1.display_name, 'Habeshan Model Face Only', 'Grammar reordering & short clean name failed');
    assert.strictEqual(orgH1.project_name, 'Habeshan Model Face Only', 'Should name project after deliverable');
    assert.ok(itemH1.provider_path.startsWith('ChatGPT / Habeshan Model Face Only / Illustrations / habeshan-model-face-only.png'), 'Provider path mismatch');
    assert.ok(itemH1.metadata?.thumbnail_url, 'Should have stored thumbnail_url');

    // Verify thumbnail is accessible via HTTP
    const thumbRes = await fetch(`${BASE_URL}${itemH1.metadata.thumbnail_url}`);
    assert.strictEqual(thumbRes.status, 200, 'Thumbnail should be accessible over HTTP static server');

    // Turn 2: Same Chat URL, but completely different topic: "another project ui"
    console.log('\n   Turn 2 (Same Chat URL): "another project ui"');
    const resH2 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'screenshot-2.png',
        mime_type: 'image/png',
        extension: 'png',
        size_bytes: 85,
        source_name: 'ChatGPT',
        source_url: multiTopicChatUrl,
        conversation_title: 'ChatGPT',
        context_prompt: 'create another project ui mockup',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resH2.status, 201);
    const jsonH2 = await resH2.json();
    const itemH2 = jsonH2.data;
    const orgH2 = jsonH2.organization;
    createdArtifactIds.push(itemH2.id);
    const uiProjectId = orgH2.project_id;

    console.log(`     Display Name: "${itemH2.display_name}"`);
    console.log(`     Project: "${orgH2.project_name}" (Created: ${orgH2.project_created})`);
    console.log(`     Provider Path: "${itemH2.provider_path}"`);

    assert.notStrictEqual(uiProjectId, habeshanProjectId, 'Turn 2 must NOT be put into Habeshan Model project!');
    assert.ok(
      orgH2.project_name === 'UI Mockup' || orgH2.project_name === 'Project UI Mockup',
      `Expected UI Mockup or Project UI Mockup, got ${orgH2.project_name}`
    );
    assert.ok(
      itemH2.provider_path.includes('UI Mockup') && itemH2.provider_path.includes('/ UI Mockups /'),
      `Provider path should contain UI Mockup folder, got ${itemH2.provider_path}`
    );

    // Turn 3: Same Chat URL, returning to habeshan model: "habeshan model traditional dress"
    console.log('\n   Turn 3 (Same Chat URL): "habeshan model traditional dress"');
    const resH3 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'image-3.png',
        mime_type: 'image/png',
        extension: 'png',
        size_bytes: 85,
        source_name: 'ChatGPT',
        source_url: multiTopicChatUrl,
        conversation_title: 'ChatGPT',
        context_prompt: 'habeshan model traditional dress',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resH3.status, 201);
    const jsonH3 = await resH3.json();
    const itemH3 = jsonH3.data;
    const orgH3 = jsonH3.organization;
    createdArtifactIds.push(itemH3.id);

    console.log(`     Display Name: "${itemH3.display_name}"`);
    console.log(`     Project: "${orgH3.project_name}" (Reused: ${!orgH3.project_created})`);
    console.log(`     Provider Path: "${itemH3.provider_path}"`);

    assert.strictEqual(orgH3.project_id, habeshanProjectId, 'Turn 3 must correlate BACK to Habeshan Model project!');
    assert.strictEqual(orgH3.project_created, false, 'Turn 3 must reuse existing Habeshan project, not create new');

    // Cleanup extra projects created in Test 5
    if (habeshanProjectId) await supabase.from('projects').delete().eq('id', habeshanProjectId);
    if (uiProjectId) await supabase.from('projects').delete().eq('id', uiProjectId);

    // -------------------------------------------------------------------------
    // TEST 6: Google Gemini Alt-Text Bug & Dynamic Prompt Isolation
    // 6A: alt_text: ", AI generated", empty prompt -> MUST use conversation title, NEVER ", AI Generated"
    // 6B: alt_text: ", AI generated", prompt: "baby character" -> MUST name "Baby Character" & separate project
    // 6C: alt_text: ", AI generated", prompt: "create modern banking dashboard ui" -> MUST name "Modern Banking Dashboard UI"
    // -------------------------------------------------------------------------
    console.log('--- 6. Testing Google Gemini Alt-Text Bug & Dynamic Prompt Isolation ---');
    const geminiSessionUrl = `https://gemini.google.com/app/test-gemini-${Date.now()}`;

    // 6A: Gemini with generic alt text and prompt in title
    console.log('   6A: Gemini alt=", AI generated", title="Habesha Model AI Portrait Prompt - Google Gemini"');
    const resG1 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'ai-generated.jpg',
        mime_type: 'image/jpeg',
        extension: 'jpg',
        size_bytes: 148811,
        source_name: 'Gemini',
        source_url: geminiSessionUrl,
        conversation_title: 'Habesha Model AI Portrait Prompt - Google Gemini',
        alt_text: ', AI generated',
        context_prompt: '',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resG1.status, 201);
    const jsonG1 = await resG1.json();
    const itemG1 = jsonG1.data;
    const orgG1 = jsonG1.organization;
    createdArtifactIds.push(itemG1.id);
    const geminiProjId1 = orgG1.project_id;

    console.log(`     Display Name: "${itemG1.display_name}"`);
    console.log(`     Project: "${orgG1.project_name}"`);
    console.log(`     Thumbnail URL: "${itemG1.metadata?.thumbnail_url}"`);

    assert.notStrictEqual(itemG1.display_name, ', AI Generated', 'Must NOT name artifact ", AI Generated"');
    assert.notStrictEqual(orgG1.project_name, ', AI Generated', 'Must NOT name project ", AI Generated"');
    assert.ok(orgG1.project_name.startsWith('Habesha Model'), `Expected project starting with Habesha Model, got ${orgG1.project_name}`);
    assert.ok(itemG1.metadata?.thumbnail_url, 'Must include thumbnail_url in metadata atomically');

    // 6B: User in Gemini asks for "baby character"
    console.log('\n   6B: Gemini alt=", AI generated", prompt="baby character"');
    const resG2 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'ai-generated.jpg',
        mime_type: 'image/jpeg',
        extension: 'jpg',
        size_bytes: 132860,
        source_name: 'Gemini',
        source_url: geminiSessionUrl,
        conversation_title: 'Habesha Model AI Portrait Prompt - Google Gemini',
        alt_text: ', AI generated',
        context_prompt: 'baby character with curly hair',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resG2.status, 201);
    const jsonG2 = await resG2.json();
    const itemG2 = jsonG2.data;
    const orgG2 = jsonG2.organization;
    createdArtifactIds.push(itemG2.id);
    const geminiProjId2 = orgG2.project_id;

    console.log(`     Display Name: "${itemG2.display_name}"`);
    console.log(`     Project: "${orgG2.project_name}" (Created: ${orgG2.project_created})`);

    assert.strictEqual(itemG2.display_name, 'Baby Character with Curly Hair');
    assert.notStrictEqual(geminiProjId2, geminiProjId1, 'Baby character must be in separate project from Habesha Model!');
    assert.ok(orgG2.project_name.includes('Baby Character'), 'Project must be named Baby Character');

    // 6C: User in Gemini asks for "create modern banking dashboard ui"
    console.log('\n   6C: Gemini alt=", AI generated", prompt="create modern banking dashboard ui"');
    const resG3 = await fetch(`${BASE_URL}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${rawToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        original_name: 'ai-generated.jpg',
        mime_type: 'image/jpeg',
        extension: 'jpg',
        size_bytes: 125000,
        source_name: 'Gemini',
        source_url: geminiSessionUrl,
        conversation_title: 'Habesha Model AI Portrait Prompt - Google Gemini',
        alt_text: ', AI generated',
        context_prompt: 'create modern banking dashboard ui',
        content_base64: tinyPngBase64,
      }),
    });
    assert.strictEqual(resG3.status, 201);
    const jsonG3 = await resG3.json();
    const itemG3 = jsonG3.data;
    const orgG3 = jsonG3.organization;
    createdArtifactIds.push(itemG3.id);
    const geminiProjId3 = orgG3.project_id;

    console.log(`     Display Name: "${itemG3.display_name}"`);
    console.log(`     Project: "${orgG3.project_name}" (Created: ${orgG3.project_created})`);

    assert.ok(itemG3.display_name.includes('Banking Dashboard UI') || itemG3.display_name.includes('Modern Banking Dashboard'));
    assert.notStrictEqual(geminiProjId3, geminiProjId1, 'UI must be separated from Habesha Model!');
    assert.notStrictEqual(geminiProjId3, geminiProjId2, 'UI must be separated from Baby Character!');

    // Cleanup Test 6 projects
    if (geminiProjId1) await supabase.from('projects').delete().eq('id', geminiProjId1);
    if (geminiProjId2) await supabase.from('projects').delete().eq('id', geminiProjId2);
    if (geminiProjId3) await supabase.from('projects').delete().eq('id', geminiProjId3);

    console.log('\n   ✅ Test 6 Passed: Gemini generic alt-text filtered & prompt separation verified!\n');

    console.log('🎉 ALL SMART ORGANIZATION & MULTI-TOPIC TESTS PASSED SUCCESSFULLY!');
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
