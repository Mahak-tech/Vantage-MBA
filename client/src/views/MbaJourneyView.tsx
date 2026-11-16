import React, { useState } from 'react';
import {
  GraduationCap,
  Calendar,
  CheckCircle2,
  Clock,
  Archive,
  BookOpen,
  FolderOpen,
  FileText,
  HelpCircle,
  MessageSquare,
  Award,
  Plus,
  ArrowRight,
  TrendingUp,
  Sparkles,
  ChevronRight,
  Edit3
} from 'lucide-react';
import { AcademicTerm, Subject, TermStatus } from '../types';
import { api } from '../services/api';

interface MbaJourneyViewProps {
  terms: AcademicTerm[];
  subjects: Subject[];
  activeTermId: string;
  onSelectTerm: (termId: string) => void;
  onRefreshTerms: () => Promise<void>;
  onNavigate: (tab: string, subjectId?: string) => void;
  openCreateSubjectModal: (termId?: string) => void;
}

export const MbaJourneyView: React.FC<MbaJourneyViewProps> = ({
  terms,
  subjects,
  activeTermId,
  onSelectTerm,
  onRefreshTerms,
  onNavigate,
  openCreateSubjectModal
}) => {
  const [selectedTermId, setSelectedTermId] = useState<string>(activeTermId || 'term-2');
  const [editingTerm, setEditingTerm] = useState<AcademicTerm | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  const selectedTerm = terms.find(t => t.id === selectedTermId) || terms[1] || terms[0];
  const termSubjects = subjects.filter(s => s.termId === selectedTerm.id || String(s.termNumber) === String(selectedTerm.termNumber));

  const getStatusBadge = (status: TermStatus) => {
    switch (status) {
      case 'active':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Active Term
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
            <CheckCircle2 className="w-3 h-3 text-indigo-600 dark:text-indigo-400" />
            Completed
          </span>
        );
      case 'upcoming':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            Upcoming
          </span>
        );
      case 'archived':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
            <Archive className="w-3 h-3 text-amber-500" />
            Archived
          </span>
        );
      default:
        return null;
    }
  };

  const handleUpdateStatus = async (newStatus: TermStatus) => {
    try {
      setIsUpdating(true);
      await api.updateAcademicTerm(selectedTerm.id, { status: newStatus });
      await onRefreshTerms();
      if (editingTerm) {
        setEditingTerm({ ...editingTerm, status: newStatus });
      }
    } catch (err: any) {
      alert(err.message || 'Failed to update term status');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleSaveTermDetails = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTerm) return;
    try {
      setIsUpdating(true);
      await api.updateAcademicTerm(editingTerm.id, {
        name: editingTerm.name,
        status: editingTerm.status,
        gpa: editingTerm.gpa || null,
        credits: editingTerm.credits,
        startDate: editingTerm.startDate,
        endDate: editingTerm.endDate,
        description: editingTerm.description
      });
      await onRefreshTerms();
      setEditingTerm(null);
    } catch (err: any) {
      alert(err.message || 'Failed to update term');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Academic Roadmap
            </span>
            <span className="text-xs text-slate-500">• 6-Term Program</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            My MBA Journey
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Manage your entire six-term MBA curriculum. Each term features an independent academic workspace for subjects, lecture materials, case studies, assignments, and AI tutors.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Current Standing</div>
            <div className="text-base font-bold text-slate-900 dark:text-white">Term 2 Active</div>
          </div>
          <button
            onClick={() => openCreateSubjectModal(selectedTerm.id)}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject to {selectedTerm.name}</span>
          </button>
        </div>
      </div>

      {/* Six-Term Visual Navigator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Select Academic Term
          </h2>
          <span className="text-[11px] text-slate-500">
            Click any term to inspect its subjects and resources
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {terms.map((term) => {
            const isSelected = term.id === selectedTermId;
            const subCount = subjects.filter(s => s.termId === term.id || String(s.termNumber) === String(term.termNumber)).length;

            return (
              <button
                key={term.id}
                onClick={() => {
                  setSelectedTermId(term.id);
                  onSelectTerm(term.id);
                }}
                className={`p-4 rounded-2xl border text-left transition-all relative overflow-hidden flex flex-col justify-between h-36 ${
                  isSelected
                    ? 'bg-white dark:bg-slate-900 border-indigo-500 dark:border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-400">T{term.termNumber}</span>
                    {getStatusBadge(term.status)}
                  </div>
                  <div className="font-extrabold text-sm text-slate-900 dark:text-white">
                    {term.name}
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500">
                  <span>{subCount} {subCount === 1 ? 'Subject' : 'Subjects'}</span>
                  {term.gpa && (
                    <span className="font-bold text-indigo-600 dark:text-indigo-400">
                      {term.gpa} GPA
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Term Detail Workspace */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-bold text-lg border border-indigo-100 dark:border-indigo-900/40">
              T{selectedTerm.termNumber}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">{selectedTerm.name} Workspace</h3>
                {getStatusBadge(selectedTerm.status)}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
                {selectedTerm.description || `Academic term ${selectedTerm.termNumber} course curriculum and resources.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-center">
            {/* Quick status dropdown */}
            <select
              value={selectedTerm.status}
              onChange={(e) => handleUpdateStatus(e.target.value as TermStatus)}
              disabled={isUpdating}
              className="text-xs font-semibold px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 border-none text-slate-700 dark:text-slate-200 cursor-pointer focus:ring-2 focus:ring-indigo-500"
            >
              <option value="active">Set Active</option>
              <option value="completed">Set Completed</option>
              <option value="upcoming">Set Upcoming</option>
              <option value="archived">Set Archived</option>
            </select>

            <button
              onClick={() => setEditingTerm(selectedTerm)}
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-700"
              title="Edit Term Details"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Term Academic Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Enrolled Subjects</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{termSubjects.length}</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Term Credits</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">{selectedTerm.credits || 18} Credits</div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Study Materials</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {selectedTerm.docCount || 0} Files
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/50 border border-slate-100 dark:border-slate-800/80">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Pending Tasks</span>
            <div className="text-xl font-extrabold text-slate-900 dark:text-white mt-1">
              {selectedTerm.pendingAssignments || 0}
            </div>
          </div>
        </div>

        {/* Subjects List for Selected Term */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300">
              Subjects in {selectedTerm.name} ({termSubjects.length})
            </h4>
            <button
              onClick={() => openCreateSubjectModal(selectedTerm.id)}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Subject</span>
            </button>
          </div>

          {termSubjects.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
              <BookOpen className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">No subjects added to {selectedTerm.name} yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                Create subjects for this term to upload lecture slides, build flashcards, and launch your dedicated subject AI tutor.
              </p>
              <button
                onClick={() => openCreateSubjectModal(selectedTerm.id)}
                className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition"
              >
                + Create Subject in {selectedTerm.name}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {termSubjects.map((sub) => (
                <div
                  key={sub.id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 transition-all shadow-xs flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-300">
                        {sub.code || `${selectedTerm.name}`}
                      </span>
                      <span className="text-[11px] text-slate-400">{sub.creditHours || 3} Credits</span>
                    </div>

                    <h5 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-1">{sub.name}</h5>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">
                      {sub.description || 'Academic course workspace for lecture slides, notes, assignments, and revision.'}
                    </p>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-xs text-slate-400">
                      <span className="flex items-center gap-1" title="Study Documents">
                        <FolderOpen className="w-3.5 h-3.5" />
                        {sub.docCount || 0}
                      </span>
                      <span className="flex items-center gap-1" title="Notes">
                        <FileText className="w-3.5 h-3.5" />
                        {sub.notesCount || 0}
                      </span>
                    </div>

                    <button
                      onClick={() => onNavigate('subjects', sub.id)}
                      className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 group"
                    >
                      <span>Open Workspace</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Term Modal */}
      {editingTerm && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Edit {editingTerm.name} Information</h3>

            <form onSubmit={handleSaveTermDetails} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Term Name</label>
                <input
                  type="text"
                  value={editingTerm.name}
                  onChange={(e) => setEditingTerm({ ...editingTerm, name: e.target.value })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                <select
                  value={editingTerm.status}
                  onChange={(e) => setEditingTerm({ ...editingTerm, status: e.target.value as TermStatus })}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                  <option value="upcoming">Upcoming</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">GPA (Optional)</label>
                  <input
                    type="text"
                    placeholder="3.85"
                    value={editingTerm.gpa || ''}
                    onChange={(e) => setEditingTerm({ ...editingTerm, gpa: e.target.value })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Total Credits</label>
                  <input
                    type="number"
                    value={editingTerm.credits || 18}
                    onChange={(e) => setEditingTerm({ ...editingTerm, credits: parseInt(e.target.value, 10) || 18 })}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Curriculum Focus / Description</label>
                <textarea
                  rows={3}
                  value={editingTerm.description || ''}
                  onChange={(e) => setEditingTerm({ ...editingTerm, description: e.target.value })}
                  placeholder="e.g. Microeconomics, Market Research Methods, Corporate Finance..."
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingTerm(null)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  {isUpdating ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
