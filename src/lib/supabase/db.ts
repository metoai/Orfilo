import { createBrowserClient, getSupabaseConfig } from './client.ts';
import { Project, Artifact, FileEvent, StorageConnection, User, AIOrganizationSuggestion } from '../../types/index.ts';

// Initial seed mock state for when Supabase credentials or tables are not yet initialized
const SEED_USER: User = {
  id: 'usr_orfilo_default',
  email: 'metoaipr@gmail.com',
  name: 'Meto User',
  avatar_url: null,
  created_at: new Date(Date.now() - 86400000 * 7).toISOString(),
  updated_at: new Date().toISOString(),
};

const SEED_PROJECTS: Project[] = [
  {
    id: 'proj_meto_01',
    user_id: 'usr_orfilo_default',
    name: 'Meto',
    description: 'Autonomous AI vision inspection platform and product collateral',
    icon: 'folder',
    color: '#19A974',
    created_at: new Date(Date.now() - 86400000 * 5).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    artifact_count: 3,
  },
  {
    id: 'proj_orfilo_02',
    user_id: 'usr_orfilo_default',
    name: 'Orfilo',
    description: 'Brand identity, system architecture, and extension capture layer',
    icon: 'sparkles',
    color: '#0B1320',
    created_at: new Date(Date.now() - 86400000 * 6).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    artifact_count: 2,
  },
  {
    id: 'proj_fert_03',
    user_id: 'usr_orfilo_default',
    name: 'Fert Creatives',
    description: 'Design system tokens, typography scales, and UI exploration',
    icon: 'palette',
    color: '#63E6B1',
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    artifact_count: 1,
  },
];

