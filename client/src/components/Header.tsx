import React from 'react';
import { Search, Flame, BookOpen, Plus, Moon, Sun, CheckCircle, LogOut } from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface HeaderProps {
  subjects: Subject[];
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  openSearchModal: () => void;
  openCreateSubjectModal: () => void;
  darkMode: boolean;
  onToggleDarkMode: () => void;
  user: UserProfile | null;
  activeTermName?: string;
  onNavigateToJourney?: () => void;
  onLogStudyMinutes?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  openSearchModal,
  openCreateSubjectModal,
  darkMode,
  onToggleDarkMode,
  user,
  activeTermName = 'Term 2',
  onNavigateToJourney,
  onLogStudyMinutes,
  onLogout
}) => {
  const goalMinutes = user?.dailyGoalMinutes || 45;
  const todayMinutes = user?.todayStudyMinutes || 0;
  const progressPercent = Math.min(100, Math.round((todayMinutes / goalMinutes) * 100));

  return (
    <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between shrink-0 sticky top-0 z-20 transition-colors">
      {/* Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-md">
        <button
          onClick={openSearchModal}
          className="w-full flex items-center justify-between px-3.5 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700/60 text-slate-500 dark:text-slate-400 rounded-xl text-xs transition border border-slate-200 dark:border-slate-700"
        >
          <div className="flex items-center gap-2">
            <Search className="w-3.5 h-3.5 text-slate-400" />
            <span>Search subjects, lecture slides, notes, MCQs...</span>
          </div>
          <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-slate-500 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md">
            Ctrl+K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-3">
        {/* Active Term Pill */}
        <button
          onClick={onNavigateToJourney}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 text-xs font-bold hover:bg-indigo-100 transition shadow-2xs"
          title="Click to view all Six Terms"
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>{activeTermName} Active</span>
        </button>

        {/* Subject Switcher */}
        {subjects.length > 0 && (
          <div className="hidden lg:flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-2.5 py-1.5 text-xs">
            <BookOpen className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedSubjectId || ''}
              onChange={(e) => setSelectedSubjectId(e.target.value || null)}
              className="bg-transparent font-semibold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer pr-1"
            >
              <option value="" className="dark:bg-slate-900">All Subjects</option>
              {subjects.map((s) => (
                <option key={s.id} value={s.id} className="dark:bg-slate-900">
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Study Streak Pill */}
        <div
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300 text-xs font-semibold"
          title={`Daily Study Progress: ${todayMinutes}m of ${goalMinutes}m target`}
        >
          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
          <span>{user?.studyStreak || 1} Day Streak</span>
        </div>

        {/* Dark Mode Toggle */}
        <button
          onClick={onToggleDarkMode}
          className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
          title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
        </button>

        {/* Profile Avatar & Student Name */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-200 dark:border-slate-800">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
            alt="Profile"
            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
          />
          <div className="hidden md:block text-left">
            <span className="block text-xs font-bold text-slate-900 dark:text-white leading-tight">
              {user?.name || 'Mahak'}
            </span>
            <span className="block text-[10px] text-slate-500 dark:text-slate-400 leading-none">
              MBA Scholar
            </span>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition ml-1"
              title="Sign Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
