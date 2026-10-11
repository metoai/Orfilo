// ==============================================================================
// ORFILO BROWSER EXTENSION: POPUP SCRIPT
// Clean Auth-gated lifecycle and real server synchronization
// ==============================================================================

const DEFAULT_SERVER_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Views
  const viewAuth = document.getElementById('view-auth');
  const viewApp = document.getElementById('view-app');
  const statusAlert = document.getElementById('statusAlert');

  // Settings
  const btnSettingsToggle = document.getElementById('btnSettingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const btnSaveServerUrl = document.getElementById('btnSaveServerUrl');

  // Auth View
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const btnLogin = document.getElementById('btnLogin');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginBtnText = document.getElementById('loginBtnText');
  const linkSignUp = document.getElementById('linkSignUp');

  // App View
  const displayUserEmail = document.getElementById('displayUserEmail');
  const statCaptureCount = document.getElementById('statCaptureCount');
  const statLastCapture = document.getElementById('statLastCapture');
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  const btnDisconnect = document.getElementById('btnDisconnect');

  // Retrieve stored settings
  const stored = await chrome.storage.local.get([
    'orfiloToken',
    'orfiloUser',
    'orfiloServerUrl',
    'captureCount',
    'lastCaptureTime',
  ]);

  let currentServerUrl = (stored.orfiloServerUrl || DEFAULT_SERVER_URL).replace(/\/+$/, '');
  serverUrlInput.value = currentServerUrl;

  // Initialize view state
  await checkAuthStatus();

  // ---------------------------------------------------------------------------
  // Alert Helper
  // ---------------------------------------------------------------------------
  function showAlert(message, type = 'error') {
    statusAlert.textContent = message;
    statusAlert.className = `alert-box ${type}`;
    statusAlert.classList.remove('hidden');
  }

  function hideAlert() {
    statusAlert.classList.add('hidden');
    statusAlert.textContent = '';
  }

  function setLoginLoading(isLoading) {
    btnLogin.disabled = isLoading;
    if (isLoading) {
      loginSpinner.classList.remove('hidden');
      loginBtnText.textContent = 'Connecting...';
    } else {
      loginSpinner.classList.add('hidden');
      loginBtnText.textContent = 'Sign In';
    }
  }

  // ---------------------------------------------------------------------------
  // Auth Verification
  // ---------------------------------------------------------------------------
  async function checkAuthStatus() {
    hideAlert();
    const storage = await chrome.storage.local.get([
      'orfiloToken',
      'orfiloUser',
      'orfiloServerUrl',
      'captureCount',
      'lastCaptureTime',
    ]);

    const token = storage.orfiloToken;
    const user = storage.orfiloUser;
    const serverUrl = (storage.orfiloServerUrl || DEFAULT_SERVER_URL).replace(/\/+$/, '');

    if (!token) {
      showAuthView();
      return;
    }

    try {
      const response = await fetch(`${serverUrl}/api/v1/extension/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        // Token invalid or unauthorized
        await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
        showAuthView();
        return;
      }

      const data = await response.json();
      if (data && data.authenticated === true) {
        showAppView(user || data.user?.email || 'Active Workspace', storage);
      } else {
        await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
        showAuthView();
      }
    } catch (err) {
      // Server unreachable - DO NOT BYPASS AUTH
      console.error('[Orfilo Popup] Server verification error:', err);
      showAuthView();
      showAlert('Cannot reach Orfilo server. Please check the server URL or ensure Orfilo is running.', 'error');
    }
  }

  function showAuthView() {
    viewAuth.classList.remove('hidden');
    viewApp.classList.add('hidden');
  }

  function showAppView(email, stats = {}) {
    viewAuth.classList.add('hidden');
    viewApp.classList.remove('hidden');
    displayUserEmail.textContent = email;

    const count = typeof stats.captureCount === 'number' ? stats.captureCount : 0;
    statCaptureCount.textContent = count.toString();

    if (stats.lastCaptureTime) {
      const date = new Date(stats.lastCaptureTime);
      statLastCapture.textContent = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      statLastCapture.textContent = 'None yet';
    }
  }

  // ---------------------------------------------------------------------------
  // Login Form Submission
  // ---------------------------------------------------------------------------
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = loginEmail.value.trim();
    const password = loginPassword.value;
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');

    if (!email || !password) {
      showAlert('Please enter both email and password.');
      return;
    }

    setLoginLoading(true);

    try {
      // Step 1: Call login endpoint
      const loginRes = await fetch(`${serverUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok || !loginData.success) {
        throw new Error(loginData.error || `Login failed (${loginRes.status})`);
      }

      const accessToken = loginData.token;
      if (!accessToken) {
        throw new Error('Authentication did not return a valid session token.');
      }

      // Step 2: Call extension pair endpoint with the acquired token
      const pairRes = await fetch(`${serverUrl}/api/v1/extension/pair`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      const pairData = await pairRes.json().catch(() => ({}));
      const extensionKey = pairData.token || accessToken;

      // Step 3: Save to local storage
      const userEmail = loginData.user?.email || email;
      await chrome.storage.local.set({
        orfiloToken: extensionKey,
        orfiloUser: userEmail,
        orfiloServerUrl: serverUrl,
      });

      loginPassword.value = '';
      const storage = await chrome.storage.local.get(['captureCount', 'lastCaptureTime']);
      showAppView(userEmail, storage);
    } catch (err) {
      console.error('[Orfilo Popup] Login error:', err);
      showAlert(err.message || 'Cannot reach Orfilo server', 'error');
    } finally {
      setLoginLoading(false);
    }
  });

  // ---------------------------------------------------------------------------
  // Disconnect
  // ---------------------------------------------------------------------------
  btnDisconnect.addEventListener('click', async () => {
    try {
      const storage = await chrome.storage.local.get(['orfiloToken', 'orfiloServerUrl']);
      if (storage.orfiloToken && storage.orfiloServerUrl) {
        // Notify server optionally
        fetch(`${storage.orfiloServerUrl}/api/v1/connections/browser_extension/disconnect`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${storage.orfiloToken}` },
        }).catch(() => {});
      }
    } catch (_) {}

    await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
    loginPassword.value = '';
    showAuthView();
    showAlert('Extension disconnected successfully.', 'success');
  });

  // ---------------------------------------------------------------------------
  // External Navigation Links
  // ---------------------------------------------------------------------------
  linkSignUp.addEventListener('click', (e) => {
    e.preventDefault();
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');
    chrome.tabs.create({ url: `${serverUrl}/` });
  });

  btnOpenDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');
    chrome.tabs.create({ url: `${serverUrl}/` });
  });

  // ---------------------------------------------------------------------------
  // Settings Panel Toggle & Save
  // ---------------------------------------------------------------------------
  btnSettingsToggle.addEventListener('click', () => {
    settingsPanel.classList.toggle('hidden');
  });

  btnCloseSettings.addEventListener('click', () => {
    settingsPanel.classList.add('hidden');
  });

  btnSaveServerUrl.addEventListener('click', async () => {
    let newUrl = serverUrlInput.value.trim() || DEFAULT_SERVER_URL;
    newUrl = newUrl.replace(/\/+$/, '');
    serverUrlInput.value = newUrl;

    await chrome.storage.local.set({ orfiloServerUrl: newUrl });
    settingsPanel.classList.add('hidden');
    showAlert('Server URL updated. Verifying connection...', 'success');

    // Retest connection
    await checkAuthStatus();
  });
});
