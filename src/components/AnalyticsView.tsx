/**
 * AnalyticsView.tsx — Quill Land Lead Manager
 *
 * Simplified market analytics:
 * - Website Coverage by Category (primary chart — two bars per category)
 * - Leads by City
 * - Leads by Category
 *
 * Purpose: "Where do we have leads and where are the biggest website opportunities?"
 */

import React, { useMemo } from 'react';
import {
  BarChart2,
  Globe,
  Building2,
  AlertTriangle,
  MapPin,
  Download,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { exportLeadsToCSV } from '../utils/csvParser';

export const AnalyticsView: React.FC = () => {
  const { clients } = useWorkspace();

  const activeClients = useMemo(() => clients.filter((c) => !c.isRejected), [clients]);

  // ─── Website coverage by category ─────────────────────────────────────────
  const categoryData = useMemo(() => {
    const map: Record<string, { withWebsite: number; noWebsite: number; total: number }> = {};

    activeClients.forEach((c) => {
      const cat = c.industry || c.niche || 'General';
      if (!map[cat]) map[cat] = { withWebsite: 0, noWebsite: 0, total: 0 };
      map[cat].total += 1;

      const noWeb =
        !c.websiteUrl ||
        c.websiteQuality === 'No Website' ||
        (c.problemFound && c.problemFound.toLowerCase().includes('no website'));

      if (noWeb) {
        map[cat].noWebsite += 1;
      } else {
        map[cat].withWebsite += 1;
      }
    });

    return Object.entries(map)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.total - a.total);
  }, [activeClients]);

  // ─── Leads by city ─────────────────────────────────────────────────────────
  const cityData = useMemo(() => {
    const map: Record<string, number> = {};
    activeClients.forEach((c) => {
      const city = c.city || 'Unknown';
      map[city] = (map[city] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 10);
  }, [activeClients]);

  // ─── Simple totals ─────────────────────────────────────────────────────────
  const totalLeads = activeClients.length;
  const noWebTotal = activeClients.filter(
    (c) => !c.websiteUrl || c.websiteQuality === 'No Website' || (c.problemFound?.toLowerCase().includes('no website'))
  ).length;
  const withWebTotal = totalLeads - noWebTotal;

  const maxCategoryTotal = Math.max(...categoryData.map((d) => d.total), 1);

  if (totalLeads === 0) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-[500px] gap-4 text-center">
        <BarChart2 className="w-16 h-16 text-slate-300" />
        <h2 className="text-xl font-bold text-slate-900 dark:text-white">No lead data yet</h2>
        <p className="text-sm text-slate-500">Import a CSV or add leads to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200/80 dark:border-slate-800/80">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <BarChart2 className="w-6 h-6 text-emerald-500" />
            Market Analytics
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Lead distribution and website opportunities by category and city.
          </p>
        </div>
        <button
          onClick={() => exportLeadsToCSV(clients)}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
        >
          <Download className="w-3.5 h-3.5 text-blue-500" />
          Export CSV
        </button>
      </div>

      {/* ── Summary totals ───────────────────────────────────────────────────── */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 shadow-xs text-center">
          <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{totalLeads}</div>
          <div className="text-xs text-slate-500 mt-1">Total Active Leads</div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-4 shadow-xs text-center">
          <div className="text-3xl font-extrabold text-amber-600 dark:text-amber-400">{noWebTotal}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            <AlertTriangle className="w-3 h-3 text-amber-500" />No Website
          </div>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-200 dark:border-emerald-800/50 p-4 shadow-xs text-center">
          <div className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400">{withWebTotal}</div>
          <div className="text-xs text-slate-500 mt-1 flex items-center justify-center gap-1">
            <Globe className="w-3 h-3 text-emerald-500" />Has Website
          </div>
        </div>
      </div>

      {/* ── Website Coverage by Category ─────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 sm:p-6 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1 flex items-center gap-2">
          <Building2 className="w-4 h-4 text-indigo-500" />
          Website Coverage by Category
        </h2>
        <p className="text-xs text-slate-500 mb-5">
          Two bars per category: With Website (indigo) · No Website (amber)
        </p>

        <div className="space-y-4">
          {categoryData.map((cat) => (
            <div key={cat.name}>
              <div className="flex items-center justify-between text-xs mb-1.5">
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-[180px]">{cat.name}</span>
                <span className="font-mono text-slate-500 ml-2">{cat.total} leads</span>
              </div>

              {/* With Website bar */}
              <div className="flex items-center gap-2 mb-1">
                <div className="w-20 text-[10px] text-indigo-600 dark:text-indigo-400 font-medium text-right shrink-0">
                  With Site
                </div>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(cat.withWebsite / maxCategoryTotal) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-6 text-right">{cat.withWebsite}</span>
              </div>

              {/* No Website bar */}
              <div className="flex items-center gap-2">
                <div className="w-20 text-[10px] text-amber-600 dark:text-amber-400 font-medium text-right shrink-0">
                  No Website
                </div>
                <div className="flex-1 h-5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full transition-all"
                    style={{ width: `${(cat.noWebsite / maxCategoryTotal) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-mono text-slate-600 dark:text-slate-300 w-6 text-right">{cat.noWebsite}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Leads by City ────────────────────────────────────────────────────── */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-rose-500" />
          Leads by City
        </h2>
        <div className="space-y-2">
          {cityData.map(([city, count]) => (
            <div key={city} className="flex items-center gap-3">
              <span className="text-xs text-slate-700 dark:text-slate-300 font-medium w-28 truncate">{city}</span>
              <div className="flex-1 h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-400 rounded-full"
                  style={{ width: `${(count / Math.max(...cityData.map((d) => d[1]), 1)) * 100}%` }}
                />
              </div>
              <span className="text-xs font-mono text-slate-500 w-6 text-right">{count}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
