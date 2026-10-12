import express from 'express';
import type { Request, Response, NextFunction } from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { GoogleGenAI, Type } from '@google/genai';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import {
  getServerSupabaseConfig,
  createServerClient,
  createUserClient,
} from './src/lib/supabase/server.ts';
import {
  organizeDeliverable,
  isGenericName,
} from './src/lib/ai/organizationEngine.ts';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ============================================================================
// TYPES & EXPRESS AUGMENTATION
// ============================================================================

export interface AuthenticatedUser {
  id: string;
  email: string;
  authMethod: 'jwt' | 'extension';
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
      supabase?: SupabaseClient;
    }
  }
}

// ============================================================================
// AUTHENTICATION MIDDLEWARE
// ============================================================================

/**
 * requireAuth middleware:
 * Validates Supabase JWT or browser extension API key (via SHA-256 hash).
 * Attaches req.user and per-request scoped req.supabase.
 */
export async function requireAuth(req: Request, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({ error: 'Empty bearer token' });
    return;
  }

  const adminClient = createServerClient();
  if (!adminClient) {
    res.status(500).json({ error: 'Database service is not configured' });
    return;
  }

  // 1. Validate Supabase JWT token
  try {
    const { data: { user }, error: jwtError } = await adminClient.auth.getUser(token);
    if (!jwtError && user) {
      req.user = {
        id: user.id,
        email: user.email || '',
        authMethod: 'jwt',
      };
      req.supabase = createUserClient(token) || adminClient;
      return next();
    }
  } catch {
    // Proceed to extension token lookup
  }

  // 2. Lookup extension API key via SHA-256 hash in integration_connections
  try {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const { data: connection, error: connError } = await adminClient
      .from('integration_connections')
      .select('id, user_id, status, revoked_at')
      .eq('access_token_hash', tokenHash)
      .eq('status', 'connected')
      .is('revoked_at', null)
      .maybeSingle();

    if (!connError && connection?.user_id) {
      let email = '';
      const { data: userRow } = await adminClient
        .from('users')
        .select('email')
        .eq('id', connection.user_id)
        .maybeSingle();

      if (userRow?.email) {
        email = userRow.email;
      } else {
        try {
          const { data: authUser } = await adminClient.auth.admin.getUserById(connection.user_id);
          email = authUser?.user?.email || '';
        } catch {}
      }

      req.user = {
        id: connection.user_id,
        email,
        authMethod: 'extension',
      };
      req.supabase = adminClient;

      // Update last_used_at in background
      void Promise.resolve(
        adminClient
          .from('integration_connections')
          .update({ last_used_at: new Date().toISOString() })
          .eq('id', connection.id)
      ).catch(() => {});

      return next();
    }
  } catch (err: any) {
    console.error('[requireAuth] Extension lookup error:', err);
  }

  res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
}

function getDb(req: Request): SupabaseClient {
  if (req.supabase) return req.supabase;
  const admin = createServerClient();
  if (!admin) throw new Error('Supabase client unavailable');
  return admin;
}

// ============================================================================
// SERVER INITIALIZATION & ROUTING
// ============================================================================

