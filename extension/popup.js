// ==============================================================================
// ORFILO BROWSER EXTENSION: POPUP SCRIPT
// In-Popup Self-Contained Auth (Sign In, Sign Up, Pair Token)
// Zero-redirect authentication; redirects only to view files / dashboard
// ==============================================================================

const DEFAULT_SERVER_URL = 'http://localhost:3000';

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements - Views
  const viewAuth = document.getElementById('view-auth');
  const viewApp = document.getElementById('view-app');
  const statusAlert = document.getElementById('statusAlert');

  // Settings Panel
  const btnSettingsToggle = document.getElementById('btnSettingsToggle');
  const settingsPanel = document.getElementById('settingsPanel');
  const btnCloseSettings = document.getElementById('btnCloseSettings');
  const serverUrlInput = document.getElementById('serverUrlInput');
  const btnSaveServerUrl = document.getElementById('btnSaveServerUrl');

  // Segmented Tabs
  const tabSignIn = document.getElementById('tabSignIn');
  const tabSignUp = document.getElementById('tabSignUp');
  const tabToken = document.getElementById('tabToken');

  // Form 1: Sign In
  const loginForm = document.getElementById('loginForm');
  const loginEmail = document.getElementById('loginEmail');
  const loginPassword = document.getElementById('loginPassword');
  const btnLogin = document.getElementById('btnLogin');
  const loginSpinner = document.getElementById('loginSpinner');
  const loginBtnText = document.getElementById('loginBtnText');

  // Form 2: Sign Up
  const signupForm = document.getElementById('signupForm');
  const signupName = document.getElementById('signupName');
  const signupEmail = document.getElementById('signupEmail');
  const signupPassword = document.getElementById('signupPassword');
  const btnSignUp = document.getElementById('btnSignUp');
  const signupSpinner = document.getElementById('signupSpinner');
  const signupBtnText = document.getElementById('signupBtnText');

  // Form 3: Token Pairing
  const tokenPairForm = document.getElementById('tokenPairForm');
  const pairingTokenInput = document.getElementById('pairingTokenInput');
  const btnPairToken = document.getElementById('btnPairToken');
  const tokenSpinner = document.getElementById('tokenSpinner');
  const tokenBtnText = document.getElementById('tokenBtnText');

  // Footer / Alternate Actions
  const btnGoogleAuth = document.getElementById('btnGoogleAuth');
  const authFooterPrompt = document.getElementById('authFooterPrompt');
  const btnToggleAuthMode = document.getElementById('btnToggleAuthMode');

  // App View
  const displayUserEmail = document.getElementById('displayUserEmail');
  const statCaptureCount = document.getElementById('statCaptureCount');
  const statLastCapture = document.getElementById('statLastCapture');
  const btnOpenDashboard = document.getElementById('btnOpenDashboard');
  const btnDisconnect = document.getElementById('btnDisconnect');

  // Active Tab State: 'signin' | 'signup' | 'token'
  let currentAuthTab = 'signin';

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
  // Alert Helpers
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

  // ---------------------------------------------------------------------------
  // Tab Switching Logic
  // ---------------------------------------------------------------------------
  function switchAuthTab(tab) {
    currentAuthTab = tab;
    hideAlert();

    // Update tab button styles
    [
      { btn: tabSignIn, name: 'signin' },
      { btn: tabSignUp, name: 'signup' },
      { btn: tabToken, name: 'token' },
    ].forEach(({ btn, name }) => {
      if (btn) {
        const isActive = name === tab;
        btn.classList.toggle('active', isActive);
        btn.setAttribute('aria-selected', isActive ? 'true' : 'false');
      }
    });

    // Show corresponding form
    loginForm.classList.toggle('hidden', tab !== 'signin');
    signupForm.classList.toggle('hidden', tab !== 'signup');
    tokenPairForm.classList.toggle('hidden', tab !== 'token');

    // Update footer prompt and button text
    if (tab === 'signin') {
      if (authFooterPrompt) authFooterPrompt.textContent = 'New to Orfilo?';
      if (btnToggleAuthMode) btnToggleAuthMode.textContent = 'Create an account';
      loginEmail.focus();
    } else if (tab === 'signup') {
      if (authFooterPrompt) authFooterPrompt.textContent = 'Already have an account?';
      if (btnToggleAuthMode) btnToggleAuthMode.textContent = 'Sign in instead';
      signupEmail.focus();
    } else {
      if (authFooterPrompt) authFooterPrompt.textContent = 'Have an account?';
      if (btnToggleAuthMode) btnToggleAuthMode.textContent = 'Sign in';
      pairingTokenInput.focus();
    }
  }

  tabSignIn.addEventListener('click', () => switchAuthTab('signin'));
  tabSignUp.addEventListener('click', () => switchAuthTab('signup'));
  tabToken.addEventListener('click', () => switchAuthTab('token'));

  if (btnToggleAuthMode) {
    btnToggleAuthMode.addEventListener('click', () => {
      if (currentAuthTab === 'signin') {
        switchAuthTab('signup');
      } else {
        switchAuthTab('signin');
      }
    });
  }

  // ---------------------------------------------------------------------------
  // Loading State Setters
  // ---------------------------------------------------------------------------
  function setLoginLoading(isLoading) {
    btnLogin.disabled = isLoading;
    if (isLoading) {
      loginSpinner.classList.remove('hidden');
      loginBtnText.textContent = 'Connecting...';
    } else {
      loginSpinner.classList.add('hidden');
      loginBtnText.textContent = 'Sign In & Pair';
    }
  }

  function setSignUpLoading(isLoading) {
    btnSignUp.disabled = isLoading;
    if (isLoading) {
      signupSpinner.classList.remove('hidden');
      signupBtnText.textContent = 'Creating Account...';
    } else {
      signupSpinner.classList.add('hidden');
      signupBtnText.textContent = 'Create Account & Pair';
    }
  }

  function setTokenLoading(isLoading) {
    btnPairToken.disabled = isLoading;
    if (isLoading) {
      tokenSpinner.classList.remove('hidden');
      tokenBtnText.textContent = 'Verifying...';
    } else {
      tokenSpinner.classList.add('hidden');
      tokenBtnText.textContent = 'Connect with Token';
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
        await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
        showAuthView();
        return;
      }

      const data = await response.json();
      if (data && data.authenticated === true) {
        showAppView(user || data.user?.email || data.user_email || 'Active Workspace', storage);
      } else {
        await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
        showAuthView();
      }
    } catch (err) {
      console.error('[Orfilo Popup] Server check error:', err);
      showAuthView();
      showAlert('Cannot reach Orfilo server. Ensure the server is running.', 'error');
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
      statLastCapture.textContent = 'Never';
    }
  }

  // Helper: Pair extension with server using JWT
  async function pairWithJwt(accessToken, serverUrl) {
    try {
      const pairRes = await fetch(`${serverUrl}/api/v1/extension/pair`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/json',
        },
      });

      if (pairRes.ok) {
        const pairData = await pairRes.json().catch(() => ({}));
        if (pairData && pairData.token) {
          return pairData.token;
        }
      }
    } catch (e) {
      console.warn('[Orfilo Popup] Pair endpoint fallback to access token:', e);
    }
    return accessToken;
  }

  // ---------------------------------------------------------------------------
  // 1. IN-POPUP SIGN IN
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
      const loginRes = await fetch(`${serverUrl}/api/v1/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const loginData = await loginRes.json().catch(() => ({}));

      if (!loginRes.ok || !loginData.token) {
        throw new Error(loginData.error || `Login failed (${loginRes.status})`);
      }

      const accessToken = loginData.token;
      const extensionKey = await pairWithJwt(accessToken, serverUrl);
      const userEmail = loginData.user?.email || email;

      await chrome.storage.local.set({
        orfiloToken: extensionKey,
        orfiloUser: userEmail,
        orfiloServerUrl: serverUrl,
      });

      loginPassword.value = '';
      const stats = await chrome.storage.local.get(['captureCount', 'lastCaptureTime']);
      showAppView(userEmail, stats);
      showAlert('Signed in and paired successfully!', 'success');
    } catch (err) {
      console.error('[Orfilo Popup] Sign in error:', err);
      showAlert(err.message || 'Unable to sign in. Please check credentials.', 'error');
    } finally {
      setLoginLoading(false);
    }
  });

  // ---------------------------------------------------------------------------
  // 2. IN-POPUP SIGN UP
  // ---------------------------------------------------------------------------
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const name = signupName.value.trim();
    const email = signupEmail.value.trim();
    const password = signupPassword.value;
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');

    if (!email || !password) {
      showAlert('Please provide an email and password.');
      return;
    }

    if (password.length < 6) {
      showAlert('Password must be at least 6 characters long.');
      return;
    }

    setSignUpLoading(true);

    try {
      const signupRes = await fetch(`${serverUrl}/api/v1/auth/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({ email, password, name }),
      });

      const signupData = await signupRes.json().catch(() => ({}));

      if (!signupRes.ok) {
        throw new Error(signupData.error || `Sign up failed (${signupRes.status})`);
      }

      const accessToken = signupData.token || signupData.session?.access_token;

      if (accessToken) {
        // Direct auto-sign-in after signup
        const extensionKey = await pairWithJwt(accessToken, serverUrl);
        const userEmail = signupData.user?.email || email;

        await chrome.storage.local.set({
          orfiloToken: extensionKey,
          orfiloUser: userEmail,
          orfiloServerUrl: serverUrl,
        });

        signupPassword.value = '';
        const stats = await chrome.storage.local.get(['captureCount', 'lastCaptureTime']);
        showAppView(userEmail, stats);
        showAlert('Account created and paired successfully!', 'success');
      } else {
        // Confirmation email required
        signupPassword.value = '';
        switchAuthTab('signin');
        loginEmail.value = email;
        showAlert('Account created! Please check your email to confirm, then sign in.', 'success');
      }
    } catch (err) {
      console.error('[Orfilo Popup] Sign up error:', err);
      showAlert(err.message || 'Unable to create account. Please try again.', 'error');
    } finally {
      setSignUpLoading(false);
    }
  });

  // ---------------------------------------------------------------------------
  // 3. IN-POPUP TOKEN PAIRING
  // ---------------------------------------------------------------------------
  tokenPairForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const token = pairingTokenInput.value.trim();
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');

    if (!token) {
      showAlert('Please paste a pairing token or extension key.');
      return;
    }

    setTokenLoading(true);

    try {
      const response = await fetch(`${serverUrl}/api/v1/extension/status`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
        },
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data.authenticated) {
        throw new Error(data.error || 'Invalid or revoked pairing token.');
      }

      const userEmail = data.user?.email || data.user_email || 'Authenticated User';
      await chrome.storage.local.set({
        orfiloToken: token,
        orfiloUser: userEmail,
        orfiloServerUrl: serverUrl,
      });

      pairingTokenInput.value = '';
      const stats = await chrome.storage.local.get(['captureCount', 'lastCaptureTime']);
      showAppView(userEmail, stats);
      showAlert('Extension successfully connected!', 'success');
    } catch (err) {
      console.error('[Orfilo Popup] Token pair error:', err);
      showAlert(err.message || 'Verification failed. Please check token.', 'error');
    } finally {
      setTokenLoading(false);
    }
  });

  // ---------------------------------------------------------------------------
  // 4. GOOGLE AUTH (Browser fallback if desired)
  // ---------------------------------------------------------------------------
  if (btnGoogleAuth) {
    btnGoogleAuth.addEventListener('click', async () => {
      hideAlert();
      const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');
      chrome.tabs.create({ url: `${serverUrl}/?action=pair-extension&auth_provider=google` });
      showAlert('Google sign-in opened in browser. Complete sign-in to pair automatically.', 'info');
    });
  }

  // ---------------------------------------------------------------------------
  // 5. DISCONNECT
  // ---------------------------------------------------------------------------
  btnDisconnect.addEventListener('click', async () => {
    try {
      const storage = await chrome.storage.local.get(['orfiloToken', 'orfiloServerUrl']);
      if (storage.orfiloToken && storage.orfiloServerUrl) {
        fetch(`${storage.orfiloServerUrl}/api/v1/connections/browser_extension/disconnect`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${storage.orfiloToken}` },
        }).catch(() => {});
      }
    } catch (_) {}

    await chrome.storage.local.remove(['orfiloToken', 'orfiloUser']);
    loginPassword.value = '';
    signupPassword.value = '';
    pairingTokenInput.value = '';
    showAuthView();
    switchAuthTab('signin');
    showAlert('Extension disconnected successfully.', 'success');
  });

  // ---------------------------------------------------------------------------
  // 6. REDIRECT ONLY FOR VIEWING FILES / FULL CONTROL ON DASHBOARD
  // ---------------------------------------------------------------------------
  btnOpenDashboard.addEventListener('click', (e) => {
    e.preventDefault();
    const serverUrl = (serverUrlInput.value.trim() || DEFAULT_SERVER_URL).replace(/\/+$/, '');
    chrome.tabs.create({ url: `${serverUrl}/` });
  });

  // ---------------------------------------------------------------------------
  // 7. REAL-TIME STORAGE LISTENER
  // ---------------------------------------------------------------------------
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && (changes.orfiloToken || changes.orfiloUser)) {
      checkAuthStatus();
    }
  });

  // ---------------------------------------------------------------------------
  // 8. SETTINGS PANEL
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
    showAlert('Server URL saved. Checking connection...', 'info');
    await checkAuthStatus();
  });
});
