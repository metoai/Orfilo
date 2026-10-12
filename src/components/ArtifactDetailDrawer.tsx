import React, { useState } from 'react';
import {
  X,
  Trash2,
  Edit2,
  FolderInput,
  Check,
  Info,
  FileText,
  Image as ImageIcon,
  Code as CodeIcon,
  FileQuestion,
  ExternalLink,
  HardDrive,
  Copy,
  Folder,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Artifact, Project } from '../types/index.ts';
import { db } from '../lib/supabase/db.ts';

interface ArtifactDetailDrawerProps {
  artifact: Artifact | null;
  projects: Project[];
  onClose: () => void;
  onArtifactUpdated: (artifact: Artifact) => void;
  onArtifactDeleted: (id: string) => void;
}

export const ArtifactDetailDrawer: React.FC<ArtifactDetailDrawerProps> = ({
  artifact,
  projects,
  onClose,
  onArtifactUpdated,
  onArtifactDeleted,
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [isMoving, setIsMoving] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState('');
  const [newPath, setNewPath] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);

  if (!artifact) return null;

  const handleStartRename = () => {
    setEditedName(artifact.display_name);
    setIsEditingName(true);
  };

  const handleSaveRename = async () => {
    if (!editedName.trim() || editedName === artifact.display_name) {
      setIsEditingName(false);
      return;
    }
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const updated = await db.updateArtifact(artifact.id, { display_name: editedName.trim() });
      onArtifactUpdated(updated);
      setIsEditingName(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to rename artifact');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartMove = () => {
    setSelectedProjectId(artifact.project_id || '');
    setNewPath(artifact.provider_path || '');
    setIsMoving(true);
  };

  const handleSaveMove = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      const proj = projects.find((p) => p.id === selectedProjectId);
      const computedPath =
        newPath.trim() ||
        (proj
          ? `${proj.name} / ${artifact.metadata?.subfolder || artifact.metadata?.category || 'General'}`
          : 'Unassigned');

      const updated = await db.updateArtifact(artifact.id, {
        project_id: selectedProjectId || null,
        provider_path: computedPath,
      });
      onArtifactUpdated(updated);
      setIsMoving(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to move artifact');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await db.deleteArtifact(artifact.id);
      onArtifactDeleted(artifact.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete artifact');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopyId = () => {
    navigator.clipboard.writeText(artifact.id);
    setCopiedId(true);
    setTimeout(() => setCopiedId(false), 2000);
  };

  const formatBytes = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const ext = (artifact.extension || '').toLowerCase();
  const meta = (artifact.metadata || {}) as Record<string, any>;
  const docUrl = (meta.doc_url as string) || (meta.source_url as string);
  const subfolder = (meta.subfolder as string) || (meta.category as string) || 'General';

  const renderPreview = () => {
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext)) {
      const imgSrc: string =
        (typeof meta.thumbnail_url === 'string' && meta.thumbnail_url) ||
        (meta.content_base64
          ? `data:${artifact.mime_type || 'image/png'};base64,${meta.content_base64}`
          : `/storage/artifacts/${artifact.id}.${artifact.extension}`);

      return (
        <div className="w-full rounded-2xl overflow-hidden border border-neutral-200/80 bg-neutral-50 relative group shadow-2xs">
          <div className="max-h-72 w-full flex items-center justify-center p-4 bg-neutral-100/60">
            <img
              src={imgSrc}
              alt={artifact.display_name}
              className="max-h-64 max-w-full rounded-lg object-contain shadow-xs"
              onError={(e) => {
                const target = e.target as HTMLElement;
                target.style.display = 'none';
              }}
            />
          </div>
          <div className="p-3 bg-white border-t border-neutral-200/80 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-mono text-[10px] uppercase font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-800">
                {artifact.extension}
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {formatBytes(artifact.size_bytes)}
              </span>
            </div>
            <a
              href={imgSrc}
              target="_blank"
              rel="noreferrer"
              download={artifact.original_name}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-900 hover:text-black bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors cursor-pointer"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Full Size</span>
            </a>
          </div>
        </div>
      );
    }

    if (['pdf', 'docx', 'doc', 'txt', 'md', 'gdoc', 'gsheet', 'gslides'].includes(ext)) {
      return (
        <div className="w-full rounded-2xl bg-neutral-50 border border-neutral-200/80 p-6 flex flex-col items-center justify-center text-center space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white border border-neutral-200/80 text-blue-600 flex items-center justify-center shadow-2xs">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-neutral-900">{artifact.display_name}</h4>
            <div className="text-[11px] text-neutral-500 mt-0.5 font-mono">
              {artifact.extension.toUpperCase()} &bull; {formatBytes(artifact.size_bytes)}
            </div>
          </div>
          {docUrl && (
            <a
              href={docUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-[#19A974] hover:bg-[#158f62] rounded-xl transition-colors cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Open Document in Google Docs</span>
            </a>
          )}
        </div>
      );
    }

    if (['ts', 'tsx', 'js', 'json', 'py', 'sql', 'html', 'css'].includes(ext)) {
      return (
        <div className="w-full bg-[#141414] rounded-2xl border border-neutral-800 p-4 font-mono text-[11px] text-emerald-400 space-y-2">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] pb-2 border-b border-neutral-800">
            <span>{artifact.display_name}</span>
            <span className="uppercase">{artifact.extension}</span>
          </div>
          <p className="text-neutral-300 font-mono text-xs leading-relaxed py-2 line-clamp-4">
            {artifact.description || `// Deliverable code snippet from ${artifact.source_name}`}
          </p>
          <div className="text-[10px] text-neutral-500">Source Deliverable</div>
        </div>
      );
    }

    return (
      <div className="w-full h-32 bg-neutral-50 rounded-2xl flex items-center justify-center border border-neutral-200/80">
        <FileQuestion className="w-8 h-8 text-neutral-400" />
      </div>
    );
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-150"
    >
      {/* Centered Modal Window */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-xl max-h-[90vh] bg-white rounded-2xl shadow-xl border border-neutral-200/80 flex flex-col overflow-hidden animate-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase font-semibold px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 border border-neutral-200/60">
              {artifact.extension}
            </span>
            <span className="text-xs text-neutral-500">Artifact Inspector</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 text-sm flex-1">
          {errorMsg && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Media Viewport */}
          {renderPreview()}

          {/* Title & Rename */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-neutral-400">
              Display Name
            </span>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs font-mono border border-neutral-300 rounded-xl bg-white focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974]"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-[#19A974] text-white rounded-xl text-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-2.5 py-1.5 border border-neutral-200 rounded-xl text-xs cursor-pointer text-neutral-600"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group pt-0.5">
                <h3 className="font-sans text-base font-semibold text-neutral-900 break-all">
                  {artifact.display_name}
                </h3>
                <button
                  onClick={handleStartRename}
                  className="opacity-0 group-hover:opacity-100 text-neutral-400 hover:text-neutral-900 p-1 rounded-md transition-opacity cursor-pointer"
                  title="Rename artifact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="text-[11px] font-mono text-neutral-400">
              Original: {artifact.original_name}
            </div>
          </div>

          {/* AI Context Card */}
          {meta.reasoning && (
            <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-3.5 space-y-1.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-neutral-900">
                <Sparkles className="w-3.5 h-3.5 text-[#19A974]" />
                <span>AI Ingestion Context</span>
              </div>
              <p className="text-xs text-neutral-600 leading-relaxed font-sans">
                {meta.reasoning}
              </p>
            </div>
          )}

          {/* Better Auth Inspector Property Table */}
          <div className="border border-neutral-200/80 rounded-xl bg-white divide-y divide-neutral-100 text-xs shadow-2xs overflow-hidden">
            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Project</span>
              <span className="font-medium text-neutral-900">
                {artifact.project?.name || 'Unassigned'}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Subfolder</span>
              <span className="font-medium text-neutral-900">{subfolder}</span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Source AI</span>
              <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-800 text-[11px] font-medium font-mono">
                {artifact.source_name || 'AI Export'}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Location Path</span>
              <span className="font-mono text-neutral-700 truncate max-w-[240px]">
                {artifact.provider_path || 'Root'}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">File Size</span>
              <span className="font-mono text-neutral-700">
                {formatBytes(artifact.size_bytes)}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Created At</span>
              <span className="font-mono text-neutral-700">
                {new Date(artifact.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>

            <div className="p-3 flex items-center justify-between">
              <span className="text-neutral-500">Artifact ID</span>
              <div className="flex items-center gap-1.5">
                <span className="font-mono text-[10px] text-neutral-400 truncate max-w-[140px]">
                  {artifact.id}
                </span>
                <button
                  type="button"
                  onClick={handleCopyId}
                  className="p-1 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  title="Copy ID"
                >
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-600" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Move to another Project */}
          {isMoving ? (
            <div className="bg-neutral-50 border border-neutral-200/80 p-4 rounded-xl space-y-3 text-xs">
              <div className="font-semibold text-neutral-900">Move to another Project</div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-xs"
                >
                  <option value="">No Project</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] text-neutral-500 mb-1">Path / Location</label>
                <input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="e.g. Meto / Marketing / Images"
                  className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg bg-white text-xs"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsMoving(false)}
                  className="px-3 py-1.5 border border-neutral-200 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMove}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-[#19A974] text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  {isProcessing ? 'Moving...' : 'Save Location'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={handleStartMove}
              className="w-full py-2 px-3 border border-neutral-200/80 hover:border-neutral-400 bg-white rounded-xl text-xs font-medium text-neutral-800 flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FolderInput className="w-3.5 h-3.5" />
              <span>Move to another Project or Folder</span>
            </button>
          )}

          {/* Delete Action */}
          {isDeleting ? (
            <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-4 text-xs space-y-2.5">
              <div className="font-semibold text-red-900">Delete this artifact?</div>
              <p className="text-red-700 text-[11px]">
                This will remove the artifact from Orfilo and record an event.
              </p>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsDeleting(false)}
                  className="px-3 py-1.5 border border-red-200 text-red-800 rounded-lg text-xs"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isProcessing}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-medium hover:bg-red-700 cursor-pointer"
                >
                  {isProcessing ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsDeleting(true)}
              className="w-full py-2 px-3 text-red-600 hover:bg-red-50/60 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete artifact</span>
            </button>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-neutral-200 hover:border-neutral-300 bg-white text-neutral-800 rounded-xl text-xs font-medium transition-colors cursor-pointer shadow-2xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
