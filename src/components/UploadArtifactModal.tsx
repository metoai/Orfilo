import React, { useState, useRef } from 'react';
import { Upload, Check, FileText, Image as ImageIcon, Code as CodeIcon, FileQuestion, ArrowRight, Loader2, AlertCircle, X, Sparkles } from 'lucide-react';
import { extractDeterministicMetadata, classifyArtifact } from '../lib/ai/classifier.ts';
import { AIOrganizationSuggestion, Project, Artifact, User } from '../types/index.ts';
import { db } from '../lib/supabase/db.ts';

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
      const aiSuggestion = await classifyArtifact(deterministic.original_name, deterministic.mime_type);

      if (aiSuggestion) {
        setSuggestion(aiSuggestion);
        setDisplayName(aiSuggestion.suggested_name);

        const matched = projects.find((p) => p.name.toLowerCase() === aiSuggestion.project_name.toLowerCase());
        if (matched) {
          setSelectedProjectId(matched.id);
        } else if (projects.length > 0) {
          setSelectedProjectId(projects[0].id);
        }
      } else {
        const fallbackSuggestion: AIOrganizationSuggestion = {
          project_name: projects[0]?.name || '',
          category: 'General',
          purpose: 'Artifact',
          suggested_name: deterministic.original_name,
          suggested_location: 'General',
          reasoning: 'Uploaded file deliverable',
        };
        setSuggestion(fallbackSuggestion);
        setDisplayName(deterministic.original_name);
        if (projects.length > 0) {
          setSelectedProjectId(projects[0].id);
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Analysis failed');
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
    if (!currentUser) {
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

      const newArtifact = await db.createArtifact({
        original_name: deterministic.original_name,
        display_name: displayName.trim() || suggestion.suggested_name,
        mime_type: deterministic.mime_type,
        extension: deterministic.extension,
        size_bytes: deterministic.size_bytes,
        project_id: selectedProjectId || null,
        provider_path: suggestion.suggested_location,
        description: suggestion.reasoning || null,
        source_type: sourceType,
        source_name: sourceName,
        ai_confidence: suggestion.confidence ?? null,
        metadata: {
          category: suggestion.category,
          subfolder: suggestion.category,
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
      return <ImageIcon className="w-5 h-5 text-emerald-600" />;
    }
    if (['pdf', 'docx', 'txt', 'md'].includes(ext)) {
      return <FileText className="w-5 h-5 text-blue-600" />;
    }
    if (['ts', 'tsx', 'js', 'json', 'py'].includes(ext)) {
      return <CodeIcon className="w-5 h-5 text-amber-600" />;
    }
    return <FileQuestion className="w-5 h-5 text-neutral-600" />;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200/80 rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center">
              <Upload className="w-4 h-4 text-[#19A974]" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">Upload AI Deliverable</h2>
              <p className="text-[11px] text-neutral-500">Auto-categorized by Ingestion Engine</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 p-1.5 rounded-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5 overflow-y-auto max-h-[75vh]">
          {errorMsg && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
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
                className="border-2 border-dashed border-neutral-200/90 hover:border-[#19A974] bg-neutral-50/50 hover:bg-neutral-50 rounded-2xl p-8 text-center cursor-pointer transition-all group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                />
                <div className="w-11 h-11 mx-auto rounded-xl bg-white border border-neutral-200/80 text-[#19A974] flex items-center justify-center mb-3 shadow-2xs group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <div className="text-xs font-semibold text-neutral-900">
                  Click to browse or drop deliverable
                </div>
                <p className="text-[11px] text-neutral-500 mt-1">
                  Supports PNG, JPG, PDF, DOCX, Code files, PPTX
                </p>
              </div>

              {/* Sample AI exports */}
              <div className="pt-1">
                <div className="text-[10px] font-mono font-semibold text-neutral-400 mb-2 uppercase tracking-wider">
                  Test with AI Sample Export:
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => handleSimulateSample('image')}
                    className="p-2.5 text-left border border-neutral-200/80 hover:border-neutral-300 rounded-xl bg-white transition-all text-xs flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-mono text-[11px] text-neutral-900 truncate">image_847392_final2.png</div>
                      <div className="text-[10px] text-neutral-400">ChatGPT Hero Concept</div>
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleSimulateSample('pdf')}
                    className="p-2.5 text-left border border-neutral-200/80 hover:border-neutral-300 rounded-xl bg-white transition-all text-xs flex items-center gap-2 group cursor-pointer shadow-2xs"
                  >
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                    <div className="truncate">
                      <div className="font-mono text-[11px] text-neutral-900 truncate">document_847291_final2.pdf</div>
                      <div className="text-[10px] text-neutral-400">Gemini Product Spec</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          ) : isAnalyzing ? (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-neutral-100 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-[#19A974] animate-spin" />
              </div>
              <div className="text-sm font-semibold text-neutral-900">Analyzing deliverable context...</div>
              <p className="text-xs text-neutral-500 max-w-xs">
                Extracting metadata, matching project, and generating subfolder location.
              </p>
            </div>
          ) : suggestion ? (
            <div className="space-y-4">
              {/* Detected artifact card */}
              <div className="bg-neutral-50 border border-neutral-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    {getFileIcon(file.type, file.name.split('.').pop() || '')}
                    <div>
                      <div className="text-xs font-mono text-neutral-500 truncate max-w-[220px]">
                        {file.name}
                      </div>
                      <div className="text-sm font-semibold text-neutral-900">
                        {suggestion.purpose}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/80 text-[11px] font-medium">
                    <Check className="w-3 h-3" />
                    <span>Auto-classified</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-neutral-200/60 text-xs">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                      Suggested Name
                    </span>
                    <div className="font-mono text-xs font-medium text-neutral-900 mt-0.5 truncate">
                      {displayName || suggestion.suggested_name}
                    </div>
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-wider text-neutral-400">
                      Suggested Location
                    </span>
                    <div className="text-xs font-medium text-neutral-900 mt-0.5 truncate">
                      {suggestion.suggested_location}
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-2.5 text-[11px] text-neutral-600 leading-relaxed border border-neutral-200/60">
                  <span className="font-medium text-neutral-900">Context: </span>
                  {suggestion.reasoning}
                </div>
              </div>

              {/* Source AI Selector Segmented Pill */}
              <div className="flex items-center justify-between text-xs px-1">
                <span className="text-neutral-500 font-medium">Source AI Tool:</span>
                <div className="p-1 bg-neutral-100 rounded-xl border border-neutral-200/50 flex gap-1">
                  {(['Gemini', 'ChatGPT', 'Claude'] as const).map((ai) => (
                    <button
                      key={ai}
                      type="button"
                      onClick={() => setSourceName(ai)}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                        sourceName === ai
                          ? 'bg-white text-neutral-900 shadow-xs'
                          : 'text-neutral-500 hover:text-neutral-900'
                      }`}
                    >
                      {ai}
                    </button>
                  ))}
                </div>
              </div>

              {/* Customization Toggle */}
              {isCustomizing ? (
                <div className="space-y-3 bg-white p-3.5 rounded-xl border border-neutral-200/80 text-xs">
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Display Name
                    </label>
                    <input
                      type="text"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg font-mono text-xs text-neutral-900 focus:outline-none focus:border-[#19A974]"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-medium text-neutral-700 mb-1">
                      Assign to Project
                    </label>
                    <select
                      value={selectedProjectId}
                      onChange={(e) => setSelectedProjectId(e.target.value)}
                      className="w-full px-3 py-1.5 border border-neutral-200 rounded-lg text-xs bg-white text-neutral-900 focus:outline-none focus:border-[#19A974]"
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
                  className="text-xs text-neutral-500 hover:text-neutral-900 underline cursor-pointer px-1"
                >
                  Customize name or project assignment...
                </button>
              )}
            </div>
          ) : null}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-neutral-100 bg-neutral-50/50 flex items-center justify-between">
          {file ? (
            <button
              type="button"
              onClick={() => {
                setFile(null);
                setSuggestion(null);
                setIsCustomizing(false);
              }}
              className="text-xs text-neutral-500 hover:text-neutral-900 cursor-pointer"
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
              className="px-3.5 py-2 text-xs text-neutral-600 hover:text-neutral-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            {suggestion && (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleSave}
                className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Save deliverable</span>
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
