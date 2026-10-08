import React, { useState } from 'react';
import { X, Download, Trash2, Edit2, FolderInput, Check, Sparkles, FileText, Image, Code, FileQuestion, ArrowRight, Loader2, AlertCircle, HardDrive } from 'lucide-react';
import { Artifact, Project } from '../types/index.ts';
import { db } from '../lib/supabase/db.ts';
import { defaultStorageProvider } from '../lib/storage/GoogleDriveProvider.ts';

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
      const updated = await db.renameArtifact(artifact.id, editedName.trim());
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
      const proj = projects.find(p => p.id === selectedProjectId);
      const computedPath = newPath.trim() || (proj ? `${proj.name} / ${artifact.metadata.category || 'General'}` : 'Unassigned');
      const updated = await db.moveArtifact(artifact.id, selectedProjectId || null, computedPath);
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
      if (artifact.provider_file_id && defaultStorageProvider.isConfigured) {
        try {
          await defaultStorageProvider.delete(artifact.provider_file_id);
        } catch (storageErr) {
          console.warn('Storage provider deletion notice:', storageErr);
        }
      }
      await db.deleteArtifact(artifact.id);
      onArtifactDeleted(artifact.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete artifact');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDownload = async () => {
    try {
      const blob = await defaultStorageProvider.download(artifact.provider_file_id || artifact.id);
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = artifact.display_name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      setErrorMsg('Download simulated: ' + err.message);
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const renderPreview = () => {
    if (['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(artifact.extension)) {
      return (
        <div className="w-full h-48 bg-gradient-to-br from-neutral-100 to-neutral-200 rounded-xl flex items-center justify-center border border-[#E7E7E4] overflow-hidden relative group">
          <div className="absolute inset-0 flex items-center justify-center opacity-30">
            <Image className="w-20 h-20 text-neutral-400" />
          </div>
          <div className="relative z-10 flex flex-col items-center text-center p-4">
            <span className="font-mono text-xs uppercase px-2 py-0.5 rounded bg-black/60 text-white backdrop-blur-xs mb-1">
              {artifact.extension} Preview
            </span>
            <span className="text-xs text-neutral-600 font-medium">{artifact.display_name}</span>
          </div>
        </div>
      );
    }
    if (['pdf', 'docx', 'txt', 'md'].includes(artifact.extension)) {
      return (
        <div className="w-full h-44 bg-blue-50/50 rounded-xl flex flex-col items-center justify-center border border-blue-100 p-6 text-center">
          <FileText className="w-10 h-10 text-blue-600 mb-2" />
          <div className="text-xs font-semibold text-blue-950">{artifact.metadata.purpose || 'Document'}</div>
          <div className="text-[11px] text-blue-800/80 mt-1 font-mono">{formatBytes(artifact.size_bytes)}</div>
        </div>
      );
    }
    if (['ts', 'tsx', 'js', 'json', 'py', 'sql'].includes(artifact.extension)) {
      return (
        <div className="w-full h-44 bg-neutral-900 rounded-xl flex flex-col justify-between border border-neutral-800 p-4 font-mono text-[11px] text-emerald-400">
          <div className="flex items-center justify-between text-neutral-400 text-[10px] pb-2 border-b border-neutral-800">
            <span>{artifact.display_name}</span>
            <span>{artifact.extension.toUpperCase()}</span>
          </div>
          <pre className="text-neutral-300 overflow-hidden line-clamp-3">
            {`// Source artifact generated by ${artifact.source_name}\nexport default function Module() {\n  return { ok: true };\n}`}
          </pre>
          <div className="text-[10px] text-neutral-500">Structured AI export</div>
        </div>
      );
    }
    return (
      <div className="w-full h-36 bg-[#FAFAF8] rounded-xl flex items-center justify-center border border-[#E7E7E4]">
        <FileQuestion className="w-8 h-8 text-neutral-400" />
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30 backdrop-blur-xs">
      <div className="w-full max-w-md bg-[#FAFAF8] h-full shadow-2xl border-l border-[#E7E7E4] flex flex-col overflow-hidden animate-in slide-in-from-right duration-200">
        {/* Drawer Header */}
        <div className="px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-[#111111]">
              {artifact.extension}
            </span>
            <span className="text-xs text-[#6B6B6B]">Artifact Details</span>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1 rounded-lg cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="p-6 overflow-y-auto space-y-6 text-sm flex-1">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Visual Preview */}
          {renderPreview()}

          {/* Title & Rename */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-semibold text-[#6B6B6B] tracking-wider">Display Name</span>
            {isEditingName ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono border border-[#19A974] rounded-lg bg-white focus:outline-none"
                  autoFocus
                />
                <button
                  onClick={handleSaveRename}
                  disabled={isProcessing}
                  className="px-2.5 py-1.5 bg-[#19A974] text-white rounded-lg text-xs font-medium cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setIsEditingName(false)}
                  className="px-2.5 py-1.5 border border-[#E7E7E4] rounded-lg text-xs cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between group">
                <h3 className="font-mono text-sm font-semibold text-[#111111] break-all">
                  {artifact.display_name}
                </h3>
                <button
                  onClick={handleStartRename}
                  className="opacity-0 group-hover:opacity-100 text-[#6B6B6B] hover:text-[#111111] p-1 transition-opacity cursor-pointer"
                  title="Rename artifact"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <div className="text-[11px] font-mono text-[#8F8F8F]">Original: {artifact.original_name}</div>
          </div>

          {/* Why is this here? (Core Orfilo value prop) */}
          <div className="bg-white border border-[#E7E7E4] rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[#111111]">
              <Sparkles className="w-3.5 h-3.5 text-[#19A974]" />
              <span>Why is this here?</span>
            </div>
            <p className="text-xs text-[#6B6B6B] leading-relaxed">
              {artifact.metadata.reasoning || `Orfilo identified this artifact as related to ${artifact.project?.name || 'your workspace'}.`}
            </p>
          </div>

          {/* Metadata Grid */}
          <div className="border border-[#E7E7E4] rounded-xl bg-white divide-y divide-[#E7E7E4] text-xs">
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Project</span>
              <span className="font-medium text-[#111111]">
                {artifact.project?.name || 'Unassigned'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Category</span>
              <span className="font-medium text-[#111111]">
                {artifact.metadata.category || 'General'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Purpose</span>
              <span className="font-medium text-[#111111]">
                {artifact.metadata.purpose || 'Artifact'}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Location</span>
              <span className="font-medium text-[#111111] truncate max-w-[200px]">
                {artifact.provider_path || 'Root'}
              </span>
            </div>
            {artifact.provider_file_id && (
              <div className="p-3 flex items-center justify-between">
                <span className="text-[#6B6B6B]">Storage Provider</span>
                <span className="inline-flex items-center gap-1.5 text-[#19A974] font-medium text-[11px]">
                  <HardDrive className="w-3.5 h-3.5" /> Google Drive Synced
                </span>
              </div>
            )}
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Source AI</span>
              <span className="px-2 py-0.5 rounded-full bg-neutral-100 text-[#111111] text-[11px] font-medium">
                {artifact.source_name}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">AI Confidence</span>
              <span className="text-[#19A974] font-medium">
                {Math.round(artifact.ai_confidence * 100)}%
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">File Size</span>
              <span className="font-mono text-neutral-600">
                {formatBytes(artifact.size_bytes)}
              </span>
            </div>
            <div className="p-3 flex items-center justify-between">
              <span className="text-[#6B6B6B]">Captured Date</span>
              <span className="text-neutral-600">
                {new Date(artifact.created_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
          </div>

          {/* Move to another project */}
          {isMoving ? (
            <div className="bg-white border border-[#E7E7E4] p-4 rounded-xl space-y-3 text-xs">
              <div className="font-semibold text-[#111111]">Move to another Project / Folder</div>
              <div>
                <label className="block text-[11px] text-[#6B6B6B] mb-1">Target Project</label>
                <select
                  value={selectedProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="w-full px-2.5 py-1.5 border border-[#E7E7E4] rounded-lg bg-white"
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
                <label className="block text-[11px] text-[#6B6B6B] mb-1">Path / Location</label>
                <input
                  type="text"
                  value={newPath}
                  onChange={(e) => setNewPath(e.target.value)}
                  placeholder="e.g. Meto / Marketing / Images"
                  className="w-full px-2.5 py-1.5 border border-[#E7E7E4] rounded-lg"
                />
              </div>
              <div className="flex gap-2 justify-end">
                <button
                  onClick={() => setIsMoving(false)}
                  className="px-3 py-1.5 border border-[#E7E7E4] rounded-lg text-xs"
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
              className="w-full py-2 px-3 border border-[#E7E7E4] hover:border-[#111111] bg-white rounded-xl text-xs font-medium text-[#111111] flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <FolderInput className="w-3.5 h-3.5" /> Move to Project or Folder
            </button>
          )}

          {/* Delete confirmation */}
          {isDeleting ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs space-y-3">
              <div className="font-semibold text-red-950">Delete this artifact?</div>
              <p className="text-red-800 text-[11px]">
                This action will remove the artifact from Orfilo and register an activity event.
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
              className="w-full py-2 px-3 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" /> Delete artifact
            </button>
          )}
        </div>

        {/* Drawer Footer */}
        <div className="px-6 py-4 border-t border-[#E7E7E4] bg-white flex items-center justify-between shrink-0">
          <button
            onClick={handleDownload}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" /> Download
          </button>
          <button
            onClick={onClose}
            className="px-3 py-2 text-xs text-[#6B6B6B] hover:text-[#111111]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
