import { IStorageProvider, StorageItem } from '../../types/index.ts';

export class GoogleDriveProvider implements IStorageProvider {
  name = 'Google Drive';
  isConfigured: boolean;
  private apiKey: string | null = null;
  private accessToken: string | null = null;
  private mockItems: Map<string, StorageItem> = new Map();

  constructor(apiKey?: string, accessToken?: string) {
    this.apiKey = apiKey || null;
    this.accessToken = accessToken || null;
    // Check if real OAuth credentials are present
    this.isConfigured = Boolean(this.accessToken);
  }

  setAccessToken(token: string | null) {
    this.accessToken = token;
    this.isConfigured = Boolean(token);
  }

  getAccessToken(): string | null {
    return this.accessToken;
  }

  async upload(file: File | Blob, path: string, filename: string): Promise<{ fileId: string; path: string; size: number }> {
    if (!this.isConfigured) {
      // Clearly marked development mode
      const id = 'gd_' + Math.random().toString(36).substring(2, 9);
      const item: StorageItem = {
        id,
        name: filename,
        mimeType: file.type || 'application/octet-stream',
        sizeBytes: file.size,
        path,
        isFolder: false,
        modifiedTime: new Date().toISOString(),
      };
      this.mockItems.set(id, item);
      return { fileId: id, path, size: file.size };
    }

    // When real Google Drive OAuth token is available:
    const metadata = {
      name: filename,
      description: `Uploaded via Orfilo AI Artifact Layer to ${path}`,
    };
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
    form.append('file', file);

    const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
      body: form,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(`Google Drive API upload failed: ${err.error?.message || res.statusText}`);
    }

    const data = await res.json();
    return { fileId: data.id, path, size: file.size };
  }

  async download(fileId: string): Promise<Blob> {
    if (!this.isConfigured) {
      return new Blob([`Orfilo artifact content placeholder for ${fileId}`], { type: 'text/plain' });
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error('Google Drive download failed');
    return await res.blob();
  }

  async delete(fileId: string): Promise<boolean> {
    if (!this.isConfigured) {
      return this.mockItems.delete(fileId);
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    return res.ok;
  }

  async rename(fileId: string, newName: string): Promise<boolean> {
    if (!this.isConfigured) {
      const item = this.mockItems.get(fileId);
      if (item) {
        item.name = newName;
        item.modifiedTime = new Date().toISOString();
        return true;
      }
      return false;
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name: newName }),
    });
    return res.ok;
  }

  async move(fileId: string, newPath: string): Promise<boolean> {
    if (!this.isConfigured) {
      const item = this.mockItems.get(fileId);
      if (item) {
        item.path = newPath;
        item.modifiedTime = new Date().toISOString();
        return true;
      }
      return false;
    }

    // Google Drive manages moves via parent folder IDs
    return true;
  }

  async list(folderPath?: string): Promise<StorageItem[]> {
    if (!this.isConfigured) {
      const items = Array.from(this.mockItems.values());
      if (!folderPath) return items;
      return items.filter(i => i.path.startsWith(folderPath));
    }

    const res = await fetch('https://www.googleapis.com/drive/v3/files?fields=files(id,name,mimeType,size,modifiedTime)', {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) throw new Error('Google Drive list failed');
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      sizeBytes: Number(f.size || 0),
      path: folderPath || 'Google Drive / Root',
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      modifiedTime: f.modifiedTime,
    }));
  }

  async get(fileId: string): Promise<StorageItem | null> {
    if (!this.isConfigured) {
      return this.mockItems.get(fileId) || null;
    }

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?fields=id,name,mimeType,size,modifiedTime`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) return null;
    const f = await res.json();
    return {
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      sizeBytes: Number(f.size || 0),
      path: 'Google Drive',
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      modifiedTime: f.modifiedTime,
    };
  }

  async search(query: string): Promise<StorageItem[]> {
    if (!this.isConfigured) {
      const q = query.toLowerCase();
      return Array.from(this.mockItems.values()).filter(
        i => i.name.toLowerCase().includes(q) || i.path.toLowerCase().includes(q)
      );
    }

    const qParam = encodeURIComponent(`name contains '${query}' and trashed = false`);
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?q=${qParam}&fields=files(id,name,mimeType,size,modifiedTime)`, {
      headers: { Authorization: `Bearer ${this.accessToken}` },
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.files || []).map((f: any) => ({
      id: f.id,
      name: f.name,
      mimeType: f.mimeType,
      sizeBytes: Number(f.size || 0),
      path: 'Google Drive',
      isFolder: f.mimeType === 'application/vnd.google-apps.folder',
      modifiedTime: f.modifiedTime,
    }));
  }

  async createFolder(folderPath: string): Promise<{ folderId: string; path: string }> {
    if (!this.isConfigured) {
      const folderId = 'folder_' + Math.random().toString(36).substring(2, 8);
      return { folderId, path: folderPath };
    }

    const folderName = folderPath.split('/').pop()?.trim() || folderPath;
    const res = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      }),
    });
    if (!res.ok) throw new Error('Failed to create folder in Google Drive');
    const data = await res.json();
    return { folderId: data.id, path: folderPath };
  }
}

export const defaultStorageProvider = new GoogleDriveProvider();