const SEED_ARTIFACTS: Artifact[] = [
  {
    id: 'art_01',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_meto_01',
    storage_connection_id: null,
    original_name: 'document_847291_final2.pdf',
    display_name: 'meto-product-overview.pdf',
    mime_type: 'application/pdf',
    extension: 'pdf',
    size_bytes: 245800,
    provider_file_id: 'gd_sample_1',
    provider_path: 'Meto / Documentation',
    description: 'Product overview and system capabilities overview generated from Gemini',
    source_type: 'download_capture',
    source_name: 'Gemini',
    ai_confidence: 0.96,
    metadata: {
      category: 'Documentation',
      purpose: 'Product overview',
      topics: ['Meto', 'Inspection', 'AI Vision'],
      keywords: ['meto', 'overview', 'specs', 'pdf'],
      reasoning: 'Orfilo identified this as a product overview PDF related to the Meto project.',
      suggested_location: 'Meto / Documentation',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'art_02',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_meto_01',
    storage_connection_id: null,
    original_name: 'image_847392_final2.png',
    display_name: 'meto-hero-v1.png',
    mime_type: 'image/png',
    extension: 'png',
    size_bytes: 1420500,
    provider_file_id: 'gd_sample_2',
    provider_path: 'Meto / Marketing / Images',
    description: 'Landing page visual hero showcasing the inspection dashboard',
    source_type: 'download_capture',
    source_name: 'ChatGPT',
    ai_confidence: 0.94,
    metadata: {
      category: 'Marketing',
      purpose: 'Hero image',
      topics: ['Meto', 'Marketing', 'Landing Page'],
      keywords: ['hero', 'landing', 'marketing', 'png'],
      reasoning: 'Orfilo identified this as a marketing hero image related to the Meto project.',
      suggested_location: 'Meto / Marketing / Images',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'art_03',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_meto_01',
    storage_connection_id: null,
    original_name: 'deck_draft_v3.pptx',
    display_name: 'meto-investor-deck.pptx',
    mime_type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    extension: 'pptx',
    size_bytes: 4890000,
    provider_file_id: null,
    provider_path: 'Meto / Presentations',
    description: 'Seed round investor presentation deck generated with Claude',
    source_type: 'manual_upload',
    source_name: 'Claude',
    ai_confidence: 0.91,
    metadata: {
      category: 'Presentations',
      purpose: 'Pitch deck',
      topics: ['Meto', 'Fundraising', 'Deck'],
      keywords: ['pitch', 'deck', 'slides'],
      reasoning: 'Orfilo recognized this as an investor slide deck for Meto.',
      suggested_location: 'Meto / Presentations',
    },
    created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 1).toISOString(),
  },
  {
    id: 'art_04',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_orfilo_02',
    storage_connection_id: null,
    original_name: 'architecture_diagram_draft.svg',
    display_name: 'orfilo-system-architecture.svg',
    mime_type: 'image/svg+xml',
    extension: 'svg',
    size_bytes: 84300,
    provider_file_id: null,
    provider_path: 'Orfilo / Documentation',
    description: 'Vector blueprint of Orfilo capture pipeline and storage connector layer',
    source_type: 'ai_export',
    source_name: 'Gemini',
    ai_confidence: 0.98,
    metadata: {
      category: 'Documentation',
      purpose: 'Architecture blueprint',
      topics: ['Orfilo', 'Infrastructure', 'Supabase'],
      keywords: ['architecture', 'diagram', 'svg'],
      reasoning: 'Orfilo identified this as the system architecture blueprint for Orfilo.',
      suggested_location: 'Orfilo / Documentation',
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: 'art_05',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_orfilo_02',
    storage_connection_id: null,
    original_name: 'manifest_v3_draft.json',
    display_name: 'chrome-extension-manifest.json',
    mime_type: 'application/json',
    extension: 'json',
    size_bytes: 3200,
    provider_file_id: null,
    provider_path: 'Orfilo / Code',
    description: 'Manifest V3 configuration for the browser Smart Capture extension',
    source_type: 'manual_upload',
    source_name: 'Claude',
    ai_confidence: 0.95,
    metadata: {
      category: 'Code',
      purpose: 'Extension config',
      topics: ['Browser Extension', 'Manifest V3'],
      keywords: ['manifest', 'extension', 'json'],
      reasoning: 'Orfilo categorized this code artifact under Orfilo / Code.',
      suggested_location: 'Orfilo / Code',
    },
    created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
  {
    id: 'art_06',
    user_id: 'usr_orfilo_default',
    project_id: 'proj_fert_03',
    storage_connection_id: null,
    original_name: 'typography_scale_export.json',
    display_name: 'fert-type-scale.json',
    mime_type: 'application/json',
    extension: 'json',
    size_bytes: 4120,
    provider_file_id: null,
    provider_path: 'Fert Creatives / Tokens',
    description: 'Geist Sans and Geist Mono typography scale tokens exported from Figma AI',
    source_type: 'manual_upload',
    source_name: 'Custom',
    ai_confidence: 0.93,
    metadata: {
      category: 'Design & Media',
      purpose: 'Design tokens',
      topics: ['Fert', 'Typography', 'Tokens'],
      keywords: ['tokens', 'geist', 'typography'],
      reasoning: 'Orfilo matched this token file to Fert Creatives.',
      suggested_location: 'Fert Creatives / Tokens',
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

const SEED_EVENTS: FileEvent[] = [
  {
    id: 'ev_01',
    user_id: 'usr_orfilo_default',
    artifact_id: 'art_01',
    event_type: 'organized',
    actor_type: 'ai_system',
    actor_id: 'gemini-2.5-flash',
    metadata: {
      artifact_name: 'meto-product-overview.pdf',
      project_name: 'Meto',
      to_path: 'Meto / Documentation',
      summary: 'AI organized meto-product-overview.pdf → Meto / Documentation',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
  {
    id: 'ev_02',
    user_id: 'usr_orfilo_default',
    artifact_id: 'art_01',
    event_type: 'saved',
    actor_type: 'human',
    actor_id: 'metoaipr@gmail.com',
    metadata: {
      artifact_name: 'meto-product-overview.pdf',
      summary: 'Captured from Gemini download and saved to Orfilo',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 3 - 1000 * 20).toISOString(),
  },
  {
    id: 'ev_03',
    user_id: 'usr_orfilo_default',
    artifact_id: 'art_02',
    event_type: 'renamed',
    actor_type: 'ai_system',
    actor_id: 'gemini-2.5-flash',
    metadata: {
      from_name: 'image_847392_final2.png',
      to_name: 'meto-hero-v1.png',
      summary: 'Renamed image_847392_final2.png → meto-hero-v1.png',
    },
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
  },
  {
    id: 'ev_04',
    user_id: 'usr_orfilo_default',
    artifact_id: 'art_04',
    event_type: 'saved',
    actor_type: 'human',
    actor_id: 'metoaipr@gmail.com',
    metadata: {
      artifact_name: 'orfilo-system-architecture.svg',
      project_name: 'Orfilo',
      summary: 'Saved architecture blueprint to Orfilo',
    },
    created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
];

export interface SchemaStatus {
  isConfigured: boolean;
  tablesCreated: boolean;
  message?: string;
  missingTable?: string;
}

class OrfiloDatabaseService {
  private memoryProjects: Project[] = [...SEED_PROJECTS];
  private memoryArtifacts: Artifact[] = [...SEED_ARTIFACTS];
  private memoryEvents: FileEvent[] = [...SEED_EVENTS];
  private memoryConnections: StorageConnection[] = [
    {
      id: 'conn_gd_01',
      user_id: 'usr_orfilo_default',
      provider: 'google_drive',
      account_name: 'metoaipr@gmail.com',
      provider_account_id: 'gdrive_user_4829',
      status: 'pending',
      credential_reference: 'gdrive_ref_pending',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  ];

  private schemaStatus: SchemaStatus = {
    isConfigured: false,
    tablesCreated: false,
  };

  constructor() {
    this.schemaStatus.isConfigured = this.isSupabaseConfigured();
  }

  isSupabaseConfigured(): boolean {
    const { isConfigured } = getSupabaseConfig();
    return isConfigured;
  }

  getSchemaStatus(): SchemaStatus {
    return this.schemaStatus;
  }

  private isTableMissingError(error: any): boolean {
    if (!error) return false;
    return (
      error.code === 'PGRST205' ||
      error.code === '42P01' ||
      (typeof error.message === 'string' &&
        (error.message.includes('schema cache') ||
          error.message.includes('does not exist') ||
          error.message.includes('relation') ||
          error.message.includes('404')))
    );
  }

  // Current session user
  async getCurrentUser(): Promise<User | null> {
    const client = createBrowserClient();
    if (client) {
      try {
        const { data: { user }, error } = await client.auth.getUser();
        if (user && !error) {
          return {
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
            avatar_url: user.user_metadata?.avatar_url || null,
            created_at: user.created_at,
            updated_at: new Date().toISOString(),
          };
        }
      } catch (e) {
        console.warn('[Orfilo DB] Could not retrieve Supabase auth user:', e);
      }
      return null;
    }
    return null;
  }

  // 1. Projects
  async getProjects(userId?: string): Promise<Project[]> {
    const client = createBrowserClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .select('*, artifacts(count)')
          .order('created_at', { ascending: false });

        if (error) {
          if (this.isTableMissingError(error)) {
            this.schemaStatus = {
              isConfigured: true,
              tablesCreated: false,
              missingTable: 'projects',
              message: "Tables not yet found in Supabase schema cache. Run migration SQL to activate.",
            };
            console.warn('[Orfilo DB] Supabase table public.projects not found in schema cache. Using sandbox state.');
            return this.getMemoryProjects(userId);
          }
          console.warn('[Orfilo DB] Error fetching projects from Supabase:', error.message);
          return this.getMemoryProjects(userId);
        }

        this.schemaStatus.tablesCreated = true;
        return (data || []).map((p: any) => ({
          id: p.id,
          user_id: p.user_id,
          name: p.name,
          description: p.description,
          icon: p.icon || 'folder',
          color: p.color || '#19A974',
          created_at: p.created_at,
          updated_at: p.updated_at,
          artifact_count: p.artifacts ? p.artifacts[0]?.count || 0 : 0,
        }));
      } catch (err: any) {
        console.warn('[Orfilo DB] Network/Supabase query exception for projects:', err);
        return this.getMemoryProjects(userId);
      }
    }

    return this.getMemoryProjects(userId);
  }

  private getMemoryProjects(userId?: string): Project[] {
    const uId = userId || SEED_USER.id;
    return this.memoryProjects
      .filter((p) => p.user_id === uId)
      .map((p) => ({
        ...p,
        artifact_count: this.memoryArtifacts.filter((a) => a.project_id === p.id).length,
      }));
  }

  async getProject(projectId: string): Promise<Project | null> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        const { data, error } = await client
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .single();
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }
    return this.memoryProjects.find((p) => p.id === projectId) || null;
  }

  async createProject(params: { name: string; description: string; icon?: string; color?: string }): Promise<Project> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthenticated: cannot create project without user session');

    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        await client.from('users').upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (_) {}

      const { data, error } = await client
        .from('projects')
        .insert({
          user_id: user.id,
          name: params.name,
          description: params.description,
          icon: params.icon || 'folder',
          color: params.color || '#19A974',
        })
        .select()
        .single();

      if (error) {
        if (this.isTableMissingError(error)) {
          this.schemaStatus.tablesCreated = false;
        } else {
          throw new Error(`Supabase error creating project: ${error.message}`);
        }
      } else if (data) {
        return data;
      }
    }

    const newProject: Project = {
      id: 'proj_' + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      name: params.name,
      description: params.description,
      icon: params.icon || 'folder',
      color: params.color || '#19A974',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      artifact_count: 0,
    };
    this.memoryProjects.unshift(newProject);
    return newProject;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      const { data, error } = await client
        .from('projects')
        .update({
          name: updates.name,
          description: updates.description,
          icon: updates.icon,
          color: updates.color,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) return data;
    }

    const idx = this.memoryProjects.findIndex((p) => p.id === id);
    if (idx === -1) throw new Error('Project not found');
    this.memoryProjects[idx] = {
      ...this.memoryProjects[idx],
      ...updates,
      updated_at: new Date().toISOString(),
    };
    return this.memoryProjects[idx];
  }

  async deleteProject(id: string): Promise<boolean> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      const { error } = await client.from('projects').delete().eq('id', id);
      if (!error) return true;
    }

    this.memoryProjects = this.memoryProjects.filter((p) => p.id !== id);
    this.memoryArtifacts.forEach((a) => {
      if (a.project_id === id) a.project_id = null;
    });
    return true;
  }

  // 2. Artifacts
  async getArtifacts(params?: { projectId?: string; query?: string; type?: string }): Promise<Artifact[]> {
    const client = createBrowserClient();
    if (client) {
      try {
        let query = client.from('artifacts').select('*, project:projects(*)').order('created_at', { ascending: false });

        if (params?.projectId) {
          query = query.eq('project_id', params.projectId);
        }
        if (params?.query) {
          query = query.or(
            `display_name.ilike.%${params.query}%,original_name.ilike.%${params.query}%,description.ilike.%${params.query}%`
          );
        }

        const { data, error } = await query;
        if (error) {
          if (this.isTableMissingError(error)) {
            this.schemaStatus.tablesCreated = false;
            console.warn('[Orfilo DB] Supabase table public.artifacts not found in schema cache. Using sandbox state.');
            return this.getMemoryArtifacts(params);
          }
          console.warn('[Orfilo DB] Error fetching artifacts from Supabase:', error.message);
          return this.getMemoryArtifacts(params);
        }

        this.schemaStatus.tablesCreated = true;
        return data || [];
      } catch (err: any) {
        console.warn('[Orfilo DB] Exception querying artifacts:', err);
        return this.getMemoryArtifacts(params);
      }
    }

    return this.getMemoryArtifacts(params);
  }

  private getMemoryArtifacts(params?: { projectId?: string; query?: string; type?: string }): Artifact[] {
    let results = [...this.memoryArtifacts];
    if (params?.projectId) {
      results = results.filter((a) => a.project_id === params.projectId);
    }
    if (params?.type && params.type !== 'all') {
      results = results.filter((a) => {
        if (params.type === 'images') return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(a.extension);
        if (params.type === 'documents') return ['pdf', 'docx', 'txt', 'md'].includes(a.extension);
        if (params.type === 'presentations') return ['pptx', 'key'].includes(a.extension);
        if (params.type === 'code') return ['ts', 'tsx', 'js', 'json', 'py', 'sql'].includes(a.extension);
        return true;
      });
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      results = results.filter(
        (a) =>
          a.display_name.toLowerCase().includes(q) ||
          a.original_name.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          (a.metadata?.keywords && a.metadata.keywords.some((k) => k.toLowerCase().includes(q))) ||
          (a.metadata?.category && a.metadata.category.toLowerCase().includes(q))
      );
    }

    return results.map((a) => ({
      ...a,
      project: this.memoryProjects.find((p) => p.id === a.project_id),
    }));
  }

  async getArtifact(id: string): Promise<Artifact | null> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        const { data, error } = await client
          .from('artifacts')
          .select('*, project:projects(*)')
          .eq('id', id)
          .single();
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }

    const art = this.memoryArtifacts.find((a) => a.id === id);
    if (!art) return null;
    return {
      ...art,
      project: this.memoryProjects.find((p) => p.id === art.project_id),
    };
  }

  async createArtifact(params: {
    original_name: string;
    display_name: string;
    mime_type: string;
    extension: string;
    size_bytes: number;
    project_id?: string | null;
    storage_connection_id?: string | null;
    provider_file_id?: string | null;
    provider_path?: string | null;
    description: string;
    source_type?: Artifact['source_type'];
    source_name?: Artifact['source_name'];
    ai_confidence: number;
    metadata: Artifact['metadata'];
  }): Promise<Artifact> {
    const user = await this.getCurrentUser();
    if (!user) throw new Error('Unauthenticated: cannot save artifact without session');

    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        await client.from('users').upsert({
          id: user.id,
          email: user.email,
          name: user.name,
          avatar_url: user.avatar_url || null,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'id' });
      } catch (_) {}

      const { data, error } = await client
        .from('artifacts')
        .insert({
          user_id: user.id,
          project_id: params.project_id || null,
          storage_connection_id: params.storage_connection_id || null,
          original_name: params.original_name,
          display_name: params.display_name,
          mime_type: params.mime_type,
          extension: params.extension,
          size_bytes: params.size_bytes,
          provider_file_id: params.provider_file_id || null,
          provider_path: params.provider_path || null,
          description: params.description,
          source_type: params.source_type || 'manual_upload',
          source_name: params.source_name || 'Gemini',
          ai_confidence: params.ai_confidence,
          metadata: params.metadata || {},
        })
        .select()
        .single();

      if (!error && data) {
        await this.recordEvent({
          artifact_id: data.id,
          event_type: 'saved',
          actor_type: 'human',
          metadata: {
            artifact_name: data.display_name,
            project_id: data.project_id,
            summary: `Saved ${data.display_name}`,
          },
        });
        return data;
      }
    }

    const newArt: Artifact = {
      id: 'art_' + Math.random().toString(36).substring(2, 9),
      user_id: user.id,
      project_id: params.project_id || null,
      storage_connection_id: params.storage_connection_id || null,
      original_name: params.original_name,
      display_name: params.display_name,
      mime_type: params.mime_type,
      extension: params.extension,
      size_bytes: params.size_bytes,
      provider_file_id: params.provider_file_id || null,
      provider_path: params.provider_path || null,
      description: params.description,
      source_type: params.source_type || 'manual_upload',
      source_name: params.source_name || 'Gemini',
      ai_confidence: params.ai_confidence,
      metadata: params.metadata || {},
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    this.memoryArtifacts.unshift(newArt);

    await this.recordEvent({
      artifact_id: newArt.id,
      event_type: 'saved',
      actor_type: 'human',
      metadata: {
        artifact_name: newArt.display_name,
        summary: `Saved ${newArt.display_name}`,
      },
    });

    return newArt;
  }

  async renameArtifact(id: string, newDisplayName: string): Promise<Artifact> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      const { data: current } = await client.from('artifacts').select('display_name').eq('id', id).single();
      const { data, error } = await client
        .from('artifacts')
        .update({
          display_name: newDisplayName,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        await this.recordEvent({
          artifact_id: id,
          event_type: 'renamed',
          actor_type: 'human',
          metadata: {
            from_name: current?.display_name || '',
            to_name: newDisplayName,
            summary: `Renamed ${current?.display_name || 'file'} → ${newDisplayName}`,
          },
        });
        return data;
      }
    }

    const item = this.memoryArtifacts.find((a) => a.id === id);
    if (!item) throw new Error('Artifact not found');
    const oldName = item.display_name;
    item.display_name = newDisplayName;
    item.updated_at = new Date().toISOString();

    await this.recordEvent({
      artifact_id: id,
      event_type: 'renamed',
      actor_type: 'human',
      metadata: {
        from_name: oldName,
        to_name: newDisplayName,
        summary: `Renamed ${oldName} → ${newDisplayName}`,
      },
    });

    return item;
  }

  async moveArtifact(id: string, newProjectId: string | null, newLocationPath: string): Promise<Artifact> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      const { data: current } = await client.from('artifacts').select('provider_path, display_name').eq('id', id).single();
      const { data, error } = await client
        .from('artifacts')
        .update({
          project_id: newProjectId,
          provider_path: newLocationPath,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .select()
        .single();

      if (!error && data) {
        await this.recordEvent({
          artifact_id: id,
          event_type: 'moved',
          actor_type: 'human',
          metadata: {
            artifact_name: current?.display_name || 'Artifact',
            from_path: current?.provider_path || 'Root',
            to_path: newLocationPath,
            summary: `Moved ${current?.display_name} → ${newLocationPath}`,
          },
        });
        return data;
      }
    }

    const item = this.memoryArtifacts.find((a) => a.id === id);
    if (!item) throw new Error('Artifact not found');
    const oldPath = item.provider_path || 'Root';
    item.project_id = newProjectId;
    item.provider_path = newLocationPath;
    item.updated_at = new Date().toISOString();

    await this.recordEvent({
      artifact_id: id,
      event_type: 'moved',
      actor_type: 'human',
      metadata: {
        artifact_name: item.display_name,
        from_path: oldPath,
        to_path: newLocationPath,
        summary: `Moved ${item.display_name} → ${newLocationPath}`,
      },
    });

    return item;
  }

  async deleteArtifact(id: string): Promise<boolean> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      const { data: current } = await client.from('artifacts').select('display_name').eq('id', id).single();
      const { error } = await client.from('artifacts').delete().eq('id', id);

      if (!error) {
        await this.recordEvent({
          artifact_id: null,
          event_type: 'deleted',
          actor_type: 'human',
          metadata: {
            artifact_name: current?.display_name || 'Artifact',
            summary: `Deleted ${current?.display_name || 'artifact'}`,
          },
        });
        return true;
      }
    }

    const item = this.memoryArtifacts.find((a) => a.id === id);
    const itemName = item?.display_name || 'Artifact';
    this.memoryArtifacts = this.memoryArtifacts.filter((a) => a.id !== id);

    await this.recordEvent({
      artifact_id: null,
      event_type: 'deleted',
      actor_type: 'human',
      metadata: {
        artifact_name: itemName,
        summary: `Deleted ${itemName}`,
      },
    });

    return true;
  }

  // 3. Activity Events
  async getEvents(limit: number = 25): Promise<FileEvent[]> {
    const client = createBrowserClient();
    if (client) {
      try {
        const { data, error } = await client
          .from('file_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (error) {
          if (this.isTableMissingError(error)) {
            console.warn('[Orfilo DB] Supabase table public.file_events not found in schema cache. Using sandbox events.');
            return this.memoryEvents.slice(0, limit);
          }
          console.warn('[Orfilo DB] Error fetching events from Supabase:', error.message);
          return this.memoryEvents.slice(0, limit);
        }

        return data || [];
      } catch (err: any) {
        console.warn('[Orfilo DB] Exception querying file_events:', err);
        return this.memoryEvents.slice(0, limit);
      }
    }

    return this.memoryEvents.slice(0, limit);
  }

  async recordEvent(params: {
    artifact_id: string | null;
    event_type: FileEvent['event_type'];
    actor_type: FileEvent['actor_type'];
    actor_id?: string;
    metadata: FileEvent['metadata'];
  }): Promise<FileEvent> {
    const user = await this.getCurrentUser();
    const uId = user?.id || SEED_USER.id;

    const client = createBrowserClient();
    if (client && user && this.schemaStatus.tablesCreated) {
      try {
        const { data, error } = await client
          .from('file_events')
          .insert({
            user_id: user.id,
            artifact_id: params.artifact_id,
            event_type: params.event_type,
            actor_type: params.actor_type,
            actor_id: params.actor_id || user.email,
            metadata: params.metadata || {},
          })
          .select()
          .single();

        if (!error && data) return data;
      } catch {
        // Fallback to memory
      }
    }

    const ev: FileEvent = {
      id: 'ev_' + Math.random().toString(36).substring(2, 9),
      user_id: uId,
      artifact_id: params.artifact_id,
      event_type: params.event_type,
      actor_type: params.actor_type,
      actor_id: params.actor_id || 'System',
      metadata: params.metadata,
      created_at: new Date().toISOString(),
    };
    this.memoryEvents.unshift(ev);
    return ev;
  }

  // 4. Storage Connections
  async getStorageConnections(): Promise<StorageConnection[]> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        const { data, error } = await client.from('storage_connections').select('*');
        if (!error && data) return data;
      } catch {
        // Fallback
      }
    }
    return this.memoryConnections;
  }

  async saveStorageConnection(conn: Omit<StorageConnection, 'id' | 'created_at' | 'updated_at'>): Promise<StorageConnection> {
    const client = createBrowserClient();
    const id = 'sc_' + Math.random().toString(36).substring(2, 9);
    const now = new Date().toISOString();
    const newRecord: StorageConnection = {
      id,
      ...conn,
      created_at: now,
      updated_at: now,
    };

    if (client && this.schemaStatus.tablesCreated) {
      try {
        const { data, error } = await client
          .from('storage_connections')
          .upsert({
            user_id: conn.user_id,
            provider: conn.provider,
            account_name: conn.account_name,
            provider_account_id: conn.provider_account_id,
            status: conn.status,
            expires_at: conn.expires_at,
          })
          .select()
          .single();
        if (!error && data) return data;
      } catch {
        // Fallback to memory
      }
    }

    this.memoryConnections = this.memoryConnections.filter(c => c.provider !== conn.provider);
    this.memoryConnections.push(newRecord);
    return newRecord;
  }

  async removeStorageConnection(provider: StorageConnection['provider']): Promise<void> {
    const client = createBrowserClient();
    if (client && this.schemaStatus.tablesCreated) {
      try {
        await client.from('storage_connections').delete().eq('provider', provider);
      } catch {
        // Ignore
      }
    }
    this.memoryConnections = this.memoryConnections.filter(c => c.provider !== provider);
  }
}

export const db = new OrfiloDatabaseService();
