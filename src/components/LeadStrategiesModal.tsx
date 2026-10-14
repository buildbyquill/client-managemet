import React from 'react';
import {
  X,
  Sparkles,
  LayoutGrid,
  Target,
  PhoneCall,
  Table,
  CheckCircle2,
  ArrowRight,
  Lightbulb,
  FileSpreadsheet,
} from 'lucide-react';
import { ProjectionMode } from '../types';

interface LeadStrategiesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentMode: ProjectionMode;
  onSelectMode: (mode: ProjectionMode) => void;
}

export const LeadStrategiesModal: React.FC<LeadStrategiesModalProps> = ({
  isOpen,
  onClose,
  currentMode,
  onSelectMode,
}) => {
  if (!isOpen) return null;

  const strategies = [
    {
      id: 'cards' as ProjectionMode,
      icon: LayoutGrid,
      title: 'Client Cards Grid (Dossiers)',
      badge: 'Visual Dossier Cards',
      badgeColor: 'bg-blue-50 dark:bg-blue-950 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      description:
        'Complete visual client cards featuring verified address, phone dialer, website audit badges, problem found hooks, and sales notes.',
      benefits: [
        'Clear visual separation between Problem Found and Notes',
        'Direct phone dial and copy buttons on every card',
        'Direct links to Google Maps search pins and live websites',
      ],
      bestFor: 'Deep research, customized proposals, and visual lead browsing',
    },
    {
      id: 'table' as ProjectionMode,
      icon: Table,
      title: 'Intelligent CRM Table (11-Column Sheet)',
      badge: 'High-Density Bulk Actions',
      badgeColor: 'bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800',
      description:
        'A high-density data sheet strictly matching the 11 CSV columns: Title, Address, Phone, Website, Industry, City, Priority, Maps, Quality, Problem, and Notes.',
      benefits: [
        'Multi-select checkboxes for batch priority updates or bulk export',
        'Sortable columns by business name, priority, and industry',
        'Dedicated Problem Found and Notes columns for instant scanning',
      ],
      bestFor: 'Auditing large datasets, bulk operations, and fast spreadsheet workflows',
    },
    {
      id: 'opportunity' as ProjectionMode,
      icon: Target,
      title: 'Opportunity Matrix (Campaign Radar)',
      badge: 'Highest Conversion Rate',
      badgeColor: 'bg-rose-50 dark:bg-rose-950 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800',
      description:
        'Segments leads by specific sales opportunity instead of raw alphabetical rows (e.g. 23 businesses with NO website vs 17 needing redesigns).',
      benefits: [
        'Built-in instant Cold Call Scripts tailored to the business',
        'Focuses your energy on "No Website" low-hanging fruit',
        'Pre-grouped pitch angles for Dentists, Bakeries, and Jewelers',
      ],
      bestFor: 'Cold emailers & cold callers targeting specific pain points',
    },
    {
      id: 'dialer' as ProjectionMode,
      icon: PhoneCall,
      title: 'Speed Dialer Cockpit (Outreach Sprint)',
      badge: 'Maximum Calling Speed',
      badgeColor: 'bg-amber-50 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800',
      description:
        'A distraction-free, 1-lead-at-a-time calling cockpit. Displaying huge phone numbers, direct dial, audit flags, live pitch script, and 1-click outcome buttons.',
      benefits: [
        'Zero distraction: call through 20-30 leads in 30 minutes',
        'One-click outcome buttons (No Answer, Contacted, Meeting Booked)',
        'Automatically flips to the next lead upon logging outcome',
      ],
      bestFor: 'Cold calling power sprints and rapid phone outreach',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex items-start justify-between gap-4 bg-slate-50/70 dark:bg-slate-900/80">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 shrink-0">
              <Lightbulb className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Better Ways to Project & Work Your Leads
                </h3>
                <span className="text-[10px] uppercase tracking-wider font-semibold px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  Lead Intelligence
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Raw CSV spreadsheets hide sales opportunities. Use these 4 purpose-built projection modes to turn raw contacts into booked clients.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: The 4 Strategies */}
        <div className="p-6 overflow-y-auto space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {strategies.map((strat) => {
              const Icon = strat.icon;
              const isCurrent = currentMode === strat.id;

              return (
                <div
                  key={strat.id}
                  className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                    isCurrent
                      ? 'border-indigo-500 bg-indigo-50/30 dark:bg-indigo-950/20 ring-2 ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-sm text-slate-900 dark:text-white">
                          {strat.title}
                        </span>
                      </div>
                      {isCurrent && (
                        <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          Active
                        </span>
                      )}
                    </div>

                    <div className="mb-2">
                      <span className={`inline-block text-[10px] font-medium px-2 py-0.5 rounded-md border ${strat.badgeColor}`}>
                        {strat.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed mb-3">
                      {strat.description}
                    </p>

                    <div className="space-y-1 mb-4">
                      {strat.benefits.map((b, i) => (
                        <div key={i} className="flex items-start gap-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span>{b}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      onSelectMode(strat.id);
                      onClose();
                    }}
                    className={`w-full py-2 px-3 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 transition ${
                      isCurrent
                        ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 cursor-default'
                        : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs'
                    }`}
                  >
                    <span>{isCurrent ? 'Currently Viewing' : 'Switch to This View'}</span>
                    {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/60 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <span>You can switch between any of these views anytime using the top mode bar or sidebar.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
