// ==============================================================================
// ORFILO BROWSER EXTENSION: BACKGROUND SERVICE WORKER (Manifest V3)
// Production artifact ingestion pipeline with real binary payloads & metrics
// ==============================================================================

const DEFAULT_SERVER_URL = 'http://localhost:3000';

// -----------------------------------------------------------------------------
// 1. LIFECYCLE & CONTEXT MENUS SETUP
// -----------------------------------------------------------------------------
chrome.runtime.onInstalled.addListener(() => {
  createContextMenus();
});

chrome.runtime.onStartup.addListener(() => {
  createContextMenus();
});

function createContextMenus() {
  if (!chrome.contextMenus) return;
  chrome.contextMenus.removeAll(() => {
    chrome.contextMenus.create({
      id: 'orfilo_save_selection',
      title: 'Save text selection to Orfilo',
      contexts: ['selection'],
    });

    chrome.contextMenus.create({
      id: 'orfilo_save_image',
      title: 'Save image to Orfilo',
      contexts: ['image'],
    });

    chrome.contextMenus.create({
      id: 'orfilo_save_link',
      title: 'Save link to Orfilo',
      contexts: ['link'],
    });

    chrome.contextMenus.create({
      id: 'orfilo_save_page',
      title: 'Save page to Orfilo',
      contexts: ['page'],
    });
  });
}

// -----------------------------------------------------------------------------
// 2. HELPER UTILITIES
// -----------------------------------------------------------------------------
function detectSourceName(url) {
  if (!url) return 'Web Browser';
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('claude.ai')) return 'Claude';
    if (host.includes('gemini.google.com')) return 'Gemini';
    if (host.includes('v0.dev')) return 'v0';
    if (host.includes('midjourney.com')) return 'Midjourney';
    return parsed.hostname.replace(/^www\./, '');
  } catch (_) {
    return 'Web Browser';
  }
}

function arrayBufferToBase64(buffer) {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  const chunkSize = 8192;
  for (let i = 0; i < bytes.length; i += chunkSize) {
    const chunk = bytes.subarray(i, i + chunkSize);
    binary += String.fromCharCode.apply(null, chunk);
  }
  return btoa(binary);
}

function textToBase64(text) {
  const bytes = new TextEncoder().encode(text);
  return arrayBufferToBase64(bytes.buffer);
}

function showNotification(title, message, isError = false) {
  if (!chrome.notifications) return;
  const notifId = 'orfilo_' + Date.now();
  chrome.notifications.create(
    notifId,
    {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message,
      priority: isError ? 2 : 1,
    },
    () => {
      if (chrome.runtime.lastError) {
        console.warn('[Orfilo Notification error]:', chrome.runtime.lastError.message);
      }
    }
  );
}

async function getAuthCredentials() {
  const data = await chrome.storage.local.get(['orfiloToken', 'orfiloServerUrl']);
  const token = data.orfiloToken;
  const serverUrl = (data.orfiloServerUrl || DEFAULT_SERVER_URL).replace(/\/+$/, '');
  return { token, serverUrl };
}

async function recordSuccessfulCapture(itemTitle) {
  const data = await chrome.storage.local.get(['captureCount', 'recentCaptures']);
  const count = (typeof data.captureCount === 'number' ? data.captureCount : 0) + 1;
  const recent = Array.isArray(data.recentCaptures) ? data.recentCaptures : [];

  recent.unshift({
    title: itemTitle,
    capturedAt: new Date().toISOString(),
  });

  if (recent.length > 20) recent.pop();

  await chrome.storage.local.set({
    captureCount: count,
    lastCaptureTime: new Date().toISOString(),
    recentCaptures: recent,
  });
}

