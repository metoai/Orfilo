// ==============================================================================
// ORFILO SMART CAPTURE: CONTENT SCRIPT (CSP-COMPLIANT & SHADOW DOM ISOLATED)
// Observes AI conversations (ChatGPT, Claude, Gemini, v0), injects 1-tap capture
// buttons on code/images/artifacts, and detects conversation finality signals.
//
// Complies strictly with OpenAI/ChatGPT, Claude, and Gemini Content Security
// Policies (CSP): ZERO innerHTML, Shadow DOM encapsulation, and isolated events.
// ==============================================================================

(function () {
  'use strict';

  console.log('[Orfilo Smart Capture] Content script initialized on:', window.location.hostname);

  // Check if running on Orfilo web app dashboard (Localhost / Production Web Workspace)
  const isOrfiloDashboard =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.port === '3000' ||
    window.location.hostname.includes('orfilo') ||
    document.title.toLowerCase().includes('orfilo');

  if (isOrfiloDashboard) {
    // 1. Announce extension presence to the web page
    window.postMessage({ type: 'ORFILO_EXTENSION_ACTIVE', version: '1.1.0' }, '*');

    // 2. Listen for pairing requests from the web dashboard modal
    window.addEventListener('message', (event) => {
      if (event.data?.type === 'ORFILO_PING_EXTENSION') {
        window.postMessage({ type: 'ORFILO_EXTENSION_ACTIVE', version: '1.1.0' }, '*');
      }
      if (event.data?.type === 'ORFILO_PAIR_REQUEST') {
        const token = event.data.token || 'orf_ext_companion_v1';
        if (typeof chrome !== 'undefined' && chrome.runtime?.sendMessage) {
          chrome.runtime.sendMessage(
            {
              action: 'VALIDATE_AND_CONNECT',
              payload: { serverUrl: window.location.origin, apiKey: token },
            },
            (response) => {
              window.postMessage(
                {
                  type: 'ORFILO_PAIR_RESPONSE',
                  success: response?.success !== false,
                  token,
                  account: response?.data?.account || 'Active Workspace',
                },
                '*'
              );
            }
          );
        }
      }
    });

    // Don't run AI chat scraping on the Orfilo web app itself
    return;
  }

  // Finality signal phrases triggering the Smart Capture Pill
  const FINALITY_SIGNALS = [
    'perfect',
    "that's exactly what i wanted",
    'thats exactly what i wanted',
    'yes, this works',
    'yes this works',
    "that's the final version",
    'thats the final version',
    'looks good',
    'use this one',
    'use this',
    'done',
    'ship it',
  ];

  // Helper to safely build SVG without innerHTML (100% CSP-safe)
  function createOrfiloIconSvg(size = 12) {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 16 16');
    svg.setAttribute('fill', 'currentColor');
    svg.setAttribute('width', String(size));
    svg.setAttribute('height', String(size));
    svg.style.flexShrink = '0';
    svg.style.verticalAlign = 'middle';

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      'M8 1.5l5.5 3.2v6.4L8 14.5l-5.5-3.4V4.7L8 1.5zm0 2.2L4.5 5.8v4.4L8 12.3l3.5-2.1V5.8L8 3.7z'
    );

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', '8');
    circle.setAttribute('cy', '8');
    circle.setAttribute('r', '1.5');

    svg.appendChild(path);
    svg.appendChild(circle);
    return svg;
  }

  // Scoped CSS injected exclusively inside Shadow Roots
  const SHADOW_BTN_CSS = `
    .orfilo-capture-btn {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      background-color: #111111;
      color: #FFFFFF;
      border: 1px solid rgba(25, 169, 116, 0.4);
      border-radius: 6px;
      padding: 3px 8px;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 500;
      line-height: 1;
      cursor: pointer;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
      transition: all 0.15s cubic-bezier(0.16, 1, 0.3, 1);
      z-index: 9999;
      text-decoration: none;
      user-select: none;
      outline: none;
    }
    .orfilo-capture-btn:hover {
      background-color: #19A974;
      border-color: #19A974;
      color: #FFFFFF;
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(25, 169, 116, 0.35);
    }
    .orfilo-capture-btn.saving {
      background-color: #262626;
      color: #A3A3A3;
      border-color: #404040;
      cursor: wait;
    }
    .orfilo-capture-btn.saved {
      background-color: #19A974;
      border-color: #19A974;
      color: #FFFFFF;
    }
  `;

  const SHADOW_PILL_CSS = `
    .orfilo-floating-pill {
      position: fixed;
      bottom: 24px;
      right: 24px;
      background: rgba(17, 17, 17, 0.96);
      backdrop-filter: blur(12px);
      -webkit-backdrop-filter: blur(12px);
      border: 1px solid rgba(25, 169, 116, 0.5);
      border-radius: 12px;
      padding: 10px 14px;
      display: flex;
      align-items: center;
      gap: 12px;
      box-shadow: 0 12px 32px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.05);
      z-index: 2147483647;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 12px;
      color: #FFFFFF;
      animation: orfilo-slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1);
    }
    @keyframes orfilo-slide-up {
      from { opacity: 0; transform: translateY(20px) scale(0.95); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .orfilo-pill-badge {
      background: #19A974;
      color: #FFFFFF;
      font-size: 10px;
      font-weight: 700;
      padding: 2px 6px;
      border-radius: 4px;
      letter-spacing: 0.05em;
      text-transform: uppercase;
    }
    .orfilo-pill-content {
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    .orfilo-pill-title {
      font-weight: 600;
      color: #FFFFFF;
    }
    .orfilo-pill-subtitle {
      color: #A3A3A3;
      font-size: 11px;
    }
    .orfilo-pill-actions {
      display: flex;
      align-items: center;
      gap: 6px;
      margin-left: 4px;
    }
    .orfilo-pill-btn-save {
      background: #19A974;
      color: #FFFFFF;
      border: none;
      border-radius: 6px;
      padding: 6px 12px;
      font-size: 11px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.15s ease;
    }
    .orfilo-pill-btn-save:hover {
      background: #158b5e;
      transform: translateY(-1px);
    }
    .orfilo-pill-btn-close {
      background: transparent;
      color: #737373;
      border: none;
      font-size: 14px;
      cursor: pointer;
      padding: 4px 6px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .orfilo-pill-btn-close:hover {
      color: #FFFFFF;
      background: rgba(255, 255, 255, 0.1);
    }
  `;

  // Determine current AI platform
  function getPlatform() {
    const host = window.location.hostname;
    if (host.includes('chatgpt.com') || host.includes('openai.com')) return 'ChatGPT';
    if (host.includes('claude.ai')) return 'Claude';
    if (host.includes('gemini.google.com')) return 'Gemini';
    if (host.includes('v0.dev')) return 'v0';
    if (host.includes('midjourney.com')) return 'Midjourney';
    return 'AI Client';
  }

  // ---------------------------------------------------------------------------
  // 1. INJECT CAPTURE BUTTONS ON CODE BLOCKS & ARTIFACTS
  // ---------------------------------------------------------------------------
  function scanAndInjectButtons() {
    // A. Code Blocks (<pre>)
    const codeBlocks = document.querySelectorAll('pre:not([data-orfilo-injected="true"])');
    codeBlocks.forEach((pre) => {
      pre.setAttribute('data-orfilo-injected', 'true');

      // Look for code element
      const codeEl = pre.querySelector('code');
      const codeText = codeEl ? codeEl.innerText : pre.innerText;
      if (!codeText || codeText.trim().length < 15) return;

      // Detect language
      const langClass = Array.from(codeEl?.classList || []).find((c) => c.startsWith('language-'));
      const rawLang = langClass ? langClass.replace('language-', '') : '';
      const extension = mapLanguageToExtension(rawLang || detectLanguageHeuristic(codeText));

      // Container for header/action buttons
      let targetContainer = pre.querySelector('.flex.items-center') || pre.querySelector('header');
      if (!targetContainer) {
        if (getComputedStyle(pre).position === 'static') {
          pre.style.position = 'relative';
        }
        targetContainer = document.createElement('div');
        targetContainer.style.position = 'absolute';
        targetContainer.style.top = '8px';
        targetContainer.style.right = '8px';
        targetContainer.style.zIndex = '10';
        pre.appendChild(targetContainer);
      }

      // Check if already injected
      if (targetContainer.querySelector('.orfilo-btn-host')) return;

      // Create isolated Shadow DOM Host element
      const host = document.createElement('div');
      host.className = 'orfilo-btn-host';
      host.style.display = 'inline-flex';
      host.style.alignItems = 'center';
      host.style.marginRight = '6px';

      const shadow = host.attachShadow({ mode: 'open' });

      // Scoped CSS
      const styleEl = document.createElement('style');
      styleEl.textContent = SHADOW_BTN_CSS;
      shadow.appendChild(styleEl);

      // Button
      const btn = document.createElement('button');
      btn.className = 'orfilo-capture-btn';
      btn.title = 'Save this code deliverable directly to Orfilo';

      const iconSvg = createOrfiloIconSvg(12);
      const labelSpan = document.createElement('span');
      labelSpan.textContent = 'Save to Orfilo';

      btn.appendChild(iconSvg);
      btn.appendChild(labelSpan);
      shadow.appendChild(btn);

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        btn.classList.add('saving');
        labelSpan.textContent = 'Saving...';

        const filename = generateArtifactFilename(codeText, extension);
        const pageTitle = document.title || 'Conversation';

        const result = await sendCaptureMessage({
          filename,
          display_name: filename,
          source_type: 'browser_extension',
          source_name: `${getPlatform()} Extension`,
          mime_type: getMimeForExtension(extension),
          size_bytes: new Blob([codeText]).size,
          source_url: window.location.href,
          context_prompt: `Code snippet extracted from ${getPlatform()} [${pageTitle}]`,
          content_preview: codeText.slice(0, 1000),
        });

        if (result?.success) {
          btn.classList.remove('saving');
          btn.classList.add('saved');
          labelSpan.textContent = '✓ Saved';
          setTimeout(() => {
            btn.classList.remove('saved');
            labelSpan.textContent = 'Save to Orfilo';
          }, 3000);
        } else if (result?.needsRefresh) {
          btn.classList.remove('saving');
          labelSpan.textContent = '⟳ Refresh tab';
          setTimeout(() => {
            labelSpan.textContent = 'Save to Orfilo';
          }, 4000);
        } else {
          btn.classList.remove('saving');
          labelSpan.textContent = '✕ Failed';
          setTimeout(() => {
            labelSpan.textContent = 'Save to Orfilo';
          }, 3000);
        }
      });

      targetContainer.prepend(host);
    });

    // B. Generated Images (e.g. DALL-E in ChatGPT or Claude image renders)
    const images = document.querySelectorAll('img:not([data-orfilo-injected="true"])');
    images.forEach((img) => {
      if (img.width < 120 || img.height < 120) return;
      if (img.src && img.src.startsWith('data:image/svg')) return;

      img.setAttribute('data-orfilo-injected', 'true');

      const parent = img.parentElement;
      if (!parent) return;

      if (getComputedStyle(parent).position === 'static') {
        parent.style.position = 'relative';
      }

      if (parent.querySelector('.orfilo-img-host')) return;

      const host = document.createElement('div');
      host.className = 'orfilo-img-host';
      host.style.position = 'absolute';
      host.style.bottom = '12px';
      host.style.right = '12px';
      host.style.zIndex = '999';

      const shadow = host.attachShadow({ mode: 'open' });

      const styleEl = document.createElement('style');
      styleEl.textContent = SHADOW_BTN_CSS;
      shadow.appendChild(styleEl);

      const btn = document.createElement('button');
      btn.className = 'orfilo-capture-btn';
      btn.title = 'Save Image to Orfilo';

      const iconSvg = createOrfiloIconSvg(12);
      const labelSpan = document.createElement('span');
      labelSpan.textContent = 'Save Image';

      btn.appendChild(iconSvg);
      btn.appendChild(labelSpan);
      shadow.appendChild(btn);

      btn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        btn.classList.add('saving');
        labelSpan.textContent = 'Saving...';

        const filename = `generated_image_${Date.now().toString(36)}.png`;
        const result = await sendCaptureMessage({
          filename,
          display_name: filename,
          source_type: 'browser_extension',
          source_name: `${getPlatform()} Extension`,
          mime_type: 'image/png',
          size_bytes: 1048576,
          source_url: img.src,
          context_prompt: `AI generated image captured from ${getPlatform()}`,
          content_preview: `Image source: ${(img.src || '').slice(0, 200)}`,
        });

        if (result?.success) {
          btn.classList.remove('saving');
          btn.classList.add('saved');
          labelSpan.textContent = '✓ Saved';
          setTimeout(() => {
            btn.classList.remove('saved');
            labelSpan.textContent = 'Save Image';
          }, 3000);
        } else if (result?.needsRefresh) {
          btn.classList.remove('saving');
          labelSpan.textContent = '⟳ Refresh tab';
          setTimeout(() => {
            labelSpan.textContent = 'Save Image';
          }, 4000);
        } else {
          btn.classList.remove('saving');
          labelSpan.textContent = '✕ Failed';
          setTimeout(() => {
            labelSpan.textContent = 'Save Image';
          }, 3000);
        }
      });

      parent.appendChild(host);
    });
  }

  // ---------------------------------------------------------------------------
  // 2. SMART FINALITY DETECTION (Stream Listener)
  // ---------------------------------------------------------------------------
  let pillTimeout = null;

  function checkForFinalitySignals() {
    const userMessages = document.querySelectorAll(
      '[data-message-author-role="user"], .font-user-message, div[data-testid*="user"]'
    );
    if (!userMessages.length) return;

    const latestUserMsg = userMessages[userMessages.length - 1];
    const text = (latestUserMsg?.textContent || '').trim().toLowerCase();

    const isSignal = FINALITY_SIGNALS.some((sig) => text.includes(sig));
    if (isSignal && !latestUserMsg.hasAttribute('data-orfilo-signal-handled')) {
      latestUserMsg.setAttribute('data-orfilo-signal-handled', 'true');
      showSmartCapturePill();
    }
  }

  function showSmartCapturePill() {
    if (document.getElementById('orfilo-pill-host')) return;

    const host = document.createElement('div');
    host.id = 'orfilo-pill-host';
    host.style.position = 'fixed';
    host.style.bottom = '24px';
    host.style.right = '24px';
    host.style.zIndex = '2147483647';

    const shadow = host.attachShadow({ mode: 'open' });

    const styleEl = document.createElement('style');
    styleEl.textContent = SHADOW_PILL_CSS;
    shadow.appendChild(styleEl);

    const pill = document.createElement('div');
    pill.className = 'orfilo-floating-pill';

    const badge = document.createElement('span');
    badge.className = 'orfilo-pill-badge';
    badge.textContent = 'Orfilo Capture';
    pill.appendChild(badge);

    const contentDiv = document.createElement('div');
    contentDiv.className = 'orfilo-pill-content';

    const titleEl = document.createElement('div');
    titleEl.className = 'orfilo-pill-title';
    titleEl.textContent = 'Milestone Deliverable Detected';

    const subEl = document.createElement('div');
    subEl.className = 'orfilo-pill-subtitle';
    subEl.textContent = `Save latest deliverable from ${getPlatform()} to your active project?`;

    contentDiv.appendChild(titleEl);
    contentDiv.appendChild(subEl);
    pill.appendChild(contentDiv);

    const actionsDiv = document.createElement('div');
    actionsDiv.className = 'orfilo-pill-actions';

    const saveBtn = document.createElement('button');
    saveBtn.className = 'orfilo-pill-btn-save';
    saveBtn.textContent = 'Save Deliverable';

    const closeBtn = document.createElement('button');
    closeBtn.className = 'orfilo-pill-btn-close';
    closeBtn.title = 'Dismiss';
    closeBtn.textContent = '✕';

    actionsDiv.appendChild(saveBtn);
    actionsDiv.appendChild(closeBtn);
    pill.appendChild(actionsDiv);

    shadow.appendChild(pill);
    document.body.appendChild(host);

    saveBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      e.stopPropagation();
      e.stopImmediatePropagation();

      saveBtn.textContent = 'Saving...';
      saveBtn.style.opacity = '0.7';

      const assistantPres = document.querySelectorAll('pre');
      const latestCode = assistantPres.length ? assistantPres[assistantPres.length - 1] : null;
      const codeText = latestCode ? latestCode.innerText : document.title;
      const filename = `final_${getPlatform().toLowerCase()}_deliverable.ts`;

      await sendCaptureMessage({
        filename,
        display_name: filename,
        source_type: 'browser_extension',
        source_name: `${getPlatform()} Extension (Finality Pill)`,
        mime_type: 'text/plain',
        size_bytes: new Blob([codeText]).size,
        source_url: window.location.href,
        context_prompt: `Captured via Orfilo Finality Signal detector from ${getPlatform()}`,
        content_preview: codeText.slice(0, 1000),
      });

      saveBtn.textContent = '✓ Saved to Orfilo';
      saveBtn.style.background = '#158b5e';
      setTimeout(() => host.remove(), 2500);
    });

    closeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      host.remove();
    });

    clearTimeout(pillTimeout);
    pillTimeout = setTimeout(() => {
      if (host && host.parentNode) host.remove();
    }, 15000);
  }

  // ---------------------------------------------------------------------------
  // 3. UTILITIES & MESSAGING
  // ---------------------------------------------------------------------------
  async function sendCaptureMessage(payload) {
    return new Promise((resolve) => {
      try {
        if (typeof chrome === 'undefined' || !chrome.runtime || !chrome.runtime.sendMessage) {
          resolve({
            success: false,
            error: 'Extension was reloaded. Please refresh this tab (F5) to reconnect.',
            needsRefresh: true,
          });
          return;
        }

        chrome.runtime.sendMessage(
          {
            action: 'CAPTURE_ARTIFACT',
            payload,
          },
          (response) => {
            if (chrome.runtime?.lastError) {
              const err = chrome.runtime.lastError.message || '';
              const isInvalidated = err.includes('context invalidated') || err.includes('Extension context');
              resolve({
                success: false,
                error: isInvalidated ? 'Extension reloaded. Please refresh tab (F5).' : err,
                needsRefresh: isInvalidated,
              });
              return;
            }
            resolve(response || { success: false });
          }
        );
      } catch (err) {
        resolve({
          success: false,
          error: 'Please refresh this tab (F5) to reconnect.',
          needsRefresh: true,
        });
      }
    });
  }

  function mapLanguageToExtension(lang) {
    const l = (lang || '').toLowerCase();
    const map = {
      typescript: 'ts',
      ts: 'ts',
      javascript: 'js',
      js: 'js',
      python: 'py',
      py: 'py',
      json: 'json',
      sql: 'sql',
      html: 'html',
      css: 'css',
      markdown: 'md',
      md: 'md',
      yaml: 'yaml',
      yml: 'yaml',
      sh: 'sh',
      bash: 'sh',
      rust: 'rs',
      go: 'go',
      java: 'java',
      cpp: 'cpp',
    };
    return map[l] || 'ts';
  }

  function detectLanguageHeuristic(code) {
    if (code.includes('import ') && code.includes(': ') && code.includes('interface ')) return 'ts';
    if (code.includes('import React') || code.includes('export default function')) return 'tsx';
    if (code.includes('def ') && code.includes(':') && (code.includes('self') || code.includes('print('))) return 'py';
    if (code.includes('SELECT ') && code.includes(' FROM ')) return 'sql';
    if (code.trim().startsWith('{') && code.trim().endsWith('}')) return 'json';
    return 'ts';
  }

  function getMimeForExtension(ext) {
    const map = {
      ts: 'text/typescript',
      js: 'text/javascript',
      py: 'text/x-python',
      sql: 'application/sql',
      json: 'application/json',
      md: 'text/markdown',
      html: 'text/html',
      css: 'text/css',
    };
    return map[ext] || 'text/plain';
  }

  function generateArtifactFilename(code, ext) {
    const firstLines = code.split('\n').slice(0, 10).join(' ');
    const funcMatch = firstLines.match(/function\s+([A-Za-z0-9_]+)/);
    const classMatch = firstLines.match(/class\s+([A-Za-z0-9_]+)/);
    const constMatch = firstLines.match(/(?:const|let|var)\s+([A-Za-z0-9_]+)/);

    const name = funcMatch?.[1] || classMatch?.[1] || constMatch?.[1] || 'deliverable';
    const kebab = name.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    return `${kebab}.${ext}`;
  }

  // ---------------------------------------------------------------------------
  // 4. DEBOUNCED OBSERVER LOOP (ZERO-MAIN-THREAD BLOCKING)
  // ---------------------------------------------------------------------------
  let debounceTimer = null;
  function scheduleScan() {
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      scanAndInjectButtons();
      checkForFinalitySignals();
    }, 350);
  }

  // Periodic fallback check
  setInterval(scheduleScan, 3000);

  // MutationObserver for dynamic React/SPA rendering
  const observer = new MutationObserver((mutations) => {
    // Only schedule if mutations added relevant nodes
    const hasInterestingNodes = mutations.some((m) =>
      Array.from(m.addedNodes).some((n) => n.nodeType === 1 && (n.nodeName === 'PRE' || n.querySelector?.('pre, img')))
    );
    if (hasInterestingNodes) {
      scheduleScan();
    }
  });

  if (document.body) {
    observer.observe(document.body, { childList: true, subtree: true });
    scheduleScan();
  } else {
    document.addEventListener('DOMContentLoaded', () => {
      observer.observe(document.body, { childList: true, subtree: true });
      scheduleScan();
    });
  }
})();
