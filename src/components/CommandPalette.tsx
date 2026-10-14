import React, { useState, useEffect } from 'react';
import {
  Search,
  Users,
  LayoutDashboard,
  Settings,
  Plus,
  UploadCloud,
  Download,
  ArrowRight,
  X,
  LayoutGrid,
  Table,
  Target,
  PhoneCall,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveTab,
    setNewClientModalOpen,
    setImportCSVModalOpen,
    setProjectionMode,
    clients,
    setSelectedClientId,
  } = useWorkspace();

  const [query, setQuery] = useState('');

  // Keyboard shortcut listener (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandPaletteOpen(!isCommandPaletteOpen);
      }
      if (e.key === 'Escape' && isCommandPaletteOpen) {
        setCommandPaletteOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isCommandPaletteOpen, setCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const q = query.toLowerCase().trim();

  const filteredClients = q
    ? clients.filter(
        (c) =>
          (c.title || c.company || c.name).toLowerCase().includes(q) ||
          (c.address || '').toLowerCase().includes(q) ||
          (c.phoneNumber || '').toLowerCase().includes(q) ||
          (c.industry || c.niche || '').toLowerCase().includes(q) ||
          (c.problemFound || '').toLowerCase().includes(q) ||
          (c.notes || '').toLowerCase().includes(q)
      )
    : [];

  const navigationItems = [
    {
      label: 'Go to Dashboard',
      description: 'Executive metrics, market chart & hot prospects',
      action: () => setActiveTab('dashboard'),
      icon: LayoutDashboard,
    },
    {
      label: 'Go to Leads Directory',
      description: 'Search and manage all verified leads',
      action: () => setActiveTab('clients'),
      icon: Users,
    },
    {
      label: 'View: Client Cards Grid',
      description: 'Visual dossier cards with problem found hooks',
      action: () => {
        setProjectionMode('cards');
        setActiveTab('clients');
      },
      icon: LayoutGrid,
    },
    {
      label: 'View: Smart CRM Table',
      description: '11-column spreadsheet view',
      action: () => {
        setProjectionMode('table');
        setActiveTab('clients');
      },
      icon: Table,
    },
    {
      label: 'View: Opportunity Matrix',
      description: 'Categorized by sales pitches and pain points',
      action: () => {
        setProjectionMode('opportunity');
        setActiveTab('clients');
      },
      icon: Target,
    },
    {
      label: 'View: Speed Dialer',
      description: 'Focused power calling sprint',
      action: () => {
        setProjectionMode('dialer');
        setActiveTab('clients');
      },
      icon: PhoneCall,
    },
    {
      label: 'Settings',
      description: 'Appearance and workspace preferences',
      action: () => setActiveTab('settings'),
      icon: Settings,
    },
  ].filter(
    (item) =>
      item.label.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-100">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-xl overflow-hidden flex flex-col max-h-[70vh] transition-colors">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center gap-3">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            autoFocus
            type="text"
            placeholder="Search leads by title, industry, phone, or problem found..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm bg-transparent text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(false)}
            className="w-6 h-6 rounded flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xs"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results list */}
        <div className="p-3 overflow-y-auto space-y-3 text-xs">
          {/* Quick Actions */}
          {!q && (
            <div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Quick Actions
              </div>
              <div className="space-y-0.5">
                <button
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setNewClientModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <Plus className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span className="font-medium">Add New Lead</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">N</kbd>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    setImportCSVModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <UploadCloud className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-medium">Import Leads (CSV)</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">I</kbd>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setCommandPaletteOpen(false);
                    exportLeadsToCSV(clients);
                  }}
                  className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition"
                >
                  <div className="flex items-center gap-2">
                    <Download className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    <span className="font-medium">Export All Leads to CSV</span>
                  </div>
                  <kbd className="text-[10px] text-slate-400 font-mono">E</kbd>
                </button>
              </div>
            </div>
          )}

          {/* Matched Leads */}
          {filteredClients.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Matched Leads ({filteredClients.length})
              </div>
              <div className="space-y-1">
                {filteredClients.slice(0, 6).map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      setSelectedClientId(c.id);
                      setActiveTab('clients');
                      setCommandPaletteOpen(false);
                    }}
                    className="w-full p-2.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700 transition"
                  >
                    <div className="flex items-center justify-between">
                      <div className="font-semibold text-slate-900 dark:text-slate-100 text-xs">
                        {c.title || c.company}
                      </div>
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                        {c.industry || c.niche}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5 truncate">
                      {c.address || c.phoneNumber}
                    </div>
                    {c.problemFound && (
                      <div className="text-[10px] text-amber-600 dark:text-amber-400 mt-1 truncate">
                        ⚠️ {c.problemFound}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Navigation */}
          {navigationItems.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider px-2 mb-1">
                Navigation & Views
              </div>
              <div className="space-y-0.5">
                {navigationItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.label}
                      type="button"
                      onClick={() => {
                        item.action();
                        setCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 text-left transition"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-3.5 h-3.5 text-slate-400" />
                        <div>
                          <div className="font-medium text-slate-900 dark:text-slate-200">
                            {item.label}
                          </div>
                          <div className="text-[10px] text-slate-400">{item.description}</div>
                        </div>
                      </div>
                      <ArrowRight className="w-3 h-3 text-slate-300 dark:text-slate-600" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Palette Footer */}
        <div className="p-2.5 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 px-4 flex items-center justify-between text-[10px] text-slate-400">
          <span>Navigate with arrows or mouse</span>
          <span>Press ESC to close</span>
        </div>
      </div>
    </div>
  );
};
