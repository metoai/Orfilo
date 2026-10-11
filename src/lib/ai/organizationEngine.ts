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

  // Strip Markdown code / bold / links / asterisks
  cleaned = cleaned.replace(/[*_#`[\]()]/g, ' ');

  // Strip conversational prefixes
  const prefixRegex =
    /^(create|generate|make|draw|design|build|render|show|give me|can you (please )?(create|generate|make|draw|design)|here is (a|an)|a photo of|an image of|a render of|a 3d render of|illustration of|dall[-e\s]+generated:?|screenshot of|mockup of|wireframe of)\s+/i;
  cleaned = cleaned.replace(prefixRegex, '');

  // Strip leading articles (a, an, the)
  cleaned = cleaned.replace(/^(a|an|the)\s+/i, '');

  // Strip leading quotes or punctuation
  cleaned = cleaned.replace(/^["'“‘\-:\s]+/, '').replace(/["'”’]+$/, '');

  // Take the first clause up to punctuation or line break
  const firstSentence = cleaned.split(/[\n.;?!]/)[0] || '';
  let candidate = firstSentence.trim();

  if (candidate.length === 0) candidate = cleaned;

  // Truncate cleanly at word boundary up to ~45 characters
  if (candidate.length > 45) {
    const truncated = candidate.slice(0, 45);
    const lastSpace = truncated.lastIndexOf(' ');
    candidate = lastSpace > 20 ? truncated.slice(0, lastSpace) : truncated;
  }

  // Strip trailing prepositions, conjunctions, or punctuation
  candidate = candidate.replace(/\s+(with|for|and|or|in|on|at|to|a|an|the|of|by|from|using|featuring)$/i, '');
  candidate = candidate.replace(/[-_–—:,]+$/, '').trim();

  // Convert to Title Case
  const words = candidate.split(/\s+/).filter(Boolean);
  const titled = words
    .map((w, idx) => {
      const lower = w.toLowerCase();
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

  // B. Correlate by conversation source_url across existing artifacts
  if (!resolvedProjectId && ctx.sourceUrl) {
    try {
      const { data: matchedArtifact } = await db
        .from('artifacts')
        .select('project_id, project:projects(id, name)')
        .eq('user_id', ctx.userId)
        .filter('metadata->>source_url', 'eq', ctx.sourceUrl)
        .not('project_id', 'is', null)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (matchedArtifact && matchedArtifact.project_id) {
        resolvedProjectId = matchedArtifact.project_id;
        // Project name might come from joined object or require quick lookup
        const projName = (matchedArtifact.project as any)?.name;
        if (projName) {
          resolvedProjectName = projName;
        } else {
          const { data: p } = await db
            .from('projects')
            .select('name')
            .eq('id', resolvedProjectId)
            .maybeSingle();
          resolvedProjectName = p?.name || 'Project Deliverables';
        }
      }
    } catch (_) {}
  }

  // C. Match by conversation title against existing projects
  const cleanConvTitle = sanitizeConversationTitle(ctx.conversationTitle);
  if (!resolvedProjectId && cleanConvTitle) {
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
    const newProjectName =
      cleanConvTitle ||
      (displayName.length > 3 && displayName.length < 35
        ? displayName
        : `${ctx.sourceName || 'AI'} Deliverables`);

    const { icon, color } = pickProjectTheme(ctx.mimeType, ext, newProjectName);

    const { data: newProj, error: createError } = await db
      .from('projects')
      .insert({
        user_id: ctx.userId,
        name: newProjectName,
        description: `Deliverables captured from ${ctx.sourceName || 'AI'} conversation`,
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
            source_name: ctx.sourceName,
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
  // ---------------------------------------------------------------------------
  const { category, subfolder } = determineFolderHierarchy(
    ctx.mimeType,
    ext,
    displayName,
    ctx.contextPrompt || ctx.altText || ''
  );

  const providerPath = ctx.explicitProviderPath || `${resolvedProjectName} / ${category} / ${subfolder} / ${finalFilename}`;

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
        : `Organized into ${category} / ${subfolder} by Orfilo`,
    aiConfidence: 0.94,
    executionTimeMs,
  };
}

// -----------------------------------------------------------------------------
// INTERNAL HELPERS
// -----------------------------------------------------------------------------

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
    if (/(logo|icon|badge|symbol|avatar|favicon|brand)/i.test(combined)) {
      return { category: 'Assets', subfolder: 'Brand & Icons' };
    }
    if (/(ui|mockup|wireframe|screen|dashboard|interface|landing|layout|hero|modal|view)/i.test(combined)) {
      return { category: 'Visuals', subfolder: 'UI Mockups' };
    }
    if (/(diagram|flowchart|architecture|chart|graph|schema|flow|er|sequence|uml)/i.test(combined)) {
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