// -----------------------------------------------------------------------------
// 3. CORE INGESTION PIPELINE
// -----------------------------------------------------------------------------
async function ingestArtifact({
  filename,
  mimeType,
  extension,
  actualSize,
  sourceUrl,
  sourceName,
  description,
  base64Content,
  previewText,
  conversationTitle = '',
  promptText = '',
  altText = '',
}) {
  const { token, serverUrl } = await getAuthCredentials();

  if (!token) {
    showNotification('Authentication Required', 'Please log in to Orfilo extension first.', true);
    throw new Error('Not authenticated');
  }

  const payload = {
    original_name: filename,
    display_name: filename,
    filename: filename,
    mime_type: mimeType,
    extension: extension.replace(/^\./, ''),
    size_bytes: actualSize,
    source_type: 'browser_extension',
    source_name: sourceName,
    source_url: sourceUrl,
    conversation_title: conversationTitle,
    context_prompt: promptText,
    alt_text: altText,
    description: description || `Captured from ${sourceName}`,
    metadata: {
      source_url: sourceUrl,
      conversation_title: conversationTitle,
      context_prompt: promptText,
      alt_text: altText,
      captured_at: new Date().toISOString(),
    },
    content_base64: base64Content,
    content_preview: previewText || (description ? description.slice(0, 300) : ''),
  };

  const response = await fetch(`${serverUrl}/api/v1/artifacts`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new Error(errorBody.error || `Server responded with ${response.status}`);
  }

  const responseData = await response.json();
  const savedItem = responseData?.data || {};
  const orgInfo = responseData?.organization || {};

  const finalTitle = savedItem.display_name || filename;
  const folderPath = orgInfo.provider_path || savedItem.provider_path || '';

  await recordSuccessfulCapture(finalTitle);

  showNotification(
    'Saved to Orfilo',
    folderPath ? `"${finalTitle}" saved to:\n${folderPath}` : `"${finalTitle}" saved successfully.`
  );

  return responseData;
}

// -----------------------------------------------------------------------------
// 4. CONTEXT MENU DISPATCHER
// -----------------------------------------------------------------------------
chrome.contextMenus.onClicked.addListener(async (info, tab) => {
  const pageUrl = info.pageUrl || tab?.url || '';
  const sourceName = detectSourceName(pageUrl);

  // Extract page / conversation title
  const rawTitle = tab?.title || '';
  const cleanTitle = rawTitle
    .replace(/\s*[-–|]\s*(ChatGPT|Claude|Gemini|v0|Midjourney).*$/i, '')
    .trim();

  let context = {
    conversationTitle: cleanTitle || 'AI Deliverables',
    promptText: '',
    altText: '',
    sourceUrl: pageUrl,
  };

  // Ask tab content script for surrounding context if available
  if (tab?.id) {
    try {
      const inPageCtx = await chrome.tabs.sendMessage(tab.id, {
        action: 'EXTRACT_CONTEXT',
        srcUrl: info.srcUrl,
      });
      if (inPageCtx) {
        context = { ...context, ...inPageCtx };
      }
    } catch (_) {}
  }

  try {
    if (info.menuItemId === 'orfilo_save_image' && info.srcUrl) {
      await captureImageFromUrl(info.srcUrl, pageUrl, sourceName, context);
    } else if (info.menuItemId === 'orfilo_save_selection' && info.selectionText) {
      await captureTextContent(info.selectionText, pageUrl, sourceName, 'Snippet', 'md', context);
    } else if (info.menuItemId === 'orfilo_save_link' && info.linkUrl) {
      const linkText = `Link URL: ${info.linkUrl}\nPage Source: ${pageUrl}`;
      await captureTextContent(linkText, pageUrl, sourceName, 'Bookmark', 'md', context);
    } else if (info.menuItemId === 'orfilo_save_page') {
      const pageTitle = tab?.title || 'Web Page';
      const summary = `Title: ${pageTitle}\nURL: ${pageUrl}\nCaptured: ${new Date().toISOString()}`;
      await captureTextContent(summary, pageUrl, sourceName, pageTitle, 'md', context);
    }
  } catch (err) {
    console.error('[Orfilo Background] Capture failed:', err);
    if (err.message !== 'Not authenticated') {
      showNotification('Capture Failed', err.message || 'Unable to save to Orfilo.', true);
    }
  }
});

