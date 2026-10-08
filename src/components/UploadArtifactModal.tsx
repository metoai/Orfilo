import React, { useState, useRef } from 'react';
import { Upload, Sparkles, Check, FileText, Image, Code, FileQuestion, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import { extractDeterministicMetadata, classifyArtifactWithGemini } from '../lib/ai/classifier.ts';
import { AIOrganizationSuggestion, Project, Artifact, User } from '../types/index.ts';
import { db } from '../lib/supabase/db.ts';
import { defaultStorageProvider } from '../lib/storage/GoogleDriveProvider.ts';

interface UploadArtifactModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Project[];
  currentUser?: User | null;
  onRequireAuth?: () => void;
  onArtifactCreated: (artifact: Artifact) => void;
}

export const UploadArtifactModal: React.FC<UploadArtifactModalProps> = ({
  isOpen,
  onClose,
  projects,
  currentUser,
  onRequireAuth,
  onArtifactCreated,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestion, setSuggestion] = useState<AIOrganizationSuggestion | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');
  const [sourceName, setSourceName] = useState<Artifact['source_name']>('Gemini');
  const [sourceType, setSourceType] = useState<Artifact['source_type']>('download_capture');
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = async (selectedFile: File) => {
    setFile(selectedFile);
    setErrorMsg(null);
    setIsAnalyzing(true);

    try {
      const deterministic = extractDeterministicMetadata(selectedFile);
      const projectNames = projects.map(p => p.name);

      const aiSuggestion = await classifyArtifactWithGemini({
        filename: deterministic.original_name,
        extension: deterministic.extension,
        mimeType: deterministic.mime_type,
        sizeBytes: deterministic.size_bytes,
        availableProjects: projectNames,
      });

      setSuggestion(aiSuggestion);
      setDisplayName(aiSuggestion.suggested_name);

      // Match project
      const matched = projects.find(p => p.name.toLowerCase() === aiSuggestion.project_name.toLowerCase());
      if (matched) {
        setSelectedProjectId(matched.id);
      } else if (projects.length > 0) {
        setSelectedProjectId(projects[0].id);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis fallback activated');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  // Preset demo test helper for validating the master build prompt workflow:
  // "AI creates: image_847392_final2.png -> Orfilo suggests meto-hero-v1.png"
  const handleSimulateSample = (sampleType: 'image' | 'pdf') => {
    if (sampleType === 'image') {
      const sampleFile = new File(['[Binary image content]'], 'image_847392_final2.png', { type: 'image/png' });
      setSourceName('ChatGPT');
      setSourceType('download_capture');
      handleFileSelect(sampleFile);
    } else {
      const sampleFile = new File(['[PDF documentation content]'], 'document_847291_final2.pdf', { type: 'application/pdf' });
      setSourceName('Gemini');
      setSourceType('download_capture');
      handleFileSelect(sampleFile);
    }
  };

  const handleSave = async () => {
    if (!file || !suggestion) return;
    if (!currentUser && db.isSupabaseConfigured()) {
      setErrorMsg('Please sign in to save artifacts to your workspace.');
      if (onRequireAuth) {
        onClose();
        onRequireAuth();
      }
      return;
    }

    setIsSaving(true);
    setErrorMsg(null);

    try {
      const deterministic = extractDeterministicMetadata(file);

      let providerFileId: string | null = null;
      if (defaultStorageProvider.isConfigured) {
        try {
          const uploadRes = await defaultStorageProvider.upload(
            file,
            suggestion.suggested_location,
            displayName.trim() || suggestion.suggested_name
          );
          providerFileId = uploadRes.fileId;
        } catch (storageErr) {
          console.warn('Storage provider sync notice:', storageErr);
        }
      }

      const newArtifact = await db.createArtifact({
        original_name: deterministic.original_name,
        display_name: displayName.trim() || suggestion.suggested_name,
        mime_type: deterministic.mime_type,
        extension: deterministic.extension,
        size_bytes: deterministic.size_bytes,
        project_id: selectedProjectId || null,
        provider_file_id: providerFileId,
        provider_path: suggestion.suggested_location,
        description: suggestion.reasoning,
        source_type: sourceType,
        source_name: sourceName,
        ai_confidence: suggestion.confidence,
        metadata: {
          category: suggestion.category,
          purpose: suggestion.purpose,
          topics: suggestion.topics,
          keywords: suggestion.keywords,
          reasoning: suggestion.reasoning,
          suggested_location: suggestion.suggested_location,
        },
      });

      onArtifactCreated(newArtifact);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save artifact');
    } finally {
      setIsSaving(false);
    }
  };

  const getFileIcon = (mime: string, ext: string) => {
    if (mime.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(ext)) {
      return <Image className="w-5 h-5 text-emerald-600" />;
    }
    if (['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py'].includes(ext)) {
      return <Code className="w-5 h-5 text-amber-600" />;
    }
    return <FileQuestion className="w-5 h-5 text-neutral-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E8F7F0] text-[#19A974] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-[#111111]">Capture AI Artifact</h2>
              <p className="text-[11px] text-[#6B6B6B]">Everything your AI creates. Organized.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-4 sm:p-6 space-y-5 overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {!file ? (
            <div className="space-y-4">
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-[#E7E7E4] hover:border-[#19A974] bg-white rounded-xl p-8 text-center cursor-pointer transition-colors group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <div className="w-12 h-12 mx-auto rounded-full bg-[#E8F7F0] text-[#19A974] flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-sm font-medium text-[#111111]">Drag and drop your AI export here</div>
                <p className="text-xs text-[#6B6B6B] mt-1">or click to browse from your device</p>
                <div className="mt-3 text-[11px] font-mono text-neutral-400">PDF, PNG, SVG, PPTX, JSON, CODE</div>
              </div>

              {/* Sample AI exports */}
              <div className="pt-2">
                <div className="text-[11px] font-medium text-[#6B6B6B] mb-2 uppercase tracking-wider">
                  Test with AI-generated file sample:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateSample('image')}
                    className="p-2.5 text-left border border-[#E7E7E4] hover:border-[#19A974] rounded-xl bg-white transition-all text-xs flex items-center gap-2 group cursor-pointer"
                  >
                    <Image className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-mono text-[11px] text-[#111111] truncate">image_847392_final2.png</div>
                      <div className="text-[10px] text-[#6B6B6B]">ChatGPT Hero Concept</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateSample('pdf')}
                    className="p-2.5 text-left border border-[#E7E7E4] hover:border-[#19A974] rounded-xl bg-white transition-all text-xs flex items-center gap-2 group cursor-pointer"
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-mono text-[11px] text-[#111111] truncate">document_847291_final2.pdf</div>
                      <div className="text-[10px] text-[#6B6B6B]">Gemini Product Doc</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="relative">
                <div className="w-12 h-12 rounded-full bg-[#E8F7F0] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-[#19A974] animate-pulse" />
                </div>
                <Loader2 className="w-12 h-12 text-[#19A974] animate-spin absolute inset-0" />
              </div>
              <div className="text-sm font-semibold text-[#111111]">Orfilo is understanding your artifact...</div>
              <p className="text-xs text-[#6B6B6B] max-w-xs">
                Extracting metadata, matching project context, and preparing smart location suggestions.
              </p>
            </div>
          ) : suggestion ? (
            <div className="space-y-4">
              {/* Detected artifact card */}
              <div className="bg-white border border-[#E7E7E4] rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {getFileIcon(file.type, file.name.split('.').pop() || '')}
                    <div>
                      <div className="text-xs font-mono text-[#6B6B6B] truncate max-w-[240px]">
                        {file.name}
                      </div>
                      <div className="text-sm font-semibold text-[#111111]">
                        {suggestion.purpose}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-[#E8F7F0] text-[#19A974] text-[11px] font-medium">
                    <Sparkles className="w-3 h-3" />
                    {Math.round(suggestion.confidence * 100)}% match
                  </div>
                </div>

                {/* AI Suggestions summary */}
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-100 text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Suggested Name</span>
                    <div className="font-mono text-xs font-medium text-[#111111] mt-0.5 truncate">
                      {displayName || suggestion.suggested_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-[#6B6B6B]">Suggested Location</span>
                    <div className="text-xs font-medium text-[#111111] mt-0.5 truncate">
                      {suggestion.suggested_location}
                    </div>
                  </div>
                </div>

                {/* Why is this here */}
                <div className="bg-[#FAFAF8] rounded-lg p-2.5 text-[11px] text-[#6B6B6B] leading-relaxed border border-[#E7E7E4]/50">
                  <span className="font-medium text-[#111111]">Reasoning: </span>
                  {suggestion.reasoning}
                </div>
              </div>

              {/* Source AI selector */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-[#6B6B6B]">Created by:</span>
                <div className="flex gap-1.5">
                  {(['Gemini', 'ChatGPT', 'Claude'] as const).map((ai) => (
                    <button
                      key={ai}
                      type="button"
                      onClick={() => setSourceName(ai)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors ${
                        sourceName === ai
                          ? 'bg-[#111111] text-white'
                          : 'bg-white border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#111111]'
                      }`}
                    >
                      {ai}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization toggler */}
              {isCustomizing ? (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-[#E7E7E4] text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Display Name</label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E7E7E4] rounded-lg font-mono text-xs focus:outline-none focus:border-[#19A974]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Assign to Project</label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-[#E7E7E4] rounded-lg text-xs bg-white focus:outline-none focus:border-[#19A974]"
                    >
                      <option value="">No Project</option>
                      {projects.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsCustomizing(true)}
                  className="text-xs text-[#6B6B6B] hover:text-[#111111] underline cursor-pointer px-1"
                >
                  Change name or project...
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E7E7E4] bg-white flex items-center justify-between">
          {file ? (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSuggestion(null);
                setIsCustomizing(false);
              }}
              className="text-xs text-[#6B6B6B] hover:text-[#111111]"
            >
              Choose different file
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs text-[#6B6B6B] hover:text-[#111111] rounded-lg"
            >
              Cancel
            </button>
            {suggestion && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" /> Save artifact
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
