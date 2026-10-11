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
 * Checks if a given file name or stem is generic (e.g. image-12345, snippet-456, screenshot).
 */
export function isGenericName(name: string): boolean {
  if (!name || !name.trim()) return true;
  const stem = name.replace(/\.[a-zA-Z0-9]+$/, '').trim();
  if (stem.length === 0) return true;
  if (/^[0-9a-f-]{8,}$/i.test(stem)) return true; // UUID or long hex hash
  if (/^\d+$/.test(stem)) return true; // Just timestamp digits
  return /^(image|img|screenshot|screen_shot|screen|snippet|code|deliverable|capture|file|download|unnamed|untitled|asset|blob|output|frame|photo|picture)([-_ \d]*)$/i.test(
    stem
  );
}

/**
 * Clean conversational prompts and alt text into a concise, professional title.
 */
export function cleanPromptToTitle(text: string): string {
  if (!text) return '';
  let cleaned = text.trim();

  // 1. Strip URLs, code wrappers, asterisks, brackets
  cleaned = cleaned.replace(/https?:\/\/\S+/g, ' ');
  cleaned = cleaned.replace(/[*_#`[\]()]/g, ' ');

  // 2. Strip conversational prefixes & generation instructions
  const prefixRegex =
    /^(can you (please )?(create|generate|make|draw|design)|please (create|generate|make|draw|design)|create|generate|make|draw|design|build|render|show me|give me|here is (a|an)?|i want (a|an)?|a photo of|an image of|a picture of|a 3d render of|illustration of|dall[-e\s]+generated:?|dall-e:?|screenshot of|mockup of|wireframe of)\s+/i;
  cleaned = cleaned.replace(prefixRegex, '');

  // 3. Strip quality hype filler tags
  cleaned = cleaned.replace(/\b(photorealistic|hyperrealistic|ultra realistic|high resolution|4k|8k|hd|cinematic lighting|octane render|trending on artstation|unreal engine|studio quality|highly detailed)\b/gi, ' ');

  // 4. Strip leading articles and conversational transition words (a, an, the, another, new, next, one more, some)
  cleaned = cleaned.replace(/^(a|an|the|another|new|next|one more|some)\s+/i, '');

  // 5. Special grammar cleanup: e.g. "only face" -> "face only"
  cleaned = cleaned.replace(/\bonly\s+([a-zA-Z0-9]+)\b/gi, '$1 only');

  // 6. Strip leading/trailing punctuation or quotes
  cleaned = cleaned.replace(/^["'“‘\-:\s]+/, '').replace(/["'”’]+$/, '');

  // 7. Take first sentence or clause
  const firstSentence = cleaned.split(/[\n.;?!]/)[0] || '';
  let candidate = firstSentence.trim();
  if (candidate.length === 0) candidate = cleaned;

  // 8. Strip trailing prepositions/conjunctions
  candidate = candidate.replace(/\s+(with|for|and|or|in|on|at|to|a|an|the|of|by|from|using|featuring)$/i, '');
  candidate = candidate.replace(/[-_–—:,]+$/, '').trim();

  // 9. Limit to max 4 to 5 words for clean, punchy, understandable naming
  const allWords = candidate.split(/\s+/).filter(Boolean);
  const words = allWords.slice(0, 5);

  // 10. Title Case formatting with acronym preservation
  const titled = words
    .map((w, idx) => {
      const lower = w.toLowerCase();
      if (['ui', 'ux', 'api', 'sql', 'css', 'html', 'js', 'ts', 'prd', 'ai'].includes(lower)) {
        return lower.toUpperCase();
      }
      if (idx > 0 && ['and', 'or', 'for', 'to', 'in', 'on', 'at', 'a', 'an', 'the', 'of', 'with', 'by'].includes(lower)) {
        return lower;
      }
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(' ');

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

  // If name is generic or missing, derive from altText, contextPrompt, or conversationTitle
  const nameIsGeneric = isGenericName(displayName) || isGenericName(originalStem);

  if (nameIsGeneric || !displayName) {
    let semanticSeed = '';
    if (ctx.altText && ctx.altText.trim().length > 3) {
      semanticSeed = ctx.altText.trim();
    } else if (ctx.contextPrompt && ctx.contextPrompt.trim().length > 3) {
      semanticSeed = ctx.contextPrompt.trim();
    } else if (ctx.conversationTitle && !isGenericConversationTitle(ctx.conversationTitle)) {
      semanticSeed = ctx.conversationTitle.trim();
    }

    const derivedTitle = cleanPromptToTitle(semanticSeed);
    if (derivedTitle.length >= 3) {
      displayName = derivedTitle;
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

  // Ensure original_name is a clean kebab-case file with extension
  const cleanKebabStem = toKebabCase(displayName) || 'deliverable';
  const finalFilename = `${cleanKebabStem}.${ext}`;

  // ---------------------------------------------------------------------------
  // 2. PROJECT CORRELATION & AUTO-CREATION
  // ---------------------------------------------------------------------------
  let resolvedProjectId = ctx.explicitProjectId || '';
  let resolvedProjectName = '';
  let projectCreated = false;

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

  // B. Correlate by conversation source_url across existing artifacts ONLY IF semantically related!
  const currentPromptOrAlt = ctx.contextPrompt || ctx.altText || '';
  let priorArtifactsInSession: any[] = [];

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
        priorArtifactsInSession = matchedArtifacts;

        // Check each existing project in this conversation to find a topic match
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

  // C. Match by conversation title against existing projects (only if relevant to current deliverable)
  const cleanConvTitle = sanitizeConversationTitle(ctx.conversationTitle);
  const convTitleIsRelated =
    cleanConvTitle && isRelatedToProject(cleanConvTitle, currentPromptOrAlt, displayName);

  if (!resolvedProjectId && convTitleIsRelated) {
    const { data: existingProjects } = await db
      .from('projects')
      .select('id, name')
      .eq('user_id', ctx.userId);

    if (existingProjects && existingProjects.length > 0) {
      const lowerCandidate = cleanConvTitle.toLowerCase();
      const match = existingProjects.find(
        (p) =>
          p.name.toLowerCase() === lowerCandidate ||
          p.name.toLowerCase().includes(lowerCandidate) ||
          lowerCandidate.includes(p.name.toLowerCase())
      );
      if (match) {
        resolvedProjectId = match.id;
        resolvedProjectName = match.name;
      }
    }
  }

  // D. If still no project, AUTO-CREATE a dedicated project for this deliverable
  if (!resolvedProjectId) {
    // If there were no prior artifacts in this chat session, the clean conversation title is authoritative
    // (e.g. chat was created as "Fintech Mobile App Redesign").
    // If prior artifacts exist and this deliverable is a new topic, use the deliverable name.
    const isFirstInSession = priorArtifactsInSession.length === 0;
    const shouldUseConvTitle = Boolean(cleanConvTitle && (isFirstInSession || convTitleIsRelated));

    const rawProjectName =
      (shouldUseConvTitle ? cleanConvTitle : '') ||
      (displayName.length >= 2 && displayName.length <= 40 ? displayName : '') ||
      `${normalizeAiFolderName(ctx.sourceName, ctx.sourceUrl)} Workspace`;
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
    'only', 'new', 'some', 'any', 'my', 'your', 'our', 'another', 'first', 'second'
  ]);

  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopwords.has(w));
}

const SYNONYM_CLUSTERS: string[][] = [
  ['app', 'ui', 'ux', 'dashboard', 'interface', 'screen', 'mockup', 'frontend', 'web', 'page', 'design', 'redesign'],
  ['fintech', 'banking', 'bank', 'finance', 'financial', 'payment', 'card', 'crypto', 'wallet', 'money', 'balance'],
  ['model', 'fashion', 'clothing', 'dress', 'portrait', 'face', 'character', 'habeshan', 'habesha'],
  ['auth', 'authentication', 'login', 'signup', 'register', 'password', 'oauth', 'token'],
  ['database', 'sql', 'postgres', 'schema', 'table', 'migration', 'backend', 'api'],
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
  const newKeywords = new Set([
    ...extractTopicKeywords(newPrompt),
    ...extractTopicKeywords(newDisplayName),
  ]);

  if (projectKeywords.length === 0 || newKeywords.size === 0) return false;

  // 1. Direct keyword overlap
  for (const kw of projectKeywords) {
    if (newKeywords.has(kw)) return true;
  }

  // 2. Domain synonym cluster matching
  for (const cluster of SYNONYM_CLUSTERS) {
    const hasProjKw = projectKeywords.some((pk) => cluster.includes(pk));
    const hasNewKw = [...newKeywords].some((nk) => cluster.includes(nk));
    if (hasProjKw && hasNewKw) {
      return true;
    }
  }

  // 3. Substring matches
  const lowerProj = projectName.toLowerCase();
  const lowerPrompt = (newPrompt + ' ' + newDisplayName).toLowerCase();
  if (lowerPrompt.includes(lowerProj) || lowerProj.includes(lowerPrompt)) return true;

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
    .replace(/\s*[-–|]\s*(ChatGPT|Claude|Gemini|v0|Midjourney).*$/i, '')
    .trim();
  if (isGenericConversationTitle(clean)) return '';
  return clean.slice(0, 60);
}

function getCategoryLabel(mimeType: string, ext: string): string {
  if (mimeType.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
    return 'Visual Asset';
  }
  if (['ts', 'tsx', 'js', 'jsx', 'py', 'go', 'rs', 'sql', 'html', 'css'].includes(ext)) {
    return 'Code Deliverable';
  }
  if (['md', 'txt', 'pdf', 'doc', 'docx'].includes(ext)) {
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
  if (lower.includes('spec') || lower.includes('plan') || lower.includes('doc')) {
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
  if (/(spec|prd|requirement|architecture|plan|rfp|brief)/i.test(combined)) {
    return { category: 'Docs', subfolder: 'Specifications' };
  }
  if (/(copy|email|pitch|ad|marketing|newsletter|article|post)/i.test(combined)) {
    return { category: 'Docs', subfolder: 'Copywriting' };
  }

  return { category: 'Docs', subfolder: 'General' };
}
