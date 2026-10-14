import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Download,
  Copy,
  Check,
  Cloud,
  Loader2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { parseCSVString, convertRowsToLeads, getSampleCSVTemplate, STANDARD_CSV_HEADERS } from '../utils/csvParser';
import { Client } from '../types';

export const ImportCSVModal: React.FC = () => {
  const { clients, isImportCSVModalOpen, setImportCSVModalOpen, importClients, isFirestoreSyncing, firebaseUser } = useWorkspace();

  const [rawText, setRawText] = useState('');
  const [parsedRows, setParsedRows] = useState<Omit<Client, 'id' | 'dateAdded'>[]>([]);
  const [activeTab, setActiveTab] = useState<'upload' | 'paste'>('upload');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [importMode, setImportMode] = useState<'append' | 'replace'>('append');
  const [isTemplateCopied, setIsTemplateCopied] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  if (!isImportCSVModalOpen) return null;

  const handleCopyTemplate = () => {
    navigator.clipboard.writeText(getSampleCSVTemplate());
    setIsTemplateCopied(true);
    setTimeout(() => setIsTemplateCopied(false), 2000);
  };

  const handleDownloadTemplate = () => {
    const csvContent = getSampleCSVTemplate();
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'leads_template_11_columns.csv';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleProcessText = (text: string) => {
    setErrorMsg(null);
    setSuccessCount(null);

    if (!text.trim()) {
      setParsedRows([]);
      return;
    }

    try {
      const rows = parseCSVString(text);
      if (rows.length < 2) {
        setErrorMsg('CSV must have a header row and at least one lead row.');
        setParsedRows([]);
        return;
      }

      const leads = convertRowsToLeads(rows);
      if (leads.length === 0) {
        setErrorMsg('Could not detect valid lead records from CSV content.');
        setParsedRows([]);
        return;
      }

      setParsedRows(leads);
    } catch (err: any) {
      setErrorMsg('Error reading CSV: ' + (err.message || 'Unknown format'));
      setParsedRows([]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setRawText(content);
      handleProcessText(content);
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read file.');
    };
    reader.readAsText(file);
  };

  const handleImport = async () => {
    if (parsedRows.length === 0 || isImporting) return;
    setIsImporting(true);
    setErrorMsg(null);

    try {
      const count = await importClients(parsedRows, importMode === 'replace');
      setSuccessCount(count);
      setTimeout(() => {
        setImportCSVModalOpen(false);
        setParsedRows([]);
        setRawText('');
        setSuccessCount(null);
      }, 1400);
    } catch (err: any) {
      setErrorMsg('Failed to import leads: ' + (err?.message || 'Unknown error'));
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Import Leads from CSV
              </h3>
              <p className="text-xs text-slate-500">
                Optimized for your standard 11 columns: Title, Address, PhoneNumber, WebsiteURL, Industry, City, LeadPriority, MapsLink, WebsiteQuality, ProblemFound, Notes
              </p>
            </div>
          </div>
          <button
            onClick={() => setImportCSVModalOpen(false)}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Backend & Cloud Database Sync Indicator */}
        <div className="flex items-center justify-between px-3 py-2 rounded-xl text-xs bg-indigo-50/70 dark:bg-indigo-950/40 border border-indigo-200/80 dark:border-indigo-800/80 mt-3">
          <div className="flex items-center gap-2">
            <Cloud className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              Backend Storage:
            </span>
            <span className="text-slate-600 dark:text-slate-400">
              {firebaseUser ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                  Firebase Cloud Firestore (Multi-Device Team Sync Active)
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400 font-medium">
                  Server Storage Active • Sign in with Google (via Topbar) for live team cloud sync
                </span>
              )}
            </span>
          </div>
          {isFirestoreSyncing && (
            <div className="flex items-center gap-1 text-indigo-600 font-medium animate-pulse shrink-0">
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Syncing...</span>
            </div>
          )}
        </div>

        {/* 11-Column Quick Reference & Template Helper Banner */}
        <div className="bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 rounded-xl p-3 my-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Standardized 11-Column Format Ready</span>
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                Title • Address • PhoneNumber • WebsiteURL • Industry • City • LeadPriority • MapsLink • WebsiteQuality • ProblemFound • Notes
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleCopyTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition shadow-2xs"
                title="Copy sample CSV template with 11 columns"
              >
                {isTemplateCopied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-slate-500" />
                    <span>Copy Template</span>
                  </>
                )}
              </button>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/60 transition"
                title="Download .csv template file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .CSV</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 dark:border-slate-800 my-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('upload')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Upload .CSV File
          </button>
          <button
            onClick={() => setActiveTab('paste')}
            className={`pb-2.5 px-3 border-b-2 transition ${
              activeTab === 'paste'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Paste CSV Text
          </button>
        </div>

        {/* Body content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1">
          {activeTab === 'upload' ? (
            <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-8 text-center bg-slate-50/50 dark:bg-slate-800/30">
              <UploadCloud className="w-10 h-10 text-indigo-500 mx-auto mb-3" />
              <div className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1">
                Choose or drag your CSV file
              </div>
              <p className="text-xs text-slate-500 mb-4">
                Compatible with any Google Maps scraper or CSV lead list
              </p>
              <label className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer shadow-xs transition">
                <span>Select .CSV File</span>
                <input
                  type="file"
                  accept=".csv,text/csv"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          ) : (
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-600 dark:text-slate-300">
                Paste your raw CSV text with headers:
              </label>
              <textarea
                rows={6}
                value={rawText}
                onChange={(e) => {
                  setRawText(e.target.value);
                  handleProcessText(e.target.value);
                }}
                placeholder="Title,Address,PhoneNumber,WebsiteURL,Industry,City,LeadPriority,MapsLink,WebsiteQuality,ProblemFound,Notes..."
                className="w-full text-xs font-mono p-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          )}

          {/* Error notice */}
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Success notice */}
          {successCount !== null && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 text-xs font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Successfully imported {successCount} leads into your database!</span>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedRows.length > 0 && (
            <div className="space-y-2">
              <div className="bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1.5">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs font-semibold">
                  <span className="text-slate-800 dark:text-slate-200">
                    Detected <strong className="text-emerald-600 font-bold">{parsedRows.length} new leads</strong> to import:
                  </span>
                  <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-bold text-indigo-600 dark:text-indigo-400">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'append'}
                        onChange={() => setImportMode('append')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Append to existing</span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer text-xs font-medium text-slate-500 hover:text-rose-600">
                      <input
                        type="radio"
                        name="importMode"
                        checked={importMode === 'replace'}
                        onChange={() => setImportMode('replace')}
                        className="text-indigo-600 focus:ring-indigo-500"
                      />
                      <span>Replace all</span>
                    </label>
                  </div>
                </div>
                <div className="text-[11px]">
                  {importMode === 'append' ? (
                    <span className="text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>Your existing {clients.length} leads will be preserved. Total leads after import will be {clients.length + parsedRows.length}.</span>
                    </span>
                  ) : (
                    <span className="text-rose-600 dark:text-rose-400 font-medium flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>Warning: This will clear your current {clients.length} leads and replace them with these {parsedRows.length} leads.</span>
                    </span>
                  )}
                </div>
              </div>

              <div className="max-h-48 overflow-y-auto border border-slate-200 dark:border-slate-800 rounded-lg text-xs">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 dark:bg-slate-800 text-[11px] text-slate-500 uppercase sticky top-0">
                    <tr>
                      <th className="p-2">Title</th>
                      <th className="p-2">Industry</th>
                      <th className="p-2">Phone</th>
                      <th className="p-2">Priority</th>
                      <th className="p-2">Quality</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {parsedRows.slice(0, 10).map((r, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/50">
                        <td className="p-2 font-medium truncate max-w-[150px]">{r.title || r.name}</td>
                        <td className="p-2 truncate max-w-[100px]">{r.industry}</td>
                        <td className="p-2 font-mono text-[11px]">{r.phoneNumber || '—'}</td>
                        <td className="p-2">
                          <span className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                            r.leadPriority === 'High' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {r.leadPriority}
                          </span>
                        </td>
                        <td className="p-2 text-[11px]">{r.websiteQuality}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {parsedRows.length > 10 && (
                <div className="text-[11px] text-slate-400 text-center">
                  + {parsedRows.length - 10} more rows
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 mt-auto">
          <button
            onClick={() => setImportCSVModalOpen(false)}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition"
          >
            Cancel
          </button>

          <button
            disabled={parsedRows.length === 0 || isImporting}
            onClick={handleImport}
            className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white shadow-sm transition"
          >
            {isImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Storing {parsedRows.length} Leads in Backend...</span>
              </>
            ) : (
              <>
                <span>Import {parsedRows.length} Leads</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
