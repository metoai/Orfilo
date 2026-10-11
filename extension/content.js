// ==============================================================================
// ORFILO BROWSER EXTENSION: CONTENT SCRIPT
// Clean, reliable in-page deliverable capture for AI tool interfaces
// ==============================================================================

(function () {
  'use strict';

  // ---------------------------------------------------------------------------
  // 1. DETECT AI TOOL
  // ---------------------------------------------------------------------------
  function detectPlatform() {
    const host = window.location.hostname.toLowerCase();
    if (host.includes('chatgpt.com') || host.includes('chat.openai.com')) return 'ChatGPT';
    if (host.includes('claude.ai')) return 'Claude';
    if (host.includes('gemini.google.com')) return 'Gemini';
    if (host.includes('v0.dev')) return 'v0';
    if (host.includes('midjourney.com')) return 'Midjourney';
    return null;
  }

  function isOrfiloApp() {
    const host = window.location.hostname.toLowerCase();
    return host === 'localhost' || host === '127.0.0.1' || host.includes('vercel.app') || host.includes('orfilo');
  }

  if (isOrfiloApp()) {
    console.log('[Orfilo Companion] Pairing bridge active on Orfilo web app');
    window.addEventListener('message', (event) => {
      if (event.data && event.data.type === 'ORFILO_PAIR_EXTENSION' && event.data.token) {
        chrome.runtime.sendMessage({
          action: 'PAIR_EXTENSION',
          token: event.data.token,
          userEmail: event.data.userEmail,
          serverUrl: window.location.origin,
        }, (response) => {
          if (response && response.success) {
            window.postMessage({ type: 'ORFILO_PAIR_CONFIRMED', success: true }, '*');
          }
        });
      }
    });
    window.postMessage({ type: 'ORFILO_EXTENSION_INSTALLED', version: '2.0.0' }, '*');
    return;
  }

  const platformName = detectPlatform();
  if (!platformName) return;

  console.log(`[Orfilo Companion] Active on ${platformName}`);

  // ---------------------------------------------------------------------------
  // 2. LANGUAGE DETECTION HELPERS
  // ---------------------------------------------------------------------------
  const LANGUAGE_EXT_MAP = {
    javascript: 'js',
    js: 'js',
    typescript: 'ts',
    ts: 'ts',
    jsx: 'jsx',
    tsx: 'tsx',
    python: 'py',
    py: 'py',
    html: 'html',
    css: 'css',
    scss: 'scss',
    json: 'json',
    markdown: 'md',
    md: 'md',
    sql: 'sql',
    bash: 'sh',
    sh: 'sh',
    shell: 'sh',
    zsh: 'sh',
    rust: 'rs',
    rs: 'rs',
    go: 'go',
    java: 'java',
    c: 'c',
    cpp: 'cpp',
    'c++': 'cpp',
    csharp: 'cs',
    'c#': 'cs',
    ruby: 'rb',
    rb: 'rb',
    php: 'php',
    yaml: 'yaml',
    yml: 'yaml',
    dockerfile: 'dockerfile',
    swift: 'swift',
    kotlin: 'kt',
  };

  function detectCodeLanguage(preElement) {
    // Check classes on pre and inner code elements
    const candidates = [preElement.className];
    const codeEl = preElement.querySelector('code');
    if (codeEl) candidates.push(codeEl.className);

    // Look for language badges or header bars
    const headerEl = preElement.parentElement?.querySelector('[class*="language"], [class*="header"]');
    if (headerEl) candidates.push(headerEl.textContent || '');

    for (const text of candidates) {
      if (!text) continue;
      const match = text.match(/(?:language|lang)-([a-zA-Z0-9+#-]+)/i);
      if (match && match[1]) {
        const langKey = match[1].toLowerCase();
        if (LANGUAGE_EXT_MAP[langKey]) {
          return { lang: langKey, ext: LANGUAGE_EXT_MAP[langKey] };
        }
      }
      // Check direct word match
      const words = text.toLowerCase().split(/[\s_-]+/);
      for (const w of words) {
        if (LANGUAGE_EXT_MAP[w]) {
          return { lang: w, ext: LANGUAGE_EXT_MAP[w] };
        }
      }
    }

    return { lang: 'code', ext: 'txt' };
  }

  // ---------------------------------------------------------------------------
  // 3. CREATE FLOATING CAPTURE BUTTON
  // ---------------------------------------------------------------------------
  function createCaptureButton(label = 'Save to Orfilo') {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'orfilo-save-btn';
    btn.setAttribute('aria-label', label);

    // SVG Icon + Label
    btn.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
        <polyline points="17 21 17 13 7 13 7 21"></polyline>
        <polyline points="7 3 7 8 15 8"></polyline>
      </svg>
      <span class="orfilo-btn-text">${label}</span>
    `;
    return btn;
  }

  function setButtonState(btn, state, text) {
    const textSpan = btn.querySelector('.orfilo-btn-text');
    btn.classList.remove('orfilo-state-saving', 'orfilo-state-saved', 'orfilo-state-error');

    if (state === 'saving') {
      btn.classList.add('orfilo-state-saving');
      btn.disabled = true;
      if (textSpan) textSpan.textContent = text || 'Saving...';
    } else if (state === 'saved') {
      btn.classList.add('orfilo-state-saved');
      btn.disabled = false;
      if (textSpan) textSpan.textContent = text || 'Saved!';
      setTimeout(() => {
        btn.classList.remove('orfilo-state-saved');
        if (textSpan) textSpan.textContent = 'Save to Orfilo';
      }, 2500);
    } else if (state === 'error') {
      btn.classList.add('orfilo-state-error');
      btn.disabled = false;
      if (textSpan) textSpan.textContent = text || 'Failed';
      setTimeout(() => {
        btn.classList.remove('orfilo-state-error');
        if (textSpan) textSpan.textContent = 'Save to Orfilo';
      }, 2500);
    }
  }

  function extractSurroundingContext(element) {
    let promptText = '';
    try {
      const turn = element.closest('[data-message-author-role]') || element.closest('article') || element.closest('.agent-turn') || element.closest('.group');
      if (turn) {
        let prev = turn.previousElementSibling;
        while (prev && !promptText) {
          const text = (prev.innerText || prev.textContent || '').trim();
          if (text.length > 5 && text.length < 1500) {
            promptText = text.slice(0, 400);
            break;
          }
          prev = prev.previousElementSibling;
        }
      }
    } catch (_) {}

    const conversationTitle = (document.title || '')
      .replace(/\s*[-–|]\s*(ChatGPT|Claude|Gemini|v0|Midjourney).*$/i, '')
      .trim();

    return {
      conversationTitle: conversationTitle || 'AI Deliverables',
      promptText: promptText || '',
      sourceUrl: window.location.href,
    };
  }

  // ---------------------------------------------------------------------------
  // 4. ATTACH TO CODE BLOCKS
  // ---------------------------------------------------------------------------
  function attachToCodeBlock(pre) {
    if (pre.getAttribute('data-orfilo-attached')) return;
    pre.setAttribute('data-orfilo-attached', 'true');

    // Make sure pre or wrapper is positioned relative
    const style = window.getComputedStyle(pre);
    if (style.position === 'static') {
      pre.style.position = 'relative';
    }

    const btn = createCaptureButton('Save to Orfilo');
    btn.classList.add('orfilo-btn-code');

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      const codeElement = pre.querySelector('code') || pre;
      const codeContent = codeElement.innerText || codeElement.textContent || '';
      if (!codeContent.trim()) return;

      const { lang, ext } = detectCodeLanguage(pre);
      setButtonState(btn, 'saving');

      const ctx = extractSurroundingContext(pre);

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'CAPTURE_ARTIFACT',
          payload: {
            type: 'code',
            content: codeContent,
            extension: ext,
            label: `${lang}-snippet`,
            sourceName: platformName,
            conversationTitle: ctx.conversationTitle,
            promptText: ctx.promptText,
            sourceUrl: ctx.sourceUrl,
          },
        });

        if (response && response.success) {
          setButtonState(btn, 'saved');
        } else {
          setButtonState(btn, 'error', response?.error || 'Save failed');
        }
      } catch (err) {
        setButtonState(btn, 'error', 'Error');
      }
    });

    pre.appendChild(btn);
  }

  // ---------------------------------------------------------------------------
  // 5. ATTACH TO IMAGES
  // ---------------------------------------------------------------------------
  function attachToImage(img) {
    if (img.getAttribute('data-orfilo-attached')) return;
    // Skip small icons, badges, avatars
    if (img.width > 0 && img.width < 120 && img.height > 0 && img.height < 120) return;
    if (!img.src || img.src.startsWith('blob:') && !img.complete) return;

    img.setAttribute('data-orfilo-attached', 'true');

    const wrapper = img.parentElement;
    if (!wrapper) return;

    // Ensure wrapper has relative positioning
    const wrapperStyle = window.getComputedStyle(wrapper);
    if (wrapperStyle.position === 'static') {
      wrapper.style.position = 'relative';
    }

    const btn = createCaptureButton('Save to Orfilo');
    btn.classList.add('orfilo-btn-image');

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      if (!img.src) return;
      setButtonState(btn, 'saving');

      const ctx = extractSurroundingContext(img);
      const altText = (img.alt || img.title || '').trim();

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'CAPTURE_ARTIFACT',
          payload: {
            type: 'image',
            imageUrl: img.src,
            sourceName: platformName,
            altText: altText,
            conversationTitle: ctx.conversationTitle,
            promptText: ctx.promptText,
            sourceUrl: ctx.sourceUrl,
          },
        });

        if (response && response.success) {
          setButtonState(btn, 'saved');
        } else {
          setButtonState(btn, 'error', response?.error || 'Save failed');
        }
      } catch (err) {
        setButtonState(btn, 'error', 'Error');
      }
    });

    wrapper.appendChild(btn);
  }

  // ---------------------------------------------------------------------------
  // 6. DOM SCANNER & OBSERVER
  // ---------------------------------------------------------------------------
  function scanDOM() {
    // 1. Scan code blocks
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach((pre) => attachToCodeBlock(pre));

    // 2. Scan images in message contents or output viewports
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      // Check if image is loaded or has valid dimensions
      if (img.naturalWidth > 120 || img.width > 120) {
        attachToImage(img);
      } else {
        img.addEventListener('load', () => {
          if (img.naturalWidth > 120) {
            attachToImage(img);
          }
        }, { once: true });
      }
    });
  }

  // Initial scan
  scanDOM();

  // Handle messages from background worker (e.g. context menu clicks requesting context)
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    if (message.action === 'EXTRACT_CONTEXT') {
      let targetEl = null;
      if (message.srcUrl) {
        targetEl = Array.from(document.querySelectorAll('img')).find(
          (img) => img.src === message.srcUrl || img.currentSrc === message.srcUrl
        );
      }
      const ctx = extractSurroundingContext(targetEl || document.body);
      const altText = targetEl ? (targetEl.alt || targetEl.title || '').trim() : '';
      sendResponse({ ...ctx, altText });
      return false;
    }
  });

  // Throttled observer for dynamic AI responses
  let scanTimeout = null;
  const observer = new MutationObserver(() => {
    if (scanTimeout) return;
    scanTimeout = setTimeout(() => {
      scanDOM();
      scanTimeout = null;
    }, 500);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });
})();
