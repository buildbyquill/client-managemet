import React, { useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  Legend,
} from 'recharts';
import { Flame, AlertTriangle, Building2, Globe, Layers, Filter, CheckCircle2 } from 'lucide-react';
import { Client } from '../types';

export type ChartViewType = 'stacked-industry' | 'priority' | 'website-health';

interface LeadAnalyticsChartProps {
  clients: Client[];
  activeFilterIndustry: string;
  activeFilterPriority: string;
  activeFilterWebsite: string;
  onFilterIndustry: (industry: string) => void;
  onFilterPriority: (priority: string) => void;
  onFilterWebsite: (websiteStatus: string) => void;
  onResetFilters: () => void;
}

export const LeadAnalyticsChart: React.FC<LeadAnalyticsChartProps> = ({
  clients,
  activeFilterIndustry,
  activeFilterPriority,
  activeFilterWebsite,
  onFilterIndustry,
  onFilterPriority,
  onFilterWebsite,
  onResetFilters,
}) => {
  const [chartView, setChartView] = React.useState<ChartViewType>('stacked-industry');

  // Compute dynamic Industry distribution with stacked Website info
  const industryData = useMemo(() => {
    const map = new Map<string, { total: number; noWebsite: number; hasWebsite: number; highPriority: number }>();

    clients.forEach((client) => {
      const ind = client.industry || client.niche || 'Other';
      if (!map.has(ind)) {
        map.set(ind, { total: 0, noWebsite: 0, hasWebsite: 0, highPriority: 0 });
      }
      const item = map.get(ind)!;
      item.total += 1;

      const hasNoWeb =
        !client.websiteUrl ||
        client.websiteQuality === 'No Website' ||
        (client.problemFound && client.problemFound.toLowerCase().includes('no website'));

      if (hasNoWeb) {
        item.noWebsite += 1;
      } else {
        item.hasWebsite += 1;
      }

      const isHigh = (client.leadPriority || client.priority) === 'High';
      if (isHigh) {
        item.highPriority += 1;
      }
    });

    return Array.from(map.entries()).map(([name, data]) => ({
      name,
      'No Website': data.noWebsite,
      'Has Website': data.hasWebsite,
      'High Priority': data.highPriority,
      total: data.total,
    }));
  }, [clients]);

  // Compute Priority distribution
  const priorityData = useMemo(() => {
    let highNoWeb = 0;
    let highHasWeb = 0;
    let lowNoWeb = 0;
    let lowHasWeb = 0;

    clients.forEach((c) => {
      const isHigh = (c.leadPriority || c.priority) === 'High';
      const hasNoWeb =
        !c.websiteUrl ||
        c.websiteQuality === 'No Website' ||
        (c.problemFound && c.problemFound.toLowerCase().includes('no website'));

      if (isHigh) {
        if (hasNoWeb) highNoWeb++;
        else highHasWeb++;
      } else {
        if (hasNoWeb) lowNoWeb++;
        else lowHasWeb++;
      }
    });

    return [
      {
        name: 'High Priority',
        key: 'High',
        'No Website (Hot Pitch)': highNoWeb,
        'Has Website (Redesign)': highHasWeb,
        total: highNoWeb + highHasWeb,
      },
      {
        name: 'Low Priority',
        key: 'Low',
        'No Website (Hot Pitch)': lowNoWeb,
        'Has Website (Redesign)': lowHasWeb,
        total: lowNoWeb + lowHasWeb,
      },
    ];
  }, [clients]);

  // Compute Website Health distribution
  const websiteData = useMemo(() => {
    let noWebCount = 0;
    let hasWebCount = 0;

    clients.forEach((c) => {
      const hasNoWeb =
        !c.websiteUrl ||
        c.websiteQuality === 'No Website' ||
        (c.problemFound && c.problemFound.toLowerCase().includes('no website'));

      if (hasNoWeb) noWebCount++;
      else hasWebCount++;
    });

    return [
      {
        name: 'No Website (Direct Dev Pitch)',
        statusKey: 'no-website',
        count: noWebCount,
        color: '#F59E0B',
      },
      {
        name: 'Has Website (Redesign / Audit)',
        statusKey: 'has-website',
        count: hasWebCount,
        color: '#6366F1',
      },
    ];
  }, [clients]);

  // Summary counts
  const totalLeads = clients.length;
  const noWebTotal = clients.filter(
    (c) =>
      !c.websiteUrl ||
      c.websiteQuality === 'No Website' ||
      (c.problemFound && c.problemFound.toLowerCase().includes('no website'))
  ).length;
  const highPriorityTotal = clients.filter(
    (c) => (c.leadPriority || c.priority) === 'High'
  ).length;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-xs transition-colors">
      {/* Chart Header & Mode Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Lead Distribution & Outreach Analytics</span>
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-medium">
              Click any bar to filter
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Interactive breakdown showing categories, website presence, and priority status across your pipeline.
          </p>
        </div>

        {/* Tab switcher: Idea 1 & 2 */}
        <div className="flex items-center bg-slate-100 dark:bg-slate-800/90 p-1 rounded-xl border border-slate-200 dark:border-slate-700 text-xs shrink-0 self-start sm:self-auto">
          <button
            onClick={() => setChartView('stacked-industry')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              chartView === 'stacked-industry'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>By Category (Stacked)</span>
          </button>

          <button
            onClick={() => setChartView('priority')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              chartView === 'priority'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5 text-rose-500" />
            <span>By Priority</span>
          </button>

          <button
            onClick={() => setChartView('website-health')}
            className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1.5 transition ${
              chartView === 'website-health'
                ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Globe className="w-3.5 h-3.5 text-amber-500" />
            <span>Website Status</span>
          </button>
        </div>
      </div>

      {/* Main Chart Area */}
      <div className="pt-4 grid grid-cols-1 lg:grid-cols-4 gap-6 items-center">
        {/* The Recharts Graphic (3 cols) */}
        <div className="lg:col-span-3 h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            {chartView === 'stacked-industry' ? (
              <BarChart
                data={industryData}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                onClick={(e) => {
                  if (e && e.activeLabel) {
                    onFilterIndustry(e.activeLabel as string);
                  }
                }}
                className="cursor-pointer"
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                      return (
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1 z-50">
                          <p className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-1 border-slate-100 dark:border-slate-800">
                            {label} ({total} Total Leads)
                          </p>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-bold font-mono text-slate-900 dark:text-white">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                          <p className="text-[10px] text-indigo-600 dark:text-indigo-400 pt-1 font-medium italic">
                            Click bar to filter leads below
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                />
                {/* Stacked Bars: No Website (Gold) & Has Website (Indigo) */}
                <Bar
                  dataKey="No Website"
                  stackId="a"
                  fill="#F59E0B"
                  radius={[0, 0, 0, 0]}
                  name="No Website (Hot Opportunity)"
                />
                <Bar
                  dataKey="Has Website"
                  stackId="a"
                  fill="#6366F1"
                  radius={[6, 6, 0, 0]}
                  name="Has Website (Redesign/Audit)"
                />
              </BarChart>
            ) : chartView === 'priority' ? (
              <BarChart
                data={priorityData}
                margin={{ top: 10, right: 20, left: -10, bottom: 20 }}
                onClick={(e: any) => {
                  if (e && e.activeLabel) {
                    const labelStr = String(e.activeLabel);
                    const key = labelStr.includes('High') ? 'High' : 'Low';
                    onFilterPriority(key);
                  }
                }}
                className="cursor-pointer"
              >
                <XAxis
                  dataKey="name"
                  tick={{ fontSize: 12, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <YAxis
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                  tickLine={false}
                  axisLine={{ stroke: '#CBD5E1' }}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(244, 63, 94, 0.08)' }}
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const total = payload.reduce((acc, curr) => acc + (Number(curr.value) || 0), 0);
                      return (
                        <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xl text-xs space-y-1 z-50">
                          <p className="font-bold text-slate-900 dark:text-white border-b pb-1 mb-1 border-slate-100 dark:border-slate-800">
                            {label} ({total} Leads)
                          </p>
                          {payload.map((entry, idx) => (
                            <div key={idx} className="flex items-center justify-between gap-4">
                              <span className="flex items-center gap-1.5" style={{ color: entry.color }}>
                                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                                {entry.name}:
                              </span>
                              <span className="font-bold font-mono text-slate-900 dark:text-white">
                                {entry.value}
                              </span>
                            </div>
                          ))}
                          <p className="text-[10px] text-rose-600 dark:text-rose-400 pt-1 font-medium italic">
                            Click to filter {label}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend
                  verticalAlign="top"
                  align="right"
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{ fontSize: 12, paddingBottom: 10 }}
                />
                <Bar
                  dataKey="No Website (Hot Pitch)"
                  stackId="prio"
                  fill="#E11D48"
                  radius={[0, 0, 0, 0]}
                />
                <Bar
                  dataKey="Has Website (Redesign)"
                  stackId="prio"
                  fill="#3B82F6"
                  radius={[6, 6, 0, 0]}
                />
              </BarChart>
            ) : (
              <BarChart
                data={websiteData}
                layout="vertical"
                margin={{ top: 10, right: 30, left: 40, bottom: 10 }}
                onClick={(e: any) => {
                  if (e && e.activePayload && e.activePayload[0]) {
                    const statusKey = e.activePayload[0].payload.statusKey;
                    onFilterWebsite(statusKey);
                  }
                }}
                className="cursor-pointer"
              >
                <XAxis
                  type="number"
                  allowDecimals={false}
                  tick={{ fontSize: 11, fill: '#64748B' }}
                />
                <YAxis
                  type="category"
                  dataKey="name"
                  tick={{ fontSize: 11, fill: '#475569' }}
                  width={160}
                />
                <Tooltip
                  cursor={{ fill: 'rgba(99, 102, 241, 0.08)' }}
                  formatter={(val: any) => [`${val} Leads`, 'Count']}
                />
                <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                  {websiteData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            )}
          </ResponsiveContainer>
        </div>

        {/* Actionable Strategy Callout Sidebar (1 col) */}
        <div className="bg-slate-50 dark:bg-slate-800/60 rounded-xl p-4 border border-slate-200/80 dark:border-slate-700/80 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300 flex items-center justify-between">
            <span>Market Summary</span>
            <span className="font-mono text-indigo-600 dark:text-indigo-400 font-bold">
              {totalLeads} Total
            </span>
          </div>

          <div className="space-y-2 text-xs">
            {/* Quick Filter Item: Missing Website */}
            <button
              onClick={() => onFilterWebsite(activeFilterWebsite === 'no-website' ? 'all' : 'no-website')}
              className={`w-full text-left p-2.5 rounded-lg border transition ${
                activeFilterWebsite === 'no-website'
                  ? 'bg-amber-100/70 dark:bg-amber-950/70 border-amber-400 text-amber-900 dark:text-amber-200 font-semibold ring-2 ring-amber-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-amber-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                  No Website:
                </span>
                <span className="font-bold font-mono text-amber-900 dark:text-amber-200">
                  {noWebTotal} ({totalLeads > 0 ? Math.round((noWebTotal / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Highest pitch conversion rate. Businesses rely solely on phone/storefront.
              </p>
            </button>

            {/* Quick Filter Item: High Priority */}
            <button
              onClick={() => onFilterPriority(activeFilterPriority === 'High' ? 'all' : 'High')}
              className={`w-full text-left p-2.5 rounded-lg border transition ${
                activeFilterPriority === 'High'
                  ? 'bg-rose-100/70 dark:bg-rose-950/70 border-rose-400 text-rose-900 dark:text-rose-200 font-semibold ring-2 ring-rose-500/20'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-rose-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 font-medium text-rose-800 dark:text-rose-300">
                  <Flame className="w-3.5 h-3.5 text-rose-500" />
                  High Priority:
                </span>
                <span className="font-bold font-mono text-rose-900 dark:text-rose-200">
                  {highPriorityTotal} ({totalLeads > 0 ? Math.round((highPriorityTotal / totalLeads) * 100) : 0}%)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                Established local businesses with urgent digital or brand presence needs.
              </p>
            </button>
          </div>

          {(activeFilterIndustry !== 'all' || activeFilterPriority !== 'all' || activeFilterWebsite !== 'all') && (
            <button
              onClick={onResetFilters}
              className="w-full text-center py-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-bold"
            >
              Reset Chart Filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
