import React, { useState, useEffect } from 'react';
import { Folder, Palette, Trash2, Check, AlertCircle, Loader2, X } from 'lucide-react';
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

  const colorOptions = ['#19A974', '#10B981', '#059669', '#2563EB', '#7C3AED', '#D97706', '#111111'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMsg('Project name is required');
      return;
    }

    if (!currentUser) {
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="bg-white border border-neutral-200/80 rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col animate-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="px-6 py-4 border-b border-neutral-100 flex items-center justify-between bg-white shrink-0">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
              style={{ backgroundColor: color }}
            >
              <Folder className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-neutral-900">
                {projectToEdit ? 'Edit Project' : 'Create New Project'}
              </h2>
              <p className="text-[11px] text-neutral-500">First-class container for deliverables</p>
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs overflow-y-auto">
          {errorMsg && (
            <div className="bg-red-50/80 border border-red-200/80 text-red-800 rounded-xl p-3 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Project Name *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Habesha Model"
              className="w-full px-3 py-2 border border-neutral-200/80 rounded-xl bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-1">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What deliverables and topics belong to this project?"
              rows={3}
              className="w-full px-3 py-2 border border-neutral-200/80 rounded-xl bg-white text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974] transition-all"
            />
          </div>

          <div>
            <label className="block text-[11px] font-medium text-neutral-700 mb-2">
              Color Accent
            </label>
            <div className="flex items-center gap-2">
              {colorOptions.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className={`w-7 h-7 rounded-full transition-all cursor-pointer ${
                    color === c ? 'scale-110 ring-2 ring-offset-2 ring-neutral-900' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: c }}
                  aria-label={`Select color ${c}`}
                />
              ))}
            </div>
          </div>

          {projectToEdit && (
            <div className="pt-3 border-t border-neutral-100">
              {isDeleting ? (
                <div className="bg-red-50/80 border border-red-200/80 rounded-xl p-3 text-xs space-y-2">
                  <span className="font-semibold text-red-900">Delete this project?</span>
                  <p className="text-[11px] text-red-700">
                    Deliverables will remain in your workspace as unassigned.
                  </p>
                  <div className="flex gap-2 justify-end">
                    <button
                      type="button"
                      onClick={() => setIsDeleting(false)}
                      className="px-2.5 py-1 text-xs text-neutral-600 hover:text-black cursor-pointer"
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
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete this project</span>
                </button>
              )}
            </div>
          )}

          {/* Footer Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-neutral-100">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 text-xs text-neutral-600 hover:text-neutral-900 rounded-xl cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isProcessing}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium transition-colors cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>{projectToEdit ? 'Save Changes' : 'Create Project'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
