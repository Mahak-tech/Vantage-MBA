import React, { useState, useEffect } from 'react';
import {
  RotateCcw,
  Sparkles,
  Layers,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Clock,
  ArrowRight,
  Trash2,
  BookOpen
} from 'lucide-react';
import { Subject, Note, Flashcard } from '../types';
import { api } from '../services/api';

interface RevisionCentreViewProps {
  subjects: Subject[];
  onNavigate: (tab: string, subjectId?: string) => void;
}

export const RevisionCentreView: React.FC<RevisionCentreViewProps> = ({
  subjects,
  onNavigate
}) => {
  const [revisionData, setRevisionData] = useState<{
    weakTopics: any[];
    dueFlashcardsCount: number;
    dueFlashcards: Flashcard[];
    recentNotes: Note[];
  }>({
    weakTopics: [],
    dueFlashcardsCount: 0,
    dueFlashcards: [],
    recentNotes: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRevisionData();
  }, []);

  const loadRevisionData = async () => {
    try {
      setLoading(true);
      const data = await api.getRevisionData();
      setRevisionData(data);
    } catch (err) {
      console.error('Failed to load revision data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDismissTopic = async (id: string) => {
    try {
      await api.dismissRevisionItem(id);
      loadRevisionData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-8 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 text-xs font-semibold border border-indigo-100 dark:border-indigo-900/50">
            <RotateCcw className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
            <span>Spaced Repetition & Weak Topic Remediation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Smart Revision Centre</h1>
          <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm leading-relaxed">
            Consolidate your long-term memory. Your revision queue is algorithmically prioritized based on flashcard intervals and quiz errors.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800/60 p-5 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-xs shrink-0">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center border border-indigo-100 dark:border-indigo-900/50">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-3xl font-bold text-slate-900 dark:text-white">
              {revisionData.dueFlashcardsCount}
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Flashcards Due Today</span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Weak Topics + Spaced Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Weak Topics flagged from quizzes */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" />
              <span>Priority Difficult Topics ({revisionData.weakTopics.length})</span>
            </h2>
            <span className="text-xs text-slate-500 dark:text-slate-400">Auto-flagged from missed quiz questions</span>
          </div>

          {revisionData.weakTopics.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <p className="font-semibold text-slate-900 dark:text-white">No difficult topics flagged right now.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Topics will automatically appear here when quiz scores drop below 70%.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {revisionData.weakTopics.map((item) => {
                const sub = subjects.find(s => s.id === item.subjectId);
                return (
                  <div
                    key={item.id}
                    className="p-4 rounded-xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 flex items-center justify-between gap-4"
                  >
                    <div>
                      <span className="text-[10px] font-semibold uppercase text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/50 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800/50">
                        {sub?.name || 'Subject'}
                      </span>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white mt-1.5">{item.topic}</h4>
                      <p className="text-[11px] text-amber-800 dark:text-amber-300 mt-0.5">{item.reason}</p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onNavigate('notes', item.subjectId)}
                        className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-semibold shadow-xs transition"
                      >
                        Review
                      </button>
                      <button
                        onClick={() => handleDismissTopic(item.id)}
                        className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition"
                        title="Dismiss"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Spaced Repetition Queue */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              <span>Today's Flashcard Retention Queue</span>
            </h2>
            <button
              onClick={() => onNavigate('flashcards')}
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold"
            >
              Start Full Review
            </button>
          </div>

          {revisionData.dueFlashcards.length === 0 ? (
            <div className="text-center py-10 text-slate-500 dark:text-slate-400 text-xs bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800 p-6 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto opacity-80" />
              <p className="font-semibold text-slate-900 dark:text-white">All flashcards are up to date! Great consistency.</p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Keep up your daily revision habit.</p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {revisionData.dueFlashcards.slice(0, 5).map((card) => {
                const sub = subjects.find(s => s.id === card.subjectId);
                return (
                  <div
                    key={card.id}
                    onClick={() => onNavigate('flashcards', card.subjectId)}
                    className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer transition flex items-center justify-between"
                  >
                    <div>
                      <span className="text-[10px] font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                        {sub?.name || 'Subject'}
                      </span>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white mt-1 line-clamp-1">{card.front}</p>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Quick Revision Cheat-Sheets (Recent High-Yield Notes) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <h2 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          <span>Quick 5-Minute Revision Cheat-Sheets</span>
        </h2>

        {revisionData.recentNotes.length === 0 ? (
          <p className="text-xs text-slate-500 dark:text-slate-400 italic">No notes generated yet.</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {revisionData.recentNotes.map((note) => {
              const sub = subjects.find(s => s.id === note.subjectId);
              return (
                <div
                  key={note.id}
                  onClick={() => onNavigate('notes', note.subjectId)}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:shadow-xs cursor-pointer transition bg-slate-50/60 dark:bg-slate-800/40 flex flex-col justify-between"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                      {sub?.name || 'Subject'}
                    </span>
                    <h4 className="text-xs font-semibold text-slate-900 dark:text-white mt-2 line-clamp-1">{note.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content.replace(/[#*`>]/g, '').substring(0, 90)}...
                    </p>
                  </div>

                  <div className="mt-4 pt-2.5 border-t border-slate-200 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold">
                    <span>Quick Read</span>
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
export default RevisionCentreView;
