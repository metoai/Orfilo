import { ClassificationResult } from '../../types/index.ts';

export function extractDeterministicMetadata(file: File) {
  const originalName = file.name;
  const lastDotIndex = originalName.lastIndexOf('.');
  const extension = lastDotIndex !== -1 ? originalName.slice(lastDotIndex + 1).toLowerCase() : 'bin';
  const mimeType = file.type || 'application/octet-stream';
  const sizeBytes = file.size;

  return {
    original_name: originalName,
    extension,
    mime_type: mimeType,
    size_bytes: sizeBytes,
  };
}

/**
 * Classifies an artifact via server-side Gemini endpoint.
 * Returns null if the API call fails without fake fallbacks.
 */
export async function classifyArtifact(filename: string, mimeType: string): Promise<ClassificationResult | null> {
  try {
    const res = await fetch('/api/classify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filename, mimeType }),
    });

    if (!res.ok) {
      return null;
    }

    const data = await res.json();
    if (data?.suggestion && data.suggestion.suggested_name) {
      return {
        project_name: data.suggestion.project_name || '',
        category: data.suggestion.category || '',
        purpose: data.suggestion.purpose || '',
        topics: Array.isArray(data.suggestion.topics) ? data.suggestion.topics : [],
        keywords: Array.isArray(data.suggestion.keywords) ? data.suggestion.keywords : [],
        suggested_name: data.suggestion.suggested_name,
        suggested_location: data.suggestion.suggested_location || '',
        confidence: typeof data.suggestion.confidence === 'number' ? data.suggestion.confidence : undefined,
        reasoning: data.suggestion.reasoning || '',
      };
    }
    return null;
  } catch (err) {
    console.error('[Orfilo AI Classifier] Server request failed:', err);
    return null;
  }
}

/**
 * Check AI status via server endpoint.
 */
export async function checkAIStatus(): Promise<{ available: boolean }> {
  try {
    const res = await fetch('/api/ai/status');
    if (res.ok) {
      const data = await res.json();
      return { available: Boolean(data.ready ?? data.available ?? true) };
    }
  } catch (err) {
    console.warn('[Orfilo AI] Status check failed:', err);
  }
  return { available: false };
}
