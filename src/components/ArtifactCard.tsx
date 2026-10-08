import React from 'react';
import {
  Sparkles,
  GripVertical,
  FileText,
  Image as ImageIcon,
  Code as CodeIcon,
  Presentation,
  Folder,
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
  const getFileIcon = (ext: string) => {
    const e = ext.toLowerCase();
    if (['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(e)) {
      return <ImageIcon className="w-3.5 h-3.5 text-blue-500" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py', 'sql', 'html', 'css'].includes(e)) {
      return <CodeIcon className="w-3.5 h-3.5 text-emerald-600" />;
    }
    if (['pptx', 'ppt', 'key'].includes(e)) {
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
      className={`group relative bg-white border rounded-2xl p-4 transition-all duration-150 cursor-pointer flex flex-col justify-between select-none ${
        isDragging
          ? 'opacity-40 scale-[0.98] border-dashed border-[#19A974] ring-2 ring-[#19A974]/30 shadow-none'
          : highlightMatch
          ? 'border-[#19A974] ring-2 ring-[#19A974]/20 shadow-sm'
          : 'border-[#E7E7E4] hover:border-[#19A974]/70 hover:shadow-sm'
      }`}
    >
      <div>
        {/* Top Header: File Type Badge + AI Confidence + Drag Grip */}
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <span className="inline-flex items-center gap-1 font-mono text-[10px] uppercase font-medium px-2 py-0.5 rounded-lg bg-neutral-100 text-[#444444]">
              {getFileIcon(artifact.extension)}
              <span>{artifact.extension}</span>
            </span>

            {artifact.project?.name && (
              <span
                className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-lg border border-neutral-100 text-neutral-700 bg-neutral-50 max-w-[110px] truncate"
                title={`Project: ${artifact.project.name}`}
              >
                <span
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ backgroundColor: artifact.project.color || '#19A974' }}
                />
                <span className="truncate">{artifact.project.name}</span>
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <span
              className="text-[10px] text-[#19A974] bg-[#E8F7F0] font-semibold px-1.5 py-0.5 rounded-md flex items-center gap-1"
              title={`AI Confidence: ${Math.round(artifact.ai_confidence * 100)}%`}
            >
              <Sparkles className="w-2.5 h-2.5" />
              <span>{Math.round(artifact.ai_confidence * 100)}%</span>
            </span>

            {/* Grip handle to indicate draggability on desktop */}
            <div
              className="hidden sm:block p-1 rounded-md text-neutral-300 group-hover:text-neutral-500 hover:text-[#19A974] hover:bg-neutral-100 transition-colors cursor-grab active:cursor-grabbing"
              title="Drag into a project folder in the sidebar"
              onClick={(e) => e.stopPropagation()}
            >
              <GripVertical className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>

        {/* Display Name */}
        <h3 className="font-mono text-xs font-semibold text-[#111111] group-hover:text-[#19A974] transition-colors truncate">
          {artifact.display_name}
        </h3>

        {/* Metadata info */}
        <div className="text-[11px] text-[#6B6B6B] mt-1 truncate">
          {artifact.metadata?.category || 'General'}
          {artifact.metadata?.purpose ? ` · ${artifact.metadata.purpose}` : ''}
        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-3 pt-2.5 border-t border-neutral-100 flex items-center justify-between text-[10px] text-[#8F8F8F]">
        <div className="flex items-center gap-1.5 truncate">
          <span className="px-1.5 py-0.2 rounded bg-neutral-50 border border-neutral-100 font-medium text-neutral-600">
            {artifact.source_name}
          </span>
          {artifact.size_bytes > 0 && (
            <span className="font-mono text-neutral-400">
              {(artifact.size_bytes / 1024).toFixed(0)} KB
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="group-hover:hidden transition-all text-neutral-400 font-mono">
            {new Date(artifact.created_at).toLocaleDateString(undefined, {
              month: 'short',
              day: 'numeric',
            })}
          </span>
          <span className="hidden group-hover:inline-flex items-center gap-0.5 text-[#19A974] font-medium text-[10px]">
            <span>Drag to folder</span>
          </span>
        </div>
      </div>
    </div>
  );
}