export async function createServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;
  const isProduction = process.env.NODE_ENV === 'production';

  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));
  app.use('/storage', express.static(path.resolve(__dirname, 'public', 'storage')));

  // Logging
  app.use((req: Request, _res: Response, next: NextFunction) => {
    if (!req.path.startsWith('/@') && !req.path.startsWith('/node_modules')) {
      console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    }
    next();
  });

  // Health
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'healthy', timestamp: new Date().toISOString() });
  });

  // --------------------------------------------------------------------------
  // AUTHENTICATION
  // --------------------------------------------------------------------------

  // POST /api/v1/auth/login — signInWithPassword, fail properly on bad credentials
  app.post('/api/v1/auth/login', async (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const config = getServerSupabaseConfig();
    const keyToUse = config.anonKey || config.serviceRoleKey;
    if (!config.url || !keyToUse) {
      res.status(500).json({ error: 'Supabase is not configured' });
      return;
    }

    const authClient = createClient(config.url, keyToUse, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await authClient.auth.signInWithPassword({ email, password });
    if (error || !data.session) {
      res.status(401).json({ error: error?.message || 'Invalid email or password' });
      return;
    }

    res.json({
      session: data.session,
      token: data.session.access_token,
      user: { id: data.user.id, email: data.user.email, name: data.user.user_metadata?.name || '' },
    });
  });

  // GET /api/v1/auth/google — initiate Supabase Google OAuth
  app.get('/api/v1/auth/google', (req: Request, res: Response) => {
    const config = getServerSupabaseConfig();
    if (!config.url) {
      res.status(500).json({ error: 'Supabase is not configured' });
      return;
    }

    const host = req.get('host') || `localhost:${PORT}`;
    const proto = req.headers['x-forwarded-proto'] || req.protocol || 'http';
    const origin = `${proto}://${host}`;
    const redirectParam = (req.query.redirect as string) || `${origin}/?action=pair-extension`;

    const googleAuthUrl = `${config.url}/auth/v1/authorize?provider=google&redirect_to=${encodeURIComponent(redirectParam)}`;
    res.redirect(googleAuthUrl);
  });

  // POST /api/v1/auth/signup — register user with Supabase
  app.post('/api/v1/auth/signup', async (req: Request, res: Response) => {
    const { email, password, name } = req.body || {};
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    const config = getServerSupabaseConfig();
    const keyToUse = config.anonKey || config.serviceRoleKey;
    if (!config.url || !keyToUse) {
      res.status(500).json({ error: 'Supabase is not configured' });
      return;
    }

    const authClient = createClient(config.url, keyToUse, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data, error } = await authClient.auth.signUp({
      email,
      password,
      options: { data: { name: name || '' } },
    });

    if (error) {
      res.status(400).json({ error: error.message });
      return;
    }

    if (data.user) {
      const adminClient = createServerClient();
      if (adminClient) {
        await adminClient.from('users').upsert({
          id: data.user.id,
          email: data.user.email,
          name: name || data.user.email?.split('@')[0] || '',
        });
      }
    }

    res.status(201).json({
      session: data.session,
      token: data.session?.access_token || null,
      user: data.user,
    });
  });

  // GET /api/v1/auth/me — return current user from JWT
  app.get('/api/v1/auth/me', requireAuth, async (req: Request, res: Response) => {
    const admin = createServerClient();
    let profile = null;
    if (admin && req.user) {
      const { data } = await admin.from('users').select('*').eq('id', req.user.id).maybeSingle();
      profile = data;
    }

    res.json({
      user: {
        id: req.user!.id,
        email: req.user!.email,
        name: profile?.name || '',
        avatar_url: profile?.avatar_url || null,
        created_at: profile?.created_at,
        auth_method: req.user!.authMethod,
      },
    });
  });

  // --------------------------------------------------------------------------
  // PROJECTS
  // --------------------------------------------------------------------------

  // GET /api/v1/projects — filtered by user_id
  app.get('/api/v1/projects', requireAuth, async (req: Request, res: Response) => {
    const db = getDb(req);
    const { data, error } = await db
      .from('projects')
      .select('*, artifacts(count)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ data: data || [] });
  });

  // POST /api/v1/projects — create with user_id from auth
  app.post('/api/v1/projects', requireAuth, async (req: Request, res: Response) => {
    const { name, description = '', icon = 'folder', color = '#19A974' } = req.body || {};
    if (!name || typeof name !== 'string' || !name.trim()) {
      res.status(400).json({ error: 'Project name is required' });
      return;
    }

    const db = getDb(req);
    const { data, error } = await db
      .from('projects')
      .insert({
        user_id: req.user!.id,
        name: name.trim(),
        description: typeof description === 'string' ? description.trim() : '',
        icon: icon || 'folder',
        color: color || '#19A974',
      })
      .select()
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.status(201).json({ data });
  });

  // PUT /api/v1/projects/:id — update with ownership verification
  app.put('/api/v1/projects/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, description, icon, color } = req.body || {};

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    if (name !== undefined) updates.name = String(name).trim();
    if (description !== undefined) updates.description = String(description);
    if (icon !== undefined) updates.icon = String(icon);
    if (color !== undefined) updates.color = String(color);

    const db = getDb(req);
    const { data, error } = await db
      .from('projects')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!data) {
      res.status(404).json({ error: 'Project not found or not owned by user' });
      return;
    }
    res.json({ data });
  });

  // DELETE /api/v1/projects/:id — delete with ownership verification
  app.delete('/api/v1/projects/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDb(req);
    const { error, count } = await db
      .from('projects')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (count === 0) {
      res.status(404).json({ error: 'Project not found or not owned by user' });
      return;
    }
    res.json({ message: 'Project deleted successfully' });
  });

  // --------------------------------------------------------------------------
  // ARTIFACTS
  // --------------------------------------------------------------------------

  // GET /api/v1/artifacts — query artifacts filtered by user_id with joined project
  app.get('/api/v1/artifacts', requireAuth, async (req: Request, res: Response) => {
    const db = getDb(req);
    const { project_id } = req.query;

    let query = db
      .from('artifacts')
      .select('*, project:projects(id, name, color, icon)')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (project_id && typeof project_id === 'string') {
      query = query.eq('project_id', project_id);
    }

    const { data, error } = await query;
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ data: data || [] });
  });

  // POST /api/v1/artifacts — intelligent organization & persistent insertion
  app.post('/api/v1/artifacts', requireAuth, async (req: Request, res: Response) => {
    const body = req.body || {};
    const {
      original_name,
      filename,
      display_name,
      project_id,
      storage_connection_id,
      mime_type = 'application/octet-stream',
      extension,
      size_bytes = 0,
      provider_file_id,
      provider_path,
      description,
      source_type = 'ai_export',
      source_name = 'Gemini',
      source_url,
      conversation_title,
      context_prompt,
      alt_text,
      ai_confidence,
      content_base64,
      metadata = {},
    } = body;

    const actualOriginalName = original_name || filename;
    if (!actualOriginalName) {
      res.status(400).json({ error: 'original_name or filename is required' });
      return;
    }

    const db = getDb(req);

    // Merge surrounding context parameters from body or metadata
    const effectiveSourceUrl =
      source_url || (metadata && typeof metadata === 'object' ? (metadata as any).source_url : '') || '';
    const effectiveConvTitle =
      conversation_title || (metadata && typeof metadata === 'object' ? (metadata as any).conversation_title : '') || '';
    const effectivePrompt =
      context_prompt || (metadata && typeof metadata === 'object' ? (metadata as any).context_prompt : '') || '';
    const effectiveAltText =
      alt_text || (metadata && typeof metadata === 'object' ? (metadata as any).alt_text : '') || '';

    // Run the Intelligent Organization Engine
    const orgResult = await organizeDeliverable(db, {
      userId: req.user!.id,
      originalName: actualOriginalName,
      mimeType: mime_type,
      extension: extension || actualOriginalName.split('.').pop() || 'bin',
      sizeBytes: Number(size_bytes) || 0,
      sourceType: source_type,
      sourceName: source_name,
      sourceUrl: effectiveSourceUrl,
      conversationTitle: effectiveConvTitle,
      contextPrompt: effectivePrompt,
      altText: effectiveAltText,
      explicitProjectId: project_id || null,
      explicitDisplayName: display_name && !isGenericName(display_name) ? display_name : null,
      explicitProviderPath: provider_path || null,
    });

    const artifactId = crypto.randomUUID();
    let localThumbnailUrl: string | undefined = undefined;

    // Save binary content to disk for instant preview rendering
    if (content_base64 && typeof content_base64 === 'string') {
      try {
        const base64Data = content_base64.replace(/^data:[^;]+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const storageDir = path.resolve(__dirname, 'public', 'storage', 'artifacts');
        if (!fs.existsSync(storageDir)) {
          fs.mkdirSync(storageDir, { recursive: true });
        }
        const fileName = `${artifactId}.${orgResult.extension}`;
        const filePath = path.join(storageDir, fileName);
        fs.writeFileSync(filePath, buffer);
        localThumbnailUrl = `/storage/artifacts/${fileName}`;
      } catch (writeErr) {
        console.warn('[Server] Failed to write binary artifact file:', writeErr);
      }
    }

    const finalMetadata = {
      ...(typeof metadata === 'object' && metadata !== null ? metadata : {}),
      source_url: effectiveSourceUrl || undefined,
      doc_url:
        (metadata as any)?.doc_url ||
        (body as any)?.doc_url ||
        (effectiveSourceUrl && (effectiveSourceUrl.includes('google.com') || effectiveSourceUrl.includes('docs.'))
          ? effectiveSourceUrl
          : undefined),
      conversation_title: effectiveConvTitle || undefined,
      context_prompt: effectivePrompt || undefined,
      alt_text: effectiveAltText || undefined,
      category: orgResult.category,
      subfolder: orgResult.subfolder,
      organization_time_ms: orgResult.executionTimeMs,
      thumbnail_url: localThumbnailUrl,
    };

    const { data, error } = await db
      .from('artifacts')
      .insert({
        id: artifactId,
        user_id: req.user!.id,
        project_id: orgResult.projectId || null,
        storage_connection_id: storage_connection_id || null,
        original_name: orgResult.originalName,
        display_name: orgResult.displayName,
        mime_type,
        extension: orgResult.extension,
        size_bytes: Number(size_bytes) || 0,
        provider_file_id: provider_file_id || null,
        provider_path: orgResult.providerPath,
        description: description || orgResult.description,
        source_type,
        source_name,
        ai_confidence: ai_confidence ? Number(ai_confidence) : orgResult.aiConfidence,
        metadata: finalMetadata,
      })
      .select('*, project:projects(id, name, color, icon)')
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    // Log file_event
    await db.from('file_events').insert({
      user_id: req.user!.id,
      artifact_id: data.id,
      event_type: 'created',
      actor_type: req.user!.authMethod === 'extension' ? 'agent' : 'human',
      actor_id: req.user!.id,
      metadata: {
        original_name: data.original_name,
        display_name: data.display_name,
        project_name: orgResult.projectName,
        provider_path: data.provider_path,
        organization_time_ms: orgResult.executionTimeMs,
      },
    });

    res.status(201).json({
      data,
      organization: {
        project_name: orgResult.projectName,
        project_id: orgResult.projectId,
        project_created: orgResult.projectCreated,
        provider_path: orgResult.providerPath,
        category: orgResult.category,
        subfolder: orgResult.subfolder,
        execution_time_ms: orgResult.executionTimeMs,
      },
    });
  });

  // PUT /api/v1/artifacts/:id — update artifact in Supabase
  app.put('/api/v1/artifacts/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const body = req.body || {};
    const allowed = [
      'display_name',
      'project_id',
      'storage_connection_id',
      'description',
      'provider_path',
      'metadata',
      'mime_type',
      'ai_confidence',
    ];

    const updates: Record<string, any> = { updated_at: new Date().toISOString() };
    for (const key of allowed) {
      if (body[key] !== undefined) updates[key] = body[key];
    }

    const db = getDb(req);
    const { data, error } = await db
      .from('artifacts')
      .update(updates)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .maybeSingle();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (!data) {
      res.status(404).json({ error: 'Artifact not found or not owned by user' });
      return;
    }

    const eventType = updates.project_id !== undefined ? 'moved' : 'updated';
    await db.from('file_events').insert({
      user_id: req.user!.id,
      artifact_id: data.id,
      event_type: eventType,
      actor_type: 'human',
      actor_id: req.user!.id,
      metadata: updates,
    });

    res.json({ data });
  });

  // DELETE /api/v1/artifacts/:id — delete from Supabase
  app.delete('/api/v1/artifacts/:id', requireAuth, async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDb(req);
    const { error, count } = await db
      .from('artifacts')
      .delete({ count: 'exact' })
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    if (count === 0) {
      res.status(404).json({ error: 'Artifact not found or not owned by user' });
      return;
    }
    res.json({ message: 'Artifact deleted successfully' });
  });

  // GET /api/v1/artifacts/:id/file — serve raw binary file / image
  app.get('/api/v1/artifacts/:id/file', async (req: Request, res: Response) => {
    const { id } = req.params;
    const db = getDb(req);
    const { data: artifact } = await db
      .from('artifacts')
      .select('id, extension, mime_type, metadata')
      .eq('id', id)
      .maybeSingle();

    if (!artifact) {
      res.status(404).json({ error: 'Artifact not found' });
      return;
    }

    const filePath = path.resolve(__dirname, 'public', 'storage', 'artifacts', `${id}.${artifact.extension}`);
    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', artifact.mime_type || 'application/octet-stream');
      res.sendFile(filePath);
      return;
    }

    if (artifact.metadata?.content_base64) {
      const buffer = Buffer.from(artifact.metadata.content_base64, 'base64');
      res.setHeader('Content-Type', artifact.mime_type || 'application/octet-stream');
      res.send(buffer);
      return;
    }

    res.status(404).json({ error: 'Artifact file not found' });
  });

  // --------------------------------------------------------------------------
  // FILE EVENTS
  // --------------------------------------------------------------------------

  // GET /api/v1/events — query file_events filtered by user_id
  app.get('/api/v1/events', requireAuth, async (req: Request, res: Response) => {
    const db = getDb(req);
    const limit = Math.min(Number(req.query.limit) || 50, 100);

    const { data, error } = await db
      .from('file_events')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }
    res.json({ data: data || [] });
  });

  // --------------------------------------------------------------------------
  // BROWSER EXTENSION INTEGRATION
  // --------------------------------------------------------------------------

  // POST /api/v1/extension/pair — requires auth (JWT), creates connection, returns token once
  app.post('/api/v1/extension/pair', requireAuth, async (req: Request, res: Response) => {
    if (req.user?.authMethod !== 'jwt') {
      res.status(403).json({ error: 'Extension pairing requires user JWT authentication' });
      return;
    }

    const plainToken = 'orf_' + crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(plainToken).digest('hex');

    const db = getDb(req);
    const { data, error } = await db
      .from('integration_connections')
      .insert({
        user_id: req.user.id,
        provider: 'browser_extension',
        access_token_hash: tokenHash,
        status: 'connected',
        metadata: { client: 'Orfilo Browser Extension', created_at: new Date().toISOString() },
      })
      .select('id, provider, status, created_at')
      .single();

    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.status(201).json({
      token: plainToken,
      connection_id: data.id,
      message: 'Extension paired successfully. Save this token as it will not be shown again.',
    });
  });

  // GET /api/v1/extension/status — requires auth (JWT or extension API key)
  app.get('/api/v1/extension/status', requireAuth, (req: Request, res: Response) => {
    res.json({
      authenticated: true,
      user_email: req.user?.email || '',
      user_id: req.user?.id,
    });
  });

  // GET /api/v1/extension/download — direct download for Orfilo Chrome Extension ZIP
  app.get('/api/v1/extension/download', (_req: Request, res: Response) => {
    const zipPath = path.resolve(__dirname, 'public', 'orfilo-extension.zip');
    const extDir = path.resolve(__dirname, 'extension');
    if (fs.existsSync(extDir)) {
      try {
        execSync(`cd "${extDir}" && zip -r "${zipPath}" . -x "*.git*"`, { stdio: 'ignore' });
      } catch (_) {}
    }

    if (fs.existsSync(zipPath)) {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader('Content-Disposition', 'attachment; filename="orfilo-extension.zip"');
      res.sendFile(zipPath);
      return;
    }
    res.status(404).json({ error: 'Extension download package not found' });
  });

  // --------------------------------------------------------------------------
  // GEMINI AI CLASSIFIER & INTELLIGENCE
  // --------------------------------------------------------------------------

  // POST /api/classify — uses Gemini API (GEMINI_API_KEY env var), 503 if not configured
  app.post('/api/classify', async (req: Request, res: Response) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === 'MY_GEMINI_API_KEY' || !apiKey.trim()) {
      res.status(503).json({ error: 'Gemini API key is not configured' });
      return;
    }

    const {
      filename,
      extension = '',
      mimeType = 'application/octet-stream',
      sizeBytes = 0,
      availableProjects = [],
      contextNote = '',
    } = req.body || {};

    if (!filename || typeof filename !== 'string') {
      res.status(400).json({ error: 'Filename is required' });
      return;
    }

    const ext = extension || (filename.split('.').pop() || 'bin').toLowerCase();

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `You are Orfilo, the central AI artifact organization intelligence engine.
Analyze this newly captured file artifact:
- Filename: "${filename}"
- Extension: "${ext}"
- MIME Type: "${mimeType}"
- Size Bytes: ${sizeBytes}
- User Context Note: "${contextNote}"
- User's Existing Active Projects: ${JSON.stringify(availableProjects)}

Return a structured JSON object with these exact fields:
1. "project_name": Name of the best matching project from the list, or a clean recommended new project name.
2. "category": Primary category (e.g. Design & Media, Documentation, Code, Presentations, Branding, Research).
3. "purpose": Concrete 1-sentence purpose phrase explaining what this artifact is.
4. "topics": Array of 2 to 4 high-level topic strings.
5. "keywords": Array of 2 to 4 searchable keywords.
6. "suggested_name": Clean kebab-case filename (e.g. "product-overview-deck.pdf").
7. "suggested_location": Clean hierarchy path (e.g. "Project / Category / Subfolder").
8. "confidence": Number between 0.80 and 0.99.
9. "reasoning": 1-sentence note starting with "Orfilo identified this as...".`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              project_name: { type: Type.STRING },
              category: { type: Type.STRING },
              purpose: { type: Type.STRING },
              topics: { type: Type.ARRAY, items: { type: Type.STRING } },
              keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
              suggested_name: { type: Type.STRING },
              suggested_location: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              reasoning: { type: Type.STRING },
            },
            required: [
              'project_name',
              'category',
              'purpose',
              'topics',
              'keywords',
              'suggested_name',
              'suggested_location',
              'confidence',
              'reasoning',
            ],
          },
        },
      });

      if (!response.text) {
        res.status(500).json({ error: 'Empty response received from Gemini' });
        return;
      }

      const suggestion = JSON.parse(response.text);
      res.json({ suggestion, source: 'gemini-2.5-flash' });
    } catch (err: any) {
      console.error('[Gemini Classifier] Error:', err);
      res.status(500).json({ error: err.message || 'AI classification failed' });
    }
  });

  // GET /api/ai/status — AI status check
  app.get('/api/ai/status', (_req: Request, res: Response) => {
    const hasKey = Boolean(process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY');
    res.json({
      status: hasKey ? 'connected' : 'unconfigured',
      ready: hasKey,
      model: 'gemini-2.5-flash',
      provider: 'Google Gemini',
      runtime: 'Server-Side Production API',
      capabilities: [
        'Automated artifact classification (/api/classify)',
        'Intelligent kebab-case naming suggestion',
        'Semantic project routing',
      ],
    });
  });

  // POST /api/ai/query — semantic search across artifacts
  app.post('/api/ai/query', async (req: Request, res: Response) => {
    const { query = '', artifacts = [] } = req.body || {};
    const q = String(query).toLowerCase();
    const matched = (Array.isArray(artifacts) ? artifacts : [])
      .filter((a: any) => {
        const name = (a.display_name || a.original_name || '').toLowerCase();
        const purpose = (a.metadata?.purpose || a.description || '').toLowerCase();
        const proj = (a.project?.name || a.project || '').toLowerCase();
        return name.includes(q) || purpose.includes(q) || proj.includes(q);
      })
      .map((a: any) => a.id);

    res.json({
      answer: matched.length > 0
        ? `Found ${matched.length} matching artifact(s) for "${query}".`
        : `No artifacts matched "${query}".`,
      matched_artifact_ids: matched,
    });
  });

  // --------------------------------------------------------------------------
  // VITE DEV MIDDLEWARE OR PRODUCTION STATIC SERVING
  // --------------------------------------------------------------------------
  if (!isProduction) {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        host: '0.0.0.0',
        port: PORT,
        hmr: true,
      },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  return { app, PORT };
}

// Start server
createServer()
  .then(({ app, PORT }) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`[Orfilo Server] Production server running on http://0.0.0.0:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('[Orfilo Server] Fatal startup error:', err);
    process.exit(1);
  });
