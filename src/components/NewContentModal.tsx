import React, { useState } from 'react';
import { X, Plus, Megaphone, DollarSign, Calendar, Sparkles } from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { ContentFormat, ContentPlatform, ContentStage } from '../types';

export const NewContentModal: React.FC = () => {
  const { isNewContentModalOpen, setNewContentModalOpen, addContentPiece, activeUser } = useWorkspace();

  const [title, setTitle] = useState('');
  const [platform, setPlatform] = useState<ContentPlatform>('Meta Ads');
  const [format, setFormat] = useState<ContentFormat>('Ad Campaign');
  const [stage, setStage] = useState<ContentStage>('Writing');
  const [angleHook, setAngleHook] = useState('');
  const [copyText, setCopyText] = useState('');
  const [targetAudience, setTargetAudience] = useState('Founders & Creators with 10k+ audience');
  const [adSpend, setAdSpend] = useState<number>(500);

  if (!isNewContentModalOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addContentPiece({
      title: title.trim(),
      platform,
      format,
      stage,
      angleHook: angleHook.trim() || 'Direct response hook testing monetization systems.',
      copyText: copyText.trim() || undefined,
      targetAudience: targetAudience.trim() || undefined,
      adSpend: format === 'Ad Campaign' ? Number(adSpend) || 0 : undefined,
      author: activeUser.name,
      tags: [format, platform],
    });

    setNewContentModalOpen(false);
    setTitle('');
    setAngleHook('');
    setCopyText('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-lg overflow-hidden flex flex-col">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">Plan Content / Ad Campaign</h2>
              <p className="text-xs text-slate-400">
                Track ad creatives, scripts, carousels, and performance.
              </p>
            </div>
          </div>
          <button
            onClick={() => setNewContentModalOpen(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Campaign / Content Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Meta Ads: Stop Running Your Creator Business on Google Sheets"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Platform</label>
              <select
                value={platform}
                onChange={(e) => setPlatform(e.target.value as ContentPlatform)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Meta Ads">Meta Ads (Facebook/IG)</option>
                <option value="Google Ads">Google Ads</option>
                <option value="X">X / Twitter</option>
                <option value="YouTube">YouTube</option>
                <option value="LinkedIn">LinkedIn</option>
                <option value="Instagram">Instagram</option>
                <option value="TikTok">TikTok</option>
                <option value="Newsletter">Newsletter</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Format</label>
              <select
                value={format}
                onChange={(e) => setFormat(e.target.value as ContentFormat)}
                className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="Ad Campaign">Ad Campaign</option>
                <option value="Short Video">Short Video (Reels/Shorts)</option>
                <option value="Carousel">Carousel / Graphic</option>
                <option value="Thread">Long-form / Thread</option>
                <option value="Video Long">YouTube Longform</option>
                <option value="Article">Case Study / Article</option>
              </select>
            </div>
          </div>

          {format === 'Ad Campaign' && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ad Budget / Spend ($)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  value={adSpend}
                  onChange={(e) => setAdSpend(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs font-mono bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Initial Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value as ContentStage)}
                  className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
                >
                  <option value="Idea">Idea</option>
                  <option value="Research">Research</option>
                  <option value="Writing">Writing</option>
                  <option value="Design">Design</option>
                  <option value="Scheduled">Scheduled</option>
                  <option value="Published">Published</option>
                  <option value="Performance">Performance</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Angle / Opening Hook
            </label>
            <input
              type="text"
              placeholder="e.g. Stop losing $5k/mo on churned coaching clients..."
              value={angleHook}
              onChange={(e) => setAngleHook(e.target.value)}
              className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ad Body Script / Outline
            </label>
            <textarea
              rows={3}
              placeholder="Problem, Agitation, Solution, and Call to Action..."
              value={copyText}
              onChange={(e) => setCopyText(e.target.value)}
              className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
            <button
              type="button"
              onClick={() => setNewContentModalOpen(false)}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-lg transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
              <span>Add to Content Pipeline</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
