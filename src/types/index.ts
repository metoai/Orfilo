export interface User {
  id: string;
  email: string;
  name: string;
  avatar_url?: string | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string;
  user_id: string;
  name: string;
  description: string | null;
  icon: string | null;
  color: string | null;
  created_at: string;
  updated_at: string;
  artifact_count?: number;
}

export interface ArtifactMetadata {
  category?: string;
  subfolder?: string;
  doc_url?: string;
  purpose?: string;
  topics?: string[];
  keywords?: string[];
  reasoning?: string;
  suggested_location?: string;
  ai_model?: string;
  dimensions?: { width: number; height: number };
  page_count?: number;
  word_count?: number;
  file_hash?: string;
  [key: string]: unknown;
}

export interface Artifact {
  id: string;
  user_id: string;
  project_id: string | null;
  storage_connection_id?: string | null;
  original_name: string;
  display_name: string;
  mime_type: string;
  extension: string;
  size_bytes: number;
  provider_file_id?: string | null;
  provider_path?: string | null;
  description: string | null;
  source_type: 'download_capture' | 'manual_upload' | 'agent_api' | 'ai_export' | 'browser_extension' | string | null;
  source_name: 'Gemini' | 'ChatGPT' | 'Claude' | 'Midjourney' | 'DALL-E' | 'Custom' | string | null;
  ai_confidence: number | null;
  metadata: ArtifactMetadata;
  created_at: string;
  updated_at: string;
  project?: Project;
}

export interface ArtifactEmbedding {
  artifact_id: string;
  embedding: number[];
  model: string;
  created_at: string;
}

export type FileEventType = 'saved' | 'organized' | 'renamed' | 'moved' | 'downloaded' | 'deleted' | 'imported' | string;
export type ActorType = 'human' | 'ai_system' | 'integration' | 'extension' | string;

export interface FileEvent {
  id: string;
  user_id: string;
  artifact_id: string | null;
  event_type: FileEventType;
  actor_type: ActorType;
  actor_id?: string | null;
  metadata: {
    artifact_name?: string;
    project_name?: string;
    from_name?: string;
    to_name?: string;
    from_path?: string;
    to_path?: string;
    summary?: string;
    [key: string]: unknown;
  };
  created_at: string;
}

export interface ClassificationResult {
  project_name: string;
  category: string;
  purpose: string;
  topics?: string[];
  keywords?: string[];
  suggested_name: string;
  suggested_location?: string;
  confidence?: number;
  reasoning?: string;
}

export type AIOrganizationSuggestion = ClassificationResult;
