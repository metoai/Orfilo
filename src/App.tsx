import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  Folder,
  Layers,
  Search,
  Activity,
  HardDrive,
  Settings,
  Plus,
  Puzzle,
  Zap,
  Cpu,
  Workflow,
  Compass,
  FolderInput,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  Filter,
  FileText,
  Image as ImageIcon,
  Code as CodeIcon,
  ChevronRight,
  Database,
  RefreshCw,
  SlidersHorizontal,
  FolderPlus,
  FolderOpen,
  GripVertical,
  Clock,
  Eye,
  CheckCircle,
  HelpCircle,
  LogIn,
} from 'lucide-react';
import { OrfiloBrand, OrfiloIcon } from './components/OrfiloBrand.tsx';
import { SupabaseSetupModal } from './components/SupabaseSetupModal.tsx';
import { UploadArtifactModal } from './components/UploadArtifactModal.tsx';
import { ArtifactDetailDrawer } from './components/ArtifactDetailDrawer.tsx';
import { ArtifactCard } from './components/ArtifactCard.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { StorageSettingsView } from './components/StorageSettingsView.tsx';
import { ActivityView } from './components/ActivityView.tsx';
import { LandingPageView } from './components/LandingPageView.tsx';
import { ExtensionPairModal } from './components/ExtensionPairModal.tsx';
import { IntegrationHubView } from './components/IntegrationHubView.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { queryOrfiloAI } from './lib/ai/classifier.ts';
import { db } from './lib/supabase/db.ts';
import { getSupabaseConfig, createBrowserClient } from './lib/supabase/client.ts';
import { defaultStorageProvider } from './lib/storage/GoogleDriveProvider.ts';
import { subscribeToGoogleDriveState, initSupabaseGoogleDriveAuth } from './lib/storage/googleAuth.ts';
import { Project, Artifact, FileEvent, User } from './types/index.ts';

type NavigationTab = 'home' | 'integrations' | 'projects' | 'artifacts' | 'activity' | 'storage' | 'settings' | 'landing';

