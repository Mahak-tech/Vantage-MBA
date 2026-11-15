import React from 'react';
import {
  TrendingUp,
  Award,
  Layers,
  FileText,
  HelpCircle,
  FolderOpen,
  CheckCircle2,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Subject, StudyDocument, Note, Flashcard, QuizAttempt } from '../../types';

interface LearningProgressSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: QuizAttempt[];
  onNavigateToTab: (tabId: string) => void;
}

export const LearningProgressSection: React.FC<LearningProgressSectionProps> = ({
  subject,
  documents,
  notes,
  flashcards,
  quizzes,
  onNavigateToTab
}) => {
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.status === 'mastered').length;

  const cardMasteryPercent = totalCards > 0 ? Math.round((masteredCards / totalCards) * 100) : 0;
  const avgQuizScore = quizzes.length > 0
    ? Math.round(quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length)
    : 0;

  // Composite Subject Mastery Score
  const subjectMastery = Math.min(
    100,
    Math.round((cardMasteryPercent * 0.4) + (avgQuizScore * 0.4) + (Math.min(20, documents.length * 5)))
  );

  // Collect weak topics from quizzes
  const weakTopics: { topic: string; percentage: number }[] = [];
  quizzes.forEach(q => {
    q.topicBreakdown?.forEach(t => {
      if (t.percentage < 70 && !weakTopics.some(w => w.topic === t.topic)) {
        weakTopics.push({ topic: t.topic, percentage: t.percentage });
      }
    });
  });

  return (
    <div className="space-y-6">
      {/* Top Mastery Overview Card */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-8 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2 max-w-md">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-1 rounded-md border border-indigo-100 dark:border-indigo-900/50">
            Subject Competency Index
          </span>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {subjectMastery >= 80 ? 'Mastery Achieved' : subjectMastery >= 50 ? 'Steady Progress' : 'Building Foundations'}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Calculated across flashcard spaced retention, mock test performance, and course document coverage for {subject.name}.
          </p>
        </div>

        <div className="flex items-center gap-5 bg-slate-50 dark:bg-slate-850 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 self-start sm:self-center">
          <div className="w-16 h-16 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-sm">
            {subjectMastery}%
          </div>
          <div>
            <span className="text-xs font-bold text-slate-900 dark:text-white block">Overall Mastery</span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">Target: 85%+ for Exam Excellence</span>
          </div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Study Materials</span>
            <FolderOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{documents.length} Files</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Processed & Indexed for RAG</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">AI Notes</span>
            <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{notes.length} Generated</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">Complete, Short & Revision</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Flashcard Retention</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{cardMasteryPercent}% Mastered</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{masteredCards} of {totalCards} cards</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
            <span className="text-xs font-semibold uppercase">Avg Quiz Score</span>
            <Award className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <h4 className="text-2xl font-bold text-slate-900 dark:text-white">{avgQuizScore}%</h4>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">{quizzes.length} Attempts recorded</p>
        </div>
      </div>

      {/* Weak Topics & Revision Priority */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500" />
            <span>Target Revision Topics</span>
          </h3>
          <span className="text-xs text-slate-500 dark:text-slate-400">Flagged from lower quiz scores</span>
        </div>

        {weakTopics.length === 0 ? (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2.5 border border-emerald-200 dark:border-emerald-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>No weak areas flagged! You scored 70%+ across all tested topics in this subject. Keep it up!</span>
          </div>
        ) : (
          <div className="space-y-2.5">
            {weakTopics.map((w, idx) => (
              <div key={idx} className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-900 dark:text-white">{w.topic}</span>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">Recent Quiz Accuracy: {w.percentage}%</p>
                </div>
                <button
                  onClick={() => onNavigateToTab('revision_notes')}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-xs transition shadow-xs"
                >
                  Review Notes
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
export default LearningProgressSection;
