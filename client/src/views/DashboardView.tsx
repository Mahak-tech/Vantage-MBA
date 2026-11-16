import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderOpen,
  FileText,
  Layers,
  HelpCircle,
  TrendingUp,
  Clock,
  Sparkles,
  ArrowRight,
  Plus,
  Flame,
  CheckCircle2,
  Calendar,
  ChevronRight,
  Award,
  AlertTriangle,
  CheckSquare,
  Bot,
  Zap,
  Target
} from 'lucide-react';
import {
  Subject,
  StudyDocument,
  Note,
  Flashcard,
  QuizAttempt,
  AcademicTask,
  UserProfile,
  AcademicTerm,
  Assignment,
  TodayStudyPlan
} from '../types';
import { api } from '../services/api';

interface DashboardViewProps {
  user: UserProfile | null;
  subjects: Subject[];
  documents: StudyDocument[];
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: QuizAttempt[];
  tasks: AcademicTask[];
  terms?: AcademicTerm[];
  activeTermId?: string;
  onNavigate: (tab: string, subjectId?: string) => void;
  openCreateSubjectModal: () => void;
  onLogStudyMinutes: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  user,
  subjects,
  documents,
  notes,
  flashcards,
  quizzes,
  tasks,
  terms = [],
  activeTermId = 'term-2',
  onNavigate,
  openCreateSubjectModal,
  onLogStudyMinutes
}) => {
  const [studyPlan, setStudyPlan] = useState<TodayStudyPlan | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loadingPlan, setLoadingPlan] = useState(false);

  const goalMinutes = user?.dailyGoalMinutes || 45;
  const todayMinutes = user?.todayStudyMinutes || 0;
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  const activeTerm = terms.find(t => t.id === activeTermId) || terms[1] || terms[0];

  useEffect(() => {
    loadStudyPlanAndAssignments();
  }, [activeTermId]);

  const loadStudyPlanAndAssignments = async () => {
    try {
      setLoadingPlan(true);
      const [plan, asgs] = await Promise.all([
        api.getTodayStudyPlan(activeTermId).catch(() => null),
        api.getAssignments({ termId: activeTermId }).catch(() => [])
      ]);
      if (plan) setStudyPlan(plan);
      if (asgs) setAssignments(asgs);
    } catch (err) {
      console.error('Failed to load study plan:', err);
    } finally {
      setLoadingPlan(false);
    }
  };

  // Compute composite learning progress
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.status === 'mastered').length;
  const cardProgress = totalCards > 0 ? (masteredCards / totalCards) * 40 : 0;
  const quizAvg = quizzes.length > 0 ? (quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length) * 0.4 : 0;
  const docScore = documents.length > 0 ? Math.min(20, documents.length * 5) : 0;
  const overallProgress = Math.min(100, Math.round(cardProgress + quizAvg + docScore));

  const pendingAssignments = assignments.filter(a => a.status !== 'completed' && a.status !== 'submitted');
  const recentNote = notes[notes.length - 1];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Banner & Active Term Standing */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <span>Vantage MBA</span>
            <span>•</span>
            <span>{activeTerm ? activeTerm.name : 'Term 2'} Active</span>
            <span>•</span>
            <span>{user?.specialization || 'MBA Product Management'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Mahak'}
          </h1>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            Your personal MBA academic companion. Organize coursework, upload lecture slides, track assignment milestones, and master concepts with your subject-isolated AI tutor.
          </p>

          <div className="pt-2 flex items-center gap-3">
            <button
              onClick={() => onNavigate('journey')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <span>View Six-Term Roadmap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onNavigate('assignments')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/20 hover:bg-white/30 text-white text-xs font-semibold backdrop-blur-sm transition"
            >
              <span>Assignments ({pendingAssignments.length} pending)</span>
            </button>
          </div>
        </div>

        {/* Daily Study Goal & Streak Widget */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/20 shrink-0 min-w-[280px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-100">Today's Study Goal</span>
            <span className="font-bold text-white">{todayMinutes}m / {goalMinutes}m</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1 text-[11px] text-amber-300 font-bold">
              <Flame className="w-3.5 h-3.5" />
              <span>{user?.studyStreak || 1}-Day Streak</span>
            </div>
            <button
              onClick={onLogStudyMinutes}
              className="px-3 py-1 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-xs font-bold transition shadow-xs"
            >
              +15 min
            </button>
          </div>
        </div>
      </div>

      {/* 2. "WHAT SHOULD I STUDY TODAY?" AI RECOMMENDATION ENGINE */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-indigo-100 dark:border-indigo-950/80 p-6 sm:p-7 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shadow-2xs">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <span>What should I study today?</span>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                  AI Prioritized
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Personalized study actions synthesized from upcoming deadlines, weak quiz topics, and spaced recall.
              </p>
            </div>
          </div>

          <button
            onClick={loadStudyPlanAndAssignments}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline self-start sm:self-center"
          >
            Refresh Recommendations
          </button>
        </div>

        {/* Recommendation Cards */}
        {studyPlan && studyPlan.recommendations.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-1">
            {studyPlan.recommendations.map((rec) => (
              <div
                key={rec.id}
                className="p-5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-indigo-300 dark:hover:border-indigo-800 transition flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950 text-indigo-600">
                      {rec.subjectName}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      rec.priority === 'high'
                        ? 'bg-rose-50 text-rose-600 dark:bg-rose-950 dark:text-rose-300'
                        : 'bg-amber-50 text-amber-600 dark:bg-amber-950 dark:text-amber-300'
                    }`}>
                      {rec.priority.toUpperCase()}
                    </span>
                  </div>

                  <h3 className="font-bold text-xs text-slate-900 dark:text-white leading-snug">
                    {rec.title}
                  </h3>

                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
                    {rec.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400 font-medium">
                    ⏱️ ~{rec.durationMinutes} mins
                  </span>
                  <button
                    onClick={() => onNavigate(rec.actionUrl, rec.subjectId)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                  >
                    <span>Start Action</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-xs text-slate-400">
            Analyzing coursework metrics...
          </div>
        )}
      </div>

      {/* 3. Core Academic Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Subjects */}
        <div
          onClick={() => onNavigate('subjects')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Subjects</span>
            <BookOpen className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{subjects.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{activeTerm ? activeTerm.name : 'Term 2'} Enrolled</div>
        </div>

        {/* Study Materials */}
        <div
          onClick={() => onNavigate('materials')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-emerald-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Materials</span>
            <FolderOpen className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{documents.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Slides & Cases</div>
        </div>

        {/* Notes Generated */}
        <div
          onClick={() => onNavigate('notes')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-violet-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Notes</span>
            <FileText className="w-4 h-4 text-violet-600 dark:text-violet-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{notes.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">AI Synthesized</div>
        </div>

        {/* Assignments */}
        <div
          onClick={() => onNavigate('assignments')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Assignments</span>
            <CheckSquare className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{pendingAssignments.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Pending Action</div>
        </div>

        {/* Quizzes Attempted */}
        <div
          onClick={() => onNavigate('practice')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-rose-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Quizzes</span>
            <HelpCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{quizzes.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tests Completed</div>
        </div>

        {/* Overall Progress */}
        <div
          onClick={() => onNavigate('journey')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Curriculum</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Term 2 Mastery</div>
        </div>
      </div>

      {/* 4. Continue Learning & Urgent Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Recent Notes / Subject (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Continue Learning</span>
            </h2>
            <button
              onClick={() => onNavigate('notes')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all notes</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentNote ? (
            <div
              onClick={() => onNavigate('notes', recentNote.subjectId)}
              className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 hover:shadow-sm cursor-pointer transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                  Recent Note • {recentNote.type.replace('_', ' ')}
                </span>
                <span className="text-xs text-slate-400">
                  {new Date(recentNote.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{recentNote.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                {recentNote.content.replace(/[#*`>]/g, '').substring(0, 150)}...
              </p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Resume Reading</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No recent notes generated</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Open a subject workspace to generate structured Complete, Short, or Revision notes.</p>
              <button
                onClick={() => onNavigate('subjects')}
                className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
              >
                Open Subject Workspace
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Urgent Assignments Widget (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CheckSquare className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Deadlines</span>
            </h2>
            <button
              onClick={() => onNavigate('assignments')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              View All
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
            {assignments.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No assignments scheduled.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {assignments.slice(0, 4).map((a) => {
                  const daysLeft = Math.round((new Date(a.dueDate).getTime() - Date.now()) / 86400000);
                  const isDone = a.status === 'completed' || a.status === 'submitted';

                  return (
                    <div
                      key={a.id}
                      onClick={() => onNavigate('assignments')}
                      className="py-2.5 flex items-center justify-between gap-3 text-xs cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800/50 p-1.5 rounded-xl transition"
                    >
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{a.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(a.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        isDone
                          ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300'
                          : daysLeft <= 3
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {isDone ? 'Done' : daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 5. Subjects in Current Term */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Active Subjects ({activeTerm ? activeTerm.name : 'Term 2'})</h2>
            <p className="text-xs text-slate-500">Subject-isolated knowledge bases with dedicated lecture slide indexes and personal AI tutors.</p>
          </div>
          <button
            onClick={openCreateSubjectModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {subjects.map((sub) => {
            const subDocs = documents.filter(d => d.subjectId === sub.id);
            const subNotes = notes.filter(n => n.subjectId === sub.id);
            const subCards = flashcards.filter(c => c.subjectId === sub.id);

            return (
              <div
                key={sub.id}
                onClick={() => onNavigate('subjects', sub.id)}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {sub.code || sub.semester || 'Subject'}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1">{sub.name}</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-1">
                    {sub.description || 'Full subject workspace with lecture slides, complete notes, and mock tests.'}
                  </p>
                </div>

                <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                  <div className="flex items-center gap-3">
                    <span>{subDocs.length} files</span>
                    <span>•</span>
                    <span>{subNotes.length} notes</span>
                    <span>•</span>
                    <span>{subCards.length} cards</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
