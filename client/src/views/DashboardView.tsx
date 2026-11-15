import React from 'react';
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
  Award
} from 'lucide-react';
import { Subject, StudyDocument, Note, Flashcard, QuizAttempt, AcademicTask, UserProfile } from '../types';

interface DashboardViewProps {
  user: UserProfile | null;
  subjects: Subject[];
  documents: StudyDocument[];
  notes: Note[];
  flashcards: Flashcard[];
  quizzes: QuizAttempt[];
  tasks: AcademicTask[];
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
  onNavigate,
  openCreateSubjectModal,
  onLogStudyMinutes
}) => {
  const goalMinutes = user?.dailyGoalMinutes || 45;
  const todayMinutes = user?.todayStudyMinutes || 0;
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  // Compute composite learning progress
  const totalCards = flashcards.length;
  const masteredCards = flashcards.filter(c => c.status === 'mastered').length;
  const cardProgress = totalCards > 0 ? (masteredCards / totalCards) * 40 : 0;
  const quizAvg = quizzes.length > 0 ? (quizzes.reduce((acc, q) => acc + q.percentage, 0) / quizzes.length) * 0.4 : 0;
  const docScore = documents.length > 0 ? Math.min(20, documents.length * 5) : 0;
  const overallProgress = Math.min(100, Math.round(cardProgress + quizAvg + docScore));

  // Upcoming tasks (next 14 days, uncompleted)
  const upcomingTasks = tasks
    .filter(t => !t.completed)
    .sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
    .slice(0, 4);

  const recentNote = notes[notes.length - 1];
  const recentSubject = subjects.length > 0 ? subjects[0] : null;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* 1. Welcome Banner & Student Profile */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-700 via-indigo-600 to-violet-700 p-8 text-white shadow-md flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-xs font-semibold text-indigo-100">
            <span>Vantage MBA</span>
            <span>•</span>
            <span>{user?.specialization || 'Strategic Management'}</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Scholar'}
          </h1>

          <p className="text-indigo-100 text-xs sm:text-sm leading-relaxed max-w-xl">
            Organize coursework, synthesize high-yield revision notes, practice exam-level MCQs, and track your competencies in one place.
          </p>
        </div>

        {/* Daily Study Goal Widget */}
        <div className="bg-white/10 backdrop-blur-md p-5 rounded-xl border border-white/20 shrink-0 min-w-[260px] space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-indigo-100">Today's Study Goal</span>
            <span className="font-bold text-white">{todayMinutes}m / {goalMinutes}m</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
            <div
              className="bg-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-indigo-200 font-medium">
              {progressPercent >= 100 ? 'Goal Achieved!' : `${goalMinutes - todayMinutes}m remaining`}
            </span>
            <button
              onClick={onLogStudyMinutes}
              className="px-2.5 py-1 bg-white text-indigo-700 hover:bg-indigo-50 rounded-lg text-[11px] font-bold transition shadow-xs"
            >
              +15 min
            </button>
          </div>
        </div>
      </div>

      {/* 2. Core Stats Grid (6 Key Metrics) */}
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
          <div className="text-[11px] text-slate-500 mt-0.5">Enrolled</div>
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
          <div className="text-[11px] text-slate-500 mt-0.5">Uploaded & Parsed</div>
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
          <div className="text-[11px] text-slate-500 mt-0.5">Synthesized</div>
        </div>

        {/* Flashcards */}
        <div
          onClick={() => onNavigate('flashcards')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-amber-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Flashcards</span>
            <Layers className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white">{flashcards.length}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Active Recall Cards</div>
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
          onClick={() => onNavigate('subjects')}
          className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs hover:border-sky-400 cursor-pointer transition"
        >
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Progress</span>
            <TrendingUp className="w-4 h-4 text-sky-500" />
          </div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">{overallProgress}%</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Curriculum Mastery</div>
        </div>
      </div>

      {/* 3. Continue Learning & Upcoming Deadlines */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Continue Learning Section (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>Continue Learning</span>
            </h2>
            <button
              onClick={() => onNavigate('subjects')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View all subjects</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {recentNote ? (
            <div
              onClick={() => onNavigate('notes', recentNote.subjectId)}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 hover:shadow-sm cursor-pointer transition"
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
          ) : recentSubject ? (
            <div
              onClick={() => onNavigate('subjects', recentSubject.id)}
              className="p-6 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs hover:border-indigo-400 hover:shadow-sm cursor-pointer transition"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                  Active Subject
                </span>
                <span className="text-xs text-slate-400">{recentSubject.semester || 'Semester 2'}</span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{recentSubject.name}</h3>
              <p className="text-xs text-slate-500 mt-1">Open subject workspace to generate notes, practice MCQs, or view course slides.</p>
              <div className="mt-4 flex items-center justify-between text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                <span>Open Subject Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
              <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">No recent study sessions</p>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">Create a subject and upload your course materials to start generating AI study notes.</p>
              <button
                onClick={openCreateSubjectModal}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold"
              >
                + Create Subject
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Upcoming Deadlines & Tasks (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              <span>Upcoming Deadlines</span>
            </h2>
            <button
              onClick={() => onNavigate('calendar')}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Calendar
            </button>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 shadow-xs">
            {upcomingTasks.length === 0 ? (
              <div className="text-center py-6 text-xs text-slate-400">
                No pending examination dates or deadlines.
              </div>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {upcomingTasks.map((t) => {
                  const daysLeft = Math.ceil((new Date(t.dueDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
                  return (
                    <div key={t.id} className="py-2.5 flex items-center justify-between gap-3 text-xs">
                      <div className="min-w-0">
                        <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{t.title}</p>
                        <p className="text-[11px] text-slate-400">
                          {new Date(t.dueDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                        daysLeft <= 3 ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300' : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {daysLeft <= 0 ? 'Today' : `${daysLeft}d left`}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 4. Quick Access to All Subjects */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">My Academic Subjects</h2>
            <p className="text-xs text-slate-500">Every subject features 11 dedicated workspaces for materials, notes, flashcards, MCQs, and AI mentoring.</p>
          </div>
          <button
            onClick={openCreateSubjectModal}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create Subject</span>
          </button>
        </div>

        {subjects.length === 0 ? (
          <div className="text-center py-12 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-8 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">No Subjects Enrolled Yet</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Start by creating your first subject workspace (e.g. Microeconomics, Corporate Finance, Marketing Strategy).
            </p>
            <button
              onClick={openCreateSubjectModal}
              className="px-4 py-2 bg-indigo-600 text-white font-semibold text-xs rounded-xl shadow-xs"
            >
              + Create Your First Subject
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjects.map((sub) => {
              const subDocs = documents.filter(d => d.subjectId === sub.id);
              const subNotes = notes.filter(n => n.subjectId === sub.id);
              const subCards = flashcards.filter(c => c.subjectId === sub.id);
              const subQuizzes = quizzes.filter(q => q.subjectId === sub.id);

              return (
                <div
                  key={sub.id}
                  onClick={() => onNavigate('subjects', sub.id)}
                  className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-5 shadow-xs hover:border-indigo-400 hover:shadow-md cursor-pointer transition flex flex-col justify-between"
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
        )}
      </div>
    </div>
  );
};
