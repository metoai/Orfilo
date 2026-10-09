// ==============================================================================
// ORFILO BROWSER EXTENSION: POPUP LOGIC WITH AUTH GATE
// ==============================================================================

document.addEventListener('DOMContentLoaded', async () => {
  // Views
  const viewAuth = document.getElementById('view-auth');
  const viewApp = document.getElementById('view-app');

  // Header Elements
  const statusPill = document.getElementById('statusPill');
  const statusText = document.getElementById('statusText');

  // Auth Gate Elements
  const authLoginForm = document.getElementById('authLoginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  const authConfirmedBanner = document.getElementById('authConfirmedBanner');
  const confirmedEmail = document.getElementById('confirmedEmail');
  const confirmedSub = document.getElementById('confirmedSub');
  const btnConnectWorkspace = document.getElementById('btnConnectWorkspace');
  const btnQuickPair = document.getElementById('btnQuickPair');
  const btnToggleManual = document.getElementById('btnToggleManual');
  const manualToggleArrow = document.getElementById('manualToggleArrow');
  const manualAuthBox = document.getElementById('manualAuthBox');
  const authServerUrl = document.getElementById('authServerUrl');
  const authTokenInput = document.getElementById('authTokenInput');
  const btnSubmitManualToken = document.getElementById('btnSubmitManualToken');
  const authNotice = document.getElementById('authNotice');

  // App Dashboard Elements
  const projectSelect = document.getElementById('projectSelect');
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const captureCountEl = document.getElementById('captureCount');

  // App Action elements
  const btnCaptureTab = document.getElementById('btnCaptureTab');
  const dropzone = document.getElementById('dropzone');
  const fileInput = document.getElementById('fileInput');
  const snippetInput = document.getElementById('snippetInput');
  const snippetName = document.getElementById('snippetName');
  const btnSaveSnippet = document.getElementById('btnSaveSnippet');
  const recentList = document.getElementById('recentList');
  const btnOpenOrfilo = document.getElementById('btnOpenOrfilo');

  // Settings & Session elements
  const settingServerUrl = document.getElementById('settingServerUrl');
  const settingApiKey = document.getElementById('settingApiKey');
  const settingInterceptDownloads = document.getElementById('settingInterceptDownloads');
  const settingFinalitySignals = document.getElementById('settingFinalitySignals');
  const btnSaveSettings = document.getElementById('btnSaveSettings');
  const settingsSavedNotice = document.getElementById('settingsSavedNotice');
  const sessionStatusTag = document.getElementById('sessionStatusTag');
  const sessionStorageName = document.getElementById('sessionStorageName');
  const sessionUserEmail = document.getElementById('sessionUserEmail');
  const sessionKeyPreview = document.getElementById('sessionKeyPreview');
  const btnDisconnect = document.getElementById('btnDisconnect');
  const toast = document.getElementById('toast');

  // ---------------------------------------------------------------------------
  // 1. VIEW SWITCHING
  // ---------------------------------------------------------------------------
  function switchView(view) {
    if (view === 'auth') {
      viewAuth?.classList.add('active');
      viewApp?.classList.remove('active');
      statusPill.className = 'status-pill';
      statusText.innerText = 'Setup Required';
    } else {
      viewAuth?.classList.remove('active');
      viewApp?.classList.add('active');
      statusPill.className = 'status-pill connected';
      statusText.innerText = 'Connected';
    }
  }

  function showAuthNotice(msg, type = 'error') {
    if (!authNotice) return;
    authNotice.className = `auth-notice ${type}`;
    authNotice.innerText = msg;
    authNotice.classList.remove('hidden');
  }

  function hideAuthNotice() {
    if (authNotice) authNotice.classList.add('hidden');
  }

  function updateSessionCard(apiKey, storage = 'Google Drive', userEmail = '') {
    const emailToUse = userEmail || settings?.userEmail || 'metoaipr@gmail.com';
    if (sessionStatusTag) sessionStatusTag.innerText = apiKey ? 'Active' : 'Unpaired';
    if (sessionStorageName) sessionStorageName.innerText = storage;
    if (sessionUserEmail) sessionUserEmail.innerText = apiKey ? emailToUse : 'None';
    if (confirmedEmail) confirmedEmail.innerText = `Signed In as ${emailToUse}`;
    if (confirmedSub) confirmedSub.innerText = 'Workspace Confirmed · Google Drive BYOS Connected';
    if (sessionKeyPreview) {
      if (!apiKey) {
        sessionKeyPreview.innerText = 'None';
      } else {
        const masked = apiKey.length > 8 ? `${apiKey.slice(0, 7)}••••${apiKey.slice(-4)}` : '••••••••';
        sessionKeyPreview.innerText = masked;
      }
    }
  }

  // ---------------------------------------------------------------------------
  // 2. TAB NAVIGATION (Inside App Dashboard)
  // ---------------------------------------------------------------------------
  tabBtns.forEach((btn) => {
    btn.addEventListener('click', () => {
      tabBtns.forEach((b) => b.classList.remove('active'));
      tabContents.forEach((c) => c.classList.remove('active'));

      btn.classList.add('active');
      const targetId = btn.getAttribute('data-tab');
      document.getElementById(targetId)?.classList.add('active');
    });
  });

  // ---------------------------------------------------------------------------
  // 3. INITIAL STATE EVALUATION (AUTH GATE CHECK)
  // ---------------------------------------------------------------------------
  const { settings } = await sendMessage({ action: 'GET_SETTINGS' });
  let detectedOrigin = '';
  try {
    if (typeof chrome !== 'undefined' && chrome.tabs?.query) {
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tabs[0]?.url) {
        const parsed = new URL(tabs[0].url);
        if (parsed.hostname === 'localhost' || parsed.hostname === '127.0.0.1' || parsed.hostname.includes('orfilo')) {
          detectedOrigin = parsed.origin;
        }
      }
    }
  } catch (_) {}

  const serverUrl = settings?.serverUrl || detectedOrigin || 'http://localhost:3000';
  const apiKey = settings?.apiKey || '';

  if (settings) {
    if (settingServerUrl) settingServerUrl.value = serverUrl;
    if (settingApiKey) settingApiKey.value = apiKey;
    if (authServerUrl) authServerUrl.value = serverUrl;
    if (settingInterceptDownloads) settingInterceptDownloads.checked = settings.autoInterceptDownloads !== false;
    if (settingFinalitySignals) settingFinalitySignals.checked = settings.detectFinalitySignals !== false;
    if (captureCountEl) captureCountEl.innerText = String(settings.captureCount || 0);

    renderRecentList(settings.recentCaptures || []);
  }

  // Check auth gate
  if (!apiKey) {
    // No token stored -> Show Auth Gate immediately
    switchView('auth');
  } else {
    // Token exists -> Check live verification with server
    const conn = await checkConnection(serverUrl, apiKey);
    if (conn.authenticated) {
      switchView('app');
      loadProjects(settings?.selectedProjectId);
    } else if (conn.connected) {
      // Server reached but key invalid
      switchView('auth');
      showAuthNotice('Previous session expired or key invalid. Please connect again.', 'error');
    } else {
      // Server unreachable - permit app view with offline indicator
      switchView('app');
    }
  }

  async function checkConnection(targetServerUrl, targetApiKey) {
    statusPill.className = 'status-pill';
    statusText.innerText = 'Checking...';

    const storageValEl = document.getElementById('storageVal');
    const accountValEl = document.getElementById('accountVal');

    try {
      const res = await sendMessage({
        action: 'CHECK_CONNECTION',
        payload: {
          serverUrl: targetServerUrl || serverUrl,
          apiKey: targetApiKey !== undefined ? targetApiKey : apiKey,
        },
      });

      const isConnected = res?.connected;
      const isAuthed = res?.authenticated !== false && Boolean(targetApiKey !== undefined ? targetApiKey : apiKey);

      if (isConnected && isAuthed) {
        statusPill.className = 'status-pill connected';
        statusText.innerText = 'Connected';
        const storageProv = res?.data?.storage_provider || 'Google Drive';
        const userEmail = res?.data?.user?.email || res?.data?.account || settings?.userEmail || 'metoaipr@gmail.com';
        if (storageValEl) storageValEl.innerText = storageProv;
        if (accountValEl) accountValEl.innerText = res?.data?.workspace || 'Meto Inspection Platform';
        updateSessionCard(targetApiKey || apiKey, storageProv, userEmail);
        return { connected: true, authenticated: true };
      } else if (isConnected && !isAuthed) {
        statusPill.className = 'status-pill';
        statusText.innerText = 'Setup Required';
        updateSessionCard('', 'Google Drive', '');
        return { connected: true, authenticated: false };
      } else {
        statusPill.className = 'status-pill disconnected';
        statusText.innerText = 'Offline';
        if (storageValEl) storageValEl.innerText = 'Local Cache';
        if (accountValEl) accountValEl.innerText = 'Offline';
        return { connected: false, authenticated: false };
      }
    } catch {
      statusPill.className = 'status-pill disconnected';
      statusText.innerText = 'Offline';
      return { connected: false, authenticated: false };
    }
  }

  async function loadProjects(selectedId) {
    const res = await sendMessage({ action: 'GET_PROJECTS' });
    if (res?.success && Array.isArray(res.projects)) {
      projectSelect.innerHTML = '<option value="">Auto-Route (Smart Project Routing)</option>';
      res.projects.forEach((proj) => {
        const opt = document.createElement('option');
        opt.value = proj.id;
        opt.innerText = `${proj.name} (${proj.description?.slice(0, 30) || 'Project'})`;
        if (proj.id === selectedId) opt.selected = true;
        projectSelect.appendChild(opt);
      });
    }
  }

  projectSelect.addEventListener('change', async () => {
    const selId = projectSelect.value;
    await sendMessage({
      action: 'UPDATE_SETTINGS',
      payload: { selectedProjectId: selId },
    });
    showToast('Active project updated');
  });

  // ---------------------------------------------------------------------------
  // 4. AUTH GATE ACTIONS
  // ---------------------------------------------------------------------------
  if (authLoginForm) {
    authLoginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const sUrl = authServerUrl?.value?.trim() || settingServerUrl?.value?.trim() || 'http://localhost:3000';
      const email = loginEmail?.value?.trim();
      const password = loginPassword?.value?.trim();

      if (!email || !password) {
        showAuthNotice('Please enter both email and password.', 'error');
        return;
      }

      btnSubmitLogin.disabled = true;
      btnSubmitLogin.innerHTML = '<span>Signing in...</span>';
      hideAuthNotice();

      try {
        const res = await sendMessage({
          action: 'LOGIN_USER',
          payload: { serverUrl: sUrl, email, password },
        });

        if (res?.success && res.token) {
          const uEmail = res.user?.email || email;
          showToast(`✓ Confirmed: Signed in as ${uEmail}`);
          if (settingApiKey) settingApiKey.value = res.token;
          updateSessionCard(res.token, 'Google Drive', uEmail);
          switchView('app');
          await checkConnection(sUrl, res.token);
          loadProjects();
        } else {
          showAuthNotice('Sign in failed: ' + (res?.error || 'Invalid credentials'), 'error');
        }
      } catch (err) {
        showAuthNotice('Sign in notice: ' + err.message, 'error');
      } finally {
        btnSubmitLogin.disabled = false;
        btnSubmitLogin.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/>
            <polyline points="10 17 15 12 10 7"/>
            <line x1="15" y1="12" x2="3" y2="12"/>
          </svg>
          <span>Sign In to Workspace</span>
        `;
      }
    });
  }

  if (btnConnectWorkspace) {
    btnConnectWorkspace.addEventListener('click', () => {
      const sUrl = authServerUrl?.value?.trim() || settingServerUrl?.value?.trim() || 'http://localhost:3000';
      chrome.tabs.create({ url: `${sUrl}/?action=pair-extension` });
      showAuthNotice('Opened Orfilo in your browser. Confirm pairing on the page.', 'info');
    });
  }

  if (btnQuickPair) {
    btnQuickPair.addEventListener('click', async () => {
      btnQuickPair.disabled = true;
      btnQuickPair.innerHTML = '<span>Connecting...</span>';
      hideAuthNotice();

      const sUrl = authServerUrl?.value?.trim() || settingServerUrl?.value?.trim() || 'http://localhost:3000';

      try {
        const res = await sendMessage({
          action: 'PAIR_WORKSPACE',
          payload: { serverUrl: sUrl },
        });

        if (res?.success && res.token) {
          const userEmail = res.user?.email || 'metoaipr@gmail.com';
          showToast(`✓ Confirmed: Signed in as ${userEmail}`);
          if (settingApiKey) settingApiKey.value = res.token;
          updateSessionCard(res.token, 'Google Drive', userEmail);
          switchView('app');
          await checkConnection(sUrl, res.token);
          loadProjects();
        } else {
          showAuthNotice('Could not auto-pair: ' + (res?.error || 'Make sure Orfilo is running at ' + sUrl), 'error');
        }
      } catch (err) {
        showAuthNotice('Connection error: ' + err.message, 'error');
      } finally {
        btnQuickPair.disabled = false;
        btnQuickPair.innerHTML = `
          <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
          </svg>
          <span>1-Click Connect (Local Workspace)</span>
        `;
      }
    });
  }

  if (btnToggleManual) {
    btnToggleManual.addEventListener('click', () => {
      const isHidden = manualAuthBox.classList.contains('hidden');
      if (isHidden) {
        manualAuthBox.classList.remove('hidden');
        if (manualToggleArrow) manualToggleArrow.innerText = '▴';
      } else {
        manualAuthBox.classList.add('hidden');
        if (manualToggleArrow) manualToggleArrow.innerText = '▾';
      }
    });
  }

  if (btnSubmitManualToken) {
    btnSubmitManualToken.addEventListener('click', async () => {
      const sUrl = authServerUrl?.value?.trim() || 'http://localhost:3000';
      const token = authTokenInput?.value?.trim() || '';

      if (!token) {
        showAuthNotice('Please enter a companion token or API key', 'error');
        return;
      }

      btnSubmitManualToken.disabled = true;
      btnSubmitManualToken.innerText = 'Validating...';
      hideAuthNotice();

      try {
        const res = await sendMessage({
          action: 'VALIDATE_AND_CONNECT',
          payload: { serverUrl: sUrl, apiKey: token },
        });

        if (res?.success) {
          showToast('Connected to Orfilo Workspace!');
          if (settingServerUrl) settingServerUrl.value = sUrl;
          if (settingApiKey) settingApiKey.value = token;
          updateSessionCard(token);
          switchView('app');
          await checkConnection(sUrl, token);
          loadProjects();
        } else {
          showAuthNotice(res?.error || 'Invalid companion token', 'error');
        }
      } catch (err) {
        showAuthNotice('Connection error: ' + err.message, 'error');
      } finally {
        btnSubmitManualToken.disabled = false;
        btnSubmitManualToken.innerText = 'Connect with Key';
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 5. SIGN OUT / DISCONNECT
  // ---------------------------------------------------------------------------
  if (btnDisconnect) {
    btnDisconnect.addEventListener('click', async () => {
      await sendMessage({ action: 'DISCONNECT_WORKSPACE' });
      if (settingApiKey) settingApiKey.value = '';
      updateSessionCard('', 'Google Drive', '');
      switchView('auth');
      showToast('Signed out from workspace');
      showToast('Disconnected from Orfilo workspace');
    });
  }

  // ---------------------------------------------------------------------------
  // 6. ACTION: CAPTURE ACTIVE TAB
  // ---------------------------------------------------------------------------
  btnCaptureTab.addEventListener('click', async () => {
    btnCaptureTab.disabled = true;
    btnCaptureTab.innerText = 'Capturing...';

    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const activeTab = tabs[0];
      if (!activeTab) {
        showToast('No active tab detected');
        resetCaptureTabBtn();
        return;
      }

      const title = activeTab.title || 'Web Research Artifact';
      const cleanFilename = `${title.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 30)}.md`;

      const res = await sendMessage({
        action: 'CAPTURE_ARTIFACT',
        payload: {
          filename: cleanFilename,
          display_name: title,
          source_type: 'browser_extension',
          source_name: getSourceFromUrl(activeTab.url || ''),
          mime_type: 'text/markdown',
          size_bytes: 2048,
          source_url: activeTab.url || '',
          context_prompt: `Captured active webpage: "${title}"`,
          content_preview: `Page Title: ${title}\nURL: ${activeTab.url}`,
          project_id: projectSelect.value || undefined,
        },
      });

      if (res?.success) {
        showToast(`Saved to ${res.suggestion?.suggested_location || 'Orfilo'}!`);
        refreshRecent();
      } else {
        showToast(`Capture failed: ${res?.error || 'Unknown error'}`);
      }

      resetCaptureTabBtn();
    });
  });

  function resetCaptureTabBtn() {
    btnCaptureTab.disabled = false;
    btnCaptureTab.innerHTML = `
      <svg class="btn-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
        <polyline points="17 8 12 3 7 8"/>
        <line x1="12" y1="3" x2="12" y2="15"/>
      </svg>
      <span>Capture Current Page Deliverable</span>
    `;
  }

  // ---------------------------------------------------------------------------
  // 7. ACTION: DROPZONE / LOCAL FILE CAPTURE
  // ---------------------------------------------------------------------------
  ['dragenter', 'dragover'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.add('dragover');
    });
  });

  ['dragleave', 'drop'].forEach((eventName) => {
    dropzone.addEventListener(eventName, (e) => {
      e.preventDefault();
      dropzone.classList.remove('dragover');
    });
  });

  dropzone.addEventListener('drop', (e) => {
    const files = e.dataTransfer.files;
    if (files.length) handleFiles(files);
  });

  fileInput.addEventListener('change', () => {
    if (fileInput.files.length) handleFiles(fileInput.files);
  });

  async function handleFiles(files) {
    showToast(`Uploading ${files.length} file(s)...`);

    for (const file of Array.from(files)) {
      await sendMessage({
        action: 'CAPTURE_ARTIFACT',
        payload: {
          filename: file.name,
          display_name: file.name,
          source_type: 'browser_extension',
          source_name: 'Extension Dropzone',
          mime_type: file.type || 'application/octet-stream',
          size_bytes: file.size,
          context_prompt: `Quick drop from Orfilo Chrome Extension`,
          project_id: projectSelect.value || undefined,
        },
      });
    }

    showToast('Files organized successfully!');
    fileInput.value = '';
    refreshRecent();
  }

  // ---------------------------------------------------------------------------
  // 8. ACTION: SAVE SNIPPET
  // ---------------------------------------------------------------------------
  btnSaveSnippet.addEventListener('click', async () => {
    const text = snippetInput.value.trim();
    if (!text) {
      showToast('Enter code or prompt text to save');
      return;
    }

    const name = snippetName.value.trim() || `snippet_${Date.now().toString(36)}.ts`;
    btnSaveSnippet.disabled = true;
    btnSaveSnippet.innerText = 'Saving...';

    const res = await sendMessage({
      action: 'CAPTURE_ARTIFACT',
      payload: {
        filename: name,
        display_name: name,
        source_type: 'browser_extension',
        source_name: 'Extension Snippet Box',
        mime_type: 'text/plain',
        size_bytes: new Blob([text]).size,
        context_prompt: 'Code snippet saved directly from extension',
        content_preview: text.slice(0, 1000),
        project_id: projectSelect.value || undefined,
      },
    });

    if (res?.success) {
      snippetInput.value = '';
      snippetName.value = '';
      showToast('Snippet saved to Orfilo!');
      refreshRecent();
    } else {
      showToast(`Error: ${res?.error || 'Failed'}`);
    }

    btnSaveSnippet.disabled = false;
    btnSaveSnippet.innerText = 'Save';
  });

  // ---------------------------------------------------------------------------
  // 9. RECENT CAPTURES LIST
  // ---------------------------------------------------------------------------
  function renderRecentList(items) {
    if (!items.length) {
      recentList.innerHTML = '<div class="empty-state">No artifacts captured yet. Downloads and AI deliverables will appear here.</div>';
      return;
    }

    recentList.innerHTML = items
      .map((item) => {
        const timeAgo = formatTimeAgo(new Date(item.timestamp));
        return `
        <div class="recent-item">
          <div class="recent-item-info">
            <span class="recent-item-name" title="${escapeHtml(item.filename)}">${escapeHtml(item.display_name || item.filename)}</span>
            <span class="recent-item-meta">
              <span class="recent-badge">${escapeHtml(item.suggested_location || 'Inbox')}</span>
              <span>•</span>
              <span>${timeAgo}</span>
            </span>
          </div>
        </div>
      `;
      })
      .join('');
  }

  async function refreshRecent() {
    const { settings: latestSettings } = await sendMessage({ action: 'GET_SETTINGS' });
    if (latestSettings) {
      if (captureCountEl) captureCountEl.innerText = String(latestSettings.captureCount || 0);
      renderRecentList(latestSettings.recentCaptures || []);
    }
  }

  btnOpenOrfilo.addEventListener('click', async () => {
    const { settings: curSettings } = await sendMessage({ action: 'GET_SETTINGS' });
    const url = curSettings?.serverUrl || 'http://localhost:3000';
    chrome.tabs.create({ url });
  });

  // ---------------------------------------------------------------------------
  // 10. SETTINGS SAVE
  // ---------------------------------------------------------------------------
  btnSaveSettings.addEventListener('click', async () => {
    const newApiKey = settingApiKey.value.trim();
    const newServerUrl = settingServerUrl.value.trim() || 'http://localhost:3000';

    const updated = {
      serverUrl: newServerUrl,
      apiKey: newApiKey,
      autoInterceptDownloads: settingInterceptDownloads.checked,
      detectFinalitySignals: settingFinalitySignals.checked,
    };

    await sendMessage({
      action: 'UPDATE_SETTINGS',
      payload: updated,
    });

    settingsSavedNotice.classList.add('visible');
    setTimeout(() => settingsSavedNotice.classList.remove('visible'), 2500);

    if (!newApiKey) {
      switchView('auth');
    } else {
      const conn = await checkConnection(newServerUrl, newApiKey);
      if (conn.authenticated) {
        switchView('app');
        loadProjects();
      } else {
        switchView('auth');
      }
    }

    showToast('Settings updated');
  });

  // ---------------------------------------------------------------------------
  // 11. HELPERS
  // ---------------------------------------------------------------------------
  async function sendMessage(msg) {
    return new Promise((resolve) => {
      chrome.runtime.sendMessage(msg, (response) => {
        resolve(response || {});
      });
    });
  }

  function showToast(msg) {
    toast.innerText = msg;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3000);
  }

  function getSourceFromUrl(url) {
    if (url.includes('chatgpt.com') || url.includes('openai.com')) return 'ChatGPT';
    if (url.includes('claude.ai')) return 'Claude';
    if (url.includes('gemini.google.com')) return 'Gemini';
    if (url.includes('midjourney.com')) return 'Midjourney';
    if (url.includes('v0.dev')) return 'v0';
    return 'Browser Tab';
  }

  function formatTimeAgo(date) {
    const sec = Math.floor((new Date() - date) / 1000);
    if (sec < 60) return 'Just now';
    const min = Math.floor(sec / 60);
    if (min < 60) return `${min}m ago`;
    const hrs = Math.floor(min / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  function escapeHtml(str) {
    return (str || '')
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
});
