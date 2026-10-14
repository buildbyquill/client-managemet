import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  Share2,
  CheckCircle2,
  Sun,
  Moon,
  LogIn,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { QuillLogo } from './QuillLogo';
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  firebaseSignOut,
  onAuthStateChanged,
  FirebaseUser,
} from '../lib/firebase';

export const Topbar: React.FC = () => {
  const {
    setCommandPaletteOpen,
    setNewClientModalOpen,
    setShareModalOpen,
    theme,
    toggleTheme,
    clients,
    isFirestoreSyncing,
  } = useWorkspace();

  const [showNotifications, setShowNotifications] = useState(false);
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setFirebaseUser(user);
    });
    // Handle redirect result on page load (for Cloudflare Pages)
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          setFirebaseUser(result.user);
        }
      })
      .catch((err) => {
        console.warn('Redirect result error:', err.code);
      });
    return () => unsubscribeAuth();
  }, []);

  // Smart sign-in: use redirect on deployed domains (popup blocked), popup on localhost
  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setAuthError(null);
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    try {
      if (isLocalhost) {
        await signInWithPopup(auth, googleProvider);
      } else {
        // On Cloudflare Pages: use redirect flow (no popup blockers)
        await signInWithRedirect(auth, googleProvider);
      }
    } catch (err: any) {
      console.error('Firebase Google Auth error:', err.code, err.message);
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        // Fallback to redirect if popup is blocked
        try { await signInWithRedirect(auth, googleProvider); } catch {}
      } else if (err.code === 'auth/unauthorized-domain') {
        setAuthError('Domain not authorized. Please add this domain to Firebase Console → Authentication → Settings → Authorized Domains.');
      } else {
        setAuthError(err.message || 'Sign-in failed');
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleFirebaseSignOut = async () => {
    try {
      await firebaseSignOut(auth);
      setFirebaseUser(null);
    } catch (err: any) {
      console.error('Firebase Sign Out error:', err);
    }
  };

  return (
    <header className="h-14 glass-panel px-4 sm:px-6 flex items-center justify-between sticky top-0 z-20 shrink-0 transition-colors">
      {/* Search Input (Global Command Palette Trigger) */}
      <div className="flex items-center gap-3 flex-1 max-w-md">
        <div className="md:hidden shrink-0" title="Client Manager">
          <QuillLogo size={30} className="rounded-xl shadow-xs" />
        </div>
        <button
          type="button"
          id="global-search-trigger"
          onClick={() => setCommandPaletteOpen(true)}
          aria-label="Search leads and commands (Press Command+K)"
          className="w-full flex items-center justify-between px-3.5 py-1.5 text-xs text-slate-400 dark:text-slate-400 bg-slate-100/60 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200/80 dark:border-slate-700/80 rounded-xl transition-all text-left shadow-2xs"
        >
          <div className="flex items-center gap-2.5 truncate">
            <Search className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">Search leads, notes, phone, city...</span>
          </div>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono font-medium text-slate-500 dark:text-slate-400 bg-white/80 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-700 rounded-md shadow-2xs">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2">
        {/* Firebase Authentication & Firestore Status */}
        {firebaseUser ? (
          <div className="hidden sm:flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-2.5 py-1 text-xs">
            {firebaseUser.photoURL ? (
              <img src={firebaseUser.photoURL} alt={firebaseUser.displayName || 'User'} className="w-4 h-4 rounded-full" />
            ) : (
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            )}
            <span className="font-semibold text-emerald-700 dark:text-emerald-300 truncate max-w-[110px]">
              {firebaseUser.displayName || firebaseUser.email || 'Firebase User'}
            </span>
            <button
              onClick={handleFirebaseSignOut}
              className="text-emerald-700 hover:text-rose-600 dark:text-emerald-400 dark:hover:text-rose-400 font-bold ml-1"
              title="Sign Out from Firebase"
              aria-label="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="hidden sm:flex flex-col items-end gap-1">
            <button
              onClick={handleGoogleSignIn}
              disabled={authLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-xl border bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 hover:bg-amber-500/20 transition shadow-2xs disabled:opacity-60"
              title="Sign in with Google via Firebase Auth"
              aria-label="Sign in with Google"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-500" />
              <span>{authLoading ? 'Redirecting...' : 'Sign In'}</span>
            </button>
            {authError && (
              <div className="absolute top-14 right-4 z-50 max-w-xs bg-rose-600 text-white text-[10px] leading-tight px-3 py-2 rounded-lg shadow-lg">
                ⚠️ {authError}
              </div>
            )}
          </div>
        )}

        {/* Live Database Sync Status */}
        <div
          title={
            firebaseUser
              ? `Connected to Firebase Cloud Firestore. ${clients.length} leads synced across all team members' devices.`
              : `Connected to Express backend server. ${clients.length} leads saved. Sign in with Google to enable cloud sync across all devices.`
          }
          className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 text-[11px] font-medium rounded-xl border shadow-2xs ${
            isFirestoreSyncing
              ? 'bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-500/20'
              : firebaseUser
              ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/20'
              : 'bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-500/20'
          }`}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isFirestoreSyncing
                ? 'bg-indigo-500 animate-spin'
                : firebaseUser
                ? 'bg-emerald-500 animate-pulse'
                : 'bg-amber-500'
            }`}
          />
          <span>
            {isFirestoreSyncing
              ? 'Syncing Cloud...'
              : firebaseUser
              ? `Cloud (${clients.length} Leads)`
              : `Server (${clients.length} Leads)`}
          </span>
        </div>

        {/* DESIGN TOGGLE BUTTON */}
        <button
          id="topbar-theme-toggle-btn"
          onClick={toggleTheme}
          aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          title={theme === 'dark' ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
          className={`flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-semibold rounded-xl border transition-all shadow-2xs ${
            theme === 'dark'
              ? 'bg-slate-800/80 hover:bg-slate-700/80 border-indigo-500/30 text-indigo-300'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
        >
          {theme === 'dark' ? (
            <>
              <Moon className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400/20" />
              <span className="hidden sm:inline">Dark</span>
            </>
          ) : (
            <>
              <Sun className="w-3.5 h-3.5 text-amber-500" />
              <span className="hidden sm:inline">Light</span>
            </>
          )}
        </button>

        {/* New Client Button */}
        <button
          id="topbar-new-client-btn"
          onClick={() => setNewClientModalOpen(true)}
          aria-label="Add new lead"
          className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>Add Lead</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative"
            aria-label="Notifications"
          >
            <Bell className="w-4 h-4" />
            <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-indigo-600" />
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-3 z-30 animate-in fade-in duration-150">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-xs font-semibold text-slate-900 dark:text-white">Activity & Alerts</span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-medium">All caught up</span>
              </div>
              <div className="py-2 space-y-2.5 text-xs">
                <div className="flex gap-2.5 text-slate-600 dark:text-slate-300">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">Shared Backend Connected</span>: Team members can register and collaborate.
                    <div className="text-[10px] text-slate-400 mt-0.5">Live now</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