// -----------------------------------------------------------------------------
// 5. CAPTURE HANDLERS (IMAGES & TEXT)
// -----------------------------------------------------------------------------
async function captureImageFromUrl(imageUrl, pageUrl, sourceName, context = {}) {
  let mimeType = 'image/png';
  let ext = 'png';
  let base64Content = null;
  let actualSize = 0;

  if (imageUrl.startsWith('data:')) {
    // Handle inline data URLs directly
    const matches = imageUrl.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,(.+)$/);
    if (!matches) throw new Error('Invalid data URL image format');
    mimeType = matches[1];
    base64Content = matches[2];
    actualSize = Math.round(base64Content.length * 0.75);

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('gif')) ext = 'gif';

  } else if (imageUrl.startsWith('blob:')) {
    // Blob URLs are only accessible in the page context, not the service worker.
    // Ask the content script in the active tab to convert it to base64.
    const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
    const tabId = tabs[0]?.id;
    if (!tabId) throw new Error('Cannot access blob image: no active tab');

    const result = await new Promise((resolve, reject) => {
      const timeout = setTimeout(() => reject(new Error('Blob fetch timeout')), 15000);
      chrome.tabs.sendMessage(tabId, { action: 'FETCH_BLOB_AS_BASE64', blobUrl: imageUrl }, (response) => {
        clearTimeout(timeout);
        if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
        if (!response || response.error) return reject(new Error(response?.error || 'Blob fetch failed'));
        resolve(response);
      });
    });

    base64Content = result.base64;
    mimeType = result.mimeType || 'image/png';
    actualSize = result.size || 0;

    if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
    else if (mimeType.includes('webp')) ext = 'webp';
    else if (mimeType.includes('svg')) ext = 'svg';
    else if (mimeType.includes('gif')) ext = 'gif';
    else if (mimeType.includes('png')) ext = 'png';

  } else {
    // Regular HTTP(S) URLs — fetch from service worker
    // Add no-cors mode with credentials to handle Google-hosted images
    let res;
    try {
      res = await fetch(imageUrl, { mode: 'cors', credentials: 'omit' });
      if (!res.ok) throw new Error(`Status ${res.status}`);
    } catch (_corsErr) {
      // Fall back to no-cors but this returns an opaque response with no body
      // In that case we ask the content script to do the fetch
      const tabs = await chrome.tabs.query({ active: true, currentWindow: true });
      const tabId = tabs[0]?.id;
      if (!tabId) throw new Error(`Cannot fetch image from ${imageUrl}`);

      const result = await new Promise((resolve, reject) => {
        const timeout = setTimeout(() => reject(new Error('Image fetch timeout')), 15000);
        chrome.tabs.sendMessage(tabId, { action: 'FETCH_IMAGE_AS_BASE64', imageUrl }, (response) => {
          clearTimeout(timeout);
          if (chrome.runtime.lastError) return reject(new Error(chrome.runtime.lastError.message));
          if (!response || response.error) return reject(new Error(response?.error || 'Image fetch failed in content script'));
          resolve(response);
        });
      });

      base64Content = result.base64;
      mimeType = result.mimeType || 'image/png';
      actualSize = result.size || 0;

      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('png')) ext = 'png';
    }

    if (!base64Content && res) {
      const blob = await res.blob();
      if (blob.type) mimeType = blob.type;

      if (mimeType.includes('jpeg') || mimeType.includes('jpg')) ext = 'jpg';
      else if (mimeType.includes('webp')) ext = 'webp';
      else if (mimeType.includes('svg')) ext = 'svg';
      else if (mimeType.includes('gif')) ext = 'gif';
      else if (mimeType.includes('png')) ext = 'png';

      const arrayBuffer = await blob.arrayBuffer();
      base64Content = arrayBufferToBase64(arrayBuffer);
      actualSize = blob.size || arrayBuffer.byteLength;
    }
  }

  if (!base64Content) throw new Error('Could not get image content');

  let baseName = 'image';
  if (!imageUrl.startsWith('blob:')) {
    try {
      const urlObj = new URL(imageUrl);
      const pathnameParts = urlObj.pathname.split('/');
      const lastPart = pathnameParts[pathnameParts.length - 1];
      if (lastPart && lastPart.length < 50 && lastPart.includes('.')) {
        baseName = lastPart.split('.')[0];
      }
    } catch (_) {}
  }

  const filename = `${baseName}-${Date.now()}.${ext}`;

  await ingestArtifact({
    filename,
    mimeType,
    extension: ext,
    actualSize,
    sourceUrl: pageUrl,
    sourceName,
    description: context.promptText || `Captured image from ${sourceName}`,
    base64Content,
    previewText: `[Image: ${filename}]`,
    conversationTitle: context.conversationTitle,
    promptText: context.promptText,
    altText: context.altText,
  });
}

async function captureTextContent(text, pageUrl, sourceName, label = 'Snippet', suggestedExt = 'md', context = {}) {
  const encoder = new TextEncoder();
  const encoded = encoder.encode(text);
  const actualSize = encoded.length;
  const base64Content = arrayBufferToBase64(encoded.buffer);

  let ext = suggestedExt;
  let mimeType = 'text/plain';

  if (ext === 'md') mimeType = 'text/markdown';
  else if (ext === 'js' || ext === 'ts') mimeType = 'text/javascript';
  else if (ext === 'py') mimeType = 'text/x-python';
  else if (ext === 'json') mimeType = 'application/json';

  const cleanLabel = label.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 30) || 'snippet';
  const filename = `${cleanLabel}-${Date.now()}.${ext}`;

  await ingestArtifact({
    filename,
    mimeType,
    extension: ext,
    actualSize,
    sourceUrl: pageUrl,
    sourceName,
    description: context.promptText || `${label} captured from ${sourceName}`,
    base64Content,
    previewText: text.slice(0, 500),
    conversationTitle: context.conversationTitle,
    promptText: context.promptText,
    altText: context.altText,
  });
}

