import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Home,
  Folder,
  Layers,
  Search,
  Activity,
  Settings,
  Plus,
  Puzzle,
  Zap,
  FolderInput,
  FolderOpen,
  FolderPlus,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  LogOut,
  User as UserIcon,
  ChevronRight,
  RefreshCw,
  Clock,
  Eye,
  CheckCircle,
  LogIn,
  Download,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { OrfiloBrand, OrfiloIcon } from './components/OrfiloBrand.tsx';
import { UploadArtifactModal } from './components/UploadArtifactModal.tsx';
import { ArtifactDetailDrawer } from './components/ArtifactDetailDrawer.tsx';
import { ArtifactCard } from './components/ArtifactCard.tsx';
import { ProjectModal } from './components/ProjectModal.tsx';
import { AuthModal } from './components/AuthModal.tsx';
import { ActivityView } from './components/ActivityView.tsx';
import { LandingPageView } from './components/LandingPageView.tsx';
import { AuthPageView } from './components/AuthPageView.tsx';
import { ExtensionPairModal } from './components/ExtensionPairModal.tsx';
import { MobileBottomNav } from './components/MobileBottomNav.tsx';
import { db } from './lib/supabase/db.ts';
import { createBrowserClient } from './lib/supabase/client.ts';
import { Project, Artifact, FileEvent, User } from './types/index.ts';

type NavigationTab = 'home' | 'projects' | 'artifacts' | 'activity' | 'settings' | 'landing';
type DeliverableType = 'all' | 'images' | 'documents' | 'presentations' | 'code';

