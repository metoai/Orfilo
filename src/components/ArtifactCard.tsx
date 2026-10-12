import React, { useState } from 'react';
import {
  GripVertical,
  FileText,
  Image as ImageIcon,
  Code as CodeIcon,
  Presentation,
  Folder,
  Eye,
  ExternalLink,
} from 'lucide-react';
import { Artifact } from '../types/index.ts';

interface ArtifactCardProps {
  artifact: Artifact;
  onClick: () => void;
  isDragging?: boolean;
  onDragStart?: (e: React.DragEvent, artifact: Artifact) => void;
  onDragEnd?: (e: React.DragEvent) => void;
  highlightMatch?: boolean;
}

export function ArtifactCard({
  artifact,
  onClick,
  isDragging = false,
  onDragStart,
  onDragEnd,
  highlightMatch = false,
}: ArtifactCardProps) {
  const [imageError, setImageError] = useState(false);
  const ext = (artifact.extension || '').toLowerCase();
  const isImage = ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
  const isCode = ['ts', 'tsx', 'js', 'jsx', 'json', 'py', 'sql', 'html', 'css'].includes(ext);

  // Derive thumbnail or direct asset URL
  const meta = (artifact.metadata || {}) as Record<string, any>;
  const imageUrl: string =
    (typeof meta.thumbnail_url === 'string' && meta.thumbnail_url) ||
    `/api/v1/artifacts/${artifact.id}/file`;

  const getFileIcon = (extStr: string) => {
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(extStr)) {
      return <ImageIcon className="w-4 h-4 text-emerald-600" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py', 'sql', 'html', 'css'].includes(extStr)) {
      return <CodeIcon className="w-4 h-4 text-blue-600" />;
    }
    if (['pptx', 'ppt', 'key'].includes(extStr)) {
      return <Presentation className="w-4 h-4 text-amber-600" />;
    }
    return <FileText className="w-4 h-4 text-neutral-600" />;
  };

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', artifact.id);
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({
        artifactId: artifact.id,
        displayName: artifact.display_name,
        projectId: artifact.project_id,
        category: artifact.metadata?.category || 'General',
      })
    );
    e.dataTransfer.effectAllowed = 'move';
    onDragStart?.(e, artifact);
  };

  const formatSize = (bytes: number) => {
    if (!bytes) return '';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const subfolder = (meta.subfolder as string) || (meta.category as string);

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-150 cursor-pointer flex flex-col justify-between select-none shadow-2xs hover:shadow-xs hover:-translate-y-0.5 ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-[#19A974] ring-2 ring-[#19A974]/20 shadow-none'
          : highlightMatch
          ? 'border-[#19A974] ring-2 ring-[#19A974]/20'
          : 'border-neutral-200/80 hover:border-neutral-300'
      }`}
    >
      {/* Top Preview / Media Area */}
      {isImage ? (
        <div className="relative w-full h-40 bg-neutral-50 overflow-hidden border-b border-neutral-100 flex items-center justify-center">
          {!imageError ? (
            <img
              src={imageUrl}
              alt={artifact.display_name}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              loading="lazy"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-neutral-400 gap-1.5 p-4">
              <ImageIcon className="w-7 h-7 opacity-30 text-neutral-500" />
              <span className="text-[10px] font-mono text-neutral-400">Image Deliverable</span>
            </div>
          )}

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
            <span className="text-[11px] text-white font-medium flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>Inspect</span>
            </span>
          </div>

          {/* Floating Badges */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase font-semibold px-2 py-0.5 rounded-md bg-black/70 text-white backdrop-blur-xs">
              {ext}
            </span>
            <span className="text-[9px] font-medium px-2 py-0.5 rounded-md bg-white/90 text-neutral-800 backdrop-blur-xs border border-white/40">
              {artifact.source_name || 'AI'}
            </span>
          </div>
        </div>
      ) : isCode ? (
        <div className="w-full h-32 bg-[#141414] border-b border-neutral-800 p-3.5 flex flex-col justify-between font-mono text-[10px] relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800/80 pb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CodeIcon className="w-3.5 h-3.5" />
              <span className="uppercase font-semibold">{ext}</span>
            </div>
            <span className="text-neutral-500 text-[9px]">{artifact.source_name}</span>
          </div>
          <p className="text-neutral-300 text-[10px] line-clamp-3 leading-relaxed opacity-90 font-mono">
            {artifact.description || `// ${artifact.display_name}`}
          </p>
          <div className="text-[9px] text-neutral-500">Source Code Deliverable</div>
        </div>
      ) : (
        <div className="w-full h-28 bg-neutral-50/70 border-b border-neutral-100 p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-700 shadow-2xs">
              {getFileIcon(ext)}
            </div>
            <div>
              <span className="font-mono text-[10px] font-semibold uppercase text-neutral-500">
                {ext}
              </span>
              <p className="text-xs font-medium text-neutral-900">{artifact.source_name || 'AI Document'}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata Micro-Pills */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5 truncate">
              {artifact.project?.name && (
                <span
                  className="inline-flex items-center gap-1.5 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-neutral-200/60 text-neutral-700 bg-neutral-50 max-w-[130px] truncate"
                  title={`Project: ${artifact.project.name}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: artifact.project.color || '#19A974' }}
                  />
                  <span className="truncate">{artifact.project.name}</span>
                </span>
              )}

              {subfolder && (
                <span className="text-[10px] text-neutral-600 bg-neutral-100 font-medium px-1.5 py-0.5 rounded-md truncate max-w-[110px]">
                  {subfolder}
                </span>
              )}
            </div>

            {/* Drag Grip Handle */}
            <div
              className="hidden sm:block p-1 rounded-md text-neutral-300 group-hover:text-neutral-500 hover:text-[#19A974] hover:bg-neutral-100 transition-colors cursor-grab active:cursor-grabbing shrink-0"
              title="Drag into a project folder in the sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Clean Display Name */}
          <h3 className="font-medium text-xs text-neutral-900 group-hover:text-[#19A974] transition-colors line-clamp-1 font-sans">
            {artifact.display_name}
          </h3>

          {/* Path info */}
          {artifact.provider_path && (
            <div
              className="text-[10px] text-neutral-400 font-mono mt-1.5 truncate flex items-center gap-1"
              title={artifact.provider_path}
            >
              <Folder className="w-3 h-3 shrink-0 text-neutral-400" />
              <span className="truncate">{artifact.provider_path}</span>
            </div>
          )}
        </div>

        {/* Footer info: File size & Created date */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-400 font-mono">
          <span>{formatSize(artifact.size_bytes)}</span>
          <span>
            {new Date(artifact.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
