import React, { useState, useMemo } from 'react';
import {
  Megaphone,
  Plus,
  Search,
  ChevronDown,
  Sparkles,
  ArrowRight,
  TrendingUp,
  DollarSign,
  Calendar,
  Layers,
  Trash2,
  Tag,
  Pencil,
  X,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { CONTENT_STAGES, ContentStage, ContentPlatform, ContentPiece } from '../types';

export const ContentView: React.FC = () => {
  const {
    contentPieces,
    moveContentStage,
    updateContentPiece,
    deleteContentPiece,
    setNewContentModalOpen,
  } = useWorkspace();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [editingPiece, setEditingPiece] = useState<ContentPiece | null>(null);

  const filteredPieces = useMemo(() => {
    return contentPieces.filter((piece) => {
      const matchesSearch =
        piece.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        piece.angleHook.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (piece.copyText && piece.copyText.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesPlatform =
        selectedPlatform === 'all' || piece.platform === selectedPlatform;

      return matchesSearch && matchesPlatform;
    });
  }, [contentPieces, searchQuery, selectedPlatform]);

  const getStageBadgeStyle = (stage: ContentStage) => {
    switch (stage) {
      case 'Idea':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Research':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Writing':
        return 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800';
      case 'Design':
        return 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800';
      case 'Scheduled':
        return 'bg-yellow-50 dark:bg-yellow-950/60 text-yellow-700 dark:text-yellow-300 border-yellow-200 dark:border-yellow-800';
      case 'Published':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Performance':
        return 'bg-teal-50 dark:bg-teal-950/60 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800';
      default:
        return 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  const getNextStage = (current: ContentStage): ContentStage | null => {
    const idx = CONTENT_STAGES.indexOf(current);
    if (idx !== -1 && idx < CONTENT_STAGES.length - 1) {
      return CONTENT_STAGES[idx + 1];
    }
    return null;
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
            <Megaphone className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
              Content & Ad Campaign Hub
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Plan creator ad campaigns, organic authority threads, and angle testing.
            </p>
          </div>
        </div>

        <button
          id="content-new-piece-btn"
          onClick={() => setNewContentModalOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-medium text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Plan Campaign / Post</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search campaigns by hook, angle, title, or platform..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
          />
        </div>

        <div className="relative">
          <select
            value={selectedPlatform}
            onChange={(e) => setSelectedPlatform(e.target.value)}
            className="appearance-none w-full sm:w-44 pl-3.5 pr-8 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs cursor-pointer font-medium"
          >
            <option value="all">All channels</option>
            <option value="Meta Ads">Meta Ads</option>
            <option value="Google Ads">Google Ads</option>
            <option value="X / Twitter">X / Twitter</option>
            <option value="YouTube">YouTube</option>
            <option value="LinkedIn">LinkedIn</option>
            <option value="Newsletter">Newsletter</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-4 items-start overflow-x-auto pb-6">
        {CONTENT_STAGES.map((stage) => {
          const piecesInStage = filteredPieces.filter((p) => p.stage === stage);

          return (
            <div
              key={stage}
              className="bg-slate-50/70 dark:bg-slate-950/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 min-w-[210px] flex flex-col min-h-[500px] transition-colors"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/60 dark:border-slate-800">
                <span
                  className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getStageBadgeStyle(
                    stage
                  )}`}
                >
                  {stage}
                </span>
                <span className="text-xs font-mono font-bold text-slate-400 dark:text-slate-500">
                  {piecesInStage.length}
                </span>
              </div>

              {/* Cards list */}
              <div className="space-y-3 flex-1">
                {piecesInStage.length === 0 ? (
                  <div className="border border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-6 text-center text-xs text-slate-400 dark:text-slate-600 font-medium">
                    Empty
                  </div>
                ) : (
                  piecesInStage.map((piece) => {
                    const next = getNextStage(piece.stage);
                    const isAd =
                      piece.format === 'Ad Campaign' ||
                      piece.platform === 'Meta Ads' ||
                      piece.platform === 'Google Ads';

                    return (
                      <div
                        key={piece.id}
                        className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200/80 dark:border-slate-800 p-3.5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between group"
                      >
                        <div>
                          {/* Format & Platform pills */}
                          <div className="flex items-center justify-between gap-1 mb-2">
                            <span
                              className={`text-[10px] font-semibold px-1.5 py-0.2 rounded ${
                                isAd
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-100 dark:border-rose-900 font-bold'
                                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                              }`}
                            >
                              {piece.format}
                            </span>
                            <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
                              {piece.platform}
                            </span>
                          </div>

                          <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                            {piece.title}
                          </h4>

                          {piece.angleHook && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-3 mb-2 bg-slate-50 dark:bg-slate-800/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800">
                              {piece.angleHook}
                            </p>
                          )}

                          {piece.adSpend !== undefined && piece.adSpend > 0 && (
                            <div className="flex items-center justify-between text-[11px] font-mono p-1.5 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 rounded border border-emerald-100 dark:border-emerald-900/60 mb-2">
                              <span>Spend: ${piece.adSpend}</span>
                              <span>ROAS: {piece.roas ? `${piece.roas}x` : '–'}</span>
                            </div>
                          )}
                        </div>

                        {/* Card bottom actions */}
                        <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between mt-2">
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setEditingPiece(piece)}
                              className="text-slate-300 hover:text-indigo-600 dark:text-slate-600 dark:hover:text-indigo-400 p-1 rounded transition-colors"
                              title="Edit piece"
                            >
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => deleteContentPiece(piece.id)}
                              className="text-slate-300 hover:text-rose-600 dark:text-slate-600 dark:hover:text-rose-400 p-1 rounded transition-colors"
                              title="Delete"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {next && (
                            <button
                              onClick={() => moveContentStage(piece.id, next)}
                              className="text-[10px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1 hover:underline"
                            >
                              <span>Move to {next}</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit Content Modal */}
      {editingPiece && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-lg p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">Edit Content Piece</h3>
              <button
                onClick={() => setEditingPiece(null)}
                className="w-7 h-7 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title / Headline</label>
                <input
                  type="text"
                  value={editingPiece.title}
                  onChange={(e) => setEditingPiece({ ...editingPiece, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Platform</label>
                  <select
                    value={editingPiece.platform}
                    onChange={(e) => setEditingPiece({ ...editingPiece, platform: e.target.value as ContentPlatform })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    <option value="LinkedIn">LinkedIn</option>
                    <option value="X / Twitter">X / Twitter</option>
                    <option value="YouTube">YouTube</option>
                    <option value="Meta Ads">Meta Ads</option>
                    <option value="TikTok">TikTok</option>
                    <option value="Newsletter">Newsletter</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Stage</label>
                  <select
                    value={editingPiece.stage}
                    onChange={(e) => setEditingPiece({ ...editingPiece, stage: e.target.value as ContentStage })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  >
                    {CONTENT_STAGES.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Angle / Psychological Hook</label>
                <textarea
                  rows={2}
                  value={editingPiece.angleHook}
                  onChange={(e) => setEditingPiece({ ...editingPiece, angleHook: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Draft Script / Copy</label>
                <textarea
                  rows={3}
                  value={editingPiece.copyText || ''}
                  onChange={(e) => setEditingPiece({ ...editingPiece, copyText: e.target.value })}
                  placeholder="Draft script, post body, or carousel points..."
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Ad Spend ($)</label>
                  <input
                    type="number"
                    value={editingPiece.adSpend || 0}
                    onChange={(e) => setEditingPiece({ ...editingPiece, adSpend: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">ROAS Multiple</label>
                  <input
                    type="number"
                    step="0.1"
                    value={editingPiece.roas || 0}
                    onChange={(e) => setEditingPiece({ ...editingPiece, roas: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-slate-100 focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setEditingPiece(null)}
                  className="px-3 py-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    updateContentPiece(editingPiece.id, editingPiece);
                    setEditingPiece(null);
                  }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-colors shadow-sm"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