export default function App() {
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [events, setEvents] = useState<FileEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'images' | 'documents' | 'presentations' | 'code'>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // Modals & Drawers
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isSetupModalOpen, setIsSetupModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
   const [isExtensionPairModalOpen, setIsExtensionPairModalOpen] = useState(false);
  const [isAskingAI, setIsAskingAI] = useState(false);
  const [aiQueryResult, setAiQueryResult] = useState<{
    answer: string;
    matched_artifact_ids: string[];
    suggested_action?: string;
  } | null>(null);

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Global Keyboard Shortcuts (⌘K / / to search, Esc to close modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        if (document.activeElement?.tagName !== 'INPUT' && document.activeElement?.tagName !== 'TEXTAREA') {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        setSelectedArtifact(null);
        setIsUploadOpen(false);
        setIsProjectModalOpen(false);
        setIsExtensionPairModalOpen(false);
        setIsAuthModalOpen(false);
        setIsSetupModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Handle URL Action Parameters (e.g., from Chrome Extension Auth Gate)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'pair-extension') {
        if (user) {
          setIsExtensionPairModalOpen(true);
        } else {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
      }
    }
  }, [user]);

  // Drag and Drop Artifacts to Sidebar Project Folders
  const [draggingArtifact, setDraggingArtifact] = useState<Artifact | null>(null);
  const [dragOverFolderId, setDragOverFolderId] = useState<string | null>(null);
  const [moveToast, setMoveToast] = useState<{
    id: string;
    message: string;
    artifactName: string;
    targetProjectName: string;
    previousProjectId: string | null;
    previousPath: string | null;
    artifactId: string;
  } | null>(null);

  const handleDragStart = (_e: React.DragEvent, artifact: Artifact) => {
    setDraggingArtifact(artifact);
  };

  const handleDragEnd = () => {
    setDraggingArtifact(null);
    setDragOverFolderId(null);
  };

  const handleDropArtifactOnProject = async (artifactId: string, targetProjectId: string) => {
    const targetProject = projects.find((p) => p.id === targetProjectId);
    const artifact = artifacts.find((a) => a.id === artifactId);
    if (!artifact || !targetProject) return;

    if (artifact.project_id === targetProjectId) {
      setMoveToast({
        id: Math.random().toString(),
        message: `"${artifact.display_name}" is already in ${targetProject.name}`,
        artifactName: artifact.display_name,
        targetProjectName: targetProject.name,
        previousProjectId: null,
        previousPath: null,
        artifactId: artifact.id,
      });
      setTimeout(() => setMoveToast(null), 3500);
      return;
    }

    const previousProjectId = artifact.project_id;
    const previousPath = artifact.provider_path || null;
    const newLocationPath = `${targetProject.name} / ${artifact.metadata?.category || 'General'}`;

    // Optimistically update
    const updated: Artifact = {
      ...artifact,
      project_id: targetProjectId,
      project: targetProject,
      provider_path: newLocationPath,
      updated_at: new Date().toISOString(),
    };

    setArtifacts((prev) => prev.map((a) => (a.id === artifactId ? updated : a)));
    if (selectedArtifact?.id === artifactId) {
      setSelectedArtifact(updated);
    }

    try {
      await db.moveArtifact(artifactId, targetProjectId, newLocationPath);
      const [freshProjects, freshEvents] = await Promise.all([
        db.getProjects(),
        db.getEvents(),
      ]);
      setProjects(freshProjects);
      setEvents(freshEvents);

      setMoveToast({
        id: Math.random().toString(),
        message: `Moved "${artifact.display_name}" to ${targetProject.name}`,
        artifactName: artifact.display_name,
        targetProjectName: targetProject.name,
        previousProjectId,
        previousPath,
        artifactId,
      });
      setTimeout(() => {
        setMoveToast((curr) => (curr?.artifactId === artifactId ? null : curr));
      }, 5000);
    } catch (err: any) {
      console.error('[Orfilo] Move artifact error:', err);
      // Revert optimistic update
      setArtifacts((prev) => prev.map((a) => (a.id === artifactId ? artifact : a)));
      setGlobalError('Could not move artifact: ' + (err.message || 'Unknown error'));
    }
  };

  const handleUndoMove = async () => {
    if (!moveToast || moveToast.previousProjectId === undefined) return;
    const { artifactId, previousProjectId, previousPath } = moveToast;
    const artifact = artifacts.find((a) => a.id === artifactId);
    if (!artifact) return;

    const prevProject = projects.find((p) => p.id === previousProjectId);
    const restoredPath = previousPath || (prevProject ? `${prevProject.name} / General` : 'Root');

    const reverted: Artifact = {
      ...artifact,
      project_id: previousProjectId,
      project: prevProject,
      provider_path: restoredPath,
      updated_at: new Date().toISOString(),
    };

    setArtifacts((prev) => prev.map((a) => (a.id === artifactId ? reverted : a)));
    if (selectedArtifact?.id === artifactId) {
      setSelectedArtifact(reverted);
    }

    try {
      await db.moveArtifact(artifactId, previousProjectId, restoredPath);
      const [freshProjects, freshEvents] = await Promise.all([
        db.getProjects(),
        db.getEvents(),
      ]);
      setProjects(freshProjects);
      setEvents(freshEvents);
      setMoveToast(null);
    } catch (err: any) {
      console.error('[Orfilo] Undo move error:', err);
    }
  };

  const handleAskAI = async (textToQuery?: string) => {
    const q = (textToQuery !== undefined ? textToQuery : searchQuery).trim();
    if (!q) return;
    setIsAskingAI(true);
    try {
      const res = await queryOrfiloAI({ query: q, artifacts });
      setAiQueryResult(res);
    } catch (err) {
      console.warn('AI query error:', err);
    } finally {
      setIsAskingAI(false);
    }
  };

  const { isConfigured: isSupabaseConfigured, url: supabaseUrl } = getSupabaseConfig();
  const [schemaStatus, setSchemaStatus] = useState(() => db.getSchemaStatus());
  const [isGoogleDriveConnected, setIsGoogleDriveConnected] = useState(defaultStorageProvider.isConfigured);

  // Load initial data
  const loadWorkspaceData = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const [projList, artList, eventList] = await Promise.all([
          db.getProjects(currentUser.id).catch(() => []),
          db.getArtifacts().catch(() => []),
          db.getEvents().catch(() => []),
        ]);

        setProjects(projList);
        setArtifacts(artList);
        setEvents(eventList);
      } else {
        setProjects([]);
        setArtifacts([]);
        setEvents([]);
      }
      setSchemaStatus(db.getSchemaStatus());
    } catch (err: any) {
      console.warn('Workspace data loading notice:', err);
      setSchemaStatus(db.getSchemaStatus());
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();
    initSupabaseGoogleDriveAuth();

    // Listen for auth state changes if Supabase client is live
    const client = createBrowserClient();
    if (client) {
      const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          if (session.provider_token) {
            initSupabaseGoogleDriveAuth();
          }
          const profile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || 'User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setUser(profile);
          try {
            await client.from('users').upsert({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              avatar_url: profile.avatar_url,
              updated_at: profile.updated_at,
            }, { onConflict: 'id' });
          } catch (_) {}

          const [projList, artList, eventList] = await Promise.all([
            db.getProjects(profile.id).catch(() => []),
            db.getArtifacts().catch(() => []),
            db.getEvents().catch(() => []),
          ]);
          setProjects(projList);
          setArtifacts(artList);
          setEvents(eventList);
        } else {
          setUser(null);
          setProjects([]);
          setArtifacts([]);
          setEvents([]);
        }
        setIsLoading(false);
      });

      const unsubDrive = subscribeToGoogleDriveState((state) => {
        setIsGoogleDriveConnected(state.isConnected);
      });

      const onFocus = () => {
        loadWorkspaceData();
      };
      window.addEventListener('focus', onFocus);

      const pollInterval = setInterval(() => {
        loadWorkspaceData();
      }, 5000);

      return () => {
        subscription.unsubscribe();
        unsubDrive();
        window.removeEventListener('focus', onFocus);
        clearInterval(pollInterval);
      };
    } else {
      const unsubDrive = subscribeToGoogleDriveState((state) => {
        setIsGoogleDriveConnected(state.isConnected);
      });

      const onFocus = () => {
        loadWorkspaceData();
      };
      window.addEventListener('focus', onFocus);

      const pollInterval = setInterval(() => {
        loadWorkspaceData();
      }, 5000);

      return () => {
        unsubDrive();
        window.removeEventListener('focus', onFocus);
        clearInterval(pollInterval);
      };
    }
  }, []);

  const handleSignOut = async () => {
    const client = createBrowserClient();
    if (client) {
      await client.auth.signOut();
    }
    setUser(null);
    setProjects([]);
    setArtifacts([]);
    setEvents([]);
    setActiveTab('home');
  };

  const handleExploreDemo = async () => {
    setIsLoading(true);
    const client = createBrowserClient();
    if (client && isSupabaseConfigured) {
      try {
        const { data, error } = await client.auth.signInWithPassword({
          email: 'metoaipr@gmail.com',
          password: 'Orfilo2026!Secure',
        });
        if (data?.user && !error) {
          const profile: User = {
            id: data.user.id,
            email: data.user.email || 'metoaipr@gmail.com',
            name: data.user.user_metadata?.full_name || 'Meto User',
            avatar_url: null,
            created_at: data.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setUser(profile);
          await loadWorkspaceData();
          return;
        }
      } catch (e) {
        console.warn('Demo login notice:', e);
      }
    }
    const seed = await db.getCurrentUser();
    setUser(seed || {
      id: 'usr_meto_preview',
      email: 'metoaipr@gmail.com',
      name: 'Meto User',
      avatar_url: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    await loadWorkspaceData();
  };

  // Handlers for real DB persistence
  const handleArtifactCreated = (newArt: Artifact) => {
    setArtifacts((prev) => [newArt, ...prev]);
    // Refresh events to show "saved" & "organized"
    db.getEvents().then(setEvents);
    // Refresh project counts
    db.getProjects().then(setProjects);
  };

  const handleArtifactUpdated = (updatedArt: Artifact) => {
    setArtifacts((prev) => prev.map((a) => (a.id === updatedArt.id ? updatedArt : a)));
    if (selectedArtifact?.id === updatedArt.id) {
      setSelectedArtifact(updatedArt);
    }
    db.getEvents().then(setEvents);
    db.getProjects().then(setProjects);
  };

  const handleArtifactDeleted = (deletedId: string) => {
    setArtifacts((prev) => prev.filter((a) => a.id !== deletedId));
    if (selectedArtifact?.id === deletedId) {
      setSelectedArtifact(null);
    }
    db.getEvents().then(setEvents);
    db.getProjects().then(setProjects);
  };

  const handleProjectSaved = (savedProj: Project) => {
    setProjects((prev) => {
      const exists = prev.some((p) => p.id === savedProj.id);
      if (exists) {
        return prev.map((p) => (p.id === savedProj.id ? savedProj : p));
      }
      return [savedProj, ...prev];
    });
  };

  const handleProjectDeleted = (deletedId: string) => {
    setProjects((prev) => prev.filter((p) => p.id !== deletedId));
    if (selectedProjectId === deletedId) {
      setSelectedProjectId(null);
    }
    // Artifacts in this project become unassigned
    setArtifacts((prev) =>
      prev.map((a) => (a.project_id === deletedId ? { ...a, project_id: null, project: undefined } : a))
    );
  };

  // Filtered Artifacts for display
  const filteredArtifacts = useMemo(() => {
    let list = artifacts;

    if (selectedProjectId) {
      list = list.filter((a) => a.project_id === selectedProjectId);
    }

    if (typeFilter !== 'all') {
      list = list.filter((a) => {
        if (typeFilter === 'images') return ['png', 'jpg', 'jpeg', 'webp', 'svg'].includes(a.extension);
        if (typeFilter === 'documents') return ['pdf', 'docx', 'txt', 'md'].includes(a.extension);
        if (typeFilter === 'presentations') return ['pptx', 'key'].includes(a.extension);
        if (typeFilter === 'code') return ['ts', 'tsx', 'js', 'json', 'py', 'sql'].includes(a.extension);
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (a) =>
          a.display_name.toLowerCase().includes(q) ||
          a.original_name.toLowerCase().includes(q) ||
          (a.description ? a.description.toLowerCase().includes(q) : false) ||
          (a.project?.name ? a.project.name.toLowerCase().includes(q) : false) ||
          (a.source_name ? a.source_name.toLowerCase().includes(q) : false) ||
          (a.metadata?.purpose && a.metadata.purpose.toLowerCase().includes(q)) ||
          (a.metadata?.category && a.metadata.category.toLowerCase().includes(q)) ||
          (a.metadata?.keywords && a.metadata.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [artifacts, selectedProjectId, typeFilter, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF8] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <OrfiloIcon size={44} />
          <div className="flex items-center gap-2 text-xs text-[#6B6B6B] mt-2 font-mono">
            <span>Loading Orfilo workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // 1. If unauthenticated, the first page is the Landing Page
  if (!user) {
    return (
      <>
        <LandingPageView
          onSignIn={() => {
            setAuthModalMode('signin');
            setIsAuthModalOpen(true);
          }}
          onSignUp={() => {
            setAuthModalMode('signup');
            setIsAuthModalOpen(true);
          }}
          onExploreDemo={handleExploreDemo}
        />
        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
          onAuthSuccess={async (authenticatedUser) => {
            setUser(authenticatedUser);
            setIsAuthModalOpen(false);
            await loadWorkspaceData();
          }}
        />
      </>
    );
  }

  // 2. If authenticated and selected Landing Page preview
  if (activeTab === 'landing') {
    return (
      <LandingPageView
        onSignIn={() => setActiveTab('home')}
        onSignUp={() => setActiveTab('home')}
        onExploreDemo={() => setActiveTab('home')}
        isLoggedIn={true}
        onReturnToDashboard={() => setActiveTab('home')}
      />
    );
  }

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  return (
    <div className="min-h-screen bg-[#FAFAF8] text-[#111111] flex flex-col antialiased selection:bg-[#E8F7F0] selection:text-[#19A974]">
      {/* Global Error Banner */}
      {globalError && (
        <aside aria-label="Global System Error" className="bg-red-50 border-b border-red-200 px-4 py-2 text-xs text-red-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-red-600 hover:text-red-950 font-bold p-1">
            ✕
          </button>
        </aside>
      )}

      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar Navigation */}
        <aside className="w-64 border-r border-[#E7E7E4] bg-white flex flex-col justify-between shrink-0 hidden md:flex">
          <div className="p-5 space-y-6">
            {/* Brand Logo */}
            <div className="flex items-center justify-between">
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('home');
                }}
                className="text-left cursor-pointer"
              >
                <OrfiloBrand variant="horizontal" size="md" showTagline={false} />
              </button>
            </div>

            {/* Quick persistent Action: + Add artifact */}
            <button
              onClick={() => setIsUploadOpen(true)}
              className="w-full py-2.5 px-3 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-xs transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add artifact</span>
            </button>

            {/* Navigation Links */}
            <nav className="space-y-1 text-xs">
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('home');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'home' && !selectedProjectId
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <Home className="w-4 h-4" />
                <span>Home</span>
              </button>

              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('integrations');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'integrations'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Puzzle className="w-4 h-4 text-[#19A974]" />
                  <span>Integrations</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#E8F7F0] text-[#19A974] font-semibold">
                  Hub
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('projects');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'projects'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Folder className="w-4 h-4" />
                  <span>Projects</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                  {projects.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('artifacts');
                }}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'artifacts'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Layers className="w-4 h-4" />
                  <span>All Artifacts</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                  {artifacts.length}
                </span>
              </button>

              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('activity');
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'activity'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <Activity className="w-4 h-4" />
                <span>Activity</span>
              </button>

              {/* Specific Project Folders (Drag & Drop targets) */}
              <div className="pt-3 border-t border-[#E7E7E4]/70">
                <div className="flex items-center justify-between px-3 py-1 mb-1 text-[10px] font-bold text-neutral-400 uppercase tracking-wider">
                  <div className="flex items-center gap-1.5">
                    <span>Project Folders</span>
                  </div>
                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setIsProjectModalOpen(true);
                    }}
                    className="p-1 rounded-md hover:bg-neutral-100 text-neutral-400 hover:text-[#111111] transition-colors"
                    title="Create new project folder"
                  >
                    <Plus className="w-3 h-3" />
                  </button>
                </div>

                {draggingArtifact && (
                  <div className="mx-1 mb-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-700 font-medium flex items-center gap-1.5 animate-pulse">
                    <FolderInput className="w-3 h-3 shrink-0" />
                    <span className="truncate">Drop into folder to move</span>
                  </div>
                )}

                <div className="space-y-1 max-h-52 overflow-y-auto pr-0.5">
                  {projects.map((proj) => {
                    const isSelected = selectedProjectId === proj.id;
                    const isDragOver = dragOverFolderId === proj.id;
                    const isArtifactInThis = draggingArtifact?.project_id === proj.id;
                    const count = artifacts.filter((a) => a.project_id === proj.id).length;

                    return (
                      <div
                        key={proj.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(proj.id);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            if (dragOverFolderId === proj.id) {
                              setDragOverFolderId(null);
                            }
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(null);
                          const artifactId = e.dataTransfer.getData('text/plain');
                          if (artifactId) {
                            handleDropArtifactOnProject(artifactId, proj.id);
                          }
                        }}
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setActiveTab('projects');
                        }}
                        className={`w-full group flex items-center justify-between px-3 py-2 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
                          isDragOver
                            ? 'bg-[#E8F7F0] ring-2 ring-[#19A974] text-[#19A974] scale-[1.02] shadow-sm font-semibold'
                            : draggingArtifact
                            ? isArtifactInThis
                              ? 'border border-dashed border-neutral-200 bg-neutral-50/50 text-neutral-400 opacity-60'
                              : 'border border-dashed border-[#19A974]/60 bg-emerald-50/30 hover:bg-[#E8F7F0] text-[#111111]'
                            : isSelected
                            ? 'bg-[#E8F7F0] text-[#19A974] font-semibold'
                            : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-white shrink-0 transition-transform ${
                              isDragOver ? 'scale-110' : ''
                            }`}
                            style={{ backgroundColor: proj.color || '#19A974' }}
                          >
                            {isDragOver ? (
                              <FolderOpen className="w-3 h-3" />
                            ) : (
                              <Folder className="w-3 h-3" />
                            )}
                          </div>
                          <span className="truncate">{proj.name}</span>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isDragOver ? (
                            <span className="text-[10px] font-bold text-[#19A974] bg-white px-1.5 py-0.5 rounded shadow-xs animate-bounce">
                              Move here
                            </span>
                          ) : (
                            <span
                              className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                                isSelected
                                  ? 'bg-[#19A974]/20 text-[#19A974]'
                                  : 'bg-neutral-100 text-neutral-500'
                              }`}
                            >
                              {count}
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}

                  {projects.length === 0 && (
                    <div className="px-3 py-2 text-[11px] text-neutral-400 italic">
                      No project folders yet
                    </div>
                  )}
                </div>
              </div>
            </nav>

            <div className="border-t border-[#E7E7E4] pt-4 space-y-1 text-xs">
              <button
                onClick={() => setActiveTab('storage')}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'storage'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <div className="flex items-center gap-3">
                  <HardDrive className="w-4 h-4" />
                  <span>Storage</span>
                </div>
                {isGoogleDriveConnected && (
                  <span className="w-2 h-2 rounded-full bg-[#19A974] ring-2 ring-emerald-100" />
                )}
              </button>

              {/* Chrome Extension Companion */}
              <button
                onClick={() => setIsExtensionPairModalOpen(true)}
                className="w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer text-[#111111] hover:bg-neutral-100 group border border-neutral-200/60 my-1"
                title="Pair Chrome Extension Companion"
              >
                <div className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-[#19A974]" />
                  <span>Extension</span>
                </div>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                  v1.1
                </span>
              </button>

              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl font-medium transition-colors cursor-pointer ${
                  activeTab === 'settings'
                    ? 'bg-[#E8F7F0] text-[#19A974]'
                    : 'text-[#6B6B6B] hover:text-[#111111] hover:bg-neutral-50'
                }`}
              >
                <Settings className="w-4 h-4" />
                <span>Settings</span>
              </button>
            </div>
          </div>

          {/* User Account / Auth at Bottom */}
          <div className="p-4 border-t border-[#E7E7E4] bg-neutral-50/50 space-y-2">
            {user ? (
              <>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-medium text-xs shrink-0">
                      {user.name ? user.name[0].toUpperCase() : 'U'}
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs font-semibold text-[#111111] truncate flex items-center gap-1.5">
                        <span className="truncate">{user.name}</span>
                        <span className="w-1.5 h-1.5 rounded-full bg-[#19A974] shrink-0" title="Active session" />
                      </div>
                      <div className="text-[10px] text-[#6B6B6B] font-mono truncate">
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="text-neutral-400 hover:text-[#111111] p-1.5 rounded-lg cursor-pointer"
                    title="Account Settings"
                  >
                    <UserIcon className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#E7E7E4]/50 text-[11px] text-[#6B6B6B]">
                  <button
                    onClick={() => setActiveTab('landing')}
                    className="hover:text-[#111111] underline cursor-pointer"
                  >
                    Landing Page
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="hover:text-red-600 flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Sign out</span>
                  </button>
                </div>
              </>
            ) : (
              <div className="space-y-2">
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="w-full py-2 px-3 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition-colors cursor-pointer"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Sign In</span>
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-y-auto">
          {/* Top Bar on Mobile */}
          <header className="px-4 py-2.5 border-b border-[#E7E7E4] bg-white flex md:hidden items-center justify-between shrink-0 sticky top-0 z-30">
            <div className="flex items-center gap-2 min-w-0">
              {selectedProjectId ? (
                <button
                  onClick={() => setSelectedProjectId(null)}
                  className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#111111] rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer shrink-0"
                >
                  <span>← All</span>
                </button>
              ) : null}
              <button
                onClick={() => {
                  setSelectedProjectId(null);
                  setActiveTab('home');
                }}
                className="cursor-pointer truncate"
              >
                <OrfiloBrand variant="horizontal" size="sm" showTagline={false} />
              </button>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={() => setIsExtensionPairModalOpen(true)}
                className="p-2 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-xl text-xs font-medium cursor-pointer"
                title="Pair Companion Extension"
                aria-label="Pair Companion Extension"
              >
                <Zap className="w-4 h-4" />
              </button>
              {user ? (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="w-8 h-8 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs cursor-pointer"
                  title={user.name || 'Account'}
                >
                  {user.name ? user.name[0].toUpperCase() : 'U'}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setAuthModalMode('signin');
                    setIsAuthModalOpen(true);
                  }}
                  className="px-2.5 py-1.5 bg-[#111111] text-white rounded-xl text-xs font-semibold cursor-pointer"
                >
                  Sign In
                </button>
              )}
            </div>
          </header>

          <main className="p-4 sm:p-6 md:p-10 pb-28 md:pb-10 max-w-6xl mx-auto w-full space-y-6 sm:space-y-8">
            {/* View: Home */}
            {activeTab === 'home' && !selectedProjectId && (
              <div className="space-y-8">
                {/* Greeting & Subtitle */}
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#111111]">
                    Good morning, {user?.name || 'Meto'}
                  </h1>
                  <p className="text-xs text-[#6B6B6B] mt-1">
                    Everything your AI creates. Organized.
                  </p>
                </div>

                {/* Large Search Input with AI Assistance */}
                <div className="space-y-3">
                  <div className="relative flex items-center">
                    <Search className="w-4 h-4 absolute left-4 text-neutral-400" />
                    <input
                      ref={searchInputRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && searchQuery.trim()) {
                          handleAskAI();
                        }
                      }}
                      placeholder="Search artifacts by name, project, extension... (Press ⌘K or / to focus)"
                      className="w-full pl-11 pr-28 py-3 bg-white border border-[#E7E7E4] hover:border-neutral-400 focus:border-[#19A974] rounded-2xl text-xs text-[#111111] placeholder:text-neutral-400 shadow-xs focus:outline-none transition-all"
                    />
                    <div className="absolute right-3 flex items-center gap-1.5">
                      {searchQuery && (
                        <button
                          onClick={() => {
                            setSearchQuery('');
                            setAiQueryResult(null);
                          }}
                          className="text-xs text-neutral-400 hover:text-black p-1 cursor-pointer mr-1"
                        >
                          ✕
                        </button>
                      )}
                      <button
                        onClick={() => handleAskAI()}
                        disabled={isAskingAI || !searchQuery.trim()}
                        className="px-3 py-1.5 bg-[#111111] hover:bg-neutral-800 disabled:opacity-40 text-white rounded-xl text-[11px] font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                        title="Search deliverables"
                      >
                        <Search className={`w-3 h-3 ${isAskingAI ? 'animate-spin' : ''}`} />
                        <span>{isAskingAI ? 'Searching...' : 'Search'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Mobile Quick Project Folder Pills Strip */}
                  <div className="flex md:hidden items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar text-xs">
                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className={`px-3 py-1.5 rounded-xl font-medium shrink-0 transition-colors cursor-pointer ${
                        !selectedProjectId
                          ? 'bg-[#111111] text-white shadow-xs'
                          : 'bg-white border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#111111]'
                      }`}
                    >
                      All Artifacts ({artifacts.length})
                    </button>
                    {projects.map((proj) => {
                      const count = artifacts.filter((a) => a.project_id === proj.id).length;
                      return (
                        <button
                          key={proj.id}
                          onClick={() => setSelectedProjectId(proj.id)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl font-medium shrink-0 border transition-colors cursor-pointer ${
                            selectedProjectId === proj.id
                              ? 'border-[#19A974] bg-[#E8F7F0] text-[#19A974] font-semibold'
                              : 'border-[#E7E7E4] bg-white text-[#6B6B6B] hover:text-[#111111]'
                          }`}
                        >
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: proj.color || '#19A974' }}
                          />
                          <span className="truncate">{proj.name}</span>
                          <span className="text-[10px] opacity-75 font-mono">({count})</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Ask AI Result Insight Banner */}
                  {aiQueryResult && (
                    <div className="bg-white border border-[#19A974]/30 rounded-2xl p-4 shadow-xs animate-in fade-in duration-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                            <Compass className="w-3.5 h-3.5" />
                          </div>
                          <span className="text-xs font-bold text-[#111111]">Orfilo Query Analysis</span>
                          <span className="text-[10px] font-mono text-[#19A974] bg-[#E8F7F0] px-1.5 py-0.2 rounded font-medium">
                            Gemini 3.8 Flash
                          </span>
                        </div>
                        <button
                          onClick={() => setAiQueryResult(null)}
                          className="text-neutral-400 hover:text-[#111111] text-xs cursor-pointer p-1"
                        >
                          ✕
                        </button>
                      </div>
                      <p className="text-xs text-[#333333] leading-relaxed">
                        {aiQueryResult.answer}
                      </p>
                      {aiQueryResult.matched_artifact_ids.length > 0 && (
                        <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#6B6B6B]">
                          <span>
                            {aiQueryResult.matched_artifact_ids.length} matching artifact(s) identified
                          </span>
                          <button
                            onClick={() => setIsExtensionPairModalOpen(true)}
                            className="text-[#19A974] hover:underline font-medium cursor-pointer"
                          >
                            Capture more via Extension →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Quick AI Connect Helper Strip */}
                  <div className="flex items-center justify-between px-1 text-[11px] text-[#6B6B6B]">
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#19A974]" />
                      <span>Ingestion Engine: <strong>Gemini 3.8 Flash</strong> active</span>
                    </div>
                    <button
                      onClick={() => setIsExtensionPairModalOpen(true)}
                      className="text-neutral-700 hover:text-emerald-700 hover:underline flex items-center gap-1.5 font-medium cursor-pointer"
                    >
                      <Zap className="w-3 h-3 text-[#19A974]" />
                      <span>Pair Chrome Extension Companion</span>
                    </button>
                  </div>
                </div>

                {/* Your Projects Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#111111]">Your Projects</h2>
                    <button
                      onClick={() => {
                        setProjectToEdit(null);
                        setIsProjectModalOpen(true);
                      }}
                      className="text-xs text-[#19A974] hover:underline flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>New project</span>
                    </button>
                  </div>

                  {projects.length === 0 ? (
                    <div className="bg-white border border-[#E7E7E4] rounded-2xl p-8 text-center space-y-3">
                      <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center mx-auto">
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-[#111111]">Create your first project</h3>
                        <p className="text-xs text-[#6B6B6B] mt-1 max-w-sm mx-auto">
                          {user
                            ? "What are you working on with AI? Create a project like 'Meto' to organize your artifacts."
                            : "Sign in with your Supabase account to load your projects or create a new one."}
                        </p>
                      </div>
                      <div className="flex items-center justify-center gap-2 pt-1">
                        {user ? (
                          <button
                            onClick={() => {
                              setProjectToEdit(null);
                              setIsProjectModalOpen(true);
                            }}
                            className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium cursor-pointer"
                          >
                            Create project
                          </button>
                        ) : (
                          <button
                            onClick={() => setIsAuthModalOpen(true)}
                            className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-medium cursor-pointer"
                          >
                            Sign in to Supabase
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {projects.map((proj) => {
                        const isDragOver = dragOverFolderId === `grid-${proj.id}`;
                        return (
                          <div
                            key={proj.id}
                            onDragOver={(e) => {
                              e.preventDefault();
                              e.dataTransfer.dropEffect = 'move';
                            }}
                            onDragEnter={(e) => {
                              e.preventDefault();
                              setDragOverFolderId(`grid-${proj.id}`);
                            }}
                            onDragLeave={(e) => {
                              if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                if (dragOverFolderId === `grid-${proj.id}`) {
                                  setDragOverFolderId(null);
                                }
                              }
                            }}
                            onDrop={(e) => {
                              e.preventDefault();
                              setDragOverFolderId(null);
                              const artifactId = e.dataTransfer.getData('text/plain');
                              if (artifactId) {
                                handleDropArtifactOnProject(artifactId, proj.id);
                              }
                            }}
                            onClick={() => setSelectedProjectId(proj.id)}
                            className={`bg-white border rounded-xl p-4 transition-all cursor-pointer group flex flex-col justify-between ${
                              isDragOver
                                ? 'border-[#19A974] ring-2 ring-[#19A974] bg-[#E8F7F0]/40 scale-[1.02]'
                                : draggingArtifact
                                ? 'border-dashed border-[#19A974]/60 hover:border-[#19A974]'
                                : 'border-[#E7E7E4] hover:border-[#19A974]'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                                style={{ backgroundColor: proj.color || '#19A974' }}
                              >
                                {isDragOver ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                              </div>
                              <span className="text-xs font-mono text-[#6B6B6B]">
                                {artifacts.filter((a) => a.project_id === proj.id).length} artifacts
                              </span>
                            </div>
                            <div className="mt-3">
                              <h3 className="text-xs font-semibold text-[#111111] group-hover:text-[#19A974] transition-colors">
                                {proj.name}
                              </h3>
                              <p className="text-[11px] text-[#6B6B6B] line-clamp-1 mt-0.5">
                                {proj.description || 'AI project workspace'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Recent Artifacts Grid */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#111111]">Recent Artifacts</h2>
                    <button
                      onClick={() => setActiveTab('artifacts')}
                      className="text-xs text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>View all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {filteredArtifacts.length === 0 ? (
                    <div className="bg-white border border-[#E7E7E4] rounded-2xl p-8 text-center space-y-2">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-500 flex items-center justify-center mx-auto">
                        <Layers className="w-5 h-5" />
                      </div>
                      <h3 className="text-sm font-semibold text-[#111111]">Your AI creates. Orfilo organizes.</h3>
                      <p className="text-xs text-[#6B6B6B] max-w-sm mx-auto">
                        Capture an artifact from Gemini, ChatGPT, or Claude to let Orfilo automatically understand and organize it.
                      </p>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="mt-2 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium cursor-pointer inline-flex items-center gap-1.5"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add an artifact</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {filteredArtifacts.slice(0, 6).map((art) => (
                        <ArtifactCard
                          key={art.id}
                          artifact={art}
                          isDragging={draggingArtifact?.id === art.id}
                          onDragStart={handleDragStart}
                          onDragEnd={handleDragEnd}
                          onClick={() => setSelectedArtifact(art)}
                        />
                      ))}
                    </div>
                  )}
                </section>

                {/* Recent Activity Mini Feed */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-sm font-semibold text-[#111111]">Recent Activity</h2>
                    <button
                      onClick={() => setActiveTab('activity')}
                      className="text-xs text-[#6B6B6B] hover:text-[#111111] flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>Full timeline</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="bg-white border border-[#E7E7E4] rounded-xl divide-y divide-[#E7E7E4]">
                    {events.slice(0, 3).map((ev) => (
                      <div key={ev.id} className="p-3.5 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <div className="w-6 h-6 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                            <Workflow className="w-3 h-3" />
                          </div>
                          <div>
                            <span className="font-medium text-[#111111]">
                              {ev.actor_type === 'ai_system' ? 'AI organized: ' : 'Saved: '}
                            </span>
                            <span className="text-[#6B6B6B] font-mono">
                              {ev.metadata.summary || `${ev.event_type} artifact`}
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] text-[#8F8F8F]">
                          {new Date(ev.created_at).toLocaleTimeString(undefined, {
                            hour: 'numeric',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {/* View: Project Detail */}
            {selectedProjectId && activeProject && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <button
                      onClick={() => setSelectedProjectId(null)}
                      className="text-xs text-[#6B6B6B] hover:text-[#111111] underline cursor-pointer"
                    >
                      ← Back to Projects
                    </button>
                    <span className="text-[#E7E7E4]">/</span>
                    <div className="flex items-center gap-2">
                      <div
                        className="w-5 h-5 rounded-md flex items-center justify-center text-white"
                        style={{ backgroundColor: activeProject.color || '#19A974' }}
                      >
                        <Folder className="w-3 h-3" />
                      </div>
                      <h1 className="text-xl font-bold text-[#111111]">{activeProject.name}</h1>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setProjectToEdit(activeProject);
                        setIsProjectModalOpen(true);
                      }}
                      className="px-3 py-1.5 border border-[#E7E7E4] hover:border-[#111111] rounded-xl text-xs font-medium text-[#111111] bg-white cursor-pointer"
                    >
                      Edit Project
                    </button>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-3.5 py-1.5 bg-[#19A974] text-white rounded-xl text-xs font-medium flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Artifact</span>
                    </button>
                  </div>
                </div>

                <p className="text-xs text-[#6B6B6B] max-w-xl">
                  {activeProject.description || 'No description provided.'}
                </p>

                {/* Filter Tabs */}
                <div className="flex gap-2 border-b border-[#E7E7E4] pb-2 text-xs">
                  {(['all', 'images', 'documents', 'presentations', 'code'] as const).map((filter) => (
                    <button
                      key={filter}
                      onClick={() => setTypeFilter(filter)}
                      className={`px-3 py-1.5 rounded-lg font-medium capitalize transition-colors cursor-pointer ${
                        typeFilter === filter
                          ? 'bg-[#111111] text-white'
                          : 'text-[#6B6B6B] hover:text-[#111111]'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>

                {/* Artifacts in Project */}
                {filteredArtifacts.length === 0 ? (
                  <div className="bg-white border border-[#E7E7E4] rounded-2xl p-12 text-center">
                    <Folder className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-[#111111]">No artifacts in this project yet</h3>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Upload an export or let Orfilo organize one here.
                    </p>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-4 px-4 py-2 bg-[#19A974] text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add artifact</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredArtifacts.map((art) => (
                      <ArtifactCard
                        key={art.id}
                        artifact={art}
                        isDragging={draggingArtifact?.id === art.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedArtifact(art)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View: Projects Overview */}
            {activeTab === 'projects' && !selectedProjectId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-xl font-bold text-[#111111]">Projects</h1>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      First-class organizational units for your AI output
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setIsProjectModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] text-white rounded-xl text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((proj) => {
                    const isDragOver = dragOverFolderId === `overview-${proj.id}`;
                    return (
                      <div
                        key={proj.id}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = 'move';
                        }}
                        onDragEnter={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(`overview-${proj.id}`);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            if (dragOverFolderId === `overview-${proj.id}`) {
                              setDragOverFolderId(null);
                            }
                          }
                        }}
                        onDrop={(e) => {
                          e.preventDefault();
                          setDragOverFolderId(null);
                          const artifactId = e.dataTransfer.getData('text/plain');
                          if (artifactId) {
                            handleDropArtifactOnProject(artifactId, proj.id);
                          }
                        }}
                        onClick={() => setSelectedProjectId(proj.id)}
                        className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group ${
                          isDragOver
                            ? 'border-[#19A974] ring-2 ring-[#19A974] bg-[#E8F7F0]/40 scale-[1.02]'
                            : draggingArtifact
                            ? 'border-dashed border-[#19A974]/60 hover:border-[#19A974]'
                            : 'border-[#E7E7E4] hover:border-[#19A974]'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white"
                              style={{ backgroundColor: proj.color || '#19A974' }}
                            >
                              {isDragOver ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                            </div>
                            <span className="font-mono text-xs px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                              {artifacts.filter((a) => a.project_id === proj.id).length} artifacts
                            </span>
                          </div>
                          <h2 className="text-sm font-bold text-[#111111] group-hover:text-[#19A974] transition-colors">
                            {proj.name}
                          </h2>
                          <p className="text-xs text-[#6B6B6B] mt-1 line-clamp-2 leading-relaxed">
                            {proj.description || 'AI workspace project.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-[#8F8F8F]">
                          <span>Updated recently</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* View: All Artifacts */}
            {activeTab === 'artifacts' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-xl font-bold text-[#111111]">All Artifacts</h1>
                    <p className="text-xs text-[#6B6B6B] mt-0.5">
                      Search, view, and inspect every file your AI has created
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-4 py-2 bg-[#19A974] text-white rounded-xl text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Artifact</span>
                    </button>
                  </div>
                </div>

                {/* Search Bar & Type Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, description, project, purpose, or AI..."
                      className="w-full pl-9 pr-4 py-2 bg-white border border-[#E7E7E4] rounded-xl text-xs focus:outline-none focus:border-[#19A974]"
                    />
                  </div>

                  <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-xs">
                    {(['all', 'images', 'documents', 'presentations', 'code'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTypeFilter(filter)}
                        className={`px-3 py-1.5 rounded-xl font-medium capitalize transition-colors cursor-pointer ${
                          typeFilter === filter
                            ? 'bg-[#111111] text-white'
                            : 'bg-white border border-[#E7E7E4] text-[#6B6B6B] hover:text-[#111111]'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Artifacts Grid */}
                {filteredArtifacts.length === 0 ? (
                  <div className="bg-white border border-[#E7E7E4] rounded-2xl p-12 text-center">
                    <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-[#111111]">Nothing matched that search</h3>
                    <p className="text-xs text-[#6B6B6B] mt-1">
                      Try different keywords or upload a new artifact.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {filteredArtifacts.map((art) => (
                      <ArtifactCard
                        key={art.id}
                        artifact={art}
                        isDragging={draggingArtifact?.id === art.id}
                        onDragStart={handleDragStart}
                        onDragEnd={handleDragEnd}
                        onClick={() => setSelectedArtifact(art)}
                        highlightMatch={Boolean(
                          aiQueryResult?.matched_artifact_ids.includes(art.id)
                        )}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* View: Integrations Hub */}
            {activeTab === 'integrations' && (
              <IntegrationHubView
                projects={projects}
                onArtifactCreated={handleArtifactCreated}
                onOpenUpload={() => setIsUploadOpen(true)}
                onOpenExtensionModal={() => setIsExtensionPairModalOpen(true)}
                onOpenStorage={() => setActiveTab('storage')}
              />
            )}

            {/* View: Activity */}
            {activeTab === 'activity' && <ActivityView events={events} onRefresh={loadWorkspaceData} />}

            {/* View: Storage */}
            {activeTab === 'storage' && <StorageSettingsView currentUser={user} />}

            {/* View: Settings */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div>
                  <h1 className="text-xl font-bold text-[#111111]">Workspace Settings</h1>
                  <p className="text-xs text-[#6B6B6B] mt-0.5">
                    Supabase connection, Row Level Security status, and environment variables
                  </p>
                </div>

                {/* Supabase Status Card */}
                <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isSupabaseConfigured ? 'bg-[#E8F7F0] text-[#19A974]' : 'bg-amber-50 text-amber-600'}`}>
                        <Database className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-[#111111]">Supabase PostgreSQL Backend</h2>
                        <p className="text-xs text-[#6B6B6B]">
                          {isSupabaseConfigured ? 'Active & Connected' : 'Missing Credentials (Dev Sandbox Active)'}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => setIsSetupModalOpen(true)}
                      className="px-3 py-1.5 border border-[#E7E7E4] hover:border-[#111111] rounded-xl text-xs font-medium text-[#111111] bg-white cursor-pointer"
                    >
                      View Config Details
                    </button>
                  </div>

                  <div className="pt-3 border-t border-[#E7E7E4] text-xs space-y-2">
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Row Level Security (RLS):</span>
                      <span className="font-medium text-[#111111]">Hardened (User-scoped only)</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Tables Defined:</span>
                      <span className="font-mono text-[#111111]">users, projects, storage_connections, artifacts, artifact_embeddings, file_events</span>
                    </div>
                    <div className="flex justify-between text-[#6B6B6B]">
                      <span>Service Role Key Exposure:</span>
                      <span className="text-[#19A974] font-medium">Protected (Server-side only)</span>
                    </div>
                  </div>
                </div>

                {/* Google Drive Status */}
                <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <HardDrive className="w-5 h-5 text-neutral-600" />
                      <div>
                        <h2 className="text-sm font-semibold text-[#111111]">Google Drive StorageProvider</h2>
                        <p className="text-xs text-[#6B6B6B]">
                          {isGoogleDriveConnected ? 'Connected & Active (OAuth)' : 'Not Connected'}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setActiveTab('storage')}
                      className="text-xs text-[#19A974] hover:underline cursor-pointer"
                    >
                      Manage
                    </button>
                  </div>
                </div>

                {/* Companion Extension & Ingestion Hub */}
                <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                        <Cpu className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h2 className="text-sm font-semibold text-[#111111]">Companion Extension & Ingestion</h2>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-200">
                            v1.1 Active
                          </span>
                        </div>
                        <p className="text-xs text-[#6B6B6B]">
                          Captures deliverables directly from ChatGPT, Claude, Gemini, and v0
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExtensionPairModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-xs transition-colors"
                    >
                      Pair Extension
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Modals & Drawers */}
      <UploadArtifactModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        projects={projects}
        currentUser={user}
        onRequireAuth={() => setIsAuthModalOpen(true)}
        onArtifactCreated={handleArtifactCreated}
      />

      <ArtifactDetailDrawer
        artifact={selectedArtifact}
        projects={projects}
        onClose={() => setSelectedArtifact(null)}
        onArtifactUpdated={handleArtifactUpdated}
        onArtifactDeleted={handleArtifactDeleted}
      />

      <ProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => {
          setIsProjectModalOpen(false);
          setProjectToEdit(null);
        }}
        projectToEdit={projectToEdit}
        currentUser={user}
        onRequireAuth={() => setIsAuthModalOpen(true)}
        onProjectSaved={handleProjectSaved}
        onProjectDeleted={handleProjectDeleted}
      />

      <SupabaseSetupModal
        isOpen={isSetupModalOpen}
        onClose={() => setIsSetupModalOpen(false)}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onAuthSuccess={(authedUser) => {
          setUser(authedUser);
          loadWorkspaceData();
        }}
      />

      <ExtensionPairModal
        isOpen={isExtensionPairModalOpen}
        onClose={() => setIsExtensionPairModalOpen(false)}
        projects={projects}
        onArtifactCreated={handleArtifactCreated}
      />

      {/* Floating Dragging Indicator */}
      {draggingArtifact && (
        <aside
          aria-label="Drag feedback"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#111111] text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-3 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 pointer-events-none max-w-[90vw]"
        >
          <div className="w-6 h-6 rounded-lg bg-[#19A974] flex items-center justify-center text-white shrink-0">
            <FolderOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs truncate">
            <span className="font-semibold text-emerald-400">Moving artifact:</span>{' '}
            <span className="font-mono text-neutral-200 truncate">{draggingArtifact.display_name}</span>
            <span className="text-neutral-400 ml-1.5 hidden sm:inline">
              → Drop into any project folder
            </span>
          </div>
        </aside>
      )}

      {/* Toast Notification with Undo */}
      {moveToast && (
        <aside
          aria-label="Notification toast"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-white border border-[#19A974]/40 shadow-xl rounded-2xl p-4 flex items-center gap-3 max-w-[calc(100vw-2rem)] sm:max-w-md animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="w-8 h-8 rounded-xl bg-[#E8F7F0] text-[#19A974] flex items-center justify-center shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-semibold text-[#111111]">Artifact Moved</div>
            <div className="text-[#6B6B6B] truncate">
              <span className="font-mono font-medium text-neutral-800">{moveToast.artifactName}</span>
              {' → '}
              <span className="font-medium text-[#19A974]">{moveToast.targetProjectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {moveToast.previousProjectId !== null && (
              <button
                onClick={handleUndoMove}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-[#111111] text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Undo
              </button>
            )}
            <button
              onClick={() => setMoveToast(null)}
              className="text-neutral-400 hover:text-black p-1 text-xs cursor-pointer"
            >
              ✕
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Bottom Navigation Menu */}
      <MobileBottomNav
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenAIModal={() => setIsExtensionPairModalOpen(true)}
        selectedProjectId={selectedProjectId}
        onSelectProject={setSelectedProjectId}
        projects={projects}
        artifactsCount={artifacts.length}
        user={user}
        onOpenAuth={() => {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }}
        onSignOut={handleSignOut}
      />
    </div>
  );
}