export default function App() {
  // 1. Core State
  const [activeTab, setActiveTab] = useState<NavigationTab>('home');
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [events, setEvents] = useState<FileEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [globalError, setGlobalError] = useState<string | null>(null);

  // 2. Navigation, Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<DeliverableType>('all');
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedSubfolder, setSelectedSubfolder] = useState<string | null>(null);

  // 3. Modals & Dialogs
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [selectedArtifact, setSelectedArtifact] = useState<Artifact | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signin');
  const [authView, setAuthView] = useState<'signin' | 'signup' | null>(() => {
    if (typeof window === 'undefined') return null;
    const path = window.location.pathname.toLowerCase();
    const hash = window.location.hash.toLowerCase();
    if (path === '/signin' || path === '/login' || hash === '#signin' || hash === '#login') return 'signin';
    if (path === '/signup' || path === '/register' || hash === '#signup' || hash === '#register') return 'signup';
    return null;
  });
  const [isExtensionPairModalOpen, setIsExtensionPairModalOpen] = useState(false);

  const navigateToAuth = (mode: 'signin' | 'signup') => {
    setAuthView(mode);
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState(null, '', `/${mode}`);
    }
  };

  const navigateToHome = () => {
    setAuthView(null);
    if (typeof window !== 'undefined' && window.history && window.history.pushState) {
      window.history.pushState(null, '', '/');
    }
  };

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      const hash = window.location.hash.toLowerCase();
      if (path === '/signin' || path === '/login' || hash === '#signin' || hash === '#login') {
        setAuthView('signin');
      } else if (path === '/signup' || path === '/register' || hash === '#signup' || hash === '#register') {
        setAuthView('signup');
      } else if (path === '/' && (!hash || hash === '#')) {
        setAuthView(null);
      }
    };
    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // 4. Drag & Drop & Toast
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

  const searchInputRef = useRef<HTMLInputElement>(null);

  // 5. Global Keyboard Shortcuts (⌘K to focus search, Esc to dismiss modals)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      } else if (e.key === '/') {
        if (
          document.activeElement?.tagName !== 'INPUT' &&
          document.activeElement?.tagName !== 'TEXTAREA'
        ) {
          e.preventDefault();
          searchInputRef.current?.focus();
        }
      } else if (e.key === 'Escape') {
        setSelectedArtifact(null);
        setIsUploadOpen(false);
        setIsProjectModalOpen(false);
        setIsExtensionPairModalOpen(false);
        setIsAuthModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 6. Handle Extension URL Actions
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('action') === 'pair-extension') {
        if (user) {
          setIsExtensionPairModalOpen(true);
        } else if (params.get('auth_provider') === 'google') {
          const client = createBrowserClient();
          if (client) {
            client.auth.signInWithOAuth({
              provider: 'google',
              options: {
                redirectTo: `${window.location.origin}/?action=pair-extension`,
                queryParams: {
                  access_type: 'offline',
                  prompt: 'select_account',
                },
              },
            });
          }
        } else {
          setAuthModalMode('signin');
          setIsAuthModalOpen(true);
        }
      }
    }
  }, [user]);

  // 7. Load Workspace Data
  const loadWorkspaceData = async () => {
    setIsLoading(true);
    setGlobalError(null);
    try {
      const currentUser = await db.getCurrentUser();
      setUser(currentUser);

      if (currentUser) {
        const [projList, artList, eventList] = await Promise.all([
          db.getProjects().catch(() => []),
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
    } catch (err: any) {
      console.warn('[Orfilo] Data loading warning:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaceData();

    const client = createBrowserClient();
    if (client) {
      const {
        data: { subscription },
      } = client.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const profile: User = {
            id: session.user.id,
            email: session.user.email || '',
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User',
            avatar_url: session.user.user_metadata?.avatar_url || null,
            created_at: session.user.created_at,
            updated_at: new Date().toISOString(),
          };
          setUser(profile);

          const [projList, artList, eventList] = await Promise.all([
            db.getProjects().catch(() => []),
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

      const onFocus = () => loadWorkspaceData();
      window.addEventListener('focus', onFocus);

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('focus', onFocus);
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
    navigateToHome();
  };

  // 8. Deliverable & Project Handlers
  const handleArtifactCreated = (newArt: Artifact) => {
    setArtifacts((prev) => [newArt, ...prev]);
    db.getEvents().then(setEvents);
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
    setArtifacts((prev) =>
      prev.map((a) => (a.project_id === deletedId ? { ...a, project_id: null, project: undefined } : a))
    );
  };

  // 9. Drag & Drop Move Handlers
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
      setTimeout(() => setMoveToast(null), 3000);
      return;
    }

    const previousProjectId = artifact.project_id;
    const previousPath = artifact.provider_path || null;
    const newLocationPath = `${targetProject.name} / ${artifact.metadata?.category || 'General'}`;

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
      await db.updateArtifact(artifactId, {
        project_id: targetProjectId,
        provider_path: newLocationPath,
      });
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
      console.error('[Orfilo] Move error:', err);
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
      await db.updateArtifact(artifactId, {
        project_id: previousProjectId,
        provider_path: restoredPath,
      });
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

  // 10. Memoized Queries & Filters
  const activeProject = useMemo(() => {
    return projects.find((p) => p.id === selectedProjectId) || null;
  }, [projects, selectedProjectId]);

  const projectArtifacts = useMemo(() => {
    if (!selectedProjectId) return [];
    return artifacts.filter((a) => a.project_id === selectedProjectId);
  }, [artifacts, selectedProjectId]);

  const projectSubfolders = useMemo(() => {
    if (!selectedProjectId) return [];
    const map = new Map<string, number>();
    projectArtifacts.forEach((a) => {
      const sub = (a.metadata?.subfolder as string) || (a.metadata?.category as string) || 'General';
      map.set(sub, (map.get(sub) || 0) + 1);
    });
    return Array.from(map.entries()).map(([name, count]) => ({ name, count }));
  }, [projectArtifacts, selectedProjectId]);

  const filteredArtifacts = useMemo(() => {
    let list = artifacts;

    if (selectedProjectId) {
      list = list.filter((a) => a.project_id === selectedProjectId);
    }

    if (selectedSubfolder) {
      list = list.filter((a) => {
        const sub = (a.metadata?.subfolder as string) || (a.metadata?.category as string) || 'General';
        return sub.toLowerCase() === selectedSubfolder.toLowerCase();
      });
    }

    if (typeFilter !== 'all') {
      list = list.filter((a) => {
        const ext = (a.extension || '').toLowerCase();
        if (typeFilter === 'images') return ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
        if (typeFilter === 'documents') return ['pdf', 'docx', 'doc', 'txt', 'md', 'gdoc', 'gsheet', 'gslides'].includes(ext);
        if (typeFilter === 'presentations') return ['pptx', 'ppt', 'key'].includes(ext);
        if (typeFilter === 'code') return ['ts', 'tsx', 'js', 'json', 'py', 'sql', 'html', 'css'].includes(ext);
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
          (a.metadata?.subfolder && a.metadata.subfolder.toLowerCase().includes(q)) ||
          (a.metadata?.keywords && a.metadata.keywords.some((k) => k.toLowerCase().includes(q)))
      );
    }

    return list;
  }, [artifacts, selectedProjectId, selectedSubfolder, typeFilter, searchQuery]);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FAFAF9] flex items-center justify-center antialiased">
        <div className="flex flex-col items-center gap-3">
          <OrfiloIcon size={36} />
          <div className="flex items-center gap-2 text-xs text-neutral-500 font-mono">
            <span>Loading workspace...</span>
          </div>
        </div>
      </div>
    );
  }

  // Unauthenticated -> Dedicated Auth Page or Landing Page
  if (!user) {
    if (authView) {
      return (
        <AuthPageView
          initialMode={authView}
          onAuthSuccess={async (authenticatedUser) => {
            setUser(authenticatedUser);
            navigateToHome();
            await loadWorkspaceData();
          }}
          onBackToHome={navigateToHome}
        />
      );
    }

    return (
      <>
        <LandingPageView
          onSignIn={() => navigateToAuth('signin')}
          onSignUp={() => navigateToAuth('signup')}
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

  // Landing Page Preview for logged-in users
  if (activeTab === 'landing') {
    return (
      <LandingPageView
        onSignIn={() => setActiveTab('home')}
        onSignUp={() => setActiveTab('home')}
        isLoggedIn={true}
        onReturnToDashboard={() => setActiveTab('home')}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-neutral-900 flex antialiased selection:bg-[#E8F7F0] selection:text-[#19A974]">
      {/* Global Error Banner */}
      {globalError && (
        <aside aria-label="Global Error" className="fixed top-0 left-0 right-0 z-50 bg-red-50 border-b border-red-200/80 px-4 py-2 text-xs text-red-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 text-red-600 shrink-0" />
            <span>{globalError}</span>
          </div>
          <button onClick={() => setGlobalError(null)} className="text-red-600 hover:text-red-950 font-bold p-1">
            ✕
          </button>
        </aside>
      )}

      {/* Desktop Sidebar Navigation (Full Height) */}
      <aside className="w-64 border-r border-neutral-200/80 bg-white flex flex-col justify-between shrink-0 hidden md:flex h-screen sticky top-0 z-30">
        <div className="p-4 space-y-5 overflow-y-auto">
          {/* Brand header at top of sidebar */}
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedSubfolder(null);
                setActiveTab('home');
              }}
              className="flex items-center gap-2.5 cursor-pointer text-left"
            >
              <OrfiloIcon size={24} />
              <span className="font-semibold text-sm tracking-tight text-neutral-900">Orfilo</span>
            </button>

            <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
              v2.0
            </span>
          </div>

          {/* Primary Nav Links (Better Auth Segmented Style) */}
          <nav className="space-y-1 text-xs">
            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedSubfolder(null);
                setActiveTab('home');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'home' && !selectedProjectId
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Home className="w-4 h-4 text-neutral-500" />
              <span>Home</span>
            </button>

            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedSubfolder(null);
                setActiveTab('projects');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'projects' && !selectedProjectId
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Folder className="w-4 h-4 text-neutral-500" />
                <span>Projects</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                {projects.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedSubfolder(null);
                setActiveTab('artifacts');
              }}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'artifacts'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Layers className="w-4 h-4 text-neutral-500" />
                <span>All Artifacts</span>
              </div>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-600">
                {artifacts.length}
              </span>
            </button>

            <button
              onClick={() => {
                setSelectedProjectId(null);
                setSelectedSubfolder(null);
                setActiveTab('activity');
              }}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-xl font-medium transition-all cursor-pointer ${
                activeTab === 'activity'
                  ? 'bg-neutral-100 text-neutral-900 font-semibold'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
              }`}
            >
              <Activity className="w-4 h-4 text-neutral-500" />
              <span>Activity</span>
            </button>
          </nav>

          {/* Project Folders Tree with Drag & Drop */}
          <div className="pt-3 border-t border-neutral-100">
            <div className="flex items-center justify-between px-2 py-1 mb-1 text-[10px] font-semibold text-neutral-400 uppercase tracking-wider font-mono">
              <span>Project Folders</span>
              <button
                onClick={() => {
                  setProjectToEdit(null);
                  setIsProjectModalOpen(true);
                }}
                className="p-1 rounded hover:bg-neutral-100 text-neutral-400 hover:text-neutral-900 cursor-pointer"
                title="Create Project"
              >
                <Plus className="w-3 h-3" />
              </button>
            </div>

            {draggingArtifact && (
              <div className="mx-1 mb-1.5 px-2 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-[10px] text-emerald-800 font-medium flex items-center gap-1.5 animate-pulse">
                <FolderInput className="w-3 h-3 shrink-0" />
                <span className="truncate">Drop into folder to move</span>
              </div>
            )}

            <div className="space-y-0.5 max-h-56 overflow-y-auto pr-0.5">
              {projects.map((proj) => {
                const isSelected = selectedProjectId === proj.id;
                const isDragOver = dragOverFolderId === proj.id;
                const count = artifacts.filter((a) => a.project_id === proj.id).length;

                return (
                  <div key={proj.id} className="space-y-0.5">
                    <div
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
                        if (selectedProjectId !== proj.id) {
                          setSelectedSubfolder(null);
                        }
                        setSelectedProjectId(proj.id);
                        setActiveTab('projects');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer select-none ${
                        isDragOver
                          ? 'bg-[#E8F7F0] ring-2 ring-[#19A974] text-[#19A974] font-semibold'
                          : isSelected
                          ? 'bg-neutral-100 text-neutral-900 font-semibold'
                          : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50'
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span
                          className="w-2 h-2 rounded-full shrink-0"
                          style={{ backgroundColor: proj.color || '#19A974' }}
                        />
                        <span className="truncate">{proj.name}</span>
                      </div>

                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-neutral-100 text-neutral-500 shrink-0">
                        {count}
                      </span>
                    </div>

                    {/* Nested Subfolders if Project Selected */}
                    {isSelected && projectSubfolders.length > 0 && (
                      <div className="ml-4 my-0.5 pl-2 border-l border-neutral-200 space-y-0.5">
                        {projectSubfolders.map(({ name: subName, count: subCount }) => {
                          const isSubActive = selectedSubfolder === subName;
                          return (
                            <div
                              key={subName}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedSubfolder(isSubActive ? null : subName);
                                setActiveTab('projects');
                              }}
                              className={`flex items-center justify-between px-2 py-1 rounded-lg text-[11px] transition-colors cursor-pointer ${
                                isSubActive
                                  ? 'bg-[#19A974] text-white font-semibold'
                                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                              }`}
                            >
                              <span className="truncate">{subName}</span>
                              <span
                                className={`text-[9px] font-mono px-1 rounded ${
                                  isSubActive ? 'bg-white/20 text-white' : 'bg-neutral-100 text-neutral-500'
                                }`}
                              >
                                {subCount}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}

              {projects.length === 0 && (
                <div className="px-2 py-2 text-[11px] text-neutral-400 italic">
                  No projects yet
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Bottom: Settings & User Account */}
        <div className="p-3 border-t border-neutral-200/80 bg-neutral-50/50 space-y-2 text-xs">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-2.5 px-2.5 py-1.5 rounded-xl font-medium transition-colors cursor-pointer ${
              activeTab === 'settings'
                ? 'bg-neutral-100 text-neutral-900'
                : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100/60'
            }`}
          >
            <Settings className="w-3.5 h-3.5 text-neutral-500" />
            <span>Workspace Settings</span>
          </button>

          <div className="flex items-center justify-between px-2.5 pt-1 border-t border-neutral-200/50 text-[11px] text-neutral-500">
            <button
              onClick={() => setActiveTab('landing')}
              className="hover:text-neutral-900 cursor-pointer"
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
        </div>
      </aside>

      {/* Right Column: Header + Main Content */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen overflow-x-hidden">
        {/* Sticky Top Header Bar */}
        <header className="h-14 border-b border-neutral-200/80 bg-white/80 backdrop-blur-md px-6 sm:px-8 flex items-center justify-between shrink-0 sticky top-0 z-20">
          {/* Mobile brand (shown only on mobile when sidebar is hidden) */}
          <div className="flex md:hidden items-center gap-2">
            <OrfiloIcon size={22} />
            <span className="font-semibold text-sm tracking-tight text-neutral-900">Orfilo</span>
          </div>

          {/* Search / Command Bar (Left-aligned, perfectly matching content below) */}
          <div className="w-full max-w-md hidden sm:block">
            <div className="relative flex items-center">
              <Search className="w-3.5 h-3.5 absolute left-3 text-neutral-400" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search deliverables, projects, subfolders..."
                className="w-full pl-8 pr-12 py-1.5 bg-neutral-100/70 hover:bg-neutral-100 focus:bg-white border border-neutral-200/70 focus:border-[#19A974] rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:ring-1 focus:ring-[#19A974] transition-all"
              />
              <div className="absolute right-2.5 flex items-center gap-1">
                {searchQuery ? (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="text-neutral-400 hover:text-neutral-900 p-0.5 cursor-pointer text-xs"
                  >
                    ✕
                  </button>
                ) : (
                  <kbd className="px-1.5 py-0.5 text-[10px] font-mono text-neutral-400 bg-white border border-neutral-200 rounded shadow-2xs">
                    ⌘K
                  </kbd>
                )}
              </div>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsExtensionPairModalOpen(true)}
              className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer shadow-2xs"
              title="Pair Extension"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
              <Puzzle className="w-3.5 h-3.5 text-neutral-500" />
              <span>Extension</span>
            </button>

            <button
              onClick={() => {
                setProjectToEdit(null);
                setIsProjectModalOpen(true);
              }}
              className="hidden lg:inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200/80 bg-white hover:bg-neutral-50 text-xs font-medium text-neutral-700 transition-colors cursor-pointer shadow-2xs"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>New Project</span>
            </button>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Artifact</span>
            </button>

            {/* User Profile */}
            <div className="ml-1 pl-2 border-l border-neutral-200/80 flex items-center">
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="w-7 h-7 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-xs cursor-pointer shadow-2xs"
                title={user.email}
              >
                {user.name ? user.name[0].toUpperCase() : 'U'}
              </button>
            </div>
          </div>
        </header>

        {/* Main Content Viewport */}
        <main className="px-6 sm:px-8 py-6 pb-24 md:pb-8 w-full space-y-6">
            {/* VIEW 1: HOME / OVERVIEW */}
            {activeTab === 'home' && !selectedProjectId && (
              <div className="space-y-6">
                {/* Greeting Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
                  <div>
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                      Welcome, {user.name}
                    </h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Everything your AI creates. Organized into clean project workspaces.
                    </p>
                  </div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white border border-neutral-200/80 text-xs font-medium text-neutral-700 shadow-2xs">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span>Gemini Ingestion Engine Active</span>
                  </div>
                </div>

                {/* Mobile Search input */}
                <div className="block sm:hidden">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search deliverables..."
                      className="w-full pl-9 pr-3 py-2 bg-white border border-neutral-200 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Projects Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-neutral-900">Projects</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                        {projects.length}
                      </span>
                    </div>
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
                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 text-center space-y-3 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center mx-auto">
                        <Folder className="w-5 h-5 text-[#19A974]" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-neutral-900">Create your first project</h3>
                        <p className="text-xs text-neutral-500 mt-1 max-w-sm mx-auto">
                          Create a project workspace like &quot;Habesha Model&quot; or &quot;Repodx&quot; to organize deliverables.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setProjectToEdit(null);
                          setIsProjectModalOpen(true);
                        }}
                        className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium cursor-pointer shadow-2xs"
                      >
                        Create project
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                      {projects.map((proj) => {
                        const isDragOver = dragOverFolderId === `grid-${proj.id}`;
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
                            onClick={() => {
                              setSelectedProjectId(proj.id);
                              setSelectedSubfolder(null);
                              setActiveTab('projects');
                            }}
                            className={`bg-white border rounded-2xl p-4 transition-all cursor-pointer group flex flex-col justify-between shadow-2xs ${
                              isDragOver
                                ? 'border-[#19A974] ring-2 ring-[#19A974] bg-[#E8F7F0]/40 scale-[1.01]'
                                : draggingArtifact
                                ? 'border-dashed border-[#19A974]/60 hover:border-[#19A974]'
                                : 'border-neutral-200/80 hover:border-neutral-300'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div
                                className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-2xs"
                                style={{ backgroundColor: proj.color || '#19A974' }}
                              >
                                {isDragOver ? <FolderOpen className="w-4 h-4" /> : <Folder className="w-4 h-4" />}
                              </div>
                              <span className="text-[11px] font-mono text-neutral-500">
                                {count} {count === 1 ? 'artifact' : 'artifacts'}
                              </span>
                            </div>

                            <div className="mt-3">
                              <h3 className="text-xs font-semibold text-neutral-900 group-hover:text-[#19A974] transition-colors">
                                {proj.name}
                              </h3>
                              <p className="text-[11px] text-neutral-500 line-clamp-1 mt-0.5">
                                {proj.description || 'Workspace project'}
                              </p>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Recent Artifacts Section */}
                <section className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <h2 className="text-sm font-semibold text-neutral-900">Recent Deliverables</h2>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                        {artifacts.length}
                      </span>
                    </div>
                    <button
                      onClick={() => setActiveTab('artifacts')}
                      className="text-xs text-neutral-500 hover:text-neutral-900 flex items-center gap-1 font-medium cursor-pointer"
                    >
                      <span>View all</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {filteredArtifacts.length === 0 ? (
                    <div className="bg-white border border-neutral-200/80 rounded-2xl p-8 text-center space-y-2 shadow-2xs">
                      <div className="w-10 h-10 rounded-xl bg-neutral-100 text-neutral-600 flex items-center justify-center mx-auto">
                        <Layers className="w-5 h-5 text-[#19A974]" />
                      </div>
                      <h3 className="text-sm font-semibold text-neutral-900">No deliverables captured yet</h3>
                      <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                        Use the companion extension or upload a file to automatically categorize it.
                      </p>
                      <button
                        onClick={() => setIsUploadOpen(true)}
                        className="mt-2 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium cursor-pointer inline-flex items-center gap-1.5 shadow-2xs"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add an artifact</span>
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
                      {filteredArtifacts.slice(0, 8).map((art) => (
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
              </div>
            )}

            {/* VIEW 2: PROJECT DETAIL & SUBFOLDER EXPLORER */}
            {selectedProjectId && activeProject && (
              <div className="space-y-6">
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-neutral-200/80">
                  <div>
                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 mb-2">
                      <button
                        onClick={() => {
                          setSelectedProjectId(null);
                          setSelectedSubfolder(null);
                        }}
                        className="hover:text-neutral-900 transition-colors cursor-pointer"
                      >
                        Projects
                      </button>
                      <ChevronRight className="w-3 h-3 text-neutral-400" />
                      <button
                        onClick={() => setSelectedSubfolder(null)}
                        className={`hover:text-neutral-900 transition-colors cursor-pointer ${
                          !selectedSubfolder ? 'font-semibold text-neutral-900' : 'text-neutral-500'
                        }`}
                      >
                        {activeProject.name}
                      </button>
                      {selectedSubfolder && (
                        <>
                          <ChevronRight className="w-3 h-3 text-neutral-400" />
                          <span className="font-semibold text-[#19A974] flex items-center gap-1">
                            <Folder className="w-3 h-3" />
                            <span>{selectedSubfolder}</span>
                          </span>
                        </>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                        style={{ backgroundColor: activeProject.color || '#19A974' }}
                      >
                        <Folder className="w-5 h-5" />
                      </div>
                      <div>
                        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-neutral-900">
                          {activeProject.name}
                        </h1>
                        <p className="text-xs text-neutral-500 mt-0.5 max-w-xl">
                          {activeProject.description || 'Deliverables organized in this project workspace'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setProjectToEdit(activeProject);
                        setIsProjectModalOpen(true);
                      }}
                      className="px-3.5 py-1.5 border border-neutral-200/80 hover:border-neutral-300 rounded-xl text-xs font-medium text-neutral-800 bg-white transition-colors cursor-pointer shadow-2xs"
                    >
                      Edit Project
                    </button>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="px-3.5 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Artifact</span>
                    </button>
                  </div>
                </div>

                {/* Subfolder Explorer Grid (Better Auth Style) */}
                {projectSubfolders.length > 0 && (
                  <div className="space-y-2.5 bg-white border border-neutral-200/80 rounded-2xl p-4 shadow-2xs">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold text-neutral-900 uppercase font-mono tracking-wider flex items-center gap-1.5">
                          <Folder className="w-3.5 h-3.5 text-[#19A974]" />
                          <span>Subfolders</span>
                        </span>
                        <span className="text-[11px] text-neutral-400 font-mono">
                          ({projectSubfolders.length} folder{projectSubfolders.length === 1 ? '' : 's'})
                        </span>
                      </div>
                      {selectedSubfolder && (
                        <button
                          onClick={() => setSelectedSubfolder(null)}
                          className="text-xs font-medium text-[#19A974] hover:underline cursor-pointer"
                        >
                          View all subfolders
                        </button>
                      )}
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                      {/* All Files card */}
                      <button
                        onClick={() => setSelectedSubfolder(null)}
                        className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                          selectedSubfolder === null
                            ? 'bg-neutral-900 border-neutral-900 text-white shadow-xs'
                            : 'bg-neutral-50/70 border-neutral-200/80 hover:border-neutral-300 text-neutral-900'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Folder className={`w-4 h-4 ${selectedSubfolder === null ? 'text-[#19A974]' : 'text-neutral-500'}`} />
                          <span
                            className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                              selectedSubfolder === null ? 'bg-white/20 text-white' : 'bg-neutral-200/60 text-neutral-700'
                            }`}
                          >
                            {projectArtifacts.length}
                          </span>
                        </div>
                        <span className="text-xs font-semibold truncate">All Files</span>
                        <span className={`text-[10px] truncate ${selectedSubfolder === null ? 'text-neutral-300' : 'text-neutral-400'}`}>
                          All subfolders
                        </span>
                      </button>

                      {/* Subfolder Cards */}
                      {projectSubfolders.map(({ name, count }) => {
                        const isSelected = selectedSubfolder === name;
                        return (
                          <button
                            key={name}
                            onClick={() => setSelectedSubfolder(isSelected ? null : name)}
                            className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                              isSelected
                                ? 'bg-[#19A974] border-[#19A974] text-white shadow-xs'
                                : 'bg-neutral-50/70 border-neutral-200/80 hover:border-neutral-300 text-neutral-900'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-2">
                              <Folder className={`w-4 h-4 ${isSelected ? 'text-white' : 'text-[#19A974]'}`} />
                              <span
                                className={`text-[10px] font-mono px-1.5 py-0.2 rounded font-semibold ${
                                  isSelected ? 'bg-white/20 text-white' : 'bg-neutral-200/60 text-neutral-700'
                                }`}
                              >
                                {count}
                              </span>
                            </div>
                            <span className="text-xs font-semibold truncate">{name}</span>
                            <span className={`text-[10px] truncate ${isSelected ? 'text-white/80' : 'text-neutral-400'}`}>
                              {count} {count === 1 ? 'file' : 'files'}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Filter Tabs (Segmented Control Pill Style) */}
                <div className="p-1 bg-neutral-200/60 rounded-xl flex items-center gap-1 w-fit overflow-x-auto text-xs">
                  {(['all', 'images', 'documents', 'presentations', 'code'] as const).map((filter) => {
                    const count = artifacts.filter((a) => {
                      if (a.project_id !== selectedProjectId) return false;
                      if (selectedSubfolder) {
                        const sub = (a.metadata?.subfolder as string) || (a.metadata?.category as string) || 'General';
                        if (sub.toLowerCase() !== selectedSubfolder.toLowerCase()) return false;
                      }
                      if (filter === 'all') return true;
                      const ext = (a.extension || '').toLowerCase();
                      if (filter === 'images') return ['png', 'jpg', 'jpeg', 'webp', 'svg', 'gif'].includes(ext);
                      if (filter === 'documents') return ['pdf', 'docx', 'doc', 'txt', 'md', 'gdoc', 'gsheet', 'gslides'].includes(ext);
                      if (filter === 'presentations') return ['pptx', 'ppt', 'key'].includes(ext);
                      if (filter === 'code') return ['ts', 'tsx', 'js', 'py', 'sql', 'html', 'css', 'json'].includes(ext);
                      return false;
                    }).length;

                    return (
                      <button
                        key={filter}
                        onClick={() => setTypeFilter(filter)}
                        className={`px-3 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer flex items-center gap-1.5 shrink-0 ${
                          typeFilter === filter
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        <span>{filter}</span>
                        <span
                          className={`text-[10px] font-mono px-1.5 py-0.2 rounded-md ${
                            typeFilter === filter ? 'bg-neutral-100 text-neutral-700' : 'bg-neutral-200/50 text-neutral-500'
                          }`}
                        >
                          {count}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {/* Artifacts in Project */}
                {filteredArtifacts.length === 0 ? (
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center shadow-2xs">
                    <Folder className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-neutral-900">No deliverables found</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Upload an AI export or drop an artifact into this folder.
                    </p>
                    <button
                      onClick={() => setIsUploadOpen(true)}
                      className="mt-4 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add artifact</span>
                    </button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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

            {/* VIEW 3: PROJECTS OVERVIEW */}
            {activeTab === 'projects' && !selectedProjectId && (
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-neutral-200/80">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900">Projects</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Organizational containers for all AI outputs and subfolders
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      setProjectToEdit(null);
                      setIsProjectModalOpen(true);
                    }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create Project</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {projects.map((proj) => {
                    const isDragOver = dragOverFolderId === `overview-${proj.id}`;
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
                        onClick={() => {
                          setSelectedProjectId(proj.id);
                          setSelectedSubfolder(null);
                        }}
                        className={`bg-white border rounded-2xl p-5 transition-all cursor-pointer flex flex-col justify-between group shadow-2xs ${
                          isDragOver
                            ? 'border-[#19A974] ring-2 ring-[#19A974] bg-[#E8F7F0]/40 scale-[1.01]'
                            : draggingArtifact
                            ? 'border-dashed border-[#19A974]/60 hover:border-[#19A974]'
                            : 'border-neutral-200/80 hover:border-neutral-300'
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between mb-3">
                            <div
                              className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-2xs"
                              style={{ backgroundColor: proj.color || '#19A974' }}
                            >
                              {isDragOver ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />}
                            </div>
                            <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-neutral-100 text-neutral-600 border border-neutral-200/60">
                              {count} {count === 1 ? 'artifact' : 'artifacts'}
                            </span>
                          </div>
                          <h2 className="text-sm font-semibold text-neutral-900 group-hover:text-[#19A974] transition-colors">
                            {proj.name}
                          </h2>
                          <p className="text-xs text-neutral-500 mt-1 line-clamp-2 leading-relaxed">
                            {proj.description || 'Project workspace.'}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-[11px] text-neutral-400">
                          <span>Open folder & subfolders</span>
                          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* VIEW 4: ALL ARTIFACTS */}
            {activeTab === 'artifacts' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-neutral-200/80">
                  <div>
                    <h1 className="text-xl font-bold tracking-tight text-neutral-900">All Artifacts</h1>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      Search and inspect every deliverable across all projects
                    </p>
                  </div>

                  <button
                    onClick={() => setIsUploadOpen(true)}
                    className="px-4 py-2 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold shadow-2xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Artifact</span>
                  </button>
                </div>

                {/* Search Bar & Type Filter */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-neutral-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search by name, description, category, or AI..."
                      className="w-full pl-8 pr-4 py-2 bg-white border border-neutral-200/80 rounded-xl text-xs text-neutral-900 placeholder:text-neutral-400 focus:outline-none focus:border-[#19A974] focus:ring-1 focus:ring-[#19A974]"
                    />
                  </div>

                  {/* Segmented Filter Pills */}
                  <div className="p-1 bg-neutral-200/60 rounded-xl flex items-center gap-1 overflow-x-auto text-xs shrink-0">
                    {(['all', 'images', 'documents', 'presentations', 'code'] as const).map((filter) => (
                      <button
                        key={filter}
                        onClick={() => setTypeFilter(filter)}
                        className={`px-3 py-1 rounded-lg font-medium capitalize transition-all cursor-pointer ${
                          typeFilter === filter
                            ? 'bg-white text-neutral-900 shadow-xs'
                            : 'text-neutral-500 hover:text-neutral-900'
                        }`}
                      >
                        {filter}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Artifacts Grid */}
                {filteredArtifacts.length === 0 ? (
                  <div className="bg-white border border-neutral-200/80 rounded-2xl p-12 text-center shadow-2xs">
                    <Layers className="w-8 h-8 text-neutral-300 mx-auto mb-2" />
                    <h3 className="text-sm font-semibold text-neutral-900">No deliverables found</h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Try different keywords or upload a new deliverable.
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3.5">
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

            {/* VIEW 5: ACTIVITY TIMELINE */}
            {activeTab === 'activity' && <ActivityView events={events} onRefresh={loadWorkspaceData} />}

            {/* VIEW 6: WORKSPACE SETTINGS */}
            {activeTab === 'settings' && (
              <div className="space-y-6 max-w-2xl">
                <div className="pb-3 border-b border-neutral-200/80">
                  <h1 className="text-xl font-bold tracking-tight text-neutral-900">Workspace Settings</h1>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Account management and extension pairing
                  </p>
                </div>

                {/* Account Details Card */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-4 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0">
                        {user.name ? user.name[0].toUpperCase() : 'U'}
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-neutral-900">{user.name}</h2>
                        <p className="text-xs text-neutral-500 font-mono">{user.email}</p>
                      </div>
                    </div>
                    <button
                      onClick={handleSignOut}
                      className="px-3.5 py-1.5 border border-red-200/80 text-red-600 hover:bg-red-50/60 rounded-xl text-xs font-medium cursor-pointer transition-colors flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>

                {/* Companion Extension Card */}
                <div className="bg-white border border-neutral-200/80 rounded-2xl p-6 space-y-3 shadow-2xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-[#19A974]">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-sm font-semibold text-neutral-900">Chrome Companion Extension</h2>
                        <p className="text-xs text-neutral-500">
                          Capture deliverables quietly from AI tools directly into project subfolders
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIsExtensionPairModalOpen(true)}
                      className="px-3.5 py-1.5 bg-[#19A974] hover:bg-[#158f62] text-white rounded-xl text-xs font-semibold cursor-pointer shadow-2xs transition-colors"
                    >
                      Pair Extension
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>

      {/* Floating Drag Feedback Indicator */}
      {draggingArtifact && (
        <aside
          aria-label="Drag feedback"
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-50 bg-neutral-900 text-white px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-3 border border-neutral-700 animate-in fade-in slide-in-from-bottom-2 pointer-events-none max-w-[90vw]"
        >
          <div className="w-6 h-6 rounded-lg bg-[#19A974] flex items-center justify-center text-white shrink-0">
            <FolderOpen className="w-3.5 h-3.5" />
          </div>
          <div className="text-xs truncate">
            <span className="font-semibold text-emerald-400">Moving artifact:</span>{' '}
            <span className="font-mono text-neutral-200 truncate">{draggingArtifact.display_name}</span>
            <span className="text-neutral-400 ml-1.5 hidden sm:inline">
              &rarr; Drop into any project folder
            </span>
          </div>
        </aside>
      )}

      {/* Move Notification Toast with Undo */}
      {moveToast && (
        <aside
          aria-label="Notification toast"
          className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-50 bg-white border border-[#19A974]/40 shadow-xl rounded-2xl p-4 flex items-center gap-3 max-w-[calc(100vw-2rem)] sm:max-w-md animate-in fade-in slide-in-from-bottom-4"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200/60">
            <CheckCircle className="w-4 h-4 text-[#19A974]" />
          </div>
          <div className="flex-1 min-w-0 text-xs">
            <div className="font-semibold text-neutral-900">Artifact Moved</div>
            <div className="text-neutral-500 truncate">
              <span className="font-mono font-medium text-neutral-800">{moveToast.artifactName}</span>
              {' &rarr; '}
              <span className="font-medium text-[#19A974]">{moveToast.targetProjectName}</span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {moveToast.previousProjectId !== null && (
              <button
                onClick={handleUndoMove}
                className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-900 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
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

      {/* Centered Modals */}
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
      />

      {/* Mobile Bottom Navigation */}
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
