import { createBrowserClient } from './client.ts';
import { Project, Artifact, FileEvent, User } from '../../types/index.ts';

async function getAuthHeaders(): Promise<HeadersInit> {
  const client = createBrowserClient();
  if (!client) throw new Error('Supabase not configured');
  const { data: { session } } = await client.auth.getSession();
  if (!session?.access_token) throw new Error('Not authenticated');
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

class DatabaseService {
  async getCurrentUser(): Promise<User | null> {
    const client = createBrowserClient();
    if (!client) return null;
    try {
      const { data: { session } } = await client.auth.getSession();
      if (!session?.user) return null;
      const u = session.user;
      return {
        id: u.id,
        email: u.email || '',
        name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || 'User',
        avatar_url: u.user_metadata?.avatar_url || null,
        created_at: u.created_at,
        updated_at: new Date().toISOString(),
      };
    } catch {
      return null;
    }
  }

  async getProjects(): Promise<Project[]> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/projects', {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch projects (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }

  async createProject(data: {
    name: string;
    description?: string | null;
    icon?: string | null;
    color?: string | null;
  }): Promise<Project> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/projects', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create project (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  async updateProject(
    id: string,
    data: Partial<Project>
  ): Promise<Project> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/v1/projects/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update project (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  async deleteProject(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/v1/projects/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete project (HTTP ${res.status})`);
    }
  }

  async getArtifacts(): Promise<Artifact[]> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/artifacts', {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch artifacts (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }

  async createArtifact(data: Partial<Artifact> & { original_name: string }): Promise<Artifact> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/artifacts', {
      method: 'POST',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to create artifact (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  async updateArtifact(
    id: string,
    data: Partial<Artifact>
  ): Promise<Artifact> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/v1/artifacts/${id}`, {
      method: 'PUT',
      headers,
      body: JSON.stringify(data),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to update artifact (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data;
  }

  async moveArtifact(id: string, projectId: string | null, providerPath: string): Promise<Artifact> {
    return this.updateArtifact(id, { project_id: projectId, provider_path: providerPath });
  }

  async renameArtifact(id: string, displayName: string): Promise<Artifact> {
    return this.updateArtifact(id, { display_name: displayName });
  }

  async deleteArtifact(id: string): Promise<void> {
    const headers = await getAuthHeaders();
    const res = await fetch(`/api/v1/artifacts/${id}`, {
      method: 'DELETE',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to delete artifact (HTTP ${res.status})`);
    }
  }

  async getEvents(): Promise<FileEvent[]> {
    const headers = await getAuthHeaders();
    const res = await fetch('/api/v1/events', {
      method: 'GET',
      headers,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || `Failed to fetch events (HTTP ${res.status})`);
    }
    const json = await res.json();
    return json.data || [];
  }
}

export const db = new DatabaseService();
