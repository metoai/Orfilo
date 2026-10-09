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

export type StorageProviderType = 'google_drive' | 'supabase' | 'local_dev' | string;
export type ConnectionStatus = 'connected' | 'pending' | 'disconnected' | 'error' | string;

export interface StorageConnection {
  id: string;
  user_id: string;
  provider: StorageProviderType;
  account_name: string | null;
  provider_account_id?: string | null;
  status: ConnectionStatus;
  credential_reference?: string | null;
  expires_at?: string | null;
  created_at: string;
  updated_at: string;
}

export interface ArtifactMetadata {
  category?: string;
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

export interface AIOrganizationSuggestion {
  project_name: string;
  category: string;
  purpose: string;
  topics: string[];
  keywords: string[];
  suggested_name: string;
  suggested_location: string;
  confidence: number;
  reasoning: string;
}

export interface StorageItem {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  path: string;
  isFolder: boolean;
  modifiedTime: string;
}

export interface IStorageProvider {
  name: string;
  isConfigured: boolean;
  upload(file: File | Blob, path: string, filename: string): Promise<{ fileId: string; path: string; size: number }>;
  download(fileId: string): Promise<Blob>;
  delete(fileId: string): Promise<boolean>;
  rename(fileId: string, newName: string): Promise<boolean>;
  move(fileId: string, newPath: string): Promise<boolean>;
  list(folderPath?: string): Promise<StorageItem[]>;
  get(fileId: string): Promise<StorageItem | null>;
  search(query: string): Promise<StorageItem[]>;
  createFolder(folderPath: string): Promise<{ folderId: string; path: string }>;
}

export type AIProviderId = 'chatgpt' | 'gemini' | 'claude' | 'cursor' | 'custom_agent' | 'perplexity';
export type AIConnectionStatus = 'connected' | 'not_connected' | 'setup_required' | 'disconnected';
export type AIAuthType = 'oauth' | 'apps_sdk' | 'mcp_bundle' | 'api_key' | 'native';

export type AICapabilityId =
  | 'save_artifacts'
  | 'retrieve_artifacts'
  | 'search_orfilo'
  | 'write_to_orfilo'
  | 'event_ingestion'
  | 'conversation_context'
  | 'automatic_capture';

export interface AICapabilitySupport {
  id: AICapabilityId;
  label: string;
  description: string;
  supported: boolean;
  notes?: string;
}

export interface AIConnection {
  id: string;
  user_id: string;
  provider: AIProviderId;
  status: AIConnectionStatus;
  auth_type: AIAuthType;
  access_token?: string; // encrypted/masked token reference
  refresh_token?: string;
  scopes: string[];
  metadata: {
    account_email?: string;
    organization?: string;
    client_name?: string;
    version?: string;
    icon?: string;
    supported_capabilities?: AICapabilitySupport[];
    [key: string]: unknown;
  };
  connected_at?: string | null;
  last_seen_at?: string | null;
  disconnected_at?: string | null;
}

export type IntegrationProviderType = 'chatgpt' | 'claude' | 'gemini' | 'cursor' | 'mcp' | 'api' | 'webhooks' | 'extension';
export type IntegrationConnectionType = 'openapi' | 'mcp' | 'rest_api' | 'webhook' | 'browser_extension';

export interface IntegrationConnection {
  id: string;
  user_id: string;
  provider: IntegrationProviderType;
  connection_type: IntegrationConnectionType;
  status: 'connected' | 'not_connected' | 'available' | 'error';
  name: string;
  description: string;
  scopes: string[];
  metadata?: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  last_used_at?: string;
}

export interface AIAgentIdentity {
  id: string;
  user_id?: string;
  name: string;
  description: string;
  type: 'chatgpt' | 'claude' | 'cursor' | 'gemini' | 'custom';
  permissions: string[];
  status: 'active' | 'revoked';
  created_at: string;
  last_used_at?: string;
}

export interface ScopedApiKey {
  id: string;
  user_id?: string;
  name: string;
  key_preview: string;
  permissions: string[];
  created_at: string;
  last_used_at?: string;
  expires_at?: string | null;
}

export interface WebhookSubscription {
  id: string;
  user_id?: string;
  url: string;
  events: string[];
  secret_preview: string;
  is_active: boolean;
  created_at: string;
  last_triggered_at?: string;
}

export interface SmartCaptureItem {
  id: string;
  filename: string;
  source_name: string;
  detected_project: string;
  suggested_category: string;
  suggested_name: string;
  confidence: number;
  finality_phrase: string;
  timestamp: string;
}
