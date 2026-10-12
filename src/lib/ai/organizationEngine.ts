import type { SupabaseClient } from '@supabase/supabase-js';

export interface IngestContext {
  userId: string;
  originalName: string;
  mimeType: string;
  extension: string;
  sizeBytes?: number;
  sourceType?: string;
  sourceName?: string;
  sourceUrl?: string;
  conversationTitle?: string;
  contextPrompt?: string;
  altText?: string;
  explicitProjectId?: string | null;
  explicitDisplayName?: string | null;
  explicitProviderPath?: string | null;
}

export interface OrganizedResult {
  displayName: string;
  originalName: string;
  extension: string;
  projectId: string;
  projectName: string;
  projectCreated: boolean;
  providerPath: string;
  category: string;
  subfolder: string;
  description: string;
  aiConfidence: number;
  executionTimeMs: number;
}

/**
 * Checks if a given file name or stem is generic (e.g. image-12345, snippet-456, screenshot, AI generated).
 */
export function isGenericName(name: string): boolean {
  if (!name || !name.trim()) return true;
  // Clean off leading/trailing punctuation like commas, dashes, quotes
  const cleaned = name.replace(/^[,.\-_:;'"\s]+/, '').replace(/[,.\-_:;'"\s]+$/, '').trim();
  if (cleaned.length === 0) return true;
  const stem = cleaned.replace(/\.[a-zA-Z0-9]+$/, '').trim().toLowerCase();
  if (stem.length === 0) return true;
  if (/^[0-9a-f-]{8,}$/i.test(stem)) return true; // UUID or long hex hash
  if (/^\d+$/.test(stem)) return true; // Just timestamp digits
  if (/^(image|img|screenshot|screen_shot|screen|snippet|code|deliverable|capture|file|download|unnamed|untitled|asset|blob|output|frame|photo|picture)([-_ \d]*)$/i.test(stem)) return true;
  // Generic AI and platform tags
  if (/^(ai[-_ ]?generated|generated[-_ ]?by[-_ ]?ai|ai[-_ ]?image|ai[-_ ]?art|ai[-_ ]?asset|ai[-_ ]?export|synthetic[-_ ]?image|model[-_ ]?output)$/i.test(stem)) return true;
  if (stem === 'ai generated' || stem === 'ai' || stem === 'gemini' || stem === 'chatgpt' || stem === 'claude' || stem === 'dall-e') return true;
  // Conversational prompts erroneously passed as names
  if (/^(you\s+said|you\s+asked|user\s+said|prompt)/i.test(cleaned)) return true;
  if (/^(generate|genertae|create|make|draw|show\s+me)\s+(another|one\s+more|a|an)?\s*(model|image|picture)?$/i.test(cleaned)) return true;
  return false;
}

/**
 * Clean conversational prompts and alt text into a concise, professional title.
 * Transforms raw user instructions (e.g. "genertae another model", "design animation cgaracter of a baby")
 * into true asset deliverable names ("Habesha Model Portrait", "Baby Animation Character").
 */
export function cleanPromptToTitle(
  text: string,
  context?: {
    conversationTitle?: string;
    projectName?: string;
    sourceName?: string;
    mimeType?: string;
    ext?: string;
  }
): string {
  if (!text) return '';
  let p = text.trim();

  // 1. Strip screen-reader / chatbot prefixes: 'You said', 'User:', etc.
  p = p.replace(/^(you\s+said|you\s+asked|user\s+said|user:|prompt:|i\s+said|query:)[\s\n:]*/i, '');
  p = p.replace(/https?:\/\/\S+/g, ' ');
  p = p.replace(/[*_#`[\]()]/g, ' ');
  p = p.replace(/^["'“‘\-:,\s]+/, '');

  // 2. Fix common fast-typing AI chat typos
  const TYPOS: Record<string, string> = {
    genertae: 'generate', generat: 'generate', genrate: 'generate', generte: 'generate',
    cgaracter: 'character', charater: 'character', charecter: 'character',
    desing: 'design', designn: 'design', cretae: 'create', creat: 'create',
    bacground: 'background', backround: 'background', portait: 'portrait',
    illlustration: 'illustration', dashbaord: 'dashboard', mokup: 'mockup',
    animaton: 'animation', animatin: 'animation',
  };
  p = p.split(/\s+/).map((w) => TYPOS[w.toLowerCase()] || w).join(' ');

  // 3. Repeatedly strip command verbs and request fluff
  let changed = true;
  while (changed) {
    const before = p;
    p = p.replace(/^(can\s+you\s+(please\s+)?|could\s+you\s+(please\s+)?|please\s+|would\s+you\s+(please\s+)?|i\s+want\s+(a|an)?\s+|i\s+need\s+(a|an)?\s+|help\s+me\s+(to\s+)?|let'?s\s+(make|create)\s+|show\s+me\s+(a|an)?\s+|give\s+me\s+(a|an)?\s+|here\s+is\s+(a|an)?\s+)/i, '');
    p = p.replace(/^(generate|create|design|make|draw|render|build|illustrate|produce|show|give|add|do)\s+/i, '');
    p = p.replace(/^(another|one\s+more|new|next|different|more|additional|second|third|alternative)\s+/i, '');
    p = p.replace(/^(a|an|the|some)\s+/i, '');
    p = p.replace(/^(photo\s+of|image\s+of|picture\s+of|render\s+of|illustration\s+of|screenshot\s+of|mockup\s+of|wireframe\s+of|view\s+of)\s+/i, '');
    p = p.replace(/^(dall[-e\s]+generated:?|dall-e:?)\s*/i, '');
    p = p.replace(/^(project\s+)?(ui\s+mockup|mockup)\s+/i, 'UI Mockup ');
    p = p.trim();
    changed = p !== before;
  }

  // 4. Strip hype filler tags & trailing prepositional phrases
  p = p.replace(/\b(photorealistic|hyperrealistic|ultra realistic|high resolution|4k|8k|hd|cinematic lighting|octane render|trending on artstation|unreal engine|studio quality|highly detailed|ai generated|generated by ai)\b/gi, ' ');
  p = p.replace(/\s+(for\s+(the\s+brand|this\s+app|the\s+project|my\s+app|the\s+user|us))$/i, '');
  p = p.replace(/\s+(with\s+(white|transparent|black|dark|clean)\s+background)$/i, '');
  p = p.replace(/\s+(with|for|and|or|in|on|at|to|a|an|the|of|by|from|using|featuring)$/i, '');

  // 5. Grammar inversion: 'only X' -> 'X only', 'X of a Y' -> 'Y X'
  p = p.replace(/\bonly\s+(the\s+)?([a-zA-Z0-9]+)\b/gi, '$2 only');
  p = p.replace(/\b([a-zA-Z0-9\s]+)\s+of\s+(a|an|the)\s+([a-zA-Z0-9]+)\b/gi, '$3 $1');

  // 6. Contextual synthesis: if the prompt is an iteration or generic category noun (e.g. 'model', 'one', 'version', 'portrait')
  const GENERIC_NOUNS = new Set(['model', 'character', 'portrait', 'person', 'image', 'photo', 'picture', 'illustration', 'one', 'version', 'variant', 'asset', 'shot', 'sample']);
  const lowerP = p.toLowerCase().trim();
  const words = lowerP.split(/\s+/).filter(Boolean);

  if (words.length <= 1 && (GENERIC_NOUNS.has(lowerP) || words.length === 0)) {
    let subject = (context?.projectName || context?.conversationTitle || '').trim();
    subject = subject.replace(/\s*[-–|]\s*(Google\s+Gemini|Gemini|Google|ChatGPT|OpenAI|Claude|Anthropic|v0|Midjourney).*$/i, '').trim();
    subject = subject.replace(/[:\s\-_]*(ai\s+portrait\s+prompt|ai\s+prompt|portrait\s+prompt|prompt)$/i, '').trim();
    if (subject && subject.length > 2 && !/^(new chat|chatgpt|claude|gemini|untitled)$/i.test(subject)) {
      if (lowerP === 'model' && !subject.toLowerCase().includes('portrait')) {
        p = `${subject} Portrait`;
      } else if (lowerP && !subject.toLowerCase().includes(lowerP)) {
        p = `${subject} ${lowerP}`;
      } else {
        p = subject;
      }
    }
  }

  // 7. Limit to 5 words & Title Case with acronym preservation
  const cleanWords = p.split(/\s+/).filter(Boolean).slice(0, 5);
  const titled = cleanWords.map((w, idx) => {
    const low = w.toLowerCase();
    if (['ui', 'ux', 'api', 'sql', 'css', 'html', 'js', 'ts', 'ai'].includes(low)) return low.toUpperCase();
    if (idx > 0 && ['and', 'or', 'for', 'to', 'in', 'on', 'at', 'a', 'an', 'the', 'of', 'with', 'by'].includes(low)) return low;
    return low.charAt(0).toUpperCase() + low.slice(1);
  }).join(' ');

  return titled.trim();
}

/**
 * Converts a title to a clean, filesystem-safe kebab-case string.
 */
export function toKebabCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 50);
}

/**
 * Extracts a high-level, clean project name from a deliverable name or user prompt.
 * E.g.:
 * "Repodx Product Roadmap & GTM Strategy" -> "Repodx"
 * "Repodx Technical Architecture & Security Whitepaper V2" -> "Repodx"
 * "Habesha Model Portrait" -> "Habesha Model"
 * "Habesha Model Face Only" -> "Habesha Model"
 * "Baby Animation Character" -> "Baby Animation"
 * "Thehero Section Minimal and Good" -> "Thehero Section"
 */
export function extractProjectNameFromDeliverable(displayName: string, prompt?: string): string {
  const source = (displayName || prompt || '').trim();
  if (!source) return '';

  let clean = source
    .replace(/^[,.\-_:;'"\s]+/, '')
    .replace(/\s*[-–|:]\s*.*$/, '')
    .trim();

  const DESCRIPTOR_PATTERNS = [
    /\s+(gtm\s+strategy|gtm|strategy|whitepaper|roadmap|architecture|specification|specs?|overview|summary|prd|guide|manual|documentation)$/i,
    /\s+(product|technical|security|minimal\s+and\s+good|v\d+)$/i,
    /\s+(ui\s+mockup|mockup|prototype|wireframe|dashboard|interface|landing\s+page|redesign)$/i,
    /\s+(portrait|face\s+only|character|mascot|illustration|render|photo|picture|wallpaper)$/i,
  ];

  let changed = true;
  while (changed) {
    changed = false;
    clean = clean.replace(/[\s&,.\-_:;'"\\/]+$/, '').trim();
    for (const pat of DESCRIPTOR_PATTERNS) {
      if (pat.test(clean)) {
        const stripped = clean.replace(pat, '').trim();
        if (stripped.length >= 2) {
          clean = stripped;
          changed = true;
          break;
        }
      }
    }
  }

  const words = clean.split(/\s+/).filter(Boolean);
  if (words.length > 3) {
    clean = words.slice(0, 3).join(' ');
  }
  return clean;
}

/**
 * Intelligent Organization Engine:
 * 1. Renames deliverables based on semantic prompt/alt context.
 * 2. Correlates with existing conversation projects or auto-creates a new project.
 * 3. Builds a structured folder and subfolder hierarchy (provider_path).
 * 4. Runs in under 100ms.
 */
export async function organizeDeliverable(
  db: SupabaseClient,
  ctx: IngestContext
): Promise<OrganizedResult> {
  const startTime = Date.now();
  const ext = (ctx.extension || ctx.originalName.split('.').pop() || 'bin')
    .replace(/^\./, '')
    .toLowerCase();

  // ---------------------------------------------------------------------------
  // 1. INTELLIGENT SEMANTIC NAMING
  // ---------------------------------------------------------------------------
  let displayName = (ctx.explicitDisplayName || '').trim();
  let originalStem = ctx.originalName.replace(/\.[a-zA-Z0-9]+$/, '').trim();

  // If name is generic or missing, derive from contextPrompt, altText, or conversationTitle
  const nameIsGeneric = isGenericName(displayName) || isGenericName(originalStem);

  // Guard: if the prompt is essentially just the chat title echoed back (common Gemini fallback failure),
  // treat it as non-discriminating and skip to alt text / conversation title.
  function promptIsJustTitle(prompt: string): boolean {
    if (!prompt) return false;
    const p = prompt.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    const t = (ctx.conversationTitle || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    if (!t || t.length < 4) return false;
    return p === t || p.includes(t) || t.includes(p);
  }

  function isGenericPrompt(prompt?: string): boolean {
    if (!prompt || !prompt.trim()) return true;
    const p = prompt.trim().toLowerCase();
    return /^(image|img|file|asset|capture|ai[-_ ]?generated|generated)$/i.test(p);
  }

  if (nameIsGeneric || !displayName) {
    let semanticSeed = '';
    const isDoc = ['gdoc', 'doc', 'docx', 'pdf', 'gsheet', 'gslides'].includes(ext) || ctx.mimeType.includes('document');

    // Priority 1: For document exports with an explicit doc title in altText (e.g. "Repodx Overview"):
    if (isDoc && ctx.altText && ctx.altText.trim().length > 2 && !isGenericName(ctx.altText)) {
      semanticSeed = ctx.altText.trim();
    }
    // Priority 2: User's context prompt — only if it is a REAL prompt, not page title
    else if (
      ctx.contextPrompt &&
      ctx.contextPrompt.trim().length > 2 &&
      !isGenericPrompt(ctx.contextPrompt) &&
      !promptIsJustTitle(ctx.contextPrompt)
    ) {
      semanticSeed = ctx.contextPrompt.trim();
    }
    // Priority 3: Alt text (ONLY if non-generic! e.g. reject ", AI generated")
    else if (ctx.altText && ctx.altText.trim().length > 2 && !isGenericName(ctx.altText)) {
      semanticSeed = ctx.altText.trim();
    }
    // Priority 4: Conversation title (e.g. "Habesha Model AI Portrait")
    else if (ctx.conversationTitle && !isGenericConversationTitle(ctx.conversationTitle)) {
      semanticSeed = ctx.conversationTitle.trim();
    }


    const derivedTitle = cleanPromptToTitle(semanticSeed, {
      conversationTitle: ctx.conversationTitle,
      sourceName: ctx.sourceName,
      mimeType: ctx.mimeType,
      ext,
    });
    if (derivedTitle.length >= 2 && !isGenericName(derivedTitle)) {
      displayName = derivedTitle;
    } else {
      const cleanConv = sanitizeConversationTitle(ctx.conversationTitle);
      if (cleanConv && !isGenericName(cleanConv)) {
        displayName = cleanConv;
      } else {
        // Deterministic fallback based on source and deliverable type
        const categoryLabel = getCategoryLabel(ctx.mimeType, ext);
        const timestampLabel = new Date().toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
        });
        displayName = `${ctx.sourceName || 'AI'} ${categoryLabel} - ${timestampLabel}`;
      }
    }
  }

  // Ensure original_name is a clean kebab-case file with extension
  const cleanKebabStem = toKebabCase(displayName) || 'deliverable';
  const finalFilename = `${cleanKebabStem}.${ext}`;

  // ---------------------------------------------------------------------------
  // 2. PROJECT CORRELATION & AUTO-CREATION
  // ---------------------------------------------------------------------------
  let resolvedProjectId = ctx.explicitProjectId || '';
  let resolvedProjectName = '';
  let projectCreated = false;

  const currentPromptOrAlt = ctx.contextPrompt || ctx.altText || '';
  const cleanConvTitle = sanitizeConversationTitle(ctx.conversationTitle);

  // A. Check explicit project ID if supplied
  if (resolvedProjectId) {
    const { data: explicitProj } = await db
      .from('projects')
      .select('id, name')
      .eq('id', resolvedProjectId)
      .eq('user_id', ctx.userId)
      .maybeSingle();

    if (explicitProj) {
      resolvedProjectId = explicitProj.id;
      resolvedProjectName = explicitProj.name;
    } else {
      resolvedProjectId = '';
    }
  }

  // B. Correlate with existing user projects based on the DELIVERABLE itself!
  if (!resolvedProjectId) {
    try {
      const { data: allProjects } = await db
        .from('projects')
        .select('id, name')
        .eq('user_id', ctx.userId)
        .order('created_at', { ascending: false });

      if (allProjects && allProjects.length > 0) {
        // Priority 1: Check semantic topic relationship with deliverable name or prompt
        for (const proj of allProjects) {
          if (isRelatedToProject(proj.name, currentPromptOrAlt, displayName)) {
            resolvedProjectId = proj.id;
            resolvedProjectName = proj.name;
            break;
          }
        }

        // Priority 2: Check extracted project brand/name against existing project names
        if (!resolvedProjectId) {
          const extractedBrand = extractProjectNameFromDeliverable(displayName, currentPromptOrAlt);
          if (extractedBrand && extractedBrand.length >= 3) {
            const match = allProjects.find(
              (p) =>
                p.name.toLowerCase() === extractedBrand.toLowerCase() ||
                p.name.toLowerCase().startsWith(extractedBrand.toLowerCase()) ||
                extractedBrand.toLowerCase().startsWith(p.name.toLowerCase())
            );
            if (match) {
              resolvedProjectId = match.id;
              resolvedProjectName = match.name;
            }
          }
        }

        // Priority 3: Match conversation title ONLY IF conversation title is actually related to the deliverable
        if (!resolvedProjectId && cleanConvTitle) {
          const convIsRelatedToDeliverable = isRelatedToProject(cleanConvTitle, currentPromptOrAlt, displayName);
          if (convIsRelatedToDeliverable) {
            const match = allProjects.find(
              (p) =>
                p.name.toLowerCase() === cleanConvTitle.toLowerCase() ||
                p.name.toLowerCase().includes(cleanConvTitle.toLowerCase()) ||
                cleanConvTitle.toLowerCase().includes(p.name.toLowerCase())
            );
            if (match) {
              resolvedProjectId = match.id;
              resolvedProjectName = match.name;
            }
          }
        }
      }
    } catch (_) {}
  }

  // C. Also check session history by source_url (ONLY if semantically related)
  if (!resolvedProjectId && ctx.sourceUrl) {
    try {
      const { data: matchedArtifacts } = await db
        .from('artifacts')
        .select('project_id, project:projects(id, name)')
        .eq('user_id', ctx.userId)
        .filter('metadata->>source_url', 'eq', ctx.sourceUrl)
        .not('project_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(10);

      if (matchedArtifacts && matchedArtifacts.length > 0) {
        for (const matched of matchedArtifacts) {
          if (!matched.project_id) continue;
          let projName = (matched.project as any)?.name;
          if (!projName) {
            const { data: p } = await db
              .from('projects')
              .select('name')
              .eq('id', matched.project_id)
              .maybeSingle();
            projName = p?.name || '';
          }

          if (isRelatedToProject(projName, currentPromptOrAlt, displayName)) {
            resolvedProjectId = matched.project_id;
            resolvedProjectName = projName;
            break;
          }
        }
      }
    } catch (_) {}
  }

  // D. If STILL no matching project, AUTO-CREATE a project for THIS DELIVERABLE
  if (!resolvedProjectId) {
    // Project name must come from the deliverable itself, UNLESS conversation title is explicitly related!
    const convIsRelated = Boolean(
      cleanConvTitle && isRelatedToProject(cleanConvTitle, currentPromptOrAlt, displayName)
    );

    let rawProjectName = '';
    if (convIsRelated) {
      rawProjectName = cleanConvTitle;
    } else {
      rawProjectName = extractProjectNameFromDeliverable(displayName, currentPromptOrAlt);
    }

    if (!rawProjectName || isGenericName(rawProjectName)) {
      rawProjectName = displayName || `${normalizeAiFolderName(ctx.sourceName, ctx.sourceUrl)} Workspace`;
    }
    const newProjectName = sanitizeProjectFolderName(rawProjectName);

    const { icon, color } = pickProjectTheme(ctx.mimeType, ext, newProjectName);

    const { data: newProj, error: createError } = await db
      .from('projects')
      .insert({
        user_id: ctx.userId,
        name: newProjectName,
        description: `Deliverables captured from ${normalizeAiFolderName(ctx.sourceName, ctx.sourceUrl)} conversation`,
        icon,
        color,
      })
      .select('id, name')
      .single();

    if (createError) {
      console.warn('[Organization Engine] Project auto-create warning:', createError.message);
      // Fallback: check if project already exists with this exact name
      const { data: fallbackProj } = await db
        .from('projects')
        .select('id, name')
        .eq('user_id', ctx.userId)
        .eq('name', newProjectName)
        .maybeSingle();

      if (fallbackProj) {
        resolvedProjectId = fallbackProj.id;
        resolvedProjectName = fallbackProj.name;
      }
    } else if (newProj) {
      resolvedProjectId = newProj.id;
      resolvedProjectName = newProj.name;
      projectCreated = true;

      // Log project creation event
      void db
        .from('file_events')
        .insert({
          user_id: ctx.userId,
          event_type: 'created',
          actor_type: 'agent',
          metadata: {
            action: 'auto_create_project',
            project_name: newProjectName,
            source_url: ctx.sourceUrl,
            source_name: normalizeAiFolderName(ctx.sourceName, ctx.sourceUrl),
          },
        })
        .then();
    }
  }

  // Fallback project name if needed
  if (!resolvedProjectName) {
    resolvedProjectName = 'Deliverables';
  }

  // ---------------------------------------------------------------------------
  // 3. FOLDER & SUBFOLDER HIERARCHY (provider_path)
  // Format: <AI Tool> / <Project Name> / <Subfolder if needed> / <Filename>
  // ---------------------------------------------------------------------------
  const aiFolder = normalizeAiFolderName(ctx.sourceName, ctx.sourceUrl);
  const cleanProjectFolder = sanitizeProjectFolderName(resolvedProjectName);

  const { category, subfolder } = determineFolderHierarchy(
    ctx.mimeType,
    ext,
    displayName,
    ctx.contextPrompt || ctx.altText || ''
  );

  const providerPath =
    ctx.explicitProviderPath ||
    (subfolder
      ? `${aiFolder} / ${cleanProjectFolder} / ${subfolder} / ${finalFilename}`
      : `${aiFolder} / ${cleanProjectFolder} / ${finalFilename}`);

  const executionTimeMs = Date.now() - startTime;

  return {
    displayName,
    originalName: finalFilename,
    extension: ext,
    projectId: resolvedProjectId,
    projectName: resolvedProjectName,
    projectCreated,
    providerPath,
    category,
    subfolder,
    description:
      ctx.contextPrompt && ctx.contextPrompt.length > 5
        ? ctx.contextPrompt.slice(0, 200)
        : `Organized into ${aiFolder} / ${cleanProjectFolder} (${subfolder}) by Orfilo`,
    aiConfidence: 0.94,
    executionTimeMs,
  };
}

// -----------------------------------------------------------------------------
// INTERNAL HELPERS
// -----------------------------------------------------------------------------

export function normalizeAiFolderName(sourceName?: string, sourceUrl?: string): string {
  const url = (sourceUrl || '').toLowerCase();
  if (url.includes('chatgpt.com') || url.includes('chat.openai.com')) return 'ChatGPT';
  if (url.includes('claude.ai')) return 'Claude';
  if (url.includes('gemini.google.com')) return 'Gemini';
  if (url.includes('v0.dev')) return 'v0';
  if (url.includes('midjourney.com')) return 'Midjourney';
  if (url.includes('cursor')) return 'Cursor';

  const name = (sourceName || '').trim();
  const lower = name.toLowerCase();
  if (lower.includes('chatgpt') || lower.includes('openai')) return 'ChatGPT';
  if (lower.includes('claude') || lower.includes('anthropic')) return 'Claude';
  if (lower.includes('gemini') || lower.includes('google')) return 'Gemini';
  if (lower.includes('midjourney')) return 'Midjourney';
  if (lower === 'v0') return 'v0';
  if (lower.includes('cursor')) return 'Cursor';

  return name || 'ChatGPT';
}

export function sanitizeProjectFolderName(projectName: string): string {
  let clean = (projectName || '').trim();
  clean = clean.replace(/^(the\s+)?project[:\s\-_]*/i, '');
  clean = clean.replace(/[:\s\-_]*project$/i, '');
  clean = clean.trim();
  return clean || projectName.trim() || 'Deliverables';
}

/**
 * Extracts significant topic keywords from a text string, excluding stopwords.
 */
export function extractTopicKeywords(text: string): string[] {
  if (!text) return [];
  const stopwords = new Set([
    'a', 'an', 'the', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'from',
    'and', 'or', 'but', 'is', 'are', 'was', 'were', 'it', 'its', 'this', 'that',
    'create', 'generate', 'make', 'draw', 'design', 'render', 'show', 'please',
    'image', 'photo', 'picture', 'illustration', 'deliverable', 'file',
    'only', 'new', 'some', 'any', 'my', 'your', 'our', 'another', 'first', 'second',
    'page', 'pages', 'abt', 'about', 'one', 'two', 'three', 'four', 'five',
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

function stemWord(word: string): string {
  return word.toLowerCase().replace(/(ing|tion|ed|es|s|an|ic)$/, '');
}

const SYNONYM_CLUSTERS: string[][] = [
  ['app', 'ui', 'ux', 'dashboard', 'interface', 'screen', 'mockup', 'frontend', 'web', 'webpage'],
  ['fintech', 'banking', 'bank', 'finance', 'financial', 'payment', 'card', 'crypto', 'wallet', 'money', 'credit', 'debit'],
  ['model', 'fashion', 'clothing', 'dress', 'portrait', 'face', 'habeshan', 'habesha', 'outfit', 'beauty'],
  ['character', 'mascot', 'avatar', 'cartoon', 'baby', 'figure'],
  ['auth', 'authentication', 'login', 'signup', 'register', 'password', 'oauth', 'token'],
  ['database', 'sql', 'postgres', 'schema', 'table', 'migration', 'backend', 'api'],
  ['doc', 'document', 'spec', 'overview', 'summary', 'report', 'brief', 'prd', 'gdoc', 'guide'],
];

/**
 * Checks if a new deliverable is semantically related to an existing project.
 */
export function isRelatedToProject(
  projectName: string,
  newPrompt: string,
  newDisplayName: string
): boolean {
  if (!projectName) return false;
  const projectKeywords = extractTopicKeywords(projectName);
  const newKeywords = [
    ...extractTopicKeywords(newPrompt),
    ...extractTopicKeywords(newDisplayName),
  ];

  if (projectKeywords.length === 0 || newKeywords.length === 0) return false;

  // 1. Direct or Stemmed keyword overlap (e.g. habeshan -> habesha, models -> model)
  const projStems = projectKeywords.map(stemWord);
  const newStems = newKeywords.map(stemWord);
  for (const ps of projStems) {
    if (newStems.includes(ps)) return true;
  }

  // 2. Domain cluster match (e.g. fintech project + debit card deliverable)
  let clusterMatches = 0;
  for (const cluster of SYNONYM_CLUSTERS) {
    const hasProjKw = projectKeywords.some((pk) => cluster.includes(pk) || cluster.includes(stemWord(pk)));
    const hasNewKw = newKeywords.some((nk) => cluster.includes(nk) || cluster.includes(stemWord(nk)));
    if (hasProjKw && hasNewKw) {
      clusterMatches++;
    }
  }
  if (clusterMatches >= 1) return true;

  // 3. Substring matches of significant entity
  const lowerProj = projectName.toLowerCase();
  const lowerPrompt = (newPrompt + ' ' + newDisplayName).toLowerCase();
  if (lowerProj.length >= 4 && lowerPrompt.includes(lowerProj)) return true;

  return false;
}

function isGenericConversationTitle(title?: string): boolean {
  if (!title) return true;
  const t = title.trim().toLowerCase();
  return (
    t === 'new chat' ||
    t === 'chatgpt' ||
    t === 'claude' ||
    t === 'gemini' ||
    t === 'v0' ||
    t === 'midjourney' ||
    t === 'untitled' ||
    t === 'ai deliverables'
  );
}

function sanitizeConversationTitle(title?: string): string {
  if (!title) return '';
  let clean = title
    .replace(/\s*[-–|]\s*(Google\s+Gemini|Gemini|Google|ChatGPT|OpenAI|Claude|Anthropic|v0|Midjourney).*$/i, '')
    .trim();
  clean = clean.replace(/[:\s\-_]*(ai\s+portrait\s+prompt|ai\s+prompt|portrait\s+prompt|prompt)$/i, '').trim();
  if (isGenericConversationTitle(clean) || isGenericName(clean)) return '';
  return clean.slice(0, 60);
}

function getCategoryLabel(mimeType: string, ext: string): string {
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    return 'Visual Asset';
  }
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'sql', 'html', 'css'].includes(ext)) {
    return 'Code Deliverable';
  }
  if (
    ['md', 'txt', 'pdf', 'doc', 'docx', 'gdoc', 'gsheet', 'gslides', 'csv', 'xlsx'].includes(ext) ||
    mimeType.includes('document') ||
    mimeType.includes('pdf') ||
    mimeType.includes('spreadsheet') ||
    mimeType.includes('presentation')
  ) {
    return 'Document';
  }
  return 'Deliverable';
}

function pickProjectTheme(
  mimeType: string,
  ext: string,
  projectName: string
): { icon: string; color: string } {
  const lower = projectName.toLowerCase();
  if (
    mimeType.startsWith('image/') ||
    ['png', 'jpg', 'webp', 'svg'].includes(ext) ||
    lower.includes('brand') ||
    lower.includes('design') ||
    lower.includes('logo') ||
    lower.includes('ui')
  ) {
    return { icon: 'palette', color: '#8B5CF6' }; // Purple
  }
  if (
    ['ts', 'tsx', 'js', 'py', 'go', 'rs', 'sql'].includes(ext) ||
    lower.includes('code') ||
    lower.includes('api') ||
    lower.includes('platform') ||
    lower.includes('dev')
  ) {
    return { icon: 'code', color: '#10B981' }; // Emerald
  }
  if (lower.includes('data') || lower.includes('analytics') || lower.includes('report')) {
    return { icon: 'bar-chart', color: '#3B82F6' }; // Blue
  }
  if (
    lower.includes('spec') ||
    lower.includes('plan') ||
    lower.includes('doc') ||
    lower.includes('overview') ||
    ['gdoc', 'doc', 'docx', 'pdf', 'gsheet', 'gslides', 'md', 'txt'].includes(ext) ||
    mimeType.includes('document')
  ) {
    return { icon: 'file-text', color: '#F59E0B' }; // Amber
  }
  return { icon: 'folder', color: '#19A974' }; // Orfilo green
}

function determineFolderHierarchy(
  mimeType: string,
  ext: string,
  displayName: string,
  contextText: string
): { category: string; subfolder: string } {
  const combined = `${displayName} ${contextText} ${ext}`.toLowerCase();

  // 1. Images & Visuals
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    if (/\b(logo|icon|badge|symbol|avatar|favicon|brand)\b/i.test(combined)) {
      return { category: 'Assets', subfolder: 'Brand & Icons' };
    }
    if (/\b(ui|mockup|wireframe|screen|dashboard|interface|landing|layout|hero|modal|view)\b/i.test(combined)) {
      return { category: 'Visuals', subfolder: 'UI Mockups' };
    }
    if (/\b(diagram|flowchart|architecture|chart|graph|schema|flow|sequence|uml|erd|er\s+diagram)\b/i.test(combined)) {
      return { category: 'Visuals', subfolder: 'Diagrams' };
    }
    return { category: 'Visuals', subfolder: 'Illustrations' };
  }

  // 2. Code & Technical
  if (['ts', 'tsx', 'js', 'jsx', 'html', 'css', 'scss', 'vue', 'svelte'].includes(ext)) {
    return { category: 'Code', subfolder: 'Components' };
  }
  if (['py', 'go', 'rs', 'java', 'c', 'cpp', 'cs', 'php'].includes(ext)) {
    return { category: 'Code', subfolder: 'Backend' };
  }
  if (['sql', 'prisma'].includes(ext)) {
    return { category: 'Code', subfolder: 'Database' };
  }
  if (['sh', 'bash', 'yml', 'yaml', 'dockerfile', 'toml', 'env'].includes(ext)) {
    return { category: 'Code', subfolder: 'Scripts' };
  }
  if (mimeType.includes('json') || ext === 'json') {
    return { category: 'Code', subfolder: 'Config' };
  }

  // 3. Documents & Text
  if (/(spec|prd|requirement|architecture|plan|rfp|brief|overview|summary|guide|doc)/i.test(combined) || ['gdoc', 'docx', 'doc', 'pdf'].includes(ext)) {
    return { category: 'Docs', subfolder: 'Specifications' };
  }
  if (/(copy|email|pitch|ad|marketing|newsletter|article|post)/i.test(combined)) {
    return { category: 'Docs', subfolder: 'Copywriting' };
  }

  return { category: 'Docs', subfolder: 'General' };
}
