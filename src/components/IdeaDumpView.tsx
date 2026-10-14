import React, { useState } from 'react';
import {
  Lightbulb,
  Plus,
  Sparkles,
  Search,
  ThumbsUp,
  ArrowRight,
  Trash2,
} from 'lucide-react';
import { useWorkspace } from '../context/WorkspaceContext';
import { IdeaCategory } from '../types';

export const IdeaDumpView: React.FC = () => {
  const {
    ideas,
    addIdea,
    voteIdea,
    deleteIdea,
    convertIdeaToProject,
    activeUser,
  } = useWorkspace();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<IdeaCategory>('App Concept');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const handleCreateIdea = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addIdea({
      title: title.trim(),
      description: description.trim() || undefined,
      content: description.trim() || title.trim(),
      category,
      priority: 'medium',
      author: activeUser.name,
      tags: [category],
    });

    setTitle('');
    setDescription('');
  };

  const filteredIdeas = ideas
    .filter((idea) => {
      const desc = idea.description || idea.content || '';
      const matchesSearch =
        idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        desc.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesCat =
        selectedCategoryFilter === 'all' || idea.category === selectedCategoryFilter;

      return matchesSearch && matchesCat;
    })
    .sort((a, b) => b.votes - a.votes);

  const getCategoryColor = (cat: IdeaCategory) => {
    switch (cat) {
      case 'App Concept':
      case 'SaaS / Tool':
        return 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800';
      case 'Service Offer':
      case 'Client Pitch':
        return 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800';
      case 'Content Hook':
      case 'Ad Angle':
        return 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800';
      case 'Internal Automation':
      case 'Studio Growth':
        return 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800';
      case 'Wild Experiment':
      case 'Quick Note':
        return 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800';
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700';
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
            <Lightbulb className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Idea Dump</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Quick-capture sparks, agency angles, software tools, and experimental concepts.
            </p>
          </div>
        </div>

        <div className="text-xs text-slate-400 dark:text-slate-500">
          <span className="font-semibold text-slate-700 dark:text-slate-300 font-mono">{ideas.length}</span> ideas logged
        </div>
      </div>

      {/* Quick Idea Dump Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-6 shadow-2xs transition-colors">
        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">Dump a new idea without friction</h2>
        </div>

        <form onSubmit={handleCreateIdea} className="space-y-3">
          <div>
            <input
              type="text"
              required
              placeholder="What's the raw spark? (e.g. AI voice intake agent for fitness coaching apps)"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-4 py-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <input
              type="text"
              placeholder="Optional notes or monetization angle..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="sm:col-span-2 px-4 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            />

            <div className="flex items-center gap-2">
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as IdeaCategory)}
                className="flex-1 px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 font-medium"
              >
                <option value="App Concept">App Concept</option>
                <option value="Service Offer">Service Offer</option>
                <option value="Content Hook">Content Hook</option>
                <option value="Internal Automation">Internal Automation</option>
                <option value="Wild Experiment">Wild Experiment</option>
              </select>

              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#4338CA] hover:bg-[#3730A3] rounded-xl transition-all shadow-sm shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Dump</span>
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search dumped ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all shadow-2xs"
          />
        </div>

        <div className="flex items-center gap-1 overflow-x-auto pb-1">
          {['all', 'App Concept', 'Service Offer', 'Content Hook', 'Internal Automation'].map(
            (cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategoryFilter === cat
                    ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                    : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            )
          )}
        </div>
      </div>

      {/* Dumped Ideas List */}
      {filteredIdeas.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-dashed border-slate-300/80 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center min-h-[260px] transition-colors">
          <Lightbulb className="w-8 h-8 text-slate-400 dark:text-slate-600 mb-2" />
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No ideas found</h3>
          <p className="text-xs text-slate-400 dark:text-slate-500 max-w-sm mt-1">
            Dump your first thought above to begin building your team repository.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIdeas.map((idea) => (
            <div
              key={idea.id}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 p-5 shadow-2xs hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getCategoryColor(
                      idea.category
                    )}`}
                  >
                    {idea.category}
                  </span>
                  <button
                    onClick={() => voteIdea(idea.id)}
                    className="flex items-center gap-1 text-[11px] font-mono font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    <ThumbsUp className="w-3 h-3" />
                    <span>{idea.votes}</span>
                  </button>
                </div>

                <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1.5 leading-snug">
                  {idea.title}
                </h3>

                {(idea.description || idea.content) && (
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 leading-relaxed">
                    {idea.description || idea.content}
                  </p>
                )}
              </div>

              <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                  By {idea.author || 'Team'}
                </span>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => convertIdeaToProject(idea.id)}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 flex items-center gap-1 hover:underline"
                  >
                    <span>To Project</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <button
                    onClick={() => deleteIdea(idea.id)}
                    className="p-1 text-slate-300 dark:text-slate-600 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
