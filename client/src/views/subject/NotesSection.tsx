import React, { useState, useEffect } from 'react';
import {
  FileText,
  Sparkles,
  Download,
  Copy,
  Check,
  Trash2,
  Edit3,
  Search,
  BookOpen,
  Zap,
  ListOrdered,
  Save,
  Plus
} from 'lucide-react';
import { Subject, StudyDocument, Note, NoteType } from '../../types';
import { api } from '../../services/api';
import jsPDF from 'jspdf';
import { marked } from 'marked';

interface NotesSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  notes: Note[];
  onRefresh: () => void;
  defaultType?: NoteType;
}

export const NotesSection: React.FC<NotesSectionProps> = ({
  subject,
  documents,
  notes,
  onRefresh,
  defaultType
}) => {
  const [selectedNote, setSelectedNote] = useState<Note | null>(notes[0] || null);
  const [filterType, setFilterType] = useState<string>(defaultType || 'all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState('');
  const [copied, setCopied] = useState(false);

  // Generation Modal State
  const [showGenModal, setShowGenModal] = useState(false);
  const [genTopic, setGenTopic] = useState('');
  const [genType, setGenType] = useState<NoteType>(defaultType || 'complete');
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);

  // Auto-select first note when notes load or update
  useEffect(() => {
    if (!selectedNote && notes.length > 0) {
      setSelectedNote(notes[0]);
    } else if (selectedNote && !notes.some(n => n.id === selectedNote.id) && notes.length > 0) {
      setSelectedNote(notes[0]);
    }
  }, [notes]);

  const filteredNotes = notes.filter(n => {
    const matchesType = filterType === 'all' || n.type === filterType;
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSearch;
  });

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const newNote = await api.generateNotes({
        subjectId: subject.id,
        docIds: selectedDocIds.length > 0 ? selectedDocIds : undefined,
        noteType: genType,
        topic: genTopic.trim() || undefined
      });
      setShowGenModal(false);
      setGenTopic('');
      await onRefresh();
      setSelectedNote(newNote);
    } catch (err: any) {
      alert(err.message || 'Failed to generate notes.');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!selectedNote) return;
    try {
      const updated = await api.updateNote(selectedNote.id, { content: editedContent });
      setSelectedNote(updated);
      setIsEditing(false);
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to save note changes.');
    }
  };

  const handleDelete = async (noteId: string) => {
    if (!window.confirm('Delete this note?')) return;
    try {
      await api.deleteNote(noteId);
      if (selectedNote?.id === noteId) {
        setSelectedNote(null);
      }
      onRefresh();
    } catch (err: any) {
      alert(err.message || 'Failed to delete note.');
    }
  };

  const handleCopy = () => {
    if (!selectedNote) return;
    navigator.clipboard.writeText(selectedNote.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    if (!selectedNote) return;
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'pt',
      format: 'a4'
    });

    const pageMargin = 40;
    const pageWidth = doc.internal.pageSize.getWidth() - pageMargin * 2;

    doc.setFont('Helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(30, 41, 59);
    doc.text(selectedNote.title, pageMargin, 50);

    doc.setFont('Helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(`Subject: ${subject.name} | Type: ${selectedNote.type.toUpperCase()}`, pageMargin, 68);

    doc.setFontSize(10);
    doc.setTextColor(30, 41, 59);

    const lines = doc.splitTextToSize(selectedNote.content.replace(/[#*`>]/g, ''), pageWidth);
    doc.text(lines, pageMargin, 95);

    doc.save(`${selectedNote.title.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls: Type Tabs & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'all', label: 'All Notes' },
            { id: 'complete', label: 'Complete Notes', icon: BookOpen },
            { id: 'short', label: 'Short Notes', icon: Zap },
            { id: 'revision', label: 'Revision Notes', icon: Sparkles },
            { id: 'exam_oriented', label: 'Exam-Oriented', icon: ListOrdered },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilterType(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                filterType === t.id
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setShowGenModal(true)}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate AI Notes</span>
        </button>
      </div>

      {/* Main Two-Column Layout: Notes List + Reader/Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 min-h-[600px]">
        {/* Left Column: Notes List (4 cols) */}
        <div className="lg:col-span-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 space-y-3 flex flex-col h-full shadow-xs">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search in notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {filteredNotes.length === 0 ? (
              <div className="text-center py-12 px-4 text-slate-400 text-xs italic">
                No notes found. Click "Generate AI Notes" to synthesize comprehensive notes!
              </div>
            ) : (
              filteredNotes.map((note) => {
                const isSelected = selectedNote?.id === note.id;
                return (
                  <div
                    key={note.id}
                    onClick={() => {
                      setSelectedNote(note);
                      setIsEditing(false);
                    }}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition ${
                      isSelected
                        ? 'border-indigo-500 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1.5">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-100 dark:bg-indigo-900/60 px-2 py-0.5 rounded">
                        {note.type}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {new Date(note.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{note.title}</h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                      {note.content.replace(/[#*`>]/g, '').substring(0, 100)}...
                    </p>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Active Note Content (8 cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 flex flex-col h-full shadow-xs">
          {selectedNote ? (
            <div className="flex-1 flex flex-col space-y-4">
              {/* Note Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800 gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-bold bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 uppercase tracking-wide">
                      {selectedNote.type} Notes
                    </span>
                    <span className="text-xs text-slate-400">
                      Last updated {new Date(selectedNote.updatedAt || selectedNote.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">{selectedNote.title}</h2>
                </div>

                <div className="flex items-center gap-2">
                  {isEditing ? (
                    <button
                      onClick={handleSaveEdit}
                      className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition"
                    >
                      <Save className="w-3.5 h-3.5" />
                      <span>Save Changes</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditedContent(selectedNote.content);
                        setIsEditing(true);
                      }}
                      className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                      title="Edit Note"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={handleCopy}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Copy Markdown"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={handleDownloadPdf}
                    className="p-2 text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
                    title="Download as PDF"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(selectedNote.id)}
                    className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-lg transition"
                    title="Delete Note"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Note Content Viewer / Editor */}
              <div className="flex-1 overflow-y-auto">
                {isEditing ? (
                  <textarea
                    value={editedContent}
                    onChange={(e) => setEditedContent(e.target.value)}
                    rows={20}
                    className="w-full h-full p-4 font-mono text-xs text-slate-900 dark:text-white bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none leading-relaxed"
                  />
                ) : (
                  <div
                    className="prose prose-slate dark:prose-invert max-w-none text-xs sm:text-sm leading-relaxed prose-headings:font-bold prose-headings:text-slate-900 dark:prose-headings:text-white prose-table:border prose-th:bg-slate-100 dark:prose-th:bg-slate-800 prose-th:p-2 prose-td:p-2 prose-blockquote:border-l-indigo-500 prose-blockquote:bg-indigo-50/50 dark:prose-blockquote:bg-indigo-950/30 prose-blockquote:py-1.5 prose-blockquote:px-3 prose-blockquote:rounded-r-lg"
                    dangerouslySetInnerHTML={{ __html: marked.parse(selectedNote.content) as string }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8 space-y-3">
              <FileText className="w-12 h-12 text-slate-300 dark:text-slate-700 mb-1" />
              <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">No Note Selected</p>
              <p className="text-xs text-slate-400 max-w-xs">
                Select an existing note from the left sidebar or click Generate AI Notes to produce fresh structured summaries.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Generate AI Notes Modal */}
      {showGenModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 dark:border-slate-800 p-6 space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <span>Generate AI Study Notes</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Synthesize structured notes from course lecture slides and textbooks.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Note Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'complete', label: 'Complete Notes' },
                  { id: 'short', label: 'Short Notes' },
                  { id: 'revision', label: 'Revision Notes' },
                  { id: 'exam_oriented', label: 'Exam-Oriented' },
                ].map(nt => (
                  <button
                    type="button"
                    key={nt.id}
                    onClick={() => setGenType(nt.id as NoteType)}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border text-left transition ${
                      genType === nt.id
                        ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 ring-1 ring-indigo-600'
                        : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {nt.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Specific Topic or Chapter (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Capital Budgeting & Discounted Cash Flows"
                value={genTopic}
                onChange={(e) => setGenTopic(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {documents.length > 0 && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                  Source Documents ({documents.length} available)
                </label>
                <div className="max-h-32 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
                  {documents.map(d => {
                    const isChecked = selectedDocIds.includes(d.id);
                    return (
                      <label key={d.id} className="flex items-center gap-2 text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedDocIds([...selectedDocIds, d.id]);
                            else setSelectedDocIds(selectedDocIds.filter(id => id !== d.id));
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="truncate">{d.title}</span>
                      </label>
                    );
                  })}
                </div>
                <span className="text-[10px] text-slate-400 mt-1 block">
                  Leave unchecked to analyze all uploaded materials for this subject.
                </span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-end gap-2">
              <button
                type="button"
                disabled={isGenerating}
                onClick={() => setShowGenModal(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isGenerating}
                onClick={handleGenerate}
                className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition disabled:opacity-50 flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>{isGenerating ? 'Synthesizing...' : 'Generate Notes'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
