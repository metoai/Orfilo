import React, { useState, useEffect } from 'react';
import { Folder, Sparkles, Palette, Trash2, Check, AlertCircle, Loader2 } from 'lucide-react';
import { Project, User } from '../types/index.ts';
import { db } from '../lib/supabase/db.ts';

interface ProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectToEdit?: Project | null;
  currentUser?: User | null;
  onRequireAuth?: () => void;
  onProjectSaved: (project: Project) => void;
  onProjectDeleted?: (id: string) => void;
}

export const ProjectModal: React.FC<ProjectModalProps> = ({
  isOpen,
  onClose,
  projectToEdit,
  currentUser,
  onRequireAuth,
  onProjectSaved,
  onProjectDeleted,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('#19A974');
  const [icon, setIcon] = useState('folder');
  const [isDeleting, setIsDeleting] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (projectToEdit) {
      setName(projectToEdit.name);
      setDescription(projectToEdit.description || '');
      setColor(projectToEdit.color || '#19A974');
      setIcon(projectToEdit.icon || 'folder');
    } else {
      setName('');
      setDescription('');
      setColor('#19A974');
      setIcon('folder');
    }
    setIsDeleting(false);
    setErrorMsg(null);
  }, [projectToEdit, isOpen]);

  if (!isOpen) return null;

  const colorOptions = ['#19A974', '#63E6B1', '#0B1320', '#2563EB', '#7C3AED', '#D97706'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }

    if (!currentUser && db.isSupabaseConfigured()) {
      setErrorMsg('Please sign in to save projects to your workspace.');
      if (onRequireAuth) {
        onClose();
        onRequireAuth();
      }
      return;
    }

    setIsProcessing(true);
    setErrorMsg(null);

    try {
      if (projectToEdit) {
        const updated = await db.updateProject(projectToEdit.id, {
          name: name.trim(),
          description: description.trim(),
          color,
          icon,
        });
        onProjectSaved(updated);
      } else {
        const created = await db.createProject({
          name: name.trim(),
          description: description.trim(),
          color,
          icon,
        });
        onProjectSaved(created);
      }
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to save project');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async () => {
    if (!projectToEdit) return;
    setIsProcessing(true);
    setErrorMsg(null);
    try {
      await db.deleteProject(projectToEdit.id);
      if (onProjectDeleted) onProjectDeleted(projectToEdit.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to delete project');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-3 sm:p-4">
      <div className="bg-[#FAFAF8] border border-[#E7E7E4] rounded-2xl w-full max-w-md shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 sm:px-6 py-4 border-b border-[#E7E7E4] flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-4 h-4" />
            </div>
            <h2 className="text-sm font-semibold text-[#111111]">
              {projectToEdit ? 'Edit Project' : 'Create New Project'}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="text-neutral-400 hover:text-[#111111] p-1 rounded-lg"
          >
            ✕
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Project Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Meto"
              className="w-full px-3 py-2 border border-[#E7E7E4] rounded-xl bg-white text-xs focus:outline-none focus:border-[#19A974]"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What are you creating with AI for this project?"
              rows={3}
              className="w-full px-3 py-2 border border-[#E7E7E4] rounded-xl bg-white text-xs focus:outline-none focus:border-[#19A974]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-[#6B6B6B] mb-1.5">Color Accent</label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-transform cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-neutral-400' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </div>

          {projectToEdit && (
            <div className="pt-3 border-t border-[#E7E7E4]">
              {isDeleting ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs space-y-2">
                  <span className="font-semibold text-red-950">Delete this project?</span>
                  <p className="text-[11px] text-red-800">
                    Artifacts in this project will remain in Orfilo as unassigned.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-2.5 py-1 text-xs text-neutral-600 hover:text-black"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleDelete}
                      disabled={isProcessing}
                      className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      {isProcessing ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setIsDeleting(true)}
                  className="text-xs text-red-600 hover:underline flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete this project
                </button>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-[#6B6B6B] hover:text-[#111111]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" /> {projectToEdit ? 'Save Changes' : 'Create Project'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
