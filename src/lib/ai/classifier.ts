import { AIOrganizationSuggestion } from '../../types/index.ts';

// Deterministic metadata extractor
export function extractDeterministicMetadata(file: File) {
  const originalName = file.name;
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.slice(lastDotIndex + 1).toLowerCase() : 'bin';
  const mimeType = file.type || getFallbackMimeType(extension);
  const sizeBytes = file.size;

  return {
    original_name: originalName,
    extension,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  };
}

function getFallbackMimeType(ext: string): string {
  const map: Record<string, string> = {
    pdf: 'application/pdf',
    png: 'image/png',
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    webp: 'image/webp',
    svg: 'image/svg+xml',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    txt: 'text/plain',
    md: 'text/markdown',
    json: 'application/json',
    ts: 'text/typescript',
    tsx: 'text/typescript-jsx',
    py: 'text/x-python',
  };
  return map[ext] || 'application/octet-stream';
}

/**
 * Clean heuristic fallback when offline or during transient network interruptions.
 * Ensures the user experience remains fast and resilient.
 */
export function getHeuristicSuggestion(
  filename: string,
  extension: string,
  availableProjects: string[]
): AIOrganizationSuggestion {
  const lower = filename.toLowerCase();

  // Match existing project if mentioned in filename
  let matchedProject = availableProjects[0] || 'Personal';
  for (const proj of availableProjects) {
    if (lower.includes(proj.toLowerCase())) {
      matchedProject = proj;
      break;
    }
  }

  let category = 'Documents';
  let purpose = 'General artifact';
  let folder = 'General';

  if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(extension)) {
    category = 'Design & Media';
    if (lower.includes('hero') || lower.includes('banner')) {
      purpose = 'Hero artwork';
      folder = 'Hero Images';
    } else if (lower.includes('icon') || lower.includes('logo')) {
      purpose = 'Brand asset';
      folder = 'Branding';
    } else {
      purpose = 'Visual asset';
      folder = 'Assets';
    }
  } else if (['pdf', 'docx', 'txt', 'md'].includes(extension)) {
    category = 'Documentation';
    if (lower.includes('overview') || lower.includes('summary')) {
      purpose = 'Product overview';
      folder = 'Documentation';
    } else if (lower.includes('spec') || lower.includes('architecture')) {
      purpose = 'Technical specification';
      folder = 'Technical';
    } else {
      purpose = 'Written reference';
      folder = 'Notes';
    }
  } else if (['pptx', 'key'].includes(extension)) {
    category = 'Presentations';
    purpose = 'Slide deck';
    folder = 'Presentations';
  } else if (['ts', 'tsx', 'js', 'py', 'json', 'sql'].includes(extension)) {
    category = 'Code';
    purpose = 'Source artifact';
    folder = 'Code';
  }

  // Clean suggested name: replace random hashes / underscores with clean kebab-case
  const cleanBase = filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[^a-zA-Z0-9_-]/g, '-')
    .replace(/_{2,}/g, '_')
    .replace(/-{2,}/g, '-')
    .toLowerCase();

  const suggested_name = `${cleanBase}.${extension}`;

  return {
    project_name: matchedProject,
    category,
    purpose,
    topics: [matchedProject, category],
    keywords: [extension, matchedProject.toLowerCase(), category.toLowerCase()],
    suggested_name,
    suggested_location: `${matchedProject} / ${folder}`,
    confidence: 0.88,
    reasoning: `Orfilo matched this ${extension.toUpperCase()} file with the ${matchedProject} project based on structural naming and type attributes.`,
  };
}

/**
 * Classifies an artifact via the full-stack server-side Gemini 3.8 Flash endpoint (/api/classify).
 * Keeps client bundles lightweight and secure.
 */
export async function classifyArtifactWithGemini(params: {
  filename: string;
  extension: string;
  mimeType: string;
  sizeBytes: number;
  availableProjects: string[];
  contextNote?: string;
}): Promise<AIOrganizationSuggestion> {
  const { filename, extension, mimeType, sizeBytes, availableProjects, contextNote } = params;

  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        filename,
        extension,
        mimeType,
        sizeBytes,
        availableProjects,
        contextNote,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      if (data.suggestion && data.suggestion.suggested_name) {
        return {
          project_name: data.suggestion.project_name || availableProjects[0] || 'General',
          category: data.suggestion.category || 'General',
          purpose: data.suggestion.purpose || 'Artifact',
          topics: Array.isArray(data.suggestion.topics) ? data.suggestion.topics : [],
          keywords: Array.isArray(data.suggestion.keywords) ? data.suggestion.keywords : [],
          suggested_name: data.suggestion.suggested_name,
          suggested_location: data.suggestion.suggested_location || `${data.suggestion.project_name} / Artifacts`,
          confidence: typeof data.suggestion.confidence === 'number' ? data.suggestion.confidence : 0.94,
          reasoning: data.suggestion.reasoning || `Orfilo organized this artifact with Gemini.`,
        };
      }
    }
  } catch (err) {
    console.warn('[Orfilo AI Classifier] Server request notice, using heuristic fallback:', err);
  }

  // Graceful deterministic fallback
  return getHeuristicSuggestion(filename, extension, availableProjects);
}

/**
 * Check Gemini AI Brain Server Connection Status
 */
export async function checkAIStatus(): Promise<{
  status: string;
  ready: boolean;
  model: string;
  provider: string;
  runtime: string;
  capabilities: string[];
}> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Orfilo AI] Status check failed:', err);
  }

  return {
    status: 'standalone',
    ready: true,
    model: 'gemini-3.8-flash',
    provider: 'Google Gemini',
    runtime: 'Local Heuristics / Hybrid',
    capabilities: [
      'Automated artifact classification',
      'Structural kebab-case naming',
      'Project routing',
    ],
  };
}

/**
 * Natural Language Query / Semantic Search with Gemini
 */
export async function queryOrfiloAI(params: {
  query: string;
  artifacts: any[];
}): Promise<{
  answer: string;
  matched_artifact_ids: string[];
  suggested_action?: string;
  confidence?: number;
}> {
  try {
    const res = await fetch('/api/ai/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('[Orfilo AI] Query error:', err);
  }

  // Fallback simple search if server AI route encounters an issue
  const q = params.query.toLowerCase();
  const matched = params.artifacts
    .filter(
      (a) =>
        a.display_name?.toLowerCase().includes(q) ||
        a.original_name?.toLowerCase().includes(q) ||
        a.metadata?.purpose?.toLowerCase().includes(q) ||
        a.project?.name?.toLowerCase().includes(q)
    )
    .map((a) => a.id);

  return {
    answer: `Found ${matched.length} artifact(s) matching "${params.query}".`,
    matched_artifact_ids: matched,
  };
}
