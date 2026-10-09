// ==============================================================================
// ORFILO BROWSER EXTENSION: BACKGROUND SERVICE WORKER (Manifest V3)
// Handles artifact capture, download interception, API sync, and notification dispatch
// ==============================================================================

const DEFAULT_SETTINGS = {
  serverUrl: 'http://localhost:3000',
  apiKey: '', // Empty by default in production; requires workspace pairing
  selectedProjectId: '',
  selectedProjectName: '',
  autoInterceptDownloads: true,
  detectFinalitySignals: true,
  captureCount: 0,
  recentCaptures: [],
};

// -----------------------------------------------------------------------------
// 1. LIFECYCLE & INSTALLATION
// -----------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(async (details) => {
  try {
    console.log('[Orfilo Extension] Installed or Updated:', details.reason);

    const stored = await chrome.storage.local.get(null);
    const initialSettings = { ...DEFAULT_SETTINGS, ...stored };
    await chrome.storage.local.set(initialSettings);

    // Setup context menu options
    setupContextMenus();

    // Test connection on startup
    await checkServerConnection(initialSettings.serverUrl, initialSettings.apiKey);
  } catch (err) {
    console.warn('[Orfilo Extension] onInstalled notice:', err);
  }
});

function setupContextMenus() {
  if (!chrome.contextMenus) return;
  try {
    chrome.contextMenus.removeAll(() => {
      if (chrome.runtime.lastError) return;
      chrome.contextMenus.create({
        id: 'orfilo_save_selection',
        title: 'Save text snippet to Orfilo',
        contexts: ['selection'],
      });

      chrome.contextMenus.create({
        id: 'orfilo_save_image',
        title: 'Save image to Orfilo Project',
        contexts: ['image'],
      });

      chrome.contextMenus.create({
        id: 'orfilo_save_page',
        title: 'Catalog active page in Orfilo',
        contexts: ['page'],
      });
    });
  } catch (err) {
    console.warn('[Orfilo Extension] contextMenus setup notice:', err);
  }
}

// -----------------------------------------------------------------------------
// 2. CONTEXT MENU ACTIONS
// -----------------------------------------------------------------------------
if (chrome.contextMenus && chrome.contextMenus.onClicked) {
  chrome.contextMenus.onClicked.addListener(async (info, tab) => {
    const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);

    if (info.menuItemId === 'orfilo_save_selection' && info.selectionText) {
      const text = info.selectionText.trim();
      const cleanSnippetName = `snippet_${Date.now().toString(36)}.txt`;
      await captureArtifact({
        filename: cleanSnippetName,
        display_name: `Snippet: ${text.slice(0, 32)}...`,
        source_type: 'browser_extension',
        source_name: getSourceFromUrl(tab?.url || ''),
        mime_type: 'text/plain',
        size_bytes: new TextEncoder().encode(text).length,
        source_url: tab?.url || '',
        context_prompt: `Captured text snippet from ${tab?.title || 'browser tab'}`,
        content_preview: text.slice(0, 500),
        project_id: settings.selectedProjectId || undefined,
      });
    }

    if (info.menuItemId === 'orfilo_save_image' && info.srcUrl) {
      const urlParts = info.srcUrl.split('?')[0].split('/');
      const rawFilename = urlParts[urlParts.length - 1] || 'ai_generated_image.png';
      const ext = rawFilename.includes('.') ? rawFilename.split('.').pop() : 'png';
      const mime = ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : ext === 'svg' ? 'image/svg+xml' : 'image/png';

      await captureArtifact({
        filename: rawFilename,
        display_name: rawFilename,
        source_type: 'browser_extension',
        source_name: getSourceFromUrl(tab?.url || ''),
        mime_type: mime,
        size_bytes: 1048576, // approximate for web preview
        source_url: info.srcUrl,
        context_prompt: `Captured image artifact from ${tab?.title || 'browser tab'}`,
        content_preview: `Image URL: ${info.srcUrl}`,
        project_id: settings.selectedProjectId || undefined,
      });
    }

    if (info.menuItemId === 'orfilo_save_page' && tab) {
      await captureArtifact({
        filename: `${tab.title?.toLowerCase().replace(/[^a-z0-9]/g, '_') || 'page'}.md`,
        display_name: tab.title || 'Saved Page Reference',
        source_type: 'browser_extension',
        source_name: getSourceFromUrl(tab.url || ''),
        mime_type: 'text/markdown',
        size_bytes: 2048,
        source_url: tab.url || '',
        context_prompt: `Web research bookmark: ${tab.title}`,
        content_preview: `URL: ${tab.url}\nTitle: ${tab.title}`,
        project_id: settings.selectedProjectId || undefined,
      });
    }
  });
}

// -----------------------------------------------------------------------------
// 3. SMART DOWNLOAD INTERCEPTION
// -----------------------------------------------------------------------------
const AI_DOMAINS = [
  'chatgpt.com',
  'openai.com',
  'claude.ai',
  'anthropic.com',
  'gemini.google.com',
  'midjourney.com',
  'v0.dev',
  'canva.com',
  'huggingface.co',
];

