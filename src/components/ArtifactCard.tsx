import React, { useState } from 'react';
import {
  CheckCircle2,
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

  // Derive the best image URL for thumbnail rendering
  const meta = (artifact.metadata || {}) as Record<string, any>;
  const imageUrl: string =
    (typeof meta.thumbnail_url === 'string' && meta.thumbnail_url) ||
    (meta.content_base64
      ? `data:${artifact.mime_type || 'image/png'};base64,${meta.content_base64}`
      : `/storage/artifacts/${artifact.id}.${ext}`);

  const getFileIcon = (extStr: string) => {
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(extStr)) {
      return <ImageIcon className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py', 'sql', 'html', 'css'].includes(extStr)) {
      return <CodeIcon className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (['pptx', 'ppt', 'key'].includes(extStr)) {
      return <Presentation className="w-3.5 h-3.5 text-amber-500" />;
    }
    return <FileText className="w-3.5 h-3.5 text-neutral-500" />;
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

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragEnd={onDragEnd}
      onClick={onClick}
      className={`group relative bg-white border rounded-2xl overflow-hidden transition-all duration-200 cursor-pointer flex flex-col justify-between select-none shadow-2xs hover:shadow-md ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-[#19A974] ring-2 ring-[#19A974]/30 shadow-none'
          : highlightMatch
          ? 'border-[#19A974] ring-2 ring-[#19A974]/20 shadow-sm'
          : 'border-[#E7E7E4] hover:border-[#19A974]/80'
      }`}
    >
      {/* Top Media / Thumbnail Section */}
      {isImage && !imageError ? (
        <div className="relative w-full h-40 bg-neutral-100 overflow-hidden border-b border-neutral-100 flex items-center justify-center">
          <img
            src={imageUrl}
            alt={artifact.display_name}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
          {/* Subtle gradient overlay on hover */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
            <span className="text-[10px] text-white/90 font-medium flex items-center gap-1">
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </span>
          </div>

          {/* Top Floating Badge */}
          <div className="absolute top-2.5 left-2.5 flex items-center gap-1.5">
            <span className="font-mono text-[9px] uppercase font-bold px-2 py-0.5 rounded-md bg-black/60 text-white backdrop-blur-xs shadow-xs">
              {ext}
            </span>
            <span className="text-[9px] font-semibold px-2 py-0.5 rounded-md bg-white/90 text-neutral-800 backdrop-blur-xs shadow-xs">
              {artifact.source_name || 'AI'}
            </span>
          </div>
        </div>
      ) : isCode ? (
        <div className="w-full h-28 bg-[#16181D] border-b border-neutral-800 p-3 flex flex-col justify-between font-mono text-[10px] relative overflow-hidden">
          <div className="flex items-center justify-between text-neutral-400 border-b border-neutral-800/80 pb-1.5">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <CodeIcon className="w-3 h-3" />
              <span className="uppercase font-bold">{ext}</span>
            </div>
            <span className="text-neutral-500 text-[9px]">{artifact.source_name}</span>
          </div>
          <p className="text-neutral-300 text-[10px] line-clamp-2 leading-relaxed opacity-90 font-mono">
            {artifact.description || `// ${artifact.display_name}`}
          </p>
          <div className="text-[9px] text-neutral-500">Component Deliverable</div>
        </div>
      ) : (
        <div className="w-full h-24 bg-gradient-to-br from-neutral-50 to-neutral-100 border-b border-neutral-100 p-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white border border-neutral-200/80 flex items-center justify-center text-neutral-600 shadow-2xs">
              {getFileIcon(ext)}
            </div>
            <div>
              <span className="font-mono text-[10px] font-bold uppercase text-neutral-500">
                {ext}
              </span>
              <p className="text-[11px] font-medium text-neutral-700">{artifact.source_name}</p>
            </div>
          </div>
        </div>
      )}

      {/* Card Content Body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Metadata badges (when not rendered in top banner) */}
          <div className="flex items-center justify-between gap-1 mb-2">
            <div className="flex items-center gap-1.5 truncate">
              {artifact.project?.name && (
                <span
                  className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-neutral-100 text-neutral-700 bg-neutral-50 max-w-[120px] truncate"
                  title={`Project: ${artifact.project.name}`}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full shrink-0"
                    style={{ backgroundColor: artifact.project.color || '#19A974' }}
                  />
                  <span className="truncate">{artifact.project.name}</span>
                </span>
              )}

              {typeof meta.subfolder === 'string' && meta.subfolder && (
                <span className="text-[10px] text-neutral-500 bg-neutral-100 font-medium px-1.5 py-0.5 rounded-md truncate max-w-[100px]">
                  {meta.subfolder}
                </span>
              )}
            </div>

            {/* Grip handle to indicate draggability */}
            <div
              className="hidden sm:block p-1 rounded-md text-neutral-300 group-hover:text-neutral-500 hover:text-[#19A974] hover:bg-neutral-100 transition-colors cursor-grab active:cursor-grabbing shrink-0"
              title="Drag into a project folder in the sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Clean Display Name */}
          <h3 className="font-medium text-xs text-[#111111] group-hover:text-[#19A974] transition-colors line-clamp-1 font-sans">
            {artifact.display_name}
          </h3>

          {/* Path info */}
          {artifact.provider_path && (
            <div
              className="text-[10px] text-[#8F8F8F] font-mono mt-1.5 truncate flex items-center gap-1"
              title={artifact.provider_path}
            >
              <Folder className="w-3 h-3 shrink-0 text-neutral-400" />
              <span className="truncate">{artifact.provider_path}</span>
            </div>
          )}
        </div>

        {/* Footer info: Source & Size & Date */}
        <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-[#8F8F8F]">
          <div className="flex items-center gap-1.5 truncate">
            {artifact.size_bytes > 0 && (
              <span className="font-mono text-neutral-400">
                {(artifact.size_bytes / 1024).toFixed(0)} KB
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="text-neutral-400 font-mono">
              {new Date(artifact.created_at).toLocaleDateString(undefined, {
                month: 'short',
                day: 'numeric',
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
