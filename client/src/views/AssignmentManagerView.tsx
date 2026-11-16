import React, { useState, useEffect } from 'react';
import {
  CheckSquare,
  Clock,
  AlertTriangle,
  Calendar as CalendarIcon,
  List,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Send,
  FileText,
  Paperclip,
  Trash2,
  Edit2,
  ExternalLink,
  Bot,
  ChevronRight,
  TrendingUp,
  Sliders
} from 'lucide-react';
import { Assignment, Subject, AcademicTerm, AssignmentStatus, AssignmentPriority } from '../types';
import { api } from '../services/api';

interface AssignmentManagerViewProps {
  subjects: Subject[];
  terms: AcademicTerm[];
  activeTermId?: string;
  onNavigateToAiTutor?: (subjectId: string, prompt?: string) => void;
}

export const AssignmentManagerView: React.FC<AssignmentManagerViewProps> = ({
  subjects,
  terms,
  activeTermId = 'term-2',
  onNavigateToAiTutor
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Filters
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [subjectFilter, setSubjectFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAsg, setEditingAsg] = useState<Assignment | null>(null);

  // Form State
  const [formTitle, setFormTitle] = useState('');
  const [formSubjectId, setFormSubjectId] = useState('');
  const [formDueDate, setFormDueDate] = useState('');
  const [formPriority, setFormPriority] = useState<AssignmentPriority>('medium');
  const [formStatus, setFormStatus] = useState<AssignmentStatus>('not_started');
  const [formEstimatedHours, setFormEstimatedHours] = useState(4);
  const [formProgress, setFormProgress] = useState(0);
  const [formDescription, setFormDescription] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadAssignments();
  }, []);

  const loadAssignments = async () => {
    try {
      setLoading(true);
      const data = await api.getAssignments();
      setAssignments(data);
    } catch (err) {
      console.error('Failed to load assignments:', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreateModal = () => {
    setEditingAsg(null);
    setFormTitle('');
    setFormSubjectId(subjects[0]?.id || '');
    // Default 5 days from now
    const d = new Date(Date.now() + 5 * 86400000);
    setFormDueDate(d.toISOString().split('T')[0]);
    setFormPriority('medium');
    setFormStatus('not_started');
    setFormEstimatedHours(4);
    setFormProgress(0);
    setFormDescription('');
    setFormNotes('');
    setModalOpen(true);
  };

  const openEditModal = (asg: Assignment) => {
    setEditingAsg(asg);
    setFormTitle(asg.title);
    setFormSubjectId(asg.subjectId);
    setFormDueDate(asg.dueDate ? asg.dueDate.split('T')[0] : '');
    setFormPriority(asg.priority);
    setFormStatus(asg.status);
    setFormEstimatedHours(asg.estimatedHours || 4);
    setFormProgress(asg.progress || 0);
    setFormDescription(asg.description || '');
    setFormNotes(asg.notes || '');
    setModalOpen(true);
  };

  const handleSaveAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim() || !formSubjectId) {
      alert('Please provide a title and select a subject.');
      return;
    }

    try {
      setIsSubmitting(true);
      if (editingAsg) {
        await api.updateAssignment(editingAsg.id, {
          title: formTitle,
          subjectId: formSubjectId,
          dueDate: new Date(formDueDate).toISOString(),
          priority: formPriority,
          status: formStatus,
          estimatedHours: Number(formEstimatedHours),
          progress: Number(formProgress),
          description: formDescription,
          notes: formNotes
        });
      } else {
        await api.createAssignment({
          title: formTitle,
          subjectId: formSubjectId,
          dueDate: new Date(formDueDate).toISOString(),
          priority: formPriority,
          status: formStatus,
          estimatedHours: Number(formEstimatedHours),
          progress: Number(formProgress),
          description: formDescription,
          notes: formNotes
        });
      }
      setModalOpen(false);
      await loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to save assignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteAssignment = async (id: string) => {
    if (!window.confirm('Delete this assignment?')) return;
    try {
      await api.deleteAssignment(id);
      await loadAssignments();
    } catch (err: any) {
      alert(err.message || 'Failed to delete assignment');
    }
  };

  const handleQuickStatusChange = async (id: string, newStatus: AssignmentStatus) => {
    try {
      await api.updateAssignment(id, {
        status: newStatus,
        progress: newStatus === 'completed' || newStatus === 'submitted' ? 100 : undefined
      });
      await loadAssignments();
    } catch (err) {
      console.error(err);
    }
  };

  // Metrics
  const now = new Date();
  const next7Days = new Date(Date.now() + 7 * 86400000);

  const pendingAsgs = assignments.filter(a => a.status !== 'completed' && a.status !== 'submitted');
  const dueThisWeek = pendingAsgs.filter(a => {
    const due = new Date(a.dueDate);
    return due >= now && due <= next7Days;
  });
  const overdueAsgs = pendingAsgs.filter(a => new Date(a.dueDate) < now);
  const submittedCount = assignments.filter(a => a.status === 'submitted' || a.status === 'completed').length;

  // Filtered List
  const filteredAssignments = assignments.filter(a => {
    if (statusFilter !== 'all') {
      if (statusFilter === 'overdue') {
        if (!(new Date(a.dueDate) < now && a.status !== 'completed' && a.status !== 'submitted')) return false;
      } else if (statusFilter === 'due_this_week') {
        const due = new Date(a.dueDate);
        if (!(due >= now && due <= next7Days && a.status !== 'completed' && a.status !== 'submitted')) return false;
      } else if (a.status !== statusFilter) {
        return false;
      }
    }
    if (subjectFilter !== 'all' && a.subjectId !== subjectFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!a.title.toLowerCase().includes(q) && !(a.description || '').toLowerCase().includes(q)) {
        return false;
      }
    }
    return true;
  });

  const getPriorityBadge = (p: AssignmentPriority) => {
    switch (p) {
      case 'high':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60">High Priority</span>;
      case 'medium':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60">Medium Priority</span>;
      case 'low':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Low Priority</span>;
    }
  };

  const getStatusBadge = (status: AssignmentStatus, dueDateStr: string) => {
    const isOverdue = new Date(dueDateStr) < now && status !== 'completed' && status !== 'submitted';
    if (isOverdue) {
      return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 dark:bg-rose-900/80 text-rose-800 dark:text-rose-200 border border-rose-300 dark:border-rose-800">Overdue</span>;
    }
    switch (status) {
      case 'not_started':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400">Not Started</span>;
      case 'in_progress':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">In Progress</span>;
      case 'completed':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 dark:bg-teal-950 text-teal-700 dark:text-teal-300">Completed</span>;
      case 'submitted':
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300">Submitted</span>;
      default:
        return null;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/90 dark:border-slate-800 p-6 sm:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
              Workload Command Centre
            </span>
            <span className="text-xs text-slate-500">• Term 2 Coursework</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Assignments & Deadlines
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
            Track submissions, manage milestones, estimate study hours, and get instant outline assistance from your Subject AI Tutor.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Assignment</span>
        </button>
      </div>

      {/* Central Academic Metrics Dashboard */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Due This Week</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {dueThisWeek.length}
          </div>
          <span className="text-[11px] text-slate-500">Urgent deadlines approaching</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {overdueAsgs.length}
          </div>
          <span className="text-[11px] text-slate-500">Action required immediately</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Pending</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <CheckSquare className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {pendingAsgs.length}
          </div>
          <span className="text-[11px] text-slate-500">Total active assignments</span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Submitted</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 dark:text-white mt-2">
            {submittedCount}
          </div>
          <span className="text-[11px] text-slate-500">Completed coursework</span>
        </div>
      </div>

      {/* Filter & View Switcher Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          {[
            { id: 'all', label: 'All' },
            { id: 'due_this_week', label: 'Due This Week', count: dueThisWeek.length },
            { id: 'in_progress', label: 'In Progress' },
            { id: 'not_started', label: 'Not Started' },
            { id: 'completed', label: 'Completed' },
            { id: 'submitted', label: 'Submitted' },
            { id: 'overdue', label: 'Overdue', count: overdueAsgs.length }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === tab.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <span>{tab.label}</span>
              {tab.count !== undefined && tab.count > 0 && (
                <span className={`ml-1.5 px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  statusFilter === tab.id ? 'bg-white/20 text-white' : 'bg-rose-100 dark:bg-rose-900 text-rose-700 dark:text-rose-200'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Subject Filter */}
          <select
            value={subjectFilter}
            onChange={(e) => setSubjectFilter(e.target.value)}
            className="text-xs px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium"
          >
            <option value="all">All Subjects</option>
            {subjects.map(s => (
              <option key={s.id} value={s.id}>{s.name}</option>
            ))}
          </select>

          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="text-xs pl-8 pr-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-800 dark:text-slate-200 w-44"
            />
          </div>
        </div>
      </div>

      {/* Assignment List */}
      <div className="space-y-4">
        {filteredAssignments.length === 0 ? (
          <div className="p-12 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
            <CheckSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200">No Assignments Found</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              There are no assignments matching your current filter criteria.
            </p>
            <button
              onClick={openCreateModal}
              className="mt-4 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
            >
              + Create Assignment
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredAssignments.map((asg) => {
              const subject = subjects.find(s => s.id === asg.subjectId);
              const dueDate = new Date(asg.dueDate);
              const daysLeft = Math.round((dueDate.getTime() - now.getTime()) / 86400000);
              const isOverdue = dueDate < now && asg.status !== 'completed' && asg.status !== 'submitted';

              return (
                <div
                  key={asg.id}
                  className={`p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all shadow-xs flex flex-col justify-between ${
                    isOverdue
                      ? 'border-rose-300 dark:border-rose-900/60 ring-1 ring-rose-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                        {subject?.name || 'MBA Core'}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {getPriorityBadge(asg.priority)}
                        {getStatusBadge(asg.status, asg.dueDate)}
                      </div>
                    </div>

                    <h4 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
                      {asg.title}
                    </h4>

                    {asg.description && (
                      <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 leading-relaxed">
                        {asg.description}
                      </p>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1 pt-1">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>Progress</span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">{asg.progress}%</span>
                      </div>
                      <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-300 ${
                            asg.progress >= 100
                              ? 'bg-emerald-500'
                              : asg.progress > 50
                              ? 'bg-indigo-600'
                              : 'bg-amber-500'
                          }`}
                          style={{ width: `${asg.progress}%` }}
                        />
                      </div>
                    </div>

                    {/* Meta & Deadline */}
                    <div className="pt-2 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-center gap-1 font-medium">
                        <CalendarIcon className="w-3.5 h-3.5 text-slate-400" />
                        <span>
                          {dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        {asg.status !== 'completed' && asg.status !== 'submitted' && (
                          <span className={`ml-1 font-bold ${daysLeft < 0 ? 'text-rose-500' : daysLeft <= 3 ? 'text-amber-500' : 'text-slate-500'}`}>
                            ({daysLeft < 0 ? `${Math.abs(daysLeft)}d overdue` : daysLeft === 0 ? 'Due today' : `${daysLeft}d left`})
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-slate-400" />
                        <span>Est: {asg.estimatedHours || 4} hrs</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions Bar */}
                  <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      {asg.status !== 'submitted' && (
                        <button
                          onClick={() => handleQuickStatusChange(asg.id, 'submitted')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 hover:bg-emerald-100 rounded-lg transition"
                        >
                          Mark Submitted
                        </button>
                      )}
                      {asg.status === 'not_started' && (
                        <button
                          onClick={() => handleQuickStatusChange(asg.id, 'in_progress')}
                          className="px-2.5 py-1 text-[11px] font-semibold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 hover:bg-indigo-100 rounded-lg transition"
                        >
                          Start Work
                        </button>
                      )}
                      {onNavigateToAiTutor && (
                        <button
                          onClick={() => onNavigateToAiTutor(asg.subjectId, `Help me outline and approach this assignment: "${asg.title}". Description: ${asg.description || ''}`)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-purple-700 dark:text-purple-300 bg-purple-50 dark:bg-purple-950/60 hover:bg-purple-100 rounded-lg transition flex items-center gap-1"
                          title="Open in AI Tutor"
                        >
                          <Bot className="w-3 h-3" />
                          <span>AI Coach</span>
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditModal(asg)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 rounded-lg transition"
                        title="Edit Assignment"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteAssignment(asg.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg transition"
                        title="Delete Assignment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create / Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-lg w-full border border-slate-200 dark:border-slate-800 p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {editingAsg ? 'Edit Assignment' : 'Create New Assignment'}
            </h3>

            <form onSubmit={handleSaveAssignment} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  placeholder="e.g. Price Elasticity Case Study Analysis"
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Subject *</label>
                  <select
                    value={formSubjectId}
                    onChange={(e) => setFormSubjectId(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  >
                    {subjects.map(s => (
                      <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Due Date *</label>
                  <input
                    type="date"
                    value={formDueDate}
                    onChange={(e) => setFormDueDate(e.target.value)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Priority</label>
                  <select
                    value={formPriority}
                    onChange={(e) => setFormPriority(e.target.value as AssignmentPriority)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Status</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as AssignmentStatus)}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  >
                    <option value="not_started">Not Started</option>
                    <option value="in_progress">In Progress</option>
                    <option value="completed">Completed</option>
                    <option value="submitted">Submitted</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Est. Hours</label>
                  <input
                    type="number"
                    value={formEstimatedHours}
                    onChange={(e) => setFormEstimatedHours(Number(e.target.value))}
                    min={1}
                    max={100}
                    className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Progress</label>
                  <span className="text-xs font-bold text-indigo-600">{formProgress}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  step={5}
                  value={formProgress}
                  onChange={(e) => setFormProgress(Number(e.target.value))}
                  className="w-full accent-indigo-600"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Assignment Description / Prompt</label>
                <textarea
                  rows={3}
                  placeholder="Paste instructions, questions, or deliverables required by the professor..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Personal Notes & References</label>
                <textarea
                  rows={2}
                  placeholder="Key concepts to cite, data sources, or internal milestones..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition"
                >
                  {isSubmitting ? 'Saving...' : editingAsg ? 'Update Assignment' : 'Create Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