chrome.downloads.onCreated.addListener(async (downloadItem) => {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  if (!settings.autoInterceptDownloads) return;

  const url = downloadItem.url || downloadItem.referrer || '';
  const isAiSource = AI_DOMAINS.some((domain) => url.includes(domain));

  if (isAiSource) {
    const rawFilename = downloadItem.filename ? downloadItem.filename.split('/').pop() : 'ai_deliverable.bin';
    const ext = rawFilename.includes('.') ? rawFilename.split('.').pop() : 'bin';
    const sourceName = getSourceFromUrl(url);

    console.log('[Orfilo Extension] Intercepted AI download:', rawFilename, 'from', sourceName);

    // Ingest into Orfilo backend
    captureArtifact({
      filename: rawFilename,
      display_name: rawFilename,
      source_type: 'browser_extension',
      source_name: `${sourceName} (Smart Intercept)`,
      mime_type: downloadItem.mime || 'application/octet-stream',
      size_bytes: downloadItem.fileSize || 1024,
      source_url: url,
      context_prompt: `Intercepted download from creative workspace ${sourceName}`,
      project_id: settings.selectedProjectId || undefined,
    });
  }
});

// -----------------------------------------------------------------------------
// 4. MESSAGE ROUTER
// -----------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  handleMessage(message)
    .then((res) => sendResponse(res))
    .catch((err) => sendResponse({ success: false, error: err.message }));
  return true; // Keep message channel open for async response
});

