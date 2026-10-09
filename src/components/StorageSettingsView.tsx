import React, { useState, useEffect } from 'react';
import {
  HardDrive,
  CheckCircle2,
  AlertCircle,
  Shield,
  RefreshCw,
  LogOut,
  Folder,
  FileText,
  Image as ImageIcon,
  ExternalLink,
  Plus,
  Loader2,
  Lock,
} from 'lucide-react';
import { defaultStorageProvider } from '../lib/storage/GoogleDriveProvider.ts';
import {
  connectGoogleDrive,
  disconnectGoogleDrive,
  subscribeToGoogleDriveState,
  SCOPES,
} from '../lib/storage/googleAuth.ts';
import { db } from '../lib/supabase/db.ts';
import { StorageItem, User } from '../types/index.ts';

interface StorageSettingsViewProps {
  currentUser?: User | null;
}

export const StorageSettingsView: React.FC<StorageSettingsViewProps> = ({ currentUser }) => {
  const [isConnected, setIsConnected] = useState(defaultStorageProvider.isConfigured);
  const [googleUser, setGoogleUser] = useState<{ email: string | null; displayName: string | null; photoURL: string | null } | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [driveFiles, setDriveFiles] = useState<StorageItem[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [isUploadingTest, setIsUploadingTest] = useState(false);
  const [testUploadNotice, setTestUploadNotice] = useState<string | null>(null);

  // Subscribe to live Google Drive state
  useEffect(() => {
    const unsubscribe = subscribeToGoogleDriveState((state) => {
      setIsConnected(state.isConnected);
      setGoogleUser(state.user);
      if (state.isConnected) {
        fetchDriveFiles();
      }
    });

    return () => unsubscribe();
  }, []);

  const fetchDriveFiles = async () => {
    setIsLoadingFiles(true);
    setErrorMessage(null);
    try {
      const items = await defaultStorageProvider.list();
      setDriveFiles(items);
    } catch (err: any) {
      console.warn('Could not fetch drive files:', err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleConnect = async () => {
    setIsConnecting(true);
    setErrorMessage(null);
    try {
      const { user: fUser } = await connectGoogleDrive();
      setIsConnected(true);
      setGoogleUser({
        email: fUser.email,
        displayName: fUser.displayName,
        photoURL: fUser.photoURL,
      });

      // Persist connection record in database
      if (currentUser) {
        await db.saveStorageConnection({
          user_id: currentUser.id,
          provider: 'google_drive',
          account_name: fUser.email || 'Google Account',
          provider_account_id: fUser.uid,
          status: 'connected',
        });
      }

      // Log activity event
      await db.recordEvent({
        artifact_id: null,
        event_type: 'organized',
        actor_type: 'integration',
        metadata: {
          summary: `Connected Google Drive storage provider for ${fUser.email}`,
          provider: 'google_drive',
        },
      });

      // Fetch live files
      await fetchDriveFiles();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to authenticate with Google Drive.');
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setShowDisconnectConfirm(false);
    try {
      await disconnectGoogleDrive();
      setIsConnected(false);
      setGoogleUser(null);
      setDriveFiles([]);

      if (currentUser) {
        await db.removeStorageConnection('google_drive');
      }

      await db.recordEvent({
        artifact_id: null,
        event_type: 'organized',
        actor_type: 'integration',
        metadata: {
          summary: 'Disconnected Google Drive storage provider',
          provider: 'google_drive',
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Error disconnecting Google Drive.');
    }
  };

  const handleTestUpload = async () => {
    setIsUploadingTest(true);
    setTestUploadNotice(null);
    try {
      const testContent = `Orfilo AI Artifact Layer Sync Verification\nTimestamp: ${new Date().toISOString()}\nTarget: Google Drive User-Owned Storage\nStatus: Verified`;
      const blob = new Blob([testContent], { type: 'text/plain' });
      const filename = `orfilo-test-artifact-${Date.now().toString().slice(-4)}.txt`;

      const res = await defaultStorageProvider.upload(blob, 'Orfilo / Artifacts', filename);

      setTestUploadNotice(`Successfully uploaded test file "${filename}" to Google Drive (ID: ${res.fileId})`);
      await fetchDriveFiles();

      await db.recordEvent({
        artifact_id: null,
        event_type: 'saved',
        actor_type: 'human',
        metadata: {
          summary: `Verified Google Drive sync: uploaded ${filename}`,
          provider_file_id: res.fileId,
        },
      });
    } catch (err: any) {
      setErrorMessage(err.message || 'Test upload failed');
    } finally {
      setIsUploadingTest(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-bold text-[#111111]">Storage & Integrations</h2>
        <p className="text-xs text-[#6B6B6B] mt-0.5">
          Orfilo connects your AI artifacts to user-owned storage. You own all the files.
        </p>
      </div>

      {errorMessage && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-xs text-red-700 flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
          <div className="flex-1">
            <span className="font-semibold">Connection Notice:</span> {errorMessage}
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-red-500 hover:text-red-800 text-xs ml-auto cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {testUploadNotice && (
        <div className="bg-[#E8F7F0] border border-[#19A974]/30 rounded-xl p-4 text-xs text-[#19A974] flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1 font-medium">{testUploadNotice}</div>
          <button
            onClick={() => setTestUploadNotice(null)}
            className="text-[#19A974] hover:underline text-xs cursor-pointer"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Google Drive Primary Card */}
      <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E7E7E4]">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-neutral-100 flex items-center justify-center text-[#111111]">
              <HardDrive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-semibold text-[#111111]">Google Drive</h3>
                {isConnected ? (
                  <span className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#E8F7F0] text-[#19A974]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#19A974] animate-pulse" />
                    Active Connection
                  </span>
                ) : (
                  <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-neutral-100 text-[#6B6B6B]">
                    Not Connected
                  </span>
                )}
              </div>
              <p className="text-xs text-[#6B6B6B] mt-0.5">
                Store AI-generated assets, PDFs, slide decks, and code directly in your personal Google Drive folders.
              </p>
            </div>
          </div>

          <div>
            {isConnected ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={fetchDriveFiles}
                  disabled={isLoadingFiles}
                  className="px-3 py-2 border border-[#E7E7E4] hover:border-[#111111] bg-white rounded-xl text-xs font-medium text-[#111111] inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  Refresh
                </button>
                <button
                  onClick={() => setShowDisconnectConfirm(true)}
                  className="px-3 py-2 border border-red-200 text-red-600 hover:bg-red-50 rounded-xl text-xs font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Disconnect
                </button>
              </div>
            ) : (
              <button
                onClick={handleConnect}
                disabled={isConnecting}
                className="w-full sm:w-auto px-4 py-2.5 bg-white border border-[#dadce0] hover:border-[#d2e3fc] hover:bg-[#f8fafd] rounded-xl text-xs font-medium text-[#3c4043] inline-flex items-center justify-center gap-3 shadow-xs transition-all cursor-pointer disabled:opacity-50"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin text-[#19A974]" />
                    <span>Connecting to Google Drive...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4 shrink-0" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    <span>Connect Google Drive</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Disconnect Confirmation Modal Dialog per Workspace Skill requirement */}
        {showDisconnectConfirm && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-xl space-y-3 text-xs">
            <div className="flex items-center gap-2 text-amber-900 font-semibold">
              <AlertCircle className="w-4 h-4 text-amber-600" />
              <span>Confirm Disconnecting Google Drive</span>
            </div>
            <p className="text-amber-800 leading-relaxed text-[11px]">
              Are you sure you want to disconnect Google Drive? Orfilo will stop syncing artifacts to your personal Google Drive until reconnected. Existing files already on your Drive will remain safe and untouched.
            </p>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                onClick={() => setShowDisconnectConfirm(false)}
                className="px-3 py-1.5 bg-white border border-amber-200 text-amber-900 rounded-lg text-xs font-medium cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDisconnect}
                className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-medium cursor-pointer"
              >
                Confirm Disconnect
              </button>
            </div>
          </div>
        )}

        {/* Connection Details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-6">
          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E7E7E4] text-xs">
            <div className="text-[#8F8F8F] text-[11px] mb-1">Authenticated Account</div>
            {googleUser ? (
              <div className="flex items-center gap-2">
                {googleUser.photoURL ? (
                  <img src={googleUser.photoURL} alt="Avatar" className="w-5 h-5 rounded-full" />
                ) : (
                  <div className="w-5 h-5 rounded-full bg-[#19A974] text-white flex items-center justify-center text-[10px]">
                    {googleUser.email?.[0].toUpperCase() || 'G'}
                  </div>
                )}
                <span className="font-medium text-[#111111] truncate">{googleUser.email}</span>
              </div>
            ) : (
              <span className="text-[#6B6B6B]">None (Sign-in required)</span>
            )}
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E7E7E4] text-xs">
            <div className="text-[#8F8F8F] text-[11px] mb-1">Permission Scope</div>
            <div className="flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-[#19A974]" />
              <span className="font-mono text-[11px] text-[#111111]">drive.file (App-scoped)</span>
            </div>
            <p className="text-[10px] text-[#8F8F8F] mt-1">
              Only files created by Orfilo are accessible for maximum privacy.
            </p>
          </div>

          <div className="p-3.5 bg-[#FAFAF8] rounded-xl border border-[#E7E7E4] text-xs">
            <div className="text-[#8F8F8F] text-[11px] mb-1">Sync Pipeline</div>
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#111111]">
                {isConnected ? 'Real-time Live Sync' : 'Awaiting Connection'}
              </span>
              {isConnected && (
                <button
                  onClick={handleTestUpload}
                  disabled={isUploadingTest}
                  className="px-2 py-1 bg-[#19A974] hover:bg-[#158f62] text-white rounded-lg text-[10px] font-medium inline-flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {isUploadingTest ? <Loader2 className="w-3 h-3 animate-spin" /> : <Plus className="w-3 h-3" />}
                  Test Sync
                </button>
              )}
            </div>
            <p className="text-[10px] text-[#8F8F8F] mt-1">
              Target folder: <span className="font-mono">Orfilo / Artifacts</span>
            </p>
          </div>
        </div>

        {/* Live Google Drive Files Section */}
        {isConnected && (
          <div className="mt-6 pt-6 border-t border-[#E7E7E4]">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Folder className="w-4 h-4 text-[#19A974]" />
                <h4 className="text-xs font-semibold text-[#111111]">Files in Google Drive Storage</h4>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-neutral-100 text-[#6B6B6B]">
                  {driveFiles.length} items
                </span>
              </div>
              <span className="text-[10px] text-[#8F8F8F]">Managed by StorageProvider</span>
            </div>

            {isLoadingFiles ? (
              <div className="p-8 text-center text-xs text-[#6B6B6B] flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-[#19A974]" />
                <span>Scanning Google Drive...</span>
              </div>
            ) : driveFiles.length === 0 ? (
              <div className="p-8 bg-[#FAFAF8] rounded-xl border border-dashed border-[#E7E7E4] text-center text-xs text-[#6B6B6B]">
                No files found in this workspace folder yet. Click "Test Sync" or upload an artifact to begin syncing.
              </div>
            ) : (
              <div className="divide-y divide-[#E7E7E4] border border-[#E7E7E4] rounded-xl overflow-hidden bg-white text-xs">
                {driveFiles.map((file) => (
                  <div key={file.id} className="p-3 flex items-center justify-between hover:bg-[#FAFAF8] transition-colors">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {file.isFolder ? (
                        <Folder className="w-4 h-4 text-amber-500 shrink-0" />
                      ) : file.mimeType.startsWith('image/') ? (
                        <ImageIcon className="w-4 h-4 text-emerald-600 shrink-0" />
                      ) : (
                        <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="font-mono text-xs font-medium text-[#111111] truncate">{file.name}</div>
                        <div className="text-[10px] text-[#8F8F8F]">{file.path}</div>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 shrink-0 text-[11px] text-[#6B6B6B]">
                      <span>{(file.sizeBytes / 1024).toFixed(1)} KB</span>
                      <span className="font-mono text-[10px] text-[#8F8F8F] hidden sm:inline">
                        ID: {file.id.slice(0, 10)}...
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Storage Architecture Overview & Roadmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-[#FAFAF8] border border-dashed border-[#E7E7E4] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-neutral-200/60 flex items-center justify-center text-neutral-600">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-neutral-200/60 text-neutral-600">
                Roadmap
              </span>
            </div>

            <h3 className="text-base font-semibold text-neutral-800">Dropbox &amp; OneDrive</h3>
            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
              Orfilo uses a pluggable StorageProvider interface. Dropbox, Box, and Microsoft OneDrive connectors plug directly into the classification pipeline without modifying metadata schemas.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E7E7E4] mt-6 text-xs text-[#8F8F8F]">
            Unified cross-cloud artifact intelligence
          </div>
        </div>

        <div className="bg-white border border-[#E7E7E4] rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 rounded-xl bg-[#E8F7F0] flex items-center justify-center text-[#19A974]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E8F7F0] text-[#19A974]">
                Architecture
              </span>
            </div>

            <h3 className="text-base font-semibold text-[#111111]">User-Owned Data Guarantee</h3>
            <p className="text-xs text-[#6B6B6B] mt-1 leading-relaxed">
              Orfilo never holds your AI assets hostage. All binary files remain in your personal cloud drives, while Orfilo maintains vector indexes, metadata classifications, and event activity.
            </p>
          </div>

          <div className="pt-6 border-t border-[#E7E7E4] mt-6 text-xs text-[#19A974] font-medium flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Zero vendor lock-in
          </div>
        </div>
      </div>
    </div>
  );
};