async function captureDocument({
  title,
  docUrl,
  pageUrl,
  sourceName,
  context = {},
  docContent = '',
}) {
  const cleanTitle = (title || 'Document').trim();
  const slug = cleanTitle.toLowerCase().replace(/[^a-z0-9_-]/g, '-').slice(0, 40) || 'document';
  let ext = 'gdoc';
  let mimeType = 'application/vnd.google-apps.document';

  if (docUrl.includes('/spreadsheets/')) {
    ext = 'gsheet';
    mimeType = 'application/vnd.google-apps.spreadsheet';
  } else if (docUrl.includes('/presentation/')) {
    ext = 'gslides';
    mimeType = 'application/vnd.google-apps.presentation';
  } else if (docUrl.endsWith('.pdf')) {
    ext = 'pdf';
    mimeType = 'application/pdf';
  } else if (docUrl.endsWith('.docx')) {
    ext = 'docx';
    mimeType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
  }

  const filename = `${slug}.${ext}`;
  const textContent =
    docContent ||
    `# ${cleanTitle}\n\nURL: ${docUrl}\nGenerated by: ${sourceName}\nCaptured at: ${new Date().toISOString()}\n\n${context.promptText ? `Prompt: ${context.promptText}\n` : ''}`;
  const base64Content = textToBase64(textContent);
  const actualSize = textContent.length;

  await ingestArtifact({
    filename,
    mimeType,
    extension: ext,
    actualSize,
    sourceUrl: docUrl || pageUrl,
    sourceName,
    description: context.promptText || `Document created in ${sourceName}: ${cleanTitle}`,
    base64Content,
    previewText: textContent.slice(0, 500),
    conversationTitle: context.conversationTitle,
    promptText: context.promptText,
    altText: cleanTitle,
  });
}

// -----------------------------------------------------------------------------
// 6. MESSAGING INTERFACE (FROM CONTENT SCRIPT)
// -----------------------------------------------------------------------------
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'PAIR_EXTENSION') {
    (async () => {
      try {
        const token = message.token;
        const userEmail = message.userEmail || 'Google User';
        const serverUrl = message.serverUrl || DEFAULT_SERVER_URL;
        if (!token) throw new Error('No token provided');

        await chrome.storage.local.set({
          orfiloToken: token,
          orfiloUser: userEmail,
          orfiloServerUrl: serverUrl,
        });

        showNotification('Orfilo Extension Paired!', `Signed in as ${userEmail}. Ready to capture AI deliverables.`);
        sendResponse({ success: true });
      } catch (err) {
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true;
  }

  if (message.action === 'CAPTURE_ARTIFACT') {
    (async () => {
      try {
        const payload = message.payload || {};
        const pageUrl = sender.tab?.url || payload.sourceUrl || '';
        const sourceName = payload.sourceName || detectSourceName(pageUrl);

        const context = {
          conversationTitle: payload.conversationTitle || '',
          promptText: payload.promptText || '',
          altText: payload.altText || '',
          sourceUrl: pageUrl,
        };

        if (payload.type === 'image' && payload.imageUrl) {
          await captureImageFromUrl(payload.imageUrl, pageUrl, sourceName, context);
        } else if (payload.type === 'document' || payload.docUrl) {
          await captureDocument({
            title: payload.title,
            docUrl: payload.docUrl,
            pageUrl,
            sourceName,
            context,
            docContent: payload.docContent,
          });
        } else if (payload.type === 'code' || payload.type === 'text') {
          const content = payload.content || '';
          const ext = payload.extension || 'txt';
          const label = payload.label || 'code';
          await captureTextContent(content, pageUrl, sourceName, label, ext, context);
        } else {
          throw new Error('Unsupported artifact payload type');
        }

        sendResponse({ success: true });
      } catch (err) {
        console.error('[Orfilo Background] Message capture error:', err);
        sendResponse({ success: false, error: err.message });
      }
    })();
    return true; // Keep message channel open for async response
  }
});
