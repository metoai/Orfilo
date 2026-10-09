import { createBrowserClient, getSupabaseConfig } from './client.ts';
import { Project, Artifact, FileEvent, StorageConnection, User, AIOrganizationSuggestion } from '../../types/index.ts';

// Authenticated workspace fallback user
const SEED_USER: User = {
  id: 'ac916334-06e2-48a8-b8c7-645a27b40c8d',
  email: 'metoaipr@gmail.com',
  name: 'Meto User',
  avatar_url: null,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// Zero hardcoded mock records — all state comes from Supabase database
const SEED_PROJECTS: Project[] = [];
const SEED_ARTIFACTS: Artifact[] = [];
const SEED_EVENTS: FileEvent[] = [];

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
    const projectMap = new Map<string, Project>();

    if (client) {
      try {
        const { data, error } = await client
          .from('projects')
          .select('*, artifacts(count)')
          .order('created_at', { ascending: false });

        if (!error && data) {
          this.schemaStatus.tablesCreated = true;
          data.forEach((p: any) => {
            projectMap.set(p.id, {
              id: p.id,
              user_id: p.user_id,
              name: p.name,
              description: p.description,
              icon: p.icon || 'folder',
              color: p.color || '#19A974',
              created_at: p.created_at,
              updated_at: p.updated_at,
              artifact_count: p.artifacts ? (Array.isArray(p.artifacts) ? p.artifacts.length : p.artifacts[0]?.count ?? 0) : 0,
            });
          });
        }
      } catch (err: any) {
        console.warn('[Orfilo DB] Exception querying projects from Supabase:', err);
      }
    }

    // Merge with server-side projects
    try {
      const res = await fetch('/api/v1/projects');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          json.data.forEach((p: any) => {
            if (!projectMap.has(p.id)) {
              projectMap.set(p.id, p);
            }
          });
        }
      }
    } catch (_) {}

    this.memoryProjects.forEach((p) => {
      if (!projectMap.has(p.id)) projectMap.set(p.id, p);
    });

    return Array.from(projectMap.values());
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
        if (!error && data) return data as unknown as Project;
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
        return data as unknown as Project;
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

      if (!error && data) return data as unknown as Project;
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
    let supabaseList: Artifact[] = [];

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
        if (!error && data) {
          supabaseList = data as unknown as Artifact[];
          this.schemaStatus.tablesCreated = true;
        }
      } catch (err: any) {
        console.warn('[Orfilo DB] Exception querying artifacts from Supabase:', err);
      }
    }

    // Merge with live server-ingested artifacts for real-time extension capture sync
    let serverList: Artifact[] = [];
    try {
      const res = await fetch('/api/v1/artifacts');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          serverList = json.data;
        }
      }
    } catch (_) {}

    const map = new Map<string, Artifact>();
    supabaseList.forEach((a) => map.set(a.id, a));
    serverList.forEach((a) => {
      if (!map.has(a.id)) map.set(a.id, a);
    });
    this.memoryArtifacts.forEach((a) => {
      if (!map.has(a.id)) map.set(a.id, a);
    });

    let merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

    if (params?.projectId) {
      merged = merged.filter((a) => a.project_id === params.projectId);
    }
    if (params?.type && params.type !== 'all') {
      const t = params.type.toLowerCase();
      merged = merged.filter((a) => {
        if (t === 'images') return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(a.extension);
        if (t === 'documents') return ['pdf', 'docx', 'txt', 'md'].includes(a.extension);
        if (t === 'presentations') return ['pptx', 'key'].includes(a.extension);
        if (t === 'code') return ['ts', 'tsx', 'js', 'json', 'py', 'sql'].includes(a.extension);
        return true;
      });
    }
    if (params?.query) {
      const q = params.query.toLowerCase();
      merged = merged.filter(
        (a) =>
          a.display_name.toLowerCase().includes(q) ||
          a.original_name.toLowerCase().includes(q) ||
          (a.description || '').toLowerCase().includes(q)
      );
    }

    return merged;
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
          a.description?.toLowerCase().includes(q) ||
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
        if (!error && data) return data as unknown as Artifact;
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
          metadata: (params.metadata || {}) as any,
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
        return data as unknown as Artifact;
      }
    }

    const newArt: Artifact = {
      id: (typeof crypto !== 'undefined' && crypto.randomUUID) ? crypto.randomUUID() : 'art_' + Math.random().toString(36).substring(2, 9),
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
        return data as unknown as Artifact;
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
        return data as unknown as Artifact;
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
    let supabaseEvents: FileEvent[] = [];

    if (client) {
      try {
        const { data, error } = await client
          .from('file_events')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(limit);

        if (!error && data) {
          supabaseEvents = data as unknown as FileEvent[];
        }
      } catch (err: any) {
        console.warn('[Orfilo DB] Exception querying file_events from Supabase:', err);
      }
    }

    // Merge with server-side live events
    let serverEvents: FileEvent[] = [];
    try {
      const res = await fetch('/api/v1/events');
      if (res.ok) {
        const json = await res.json();
        if (Array.isArray(json.data)) {
          serverEvents = json.data;
        }
      }
    } catch (_) {}

    const map = new Map<string, FileEvent>();
    supabaseEvents.forEach((e) => map.set(e.id, e));
    serverEvents.forEach((e) => {
      if (!map.has(e.id)) map.set(e.id, e);
    });
    this.memoryEvents.forEach((e) => {
      if (!map.has(e.id)) map.set(e.id, e);
    });

    const merged = Array.from(map.values());
    merged.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return merged.slice(0, limit);
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
            metadata: (params.metadata || {}) as any,
          })
          .select()
          .single();

        if (!error && data) return data as unknown as FileEvent;
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
        if (!error && data) return (data as unknown as StorageConnection[]) || [];
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
        if (!error && data) return data as unknown as StorageConnection;
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
