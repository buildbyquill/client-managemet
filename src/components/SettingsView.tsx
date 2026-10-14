import React, { useState } from 'react';
import {
  Settings,
  Users,
  Shield,
  Download,
  RotateCcw,
  CheckCircle2,
  Plus,
  Mail,
  Sliders,
  DollarSign,
  Database,
  ExternalLink,
  Sun,
  Moon,
  LogOut,
  Sparkles,
  Key,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { QuillLogo } from './QuillLogo';

export const SettingsView: React.FC = () => {
  const {
    teamMembers,
    activeUser,
    setActiveUser,
    clients,
    projects,
    invoices,
    ideas,
    theme,
    toggleTheme,
    authUser,
    logout,
    setAuthModalOpen,
    settings,
    updateSettings,
  } = useWorkspace();

  const [agencyName, setAgencyName] = useState(settings?.studioName || 'Quill Land');
  const [geminiKey, setGeminiKey] = useState(settings?.geminiApiKey || '');
  const [showKey, setShowKey] = useState(false);
  const [savedBanner, setSavedBanner] = useState(false);
  const [keySavedBanner, setKeySavedBanner] = useState(false);

  const handleExportData = () => {
    const backup = {
      agencyName,
      exportDate: new Date().toISOString(),
      clients,
      projects,
      invoices,
      ideas,
      teamMembers,
    };

    const blob = new Blob([JSON.stringify(backup, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `client_management_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3 pb-2 border-b border-slate-200/80 dark:border-slate-800/80">
        <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
          <Settings className="w-5 h-5" />
        </div>
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Settings & Workspace</h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Workspace configuration, backend server access, design toggle, and data backup controls.
          </p>
        </div>
      </div>

      {savedBanner && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Design & Theme Preferences */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {theme === 'dark' ? (
              <Moon className="w-4 h-4 text-indigo-400" />
            ) : (
              <Sun className="w-4 h-4 text-amber-500" />
            )}
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Theme</h2>
          </div>
          <button
            onClick={toggleTheme}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
            <span>Switch to {theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
          </button>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          Current aesthetic: <strong className="text-slate-800 dark:text-slate-200 capitalize">{theme} Mode</strong> with frosted glassmorphism surfaces and dark accents.
        </p>
      </div>

      {/* Backend & Account */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">Authentication & Cloud Sync</h2>
          </div>
          {authUser ? (
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/60 rounded-xl border border-rose-200 dark:border-rose-900/60 transition"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Log out</span>
            </button>
          ) : (
            <button
              onClick={() => setAuthModalOpen(true)}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition shadow-sm"
            >
              Sign In / Register
            </button>
          )}
        </div>

        <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          {authUser ? (
            <div>
              <p className="font-semibold text-slate-900 dark:text-white">
                Logged in as: <span className="text-indigo-600 dark:text-indigo-400 font-bold">{authUser.name}</span> ({authUser.username})
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Role: {authUser.role}. Your team can access this workspace from anywhere by registering their credentials.
              </p>
            </div>
          ) : (
            <div>
              <p className="font-semibold text-slate-800 dark:text-slate-200">
                You are currently browsing as a guest.
              </p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Log in or create an account with a username and password to sync your team's changes securely to the backend.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Agency Identity */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Agency Workspace Info</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Agency / Operator Name</label>
            <input
              type="text"
              value={agencyName}
              onChange={(e) => setAgencyName(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100/60 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Operating Currency</label>
            <input
              type="text"
              disabled
              value="USD ($) - United States Dollar"
              className="w-full px-3 py-2 bg-slate-100/40 dark:bg-slate-800/30 border border-slate-200/80 dark:border-slate-800 rounded-xl text-slate-400 cursor-not-allowed"
            />
          </div>
        </div>
      </div>

      {/* AI Intelligence & Gemini API Configuration */}
      <div className="glass-card rounded-2xl p-5 space-y-4 border border-indigo-500/20 bg-indigo-500/5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white">AI Lead Intelligence (Gemini 2.5 Flash)</h2>
          </div>
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
            {settings?.geminiApiKey ? 'Live Gemini Connected' : 'Heuristic Engine Active'}
          </span>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Powers Quill Land's 10-second lead research briefs, cold-call opening angles, after-call smart note extraction, and duplicate detection.
          When no key is configured, Quill Land uses a built-in deterministic heuristic engine.
        </p>

        {keySavedBanner && (
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-xs text-emerald-700 dark:text-emerald-300 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Gemini API key saved! Live AI intelligence is now enabled.</span>
          </div>
        )}

        <div className="space-y-2 text-xs">
          <label className="block font-semibold text-slate-700 dark:text-slate-300">
            Gemini API Key
          </label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <input
                type={showKey ? 'text' : 'password'}
                value={geminiKey}
                onChange={(e) => setGeminiKey(e.target.value)}
                placeholder="AIzaSy..."
                className="w-full pl-8 pr-10 py-2 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white font-mono text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
              <Key className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-3" />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-2.5 top-2.5 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                title={showKey ? 'Hide key' : 'Show key'}
              >
                {showKey ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
            <button
              type="button"
              onClick={() => {
                updateSettings({ geminiApiKey: geminiKey.trim() });
                setKeySavedBanner(true);
                setTimeout(() => setKeySavedBanner(false), 3000);
              }}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition shrink-0"
            >
              Save Key
            </button>
          </div>
          <span className="text-[11px] text-slate-400 block">
            Keys are saved in your local workspace settings and used for server-side Gemini 2.5 Flash research.
          </span>
        </div>
      </div>

      {/* Data Backup & Persistence */}
      <div className="glass-card rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-2">
          <Database className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Data Storage & Backup</h2>
        </div>

        <div className="p-4 rounded-xl bg-slate-100/50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>Backend Database File Active & Synchronized</span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            All leads, outreach notes, and qualification pipeline stages are stored securely on disk and in cloud Firestore.
          </p>
        </div>

        <div className="flex flex-wrap gap-3 pt-1">
          <button
            onClick={handleExportData}
            className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 glass-panel hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition shadow-2xs"
          >
            <Download className="w-4 h-4 text-blue-500" />
            <span>Export Workspace JSON Backup</span>
          </button>
        </div>
      </div>
    </div>
  );
};
