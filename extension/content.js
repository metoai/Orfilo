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
    if (host.includes('docs.google.com')) return 'Google Docs';
    if (host.includes('drive.google.com')) return 'Google Drive';
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
      // 1. ChatGPT, Claude, and general AI containers
      const turn =
        element.closest('[data-message-author-role]') ||
        element.closest('article') ||
        element.closest('.agent-turn') ||
        element.closest('model-response') ||
        element.closest('.model-response-container') ||
        element.closest('.response-container') ||
        element.closest('.group');

      if (turn) {
        let prev = turn.previousElementSibling;
        while (prev && !promptText) {
          const text = (prev.innerText || prev.textContent || '').trim();
          if (text.length > 3 && text.length < 2000) {
            promptText = text.slice(0, 400);
            break;
          }
          prev = prev.previousElementSibling;
        }
      }

      // 2. Specific Google Gemini DOM detection
      // Strategy: each image is inside a model-response turn. We walk UP from the image
      // to find its parent model-response container, then look at preceding sibling turns
      // for the nearest user-query. Falls back to bounding-rect proximity, then DOM order.
      if (!promptText) {
        const MODEL_TURN_SELECTORS = [
          'model-response', '.model-response', 'message-item',
          '.conversation-turn', '[data-turn-type="model"]',
          'response-container', '.response-container-content', '.response',
        ];

        // Walk up the DOM tree from the image to find its parent model-response turn
        let foundModelTurn = null;
        let walker = element.parentElement;
        while (walker && walker !== document.body) {
          for (const sel of MODEL_TURN_SELECTORS) {
            if (walker.matches && walker.matches(sel)) {
              foundModelTurn = walker;
              break;
            }
          }
          if (foundModelTurn) break;
          walker = walker.parentElement;
        }

        function extractTextFromQueryElement(queryEl) {
          if (!queryEl) return '';
          const specificEl = queryEl.querySelector('.query-text, [data-test-id="user-query"]') || queryEl;
          let text = '';
          try {
            const clone = specificEl.cloneNode(true);
            clone.querySelectorAll('.cdk-visually-hidden, [aria-hidden="true"]').forEach((el) => el.remove());
            text = (clone.innerText || clone.textContent || '').trim();
          } catch (_) {
            text = (specificEl.innerText || specificEl.textContent || '').trim();
          }
          text = text.replace(/^(you\s+said|you\s+asked|user\s+said|user:|prompt:)[\s\n:]*/i, '').trim();
          return text;
        }

        if (foundModelTurn) {
          // Walk backwards through siblings to find the nearest preceding user-query
          let sibling = foundModelTurn.previousElementSibling;
          while (sibling && !promptText) {
            const queryEl = sibling.querySelector('.query-text, [data-test-id="user-query"], user-query, .user-query-container');
            if (queryEl) {
              const text = extractTextFromQueryElement(queryEl);
              if (text.length > 2) { promptText = text.slice(0, 400); }
            }
            sibling = sibling.previousElementSibling;
          }
        }

        // Fallback A: use bounding rect to find the closest user-query ABOVE the image
        if (!promptText) {
          const geminiQueries = Array.from(
            document.querySelectorAll('user-query, .query-text, .user-query-container, [data-test-id="user-query"]')
          );
          if (geminiQueries.length > 0) {
            let imgRect = null;
            try { imgRect = element.getBoundingClientRect(); } catch(_e) {}

            if (imgRect) {
              let bestQuery = null;
              let bestDist = Infinity;
              for (const q of geminiQueries) {
                try {
                  const qRect = q.getBoundingClientRect();
                  if (qRect.bottom <= imgRect.top + 20) {
                    const dist = imgRect.top - qRect.bottom;
                    if (dist < bestDist) { bestDist = dist; bestQuery = q; }
                  }
                } catch(_e) {}
              }
              if (bestQuery) {
                const text = extractTextFromQueryElement(bestQuery);
                if (text.length > 2) { promptText = text.slice(0, 400); }
              }
            }

            // Fallback B: last preceding user-query by DOM document order
            if (!promptText) {
              const preceding = geminiQueries.filter(
                (q) => (element.compareDocumentPosition(q) & Node.DOCUMENT_POSITION_PRECEDING) !== 0
              );
              const bestQueryEl = preceding.length > 0 ? preceding[preceding.length - 1] : geminiQueries[geminiQueries.length - 1];
              if (bestQueryEl) {
                const text = extractTextFromQueryElement(bestQueryEl);
                if (text.length > 2) { promptText = text.slice(0, 400); }
              }
            }
          }
        }
      }

      // 3. Specific Claude & ChatGPT query container fallbacks
      if (!promptText) {
        const userMsgs = Array.from(
          document.querySelectorAll('[data-message-author-role="user"], .font-user-message')
        );
        if (userMsgs.length > 0) {
          const lastUserMsg = userMsgs[userMsgs.length - 1];
          const text = (lastUserMsg.innerText || lastUserMsg.textContent || '').trim();
          if (text.length > 2) {
            promptText = text.slice(0, 400);
          }
        }
      }
    } catch (_) {}

    const rawTitle = document.title || '';
    let conversationTitle = rawTitle
      .replace(/\s*[-–|]\s*(Google\s+Gemini|Gemini|Google|ChatGPT|OpenAI|Claude|Anthropic|v0|Midjourney).*$/i, '')
      .replace(/[:\s\-_]*(ai\s+portrait\s+prompt|ai\s+prompt|portrait\s+prompt|prompt)$/i, '')
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
    const existing = pre.querySelector('.orfilo-save-btn');
    if (existing && existing.isConnected) return;

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
    // Skip small icons, badges, avatars
    if (img.width > 0 && img.width < 120 && img.height > 0 && img.height < 120) return;
    if (!img.src || (img.src.startsWith('blob:') && !img.complete)) return;

    const wrapper = img.parentElement;
    if (!wrapper) return;

    const existing = wrapper.querySelector('.orfilo-save-btn');
    if (existing && existing.isConnected) return;

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
  // 6. ATTACH TO DOCUMENT CARDS & CHIPS (CHATGPT, CLAUDE, GEMINI GOOGLE DOCS / DRIVE)
  // ---------------------------------------------------------------------------
  function findDocCardContainer(element) {
    if (!element) return null;

    const isBoundary = (el) => {
      if (!el || el === document.body || el === document.documentElement) return true;
      const tag = el.tagName.toUpperCase();
      if (['ARTICLE', 'MAIN', 'BODY', 'HTML', 'FORM'].includes(tag)) return true;
      if (
        el.matches &&
        (el.matches('[data-message-author-role]') ||
          el.matches('.conversation-turn') ||
          el.matches('model-response') ||
          el.matches('.agent-turn'))
      ) {
        return true;
      }
      return false;
    };

    let curr = element;
    for (let depth = 0; depth < 8 && curr && !isBoundary(curr); depth++) {
      if (curr.classList && curr.classList.contains('orfilo-save-btn')) return null;

      // Detect card characteristics (ChatGPT tool pills, Gemini drive chips, Claude attachments)
      const hasCardClass =
        curr.matches &&
        curr.matches(
          '.drive-chip, .file-chip, drive-file-chip, doc-chip, [class*="chip"], [class*="card"], [class*="pill"], [class*="attachment"], [data-doc-id], [data-drive-id]'
        );

      const text = (curr.innerText || '').toLowerCase();
      const hasDocText =
        text.includes('google docs') ||
        text.includes('google drive') ||
        text.includes('google sheets') ||
        text.includes('google slides');
      const hasAction = !!curr.querySelector('button, [role="button"], a');

      // Ensure dimensions are a compact card/pill and not the entire chat container
      const rect = curr.getBoundingClientRect ? curr.getBoundingClientRect() : null;
      const isReasonableSize = !rect || (rect.width > 80 && rect.width < 800 && rect.height > 20 && rect.height < 450);

      if ((hasCardClass || (hasDocText && hasAction)) && isReasonableSize) {
        return curr;
      }

      curr = curr.parentElement;
    }

    return null;
  }

  function extractDocUrl(card) {
    if (!card) return '';

    // 1. Direct anchor inside card
    const anchor = card.matches('a[href]')
      ? card
      : card.querySelector(
          'a[href*="docs.google.com"], a[href*="drive.google.com"], a[href*="sheets.google.com"], a[href*="slides.google.com"]'
        );
    if (anchor && anchor.href) return anchor.href;

    // 2. Action button with URL attributes
    const actionBtn = card.querySelector('button[data-url], button[data-href], a[href], [data-url], [data-href]');
    if (actionBtn) {
      const u = actionBtn.getAttribute('data-url') || actionBtn.getAttribute('data-href') || actionBtn.href;
      if (u && (u.includes('google.com') || u.startsWith('http'))) return u;
    }

    // 3. Any anchor inside the card
    const anyLink = card.querySelector('a[href]');
    if (anyLink && anyLink.href && anyLink.href.startsWith('http')) return anyLink.href;

    // 4. Surrounding message turn
    const turn =
      card.closest('[data-message-author-role], article, model-response, .conversation-turn') || card.parentElement;
    if (turn) {
      const turnLinks = Array.from(
        turn.querySelectorAll(
          'a[href*="docs.google.com"], a[href*="drive.google.com"], a[href*="sheets.google.com"], a[href*="slides.google.com"]'
        )
      );
      if (turnLinks.length > 0) {
        return turnLinks[0].href;
      }

      // Check text or HTML for Google Doc URL
      const htmlMatch = (turn.innerHTML || '').match(/https:\/\/(?:docs|drive)\.google\.com\/[^\s"'>]+/);
      if (htmlMatch) return htmlMatch[0];
    }

    return '';
  }

  function extractDocTitle(card, docUrl) {
    const candidateTitles = [];

    // 1. Link text in the message pointing to this URL
    if (docUrl) {
      const matchingLinks = document.querySelectorAll(`a[href="${docUrl}"], a[href^="${docUrl}"]`);
      for (const link of matchingLinks) {
        const text = (link.innerText || link.textContent || '').trim();
        if (
          text &&
          text.length > 3 &&
          !['open', 'view', 'google docs', 'google drive', 'docs', 'edit'].includes(text.toLowerCase())
        ) {
          candidateTitles.push(text);
        }
      }
    }

    // 2. Titles inside the card
    if (card) {
      const titleEls = card.querySelectorAll(
        'h1, h2, h3, h4, [class*="title"], [class*="name"], strong, b, [class*="font-semibold"], [class*="font-medium"]'
      );
      for (const el of titleEls) {
        const t = (el.innerText || el.textContent || '').trim();
        if (
          t &&
          t.length > 2 &&
          !['open', 'view', 'google docs', 'google drive', 'docs', 'edit'].includes(t.toLowerCase())
        ) {
          candidateTitles.push(t);
        }
      }

      const lines = (card.innerText || card.textContent || '')
        .split('\n')
        .map((l) => l.trim())
        .filter((l) => {
          const low = l.toLowerCase();
          return (
            low &&
            !['google docs', 'google drive', 'docs', 'open', 'view', 'edit', 'download', 'save to orfilo'].includes(low)
          );
        });

      if (lines.length > 0) {
        candidateTitles.push(lines[0]);
      }
    }

    // Prefer non-truncated title with longest clean length
    candidateTitles.sort((a, b) => {
      const aTrunc = a.includes('...') || a.includes('…');
      const bTrunc = b.includes('...') || b.includes('…');
      if (aTrunc && !bTrunc) return 1;
      if (!aTrunc && bTrunc) return -1;
      return b.length - a.length;
    });

    return candidateTitles[0] || 'Google Doc Deliverable';
  }

  function watchCardPersistence(card) {
    if (card._orfiloWatcher) return;

    let debounceTimer = null;
    const observer = new MutationObserver(() => {
      const btn = card.querySelector('.orfilo-save-btn');
      if (!btn || !btn.isConnected) {
        if (debounceTimer) return;
        debounceTimer = setTimeout(() => {
          debounceTimer = null;
          attachToDocumentCard(card);
        }, 60);
      }
    });

    observer.observe(card, { childList: true, subtree: true });
    card._orfiloWatcher = observer;
  }

  function attachToDocumentCard(card) {
    if (!card) return;

    // 1. If an Orfilo button is already live in this card and properly connected:
    const existing = card.querySelector('.orfilo-save-btn');
    if (existing && existing.isConnected && document.contains(existing)) {
      // If openBtn rendered after the button was attached, ensure button is adjacent to openBtn
      const buttons = Array.from(card.querySelectorAll('button, [role="button"], a'));
      const openBtn = buttons.find((b) => {
        if (b.classList.contains('orfilo-save-btn')) return false;
        const text = (b.innerText || b.textContent || '').trim().toLowerCase();
        return text === 'open' || text === 'view' || text === 'open in docs' || text.startsWith('open');
      });
      if (
        openBtn &&
        openBtn.parentElement &&
        existing.nextElementSibling !== openBtn &&
        existing.previousElementSibling !== openBtn
      ) {
        openBtn.insertAdjacentElement('beforebegin', existing);
      }
      watchCardPersistence(card);
      return;
    }

    // Set up persistence watcher on this card
    watchCardPersistence(card);

    // Create Save to Orfilo button
    const btn = createCaptureButton('Save to Orfilo');
    btn.classList.add('orfilo-btn-doc');

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      setButtonState(btn, 'saving');

      const docUrl = extractDocUrl(card);
      const cleanTitle = extractDocTitle(card, docUrl);
      const ctx = extractSurroundingContext(card);

      try {
        let docContent = '';
        const docIdMatch = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
        if (docIdMatch && docIdMatch[1]) {
          try {
            const exportRes = await fetch(`https://docs.google.com/document/d/${docIdMatch[1]}/export?format=txt`, {
              credentials: 'include',
            });
            if (exportRes.ok) {
              docContent = await exportRes.text();
            }
          } catch (_) {}
        }

        const response = await chrome.runtime.sendMessage({
          action: 'CAPTURE_ARTIFACT',
          payload: {
            type: 'document',
            docUrl: docUrl || window.location.href,
            title: cleanTitle,
            docContent: docContent || '',
            sourceName: platformName,
            conversationTitle: ctx.conversationTitle || cleanTitle,
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

    // Placement: find the "Open" button inside card and insert right before it
    const buttons = Array.from(card.querySelectorAll('button, [role="button"], a'));
    const openBtn = buttons.find((b) => {
      if (b.classList.contains('orfilo-save-btn')) return false;
      const text = (b.innerText || b.textContent || '').trim().toLowerCase();
      return text === 'open' || text === 'view' || text === 'open in docs' || text.startsWith('open');
    });

    if (openBtn && openBtn.parentElement) {
      // Place right before openBtn so it sits naturally inside the card's action row
      openBtn.insertAdjacentElement('beforebegin', btn);
    } else {
      const lastBtn = buttons[buttons.length - 1];
      if (lastBtn && lastBtn !== btn && lastBtn.parentElement) {
        lastBtn.insertAdjacentElement('afterend', btn);
      } else {
        card.style.position = 'relative';
        btn.classList.add('orfilo-btn-doc-floating');
        card.appendChild(btn);
      }
    }
  }

  function scanDocumentCards() {
    // 1. Text walker for elements saying "Google Docs", "Google Drive", etc.
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
    const textMatches = [];
    let node;
    while ((node = walker.nextNode())) {
      const val = node.nodeValue.trim().toLowerCase();
      if (val === 'google docs' || val === 'google drive' || val === 'google sheets' || val === 'google slides') {
        if (node.parentElement) textMatches.push(node.parentElement);
      }
    }
    textMatches.forEach((el) => {
      const card = findDocCardContainer(el);
      if (card) attachToDocumentCard(card);
    });

    // 2. Buttons or anchors with text "Open"
    const allButtons = document.querySelectorAll('button, [role="button"], a');
    allButtons.forEach((b) => {
      if (b.classList.contains('orfilo-save-btn')) return;
      const txt = (b.innerText || b.textContent || '').trim().toLowerCase();
      if (txt === 'open' || txt === 'open in docs' || txt === 'view') {
        const card = findDocCardContainer(b);
        if (card) {
          const cardText = (card.innerText || '').toLowerCase();
          if (
            cardText.includes('google docs') ||
            cardText.includes('drive') ||
            cardText.includes('.gdoc') ||
            cardText.includes('docs.google.com')
          ) {
            attachToDocumentCard(card);
          }
        }
      }
    });

    // 3. Document / Drive links and chips
    const docLinks = document.querySelectorAll(
      'a[href*="docs.google.com"], a[href*="drive.google.com"], a[href*="sheets.google.com"], a[href*="slides.google.com"], [data-drive-id], [data-doc-id], drive-file-chip, doc-chip, [class*="drive-chip"], [class*="file-chip"]'
    );
    docLinks.forEach((el) => {
      const card = findDocCardContainer(el);
      if (card) {
        attachToDocumentCard(card);
      }
    });
  }

  // ---------------------------------------------------------------------------
  // 7. ATTACH TO STANDALONE GOOGLE DOCS EDITOR PAGE (docs.google.com/document/*)
  // ---------------------------------------------------------------------------
  function attachToStandaloneDoc() {
    if (document.getElementById('orfilo-standalone-doc-btn')) return;

    const getDocTitle = () => {
      const input = document.querySelector('input.docs-title-input');
      if (input && input.value) return input.value.trim();
      return document.title.replace(/\s*[-–]\s*Google\s+Docs.*$/i, '').trim() || 'Untitled Document';
    };

    const btn = createCaptureButton('Save to Orfilo');
    btn.id = 'orfilo-standalone-doc-btn';
    btn.classList.add('orfilo-btn-standalone');

    btn.addEventListener('click', async (e) => {
      e.stopPropagation();
      e.preventDefault();

      setButtonState(btn, 'saving');
      const docTitle = getDocTitle();
      const docUrl = window.location.href;

      let docContent = '';
      const docIdMatch = docUrl.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
      if (docIdMatch && docIdMatch[1]) {
        try {
          const exportRes = await fetch(`https://docs.google.com/document/d/${docIdMatch[1]}/export?format=txt`, {
            credentials: 'include',
          });
          if (exportRes.ok) {
            docContent = await exportRes.text();
          }
        } catch (_) {}
      }

      try {
        const response = await chrome.runtime.sendMessage({
          action: 'CAPTURE_ARTIFACT',
          payload: {
            type: 'document',
            docUrl: docUrl,
            title: docTitle,
            docContent: docContent || '',
            sourceName: 'Google Docs',
            conversationTitle: docTitle,
            promptText: '',
            sourceUrl: docUrl,
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

    document.body.appendChild(btn);
  }

  // ---------------------------------------------------------------------------
  // 8. DOM SCANNER & OBSERVER
  // ---------------------------------------------------------------------------
  function scanDOM() {
    // 0. Standalone Google Docs page
    if (window.location.hostname.includes('docs.google.com')) {
      attachToStandaloneDoc();
      return;
    }

    // 1. Scan code blocks
    const preBlocks = document.querySelectorAll('pre');
    preBlocks.forEach((pre) => attachToCodeBlock(pre));

    // 2. Scan images in message contents or output viewports
    const images = document.querySelectorAll('img');
    images.forEach((img) => {
      if (img.naturalWidth > 120 || img.width > 120) {
        attachToImage(img);
      } else {
        img.addEventListener(
          'load',
          () => {
            if (img.naturalWidth > 120) {
              attachToImage(img);
            }
          },
          { once: true }
        );
      }
    });

    // 3. Scan Google Docs cards, Drive chips, and document export links in AI chat
    scanDocumentCards();
  }

  // Initial scan
  scanDOM();

  // Handle messages from background worker
  chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
    // --- Extract surrounding context for a given image URL ---
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

    // --- Fetch a blob: URL and return it as base64 (blob: URLs only work in page context) ---
    if (message.action === 'FETCH_BLOB_AS_BASE64') {
      (async () => {
        try {
          const res = await fetch(message.blobUrl);
          if (!res.ok) throw new Error(`Blob fetch failed: ${res.status}`);
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          sendResponse({ base64, mimeType: blob.type || 'image/png', size: blob.size });
        } catch (err) {
          sendResponse({ error: err.message });
        }
      })();
      return true; // Keep channel open for async response
    }

    // --- Fetch an image URL from page context (for Google-hosted images that block SW fetch) ---
    if (message.action === 'FETCH_IMAGE_AS_BASE64') {
      (async () => {
        try {
          // Try fetch first
          const res = await fetch(message.imageUrl, { mode: 'cors', credentials: 'include' });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const blob = await res.blob();
          const arrayBuffer = await blob.arrayBuffer();
          const bytes = new Uint8Array(arrayBuffer);
          let binary = '';
          for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
          const base64 = btoa(binary);
          sendResponse({ base64, mimeType: blob.type || 'image/png', size: blob.size });
        } catch (_fetchErr) {
          // Final fallback: draw image to canvas and export as PNG
          try {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            await new Promise((resolve, reject) => {
              img.onload = resolve;
              img.onerror = reject;
              img.src = message.imageUrl;
            });
            const canvas = document.createElement('canvas');
            canvas.width = img.naturalWidth || img.width;
            canvas.height = img.naturalHeight || img.height;
            const ctx2d = canvas.getContext('2d');
            ctx2d.drawImage(img, 0, 0);
            const dataUrl = canvas.toDataURL('image/png');
            const base64 = dataUrl.replace(/^data:[^;]+;base64,/, '');
            const size = Math.round(base64.length * 0.75);
            sendResponse({ base64, mimeType: 'image/png', size });
          } catch (canvasErr) {
            sendResponse({ error: `Image fetch failed: ${canvasErr.message}` });
          }
        }
      })();
      return true; // Keep channel open for async response
    }
  });

  // Throttled observer for dynamic AI responses
  let scanTimeout = null;
  const observer = new MutationObserver(() => {
    if (scanTimeout) return;
    scanTimeout = setTimeout(() => {
      scanDOM();
      scanTimeout = null;
    }, 200);
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true,
  });

  // Self-healing periodic heartbeat to guarantee buttons persist across React reconciliation
  setInterval(() => {
    scanDocumentCards();
  }, 1000);
})();
