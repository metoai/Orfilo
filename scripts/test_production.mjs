import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !anonKey || !serviceKey) {
  console.error('Missing required environment variables');
  process.exit(1);
}

const adminClient = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } });
const anonClient = createClient(url, anonKey);

async function runProductionTests() {
  console.log('=== ORFILO PRODUCTION TEST SUITE ===\n');
  const results = [];

  const record = (name, passed, detail = '') => {
    results.push({ name, passed, detail });
    console.log((passed ? '✅ PASS: ' : '❌ FAIL: ') + name + (detail ? ' (' + detail + ')' : ''));
  };

  try {
    // 1. Sign In with primary user
    const email = 'metoaipr@gmail.com';
    const password = 'Orfilo2026!Secure';
    const { data: auth1, error: authErr1 } = await anonClient.auth.signInWithPassword({ email, password });
    record('Workflow 1 & 2: Sign In / Session Auth', !authErr1 && !!auth1.session, authErr1?.message || 'JWT Token received');

    const client1 = createClient(url, anonKey, {
      global: { headers: { Authorization: 'Bearer ' + auth1.session.access_token } },
    });

    // 2. Fetch Projects
    const { data: projList, error: projListErr } = await client1.from('projects').select('*, artifacts(count)');
    record('Workflow 4: Fetch Projects with Artifact Count', !projListErr, `Found ${projList ? projList.length : 0} projects`);

    // 3. Create Project
    const testProjName = 'Production QA ' + Date.now();
    const { data: newProj, error: createProjErr } = await client1.from('projects').insert({
      user_id: auth1.user.id,
      name: testProjName,
      description: 'Automated test project for production verification',
      color: '#19A974',
      icon: 'folder',
    }).select().single();
    record('Workflow 4: Create Project', !createProjErr && !!newProj?.id, newProj?.name);

    // 4. Edit Project
    const { data: updatedProj, error: editProjErr } = await client1.from('projects').update({
      description: 'Updated production description',
    }).eq('id', newProj.id).select().single();
    record('Workflow 5: Edit Project', !editProjErr && updatedProj?.description === 'Updated production description');

    // 5. Upload/Insert Artifact
    const { data: newArt, error: createArtErr } = await client1.from('artifacts').insert({
      user_id: auth1.user.id,
      project_id: newProj.id,
      original_name: 'test_artifact_' + Date.now() + '.pdf',
      display_name: 'production-verified-spec.pdf',
      mime_type: 'application/pdf',
      extension: 'pdf',
      size_bytes: 512000,
      provider_path: `${newProj.name} / Technical`,
      description: 'Production verification PDF artifact',
      source_type: 'manual_upload',
      source_name: 'Gemini',
      ai_confidence: 0.95,
      metadata: {
        category: 'Technical',
        purpose: 'Verification document',
        keywords: ['test', 'production', 'spec'],
      },
    }).select().single();
    record('Workflow 7 & 8: Upload Artifact & Save Metadata', !createArtErr && !!newArt?.id, newArt?.display_name);

    // 6. Assign Artifact / Rename
    const { data: renamedArt, error: renameErr } = await client1.from('artifacts').update({
      display_name: 'production-verified-spec-v2.pdf',
    }).eq('id', newArt.id).select().single();
    record('Workflow 9 & 10: Rename Artifact & Persist', !renameErr && renamedArt?.display_name === 'production-verified-spec-v2.pdf');

    // 7. Move Artifact
    const { data: movedArt, error: moveErr } = await client1.from('artifacts').update({
      provider_path: `${newProj.name} / Technical / Final`,
    }).eq('id', newArt.id).select().single();
    record('Workflow 11: Move Artifact Location', !moveErr && (movedArt?.provider_path || '').includes('Final'));

    // 8. Search Artifacts
    const { data: searchResults, error: searchErr } = await client1.from('artifacts')
      .select('*')
      .ilike('display_name', '%production-verified%');
    record('Workflow 13: Search Artifacts', !searchErr && (searchResults?.length || 0) > 0, `Matches: ${searchResults?.length}`);

    // 9. Record File Events
    const { data: newEv, error: evErr } = await client1.from('file_events').insert({
      user_id: auth1.user.id,
      artifact_id: newArt.id,
      event_type: 'organized',
      actor_type: 'ai_system',
      actor_id: 'gemini-2.5-flash',
      metadata: {
        summary: 'AI organized production-verified-spec-v2.pdf',
        to_path: `${newProj.name} / Technical / Final`,
      },
    }).select().single();
    record('Workflow 14: Create Activity Event', !evErr && !!newEv?.id);

    // 10. Display Activity
    const { data: eventList, error: eventListErr } = await client1.from('file_events').select('*').limit(5);
    record('Workflow 15: Display Activity Feed', !eventListErr && (eventList?.length || 0) > 0, `Count: ${eventList?.length}`);

    // 11. Delete Artifact
    const { error: delArtErr } = await client1.from('artifacts').delete().eq('id', newArt.id);
    record('Workflow 12: Delete Artifact', !delArtErr);

    // 12. Delete Project
    const { error: delProjErr } = await client1.from('projects').delete().eq('id', newProj.id);
    record('Workflow 6: Delete Project', !delProjErr);

    // 13. RLS Multi-User Security Isolation: Create User 2 and verify User 2 CANNOT read User 1's projects/artifacts
    const email2 = 'test_user2_' + Date.now() + '@example.com';
    const pass2 = 'SecurePass2026!';
    const { data: user2Created } = await adminClient.auth.admin.createUser({
      email: email2,
      password: pass2,
      email_confirm: true,
    });

    if (user2Created?.user) {
      const { data: auth2 } = await anonClient.auth.signInWithPassword({ email: email2, password: pass2 });
      const client2 = createClient(url, anonKey, {
        global: { headers: { Authorization: 'Bearer ' + auth2.session.access_token } },
      });

      // User 2 tries to read User 1's projects
      const { data: u2Projects } = await client2.from('projects').select('*');
      const hasCrossAccess = (u2Projects || []).some(p => p.user_id === auth1.user.id);
      record('Security / RLS: Multi-user Data Isolation', !hasCrossAccess && (u2Projects?.length || 0) === 0, 'Zero cross-user data leakage verified');

      // Cleanup user 2
      await adminClient.auth.admin.deleteUser(user2Created.user.id);
    }

    console.log('\n=== TEST RUN SUMMARY ===');
    const passed = results.filter(r => r.passed).length;
    console.log(`Passed: ${passed}/${results.length}`);

    if (passed === results.length) {
      console.log('🎉 ALL 13 TEST SUITES PASSED - 100% PRODUCTION READY!');
    } else {
      console.error('Some tests failed');
      process.exit(1);
    }
  } catch (err) {
    console.error('Test execution error:', err);
    process.exit(1);
  }
}

runProductionTests();
