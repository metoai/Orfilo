import React, { useState } from 'react';
import {
  Home,
  Puzzle,
  Zap,
  Folder,
  Layers,
  Plus,
  SlidersHorizontal,
  Activity,
  HardDrive,
  Settings,
  LogIn,
  LogOut,
  User as UserIcon,
  X,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Project, User } from '../types/index.ts';

type NavigationTab = 'home' | 'integrations' | 'projects' | 'artifacts' | 'activity' | 'storage' | 'settings' | 'landing';

interface MobileBottomNavProps {
  activeTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  onOpenUpload: () => void;
  onOpenAIModal: () => void;
  selectedProjectId: string | null;
  onSelectProject: (id: string | null) => void;
  projects: Project[];
  artifactsCount: number;
  user: User | null;
  onOpenAuth: () => void;
  onSignOut: () => void;
  isAIConnected?: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  activeTab,
  onSelectTab,
  onOpenUpload,
  onOpenAIModal,
  selectedProjectId,
  onSelectProject,
  projects,
  user,
  onOpenAuth,
  onSignOut,
  isAIConnected = true,
}) => {
  const [isMoreSheetOpen, setIsMoreSheetOpen] = useState(false);

  const handleTabClick = (tab: NavigationTab) => {
    onSelectProject(null);
    onSelectTab(tab);
    setIsMoreSheetOpen(false);
  };

  return (
    <>
      {/* 1. Fixed Bottom Navigation Bar */}
      <nav
        aria-label="Mobile Navigation"
        className="fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#E7E7E4] md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.06)] px-2 py-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]"
      >
        <div className="flex items-center justify-around max-w-lg mx-auto">
          {/* Home */}
          <button
            onClick={() => handleTabClick('home')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
              activeTab === 'home' && !selectedProjectId
                ? 'text-[#19A974] font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${activeTab === 'home' && !selectedProjectId ? 'scale-110 bg-[#E8F7F0]' : ''}`}>
              <Home className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Home</span>
          </button>

          {/* Integrations */}
          <button
            onClick={() => handleTabClick('integrations')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] relative ${
              activeTab === 'integrations'
                ? 'text-[#19A974] font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform relative ${activeTab === 'integrations' ? 'scale-110 bg-[#E8F7F0]' : ''}`}>
              <Puzzle className="w-5 h-5" />
              {isAIConnected && (
                <span className="absolute top-0 right-0 w-2 h-2 rounded-full bg-[#19A974] ring-2 ring-white" />
              )}
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Integrations</span>
          </button>

          {/* Quick Add Floating Button (Center) */}
          <div className="relative -mt-4 px-1">
            <button
              onClick={onOpenUpload}
              className="w-12 h-12 rounded-full bg-[#19A974] hover:bg-[#158f62] active:scale-95 text-white flex items-center justify-center shadow-lg shadow-[#19A974]/30 transition-all cursor-pointer ring-4 ring-white"
              title="Add Artifact"
              aria-label="Add Artifact"
            >
              <Plus className="w-6 h-6 stroke-[2.5]" />
            </button>
          </div>

          {/* Projects */}
          <button
            onClick={() => handleTabClick('projects')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
              activeTab === 'projects' || selectedProjectId
                ? 'text-[#19A974] font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${activeTab === 'projects' || selectedProjectId ? 'scale-110 bg-[#E8F7F0]' : ''}`}>
              <Folder className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Projects</span>
          </button>

          {/* All Artifacts */}
          <button
            onClick={() => handleTabClick('artifacts')}
            className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
              activeTab === 'artifacts'
                ? 'text-[#19A974] font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${activeTab === 'artifacts' ? 'scale-110 bg-[#E8F7F0]' : ''}`}>
              <Layers className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">Artifacts</span>
          </button>

          {/* More / Menu Drawer */}
          <button
            onClick={() => setIsMoreSheetOpen(true)}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer min-w-[52px] min-h-[44px] ${
              ['activity', 'storage', 'settings'].includes(activeTab) || isMoreSheetOpen
                ? 'text-[#19A974] font-semibold'
                : 'text-[#6B6B6B] hover:text-[#111111]'
            }`}
          >
            <div className={`p-1 rounded-lg transition-transform ${['activity', 'storage', 'settings'].includes(activeTab) || isMoreSheetOpen ? 'scale-110 bg-[#E8F7F0]' : ''}`}>
              <SlidersHorizontal className="w-5 h-5" />
            </div>
            <span className="text-[10px] mt-0.5 tracking-tight">More</span>
          </button>
        </div>
      </nav>

      {/* 2. Slide-Up "More" Mobile Sheet */}
      {isMoreSheetOpen && (
        <div className="fixed inset-0 z-50 bg-black/45 backdrop-blur-xs flex flex-col justify-end md:hidden animate-in fade-in duration-150">
          <div
            className="bg-[#FAFAF8] rounded-t-3xl border-t border-[#E7E7E4] p-5 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom duration-200 pb-[max(1.5rem,env(safe-area-inset-bottom))]"
          >
            {/* Sheet Handle & Header */}
            <div className="flex flex-col items-center gap-2">
              <div className="w-10 h-1 bg-neutral-300 rounded-full" />
              <div className="w-full flex items-center justify-between pt-1">
                <span className="text-xs font-bold uppercase tracking-wider text-[#6B6B6B]">
                  Workspace Navigation
                </span>
                <button
                  onClick={() => setIsMoreSheetOpen(false)}
                  className="p-1 rounded-lg text-neutral-400 hover:text-black cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Quick Project Folders Grid */}
            <div className="bg-white border border-[#E7E7E4] rounded-2xl p-3.5 space-y-2">
              <div className="flex items-center justify-between text-xs font-semibold text-[#111111]">
                <span>Project Folders</span>
                <span className="text-[10px] font-mono text-neutral-500">{projects.length} folders</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      onSelectProject(proj.id);
                      onSelectTab('projects');
                      setIsMoreSheetOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-xl border text-left text-xs transition-colors cursor-pointer ${
                      selectedProjectId === proj.id
                        ? 'border-[#19A974] bg-[#E8F7F0] text-[#19A974] font-semibold'
                        : 'border-[#E7E7E4] bg-neutral-50/50 hover:bg-neutral-100 text-[#111111]'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0"
                      style={{ backgroundColor: proj.color || '#19A974' }}
                    >
                      <Folder className="w-3 h-3" />
                    </div>
                    <span className="truncate">{proj.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Secondary Destinations */}
            <div className="bg-white border border-[#E7E7E4] rounded-2xl divide-y divide-[#E7E7E4] overflow-hidden text-xs">
              <button
                onClick={() => handleTabClick('activity')}
                className={`w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  activeTab === 'activity' ? 'bg-[#E8F7F0] text-[#19A974] font-semibold' : 'text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Activity className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Activity Timeline</div>
                    <div className="text-[11px] text-[#6B6B6B]">Audit trail of AI files & organization</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => handleTabClick('storage')}
                className={`w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  activeTab === 'storage' ? 'bg-[#E8F7F0] text-[#19A974] font-semibold' : 'text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <HardDrive className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Cloud Storage Providers</div>
                    <div className="text-[11px] text-[#6B6B6B]">Google Drive & Supabase Storage sync</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => handleTabClick('settings')}
                className={`w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer ${
                  activeTab === 'settings' ? 'bg-[#E8F7F0] text-[#19A974] font-semibold' : 'text-[#111111]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-neutral-100 flex items-center justify-center text-neutral-700">
                    <Settings className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold">Workspace Settings</div>
                    <div className="text-[11px] text-[#6B6B6B]">PostgreSQL RLS & environment</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>

              <button
                onClick={() => {
                  setIsMoreSheetOpen(false);
                  onOpenAIModal();
                }}
                className="w-full flex items-center justify-between p-3.5 hover:bg-neutral-50 transition-colors cursor-pointer text-[#111111]"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600">
                    <Zap className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <div className="font-semibold flex items-center gap-1.5">
                      <span>Companion Extension</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">v1.1</span>
                    </div>
                    <div className="text-[11px] text-[#6B6B6B]">Capture deliverables from ChatGPT, Claude, Gemini</div>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-neutral-400" />
              </button>
            </div>

            {/* Account / Session Row */}
            <div className="bg-white border border-[#E7E7E4] rounded-2xl p-3.5">
              {user ? (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-neutral-900 truncate">{user.name}</div>
                      <div className="text-[10px] text-neutral-500 font-mono truncate">{user.email}</div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      onSignOut();
                      setIsMoreSheetOpen(false);
                    }}
                    className="px-3 py-1.5 text-xs text-red-600 hover:text-red-800 font-medium cursor-pointer flex items-center gap-1"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between text-xs">
                  <div>
                    <div className="font-semibold text-neutral-900">Guest Session Active</div>
                    <div className="text-[11px] text-neutral-500">Sign in to save projects to Supabase</div>
                  </div>
                  <button
                    onClick={() => {
                      onOpenAuth();
                      setIsMoreSheetOpen(false);
                    }}
                    className="px-3.5 py-1.5 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl font-medium cursor-pointer flex items-center gap-1"
                  >
                    <LogIn className="w-3.5 h-3.5" />
                    <span>Sign In</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