async function handleMessage(message) {
  const { action, payload } = message;

  switch (action) {
    case 'CHECK_CONNECTION': {
      const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
      const serverUrl = payload?.serverUrl || settings.serverUrl;
      const apiKey = payload?.apiKey !== undefined ? payload.apiKey : settings.apiKey;
      const status = await checkServerConnection(serverUrl, apiKey);
      return { success: true, ...status };
    }

    case 'GET_PROJECTS': {
      const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
      const projects = await fetchServerProjects(settings.serverUrl, settings.apiKey);
      return { success: true, projects };
    }

    case 'CAPTURE_ARTIFACT': {
      const result = await captureArtifact(payload);
      return result;
    }

    case 'GET_SETTINGS': {
      const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
      return { success: true, settings };
    }

    case 'UPDATE_SETTINGS': {
      await chrome.storage.local.set(payload);
      const updated = await chrome.storage.local.get(DEFAULT_SETTINGS);
      if (payload.apiKey !== undefined || payload.serverUrl !== undefined) {
        await checkServerConnection(updated.serverUrl, updated.apiKey);
      }
      return { success: true, settings: updated };
    }

    case 'LOGIN_USER': {
      const serverUrl = payload?.serverUrl || 'http://localhost:3000';
      const email = payload?.email;
      const password = payload?.password;
      try {
        const res = await fetch(`${serverUrl}/api/v1/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const json = await res.json();
        if (res.ok && json.success) {
          await chrome.storage.local.set({
            serverUrl,
            apiKey: json.token,
            userEmail: json.user?.email || email,
            selectedProjectId: json.workspace?.project_id || '',
          });
          chrome.action.setBadgeText({ text: 'ON' });
          chrome.action.setBadgeBackgroundColor({ color: '#19A974' });
          return { success: true, token: json.token, user: json.user, workspace: json.workspace };
        } else {
          return { success: false, error: json.error || 'Login failed' };
        }
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    case 'PAIR_WORKSPACE': {
      const res = await pairWithWorkspace(payload?.serverUrl, payload?.token);
      return res;
    }

    case 'VALIDATE_AND_CONNECT': {
      const serverUrl = payload?.serverUrl || 'http://localhost:3000';
      const apiKey = (payload?.apiKey || '').trim();
      if (!apiKey) {
        return { success: false, error: 'Token cannot be empty' };
      }
      const status = await checkServerConnection(serverUrl, apiKey);
      if (!status.connected) {
        return { success: false, error: 'Cannot reach Orfilo server at ' + serverUrl };
      }
      if (status.authenticated === false) {
        return { success: false, error: 'Invalid token. Please check your Orfilo Companion key.' };
      }
      await chrome.storage.local.set({ serverUrl, apiKey });
      return { success: true, data: status.data };
    }

    case 'DISCONNECT_WORKSPACE': {
      await chrome.storage.local.set({
        apiKey: '',
        selectedProjectId: '',
        selectedProjectName: '',
      });
      chrome.action.setBadgeText({ text: 'AUTH' });
      chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
      return { success: true };
    }

    default:
      return { success: false, error: `Unknown action: ${action}` };
  }
}

// -----------------------------------------------------------------------------
// 5. CORE API CLIENT HELPERS
// -----------------------------------------------------------------------------
async function checkServerConnection(serverUrl, apiKey) {
  try {
    const headers = { Accept: 'application/json' };
    if (apiKey) {
      headers['Authorization'] = `Bearer ${apiKey}`;
    }
    const res = await fetch(`${serverUrl}/api/v1/extension/status`, {
      method: 'GET',
      headers,
    });
    if (res.ok) {
      const data = await res.json();
      const isAuthed = Boolean(apiKey && data.authenticated !== false);
      if (isAuthed) {
        chrome.action.setBadgeText({ text: 'ON' });
        chrome.action.setBadgeBackgroundColor({ color: '#19A974' });
      } else {
        chrome.action.setBadgeText({ text: 'AUTH' });
        chrome.action.setBadgeBackgroundColor({ color: '#F59E0B' });
      }
      return { connected: true, authenticated: isAuthed, data };
    }
  } catch {
    // Offline or unreachable
  }
  chrome.action.setBadgeText({ text: '!' });
  chrome.action.setBadgeBackgroundColor({ color: '#E53E3E' });
  return { connected: false, authenticated: false, error: 'Cannot reach Orfilo server' };
}

async function fetchServerProjects(serverUrl, apiKey) {
  try {
    const res = await fetch(`${serverUrl}/api/v1/projects`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
    });
    if (res.ok) {
      const json = await res.json();
      return json.data || [];
    }
  } catch (err) {
    console.error('[Orfilo Extension] Failed to fetch projects:', err);
  }
  return [];
}

async function captureArtifact(artifactData) {
  const settings = await chrome.storage.local.get(DEFAULT_SETTINGS);
  const serverUrl = settings.serverUrl || 'http://localhost:3000';
  const apiKey = settings.apiKey || 'orf_ext_companion_v1';

  const body = {
    filename: artifactData.filename || 'ai-deliverable.bin',
    display_name: artifactData.display_name,
    source_type: 'browser_extension',
    source_name: artifactData.source_name || 'Browser Extension',
    mime_type: artifactData.mime_type || 'application/octet-stream',
    size_bytes: artifactData.size_bytes || 2048,
    source_url: artifactData.source_url || '',
    context_prompt: artifactData.context_prompt || '',
    content_preview: artifactData.content_preview || '',
    project_id: artifactData.project_id || settings.selectedProjectId || undefined,
  };

  try {
    const res = await fetch(`${serverUrl}/api/v1/artifacts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'x-source-client': 'orfilo-chrome-extension-v1',
      },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errJson = await res.json().catch(() => ({}));
      throw new Error(errJson.error || `HTTP ${res.status}`);
    }

    const json = await res.json();
    const saved = json.data;
    const suggestion = json.suggestion;

    // Increment count & save in history
    const nextCount = (settings.captureCount || 0) + 1;
    const historyItem = {
      id: saved?.id || 'art_' + Date.now().toString(36),
      filename: saved?.original_name || body.filename,
      display_name: saved?.display_name || body.filename,
      project_name: suggestion?.project_name || 'Inbox',
      suggested_location: suggestion?.suggested_location || 'Meto / Assets',
      category: suggestion?.category || 'General',
      timestamp: new Date().toISOString(),
      source_name: body.source_name,
    };

    const recentCaptures = [historyItem, ...(settings.recentCaptures || [])].slice(0, 20);

    await chrome.storage.local.set({
      captureCount: nextCount,
      recentCaptures,
    });

    // Update Extension Badge
    chrome.action.setBadgeText({ text: String(nextCount) });
    chrome.action.setBadgeBackgroundColor({ color: '#19A974' });

    // Show Native Notification
    if (chrome.notifications) {
      chrome.notifications.create({
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Artifact Saved to Orfilo',
        message: `"${historyItem.display_name}" organized into ${historyItem.suggested_location}`,
        priority: 1,
      });
    }

    return { success: true, data: saved, suggestion };
  } catch (err) {
    console.error('[Orfilo Extension] Ingestion failed:', err);
    return { success: false, error: err.message };
  }
}

async function pairWithWorkspace(serverUrl, token) {
  try {
    const headers = { 'Content-Type': 'application/json' };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    const res = await fetch(`${serverUrl}/api/v1/extension/pair`, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        client_name: 'Orfilo Smart Capture Chrome Extension',
        version: '1.1.0',
      }),
    });

    if (res.ok) {
      const json = await res.json();
      const finalToken = json.token || token;
      const email = json.user?.email || 'metoaipr@gmail.com';
      await chrome.storage.local.set({
        serverUrl,
        apiKey: finalToken,
        userEmail: email,
        selectedProjectId: json.default_project_id || '',
      });
      chrome.action.setBadgeText({ text: 'ON' });
      chrome.action.setBadgeBackgroundColor({ color: '#19A974' });
      return { success: true, token: finalToken, user: json.user, workspace: json.workspace };
    }
  } catch (err) {
    return { success: false, error: err.message };
  }
  return { success: false, error: 'Pairing failed' };
}

function getSourceFromUrl(url) {
  if (url.includes('chatgpt.com') || url.includes('openai.com')) return 'ChatGPT';
  if (url.includes('claude.ai') || url.includes('anthropic.com')) return 'Claude';
  if (url.includes('gemini.google.com')) return 'Gemini';
  if (url.includes('midjourney.com')) return 'Midjourney';
  if (url.includes('v0.dev')) return 'v0';
  if (url.includes('canva.com')) return 'Canva';
  return 'Web Extension';
}
