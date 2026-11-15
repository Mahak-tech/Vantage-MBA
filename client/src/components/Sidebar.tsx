import React from 'react';
import {
  LayoutDashboard,
  BookOpen,
  FolderOpen,
  FileText,
  Layers,
  HelpCircle,
  MessageSquare,
  Sparkles,
  RotateCcw,
  Calendar,
  Settings as SettingsIcon,
  Plus,
  GraduationCap,
  ChevronRight,
  LogOut
} from 'lucide-react';
import { Subject, UserProfile } from '../types';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  subjects: Subject[];
  selectedSubjectId: string | null;
  setSelectedSubjectId: (id: string | null) => void;
  openCreateSubjectModal: () => void;
  user: UserProfile | null;
  onLogout?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  currentTab,
  setCurrentTab,
  subjects,
  selectedSubjectId,
  setSelectedSubjectId,
  openCreateSubjectModal,
  user,
  onLogout
}) => {
  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen, badge: subjects.length },
    { id: 'materials', label: 'Study Materials', icon: FolderOpen },
    { id: 'notes', label: 'AI Notes', icon: FileText },
    { id: 'flashcards', label: 'Flashcards', icon: Layers },
    { id: 'practice', label: 'Practice & Quizzes', icon: HelpCircle },
    { id: 'tutor', label: 'AI Tutor', icon: MessageSquare },
    { id: 'visual', label: 'Visual Studio', icon: Sparkles },
    { id: 'revision', label: 'Revision Centre', icon: RotateCcw },
    { id: 'calendar', label: 'Academic Calendar', icon: Calendar },
    { id: 'settings', label: 'Settings', icon: SettingsIcon },
  ];

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen shrink-0 sticky top-0 select-none z-30 transition-colors">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-none">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 dark:text-white tracking-tight leading-none text-base">Vantage MBA</h1>
            <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">
              Strategic Intelligence
            </span>
          </div>
        </div>
      </div>

      {/* Navigation List */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 px-3 mb-2">
          Platform Navigation
        </div>

        {mainNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400 dark:text-slate-500'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}

        {/* Enrolled Subjects Section */}
        <div className="pt-5 pb-1">
          <div className="flex items-center justify-between px-3 mb-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
              My Subjects
            </span>
            <button
              onClick={openCreateSubjectModal}
              className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-0.5 rounded transition"
              title="Add New Subject"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-0.5">
            {subjects.length === 0 ? (
              <p className="text-[11px] text-slate-400 dark:text-slate-500 px-3 py-1 italic">
                No subjects added yet.
              </p>
            ) : (
              subjects.map((sub) => {
                const isSelected = selectedSubjectId === sub.id && currentTab === 'subjects';
                return (
                  <button
                    key={sub.id}
                    onClick={() => {
                      setSelectedSubjectId(sub.id);
                      setCurrentTab('subjects');
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs transition text-left ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="w-2 h-2 rounded-full bg-indigo-500 shrink-0" />
                      <span className="truncate">{sub.name}</span>
                    </div>
                    <ChevronRight className="w-3 h-3 text-slate-400 shrink-0" />
                  </button>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Student Profile Pill */}
      {user && (
        <div className="px-4 py-2.5 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <img
              src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}
              alt={user.name}
              className="w-7 h-7 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
            />
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{user.name}</p>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Active Scholar
              </span>
            </div>
          </div>
          {onLogout && (
            <button
              onClick={onLogout}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition"
              title="Log Out"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* Quick User Footer */}
      <div className="p-3 border-t border-slate-200/80 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <button
          onClick={openCreateSubjectModal}
          className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>New Subject Workspace</span>
        </button>
      </div>
    </aside>
  );
};
