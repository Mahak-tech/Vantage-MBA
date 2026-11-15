import React, { useState, useEffect } from 'react';
import { Search, X, BookOpen, FileText, Layers, HelpCircle, Sparkles, FolderOpen, ArrowRight } from 'lucide-react';
import { api } from '../services/api';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (tab: string, subjectId?: string) => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({
  isOpen,
  onClose,
  onNavigate
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{
    subjects: any[];
    documents: any[];
    notes: any[];
    flashcards: any[];
    questions: any[];
    visualItems: any[];
  }>({
    subjects: [],
    documents: [],
    notes: [],
    flashcards: [],
    questions: [],
    visualItems: []
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults({ subjects: [], documents: [], notes: [], flashcards: [], questions: [], visualItems: [] });
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setLoading(true);
        const data = await api.search(query);
        setResults(data);
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalHits =
    results.subjects.length +
    results.documents.length +
    results.notes.length +
    results.flashcards.length +
    results.questions.length +
    results.visualItems.length;

  const handleSelect = (tab: string, subjectId?: string) => {
    onNavigate(tab, subjectId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        {/* Search Input */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-slate-50 dark:bg-slate-850">
          <Search className="w-5 h-5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search everything across all MBA subjects, slides & notes..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none bg-transparent"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="text-[10px] bg-white dark:bg-slate-800 text-slate-500 font-semibold px-2 py-1 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-4 space-y-4">
          {loading && (
            <div className="text-center py-6 text-xs text-slate-500 dark:text-slate-400">
              Searching knowledge repository...
            </div>
          )}

          {!loading && query && totalHits === 0 && (
            <div className="text-center py-8 text-slate-500 dark:text-slate-400">
              <p className="text-sm font-bold text-slate-900 dark:text-white">No results found for "{query}"</p>
              <p className="text-xs mt-1">Try another keyword, subject name, or topic.</p>
            </div>
          )}

          {!query && (
            <div className="py-6 px-2 text-xs text-slate-500 dark:text-slate-400 space-y-2.5">
              <p className="font-bold text-slate-400 uppercase text-[10px] tracking-wider">Quick Suggestions</p>
              <div className="flex flex-wrap gap-2">
                {['Valuation', 'Customer Lifetime Value', 'Break-even', 'Price Elasticity', 'Agile vs Waterfall', 'Equilibrium'].map(tag => (
                  <button
                    key={tag}
                    onClick={() => setQuery(tag)}
                    className="px-3 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-400 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-medium transition border border-slate-200 dark:border-slate-700"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subjects */}
          {results.subjects.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Subjects ({results.subjects.length})</span>
              </div>
              <div className="space-y-1">
                {results.subjects.map(s => (
                  <button
                    key={s.id}
                    onClick={() => handleSelect('subjects', s.id)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{s.name}</p>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{s.description || s.code || 'Subject Workspace'}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Notes */}
          {results.notes.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>AI Notes ({results.notes.length})</span>
              </div>
              <div className="space-y-1">
                {results.notes.map(n => (
                  <button
                    key={n.id}
                    onClick={() => handleSelect('notes', n.subjectId)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{n.title}</p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{n.type} notes</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Visual Items */}
          {results.visualItems.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>Visual Studio Models ({results.visualItems.length})</span>
              </div>
              <div className="space-y-1">
                {results.visualItems.map(v => (
                  <button
                    key={v.id}
                    onClick={() => handleSelect('visual', v.subjectId)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400">{v.title}</p>
                      <span className="text-[10px] text-indigo-600 dark:text-indigo-400 font-semibold uppercase">{v.mode} mode</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Documents */}
          {results.documents.length > 0 && (
            <div>
              <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                <FolderOpen className="w-3.5 h-3.5 text-emerald-600" />
                <span>Course Materials ({results.documents.length})</span>
              </div>
              <div className="space-y-1">
                {results.documents.map(d => (
                  <button
                    key={d.id}
                    onClick={() => handleSelect('materials', d.subjectId)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 text-left transition group border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
                  >
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400">{d.title}</p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 uppercase font-semibold">{d.fileType}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
export default GlobalSearchModal;
