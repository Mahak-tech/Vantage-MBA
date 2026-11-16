import React, { useState, useRef } from 'react';
import {
  UploadCloud,
  FileText,
  Trash2,
  Eye,
  CheckCircle2,
  AlertCircle,
  X,
  FileUp,
  Search,
  Sparkles
} from 'lucide-react';
import { Subject, StudyDocument } from '../../types';
import { api } from '../../services/api';

interface StudyMaterialsSectionProps {
  subject: Subject;
  documents: StudyDocument[];
  onRefresh: () => void;
  onNavigateToNotes: () => void;
}

export const StudyMaterialsSection: React.FC<StudyMaterialsSectionProps> = ({
  subject,
  documents,
  onRefresh,
  onNavigateToNotes
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewDoc, setPreviewDoc] = useState<StudyDocument | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [uploadCategory, setUploadCategory] = useState<string>('lecture_slides');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (files: FileList | File[]) => {
    if (!files || files.length === 0) return;
    try {
      setUploading(true);
      setUploadError(null);
      const fileArray = Array.from(files);
      await api.uploadDocuments(subject.id, fileArray, 'General', uploadCategory, subject.termId);
      onRefresh();
    } catch (err: any) {
      setUploadError(err.message || 'File upload and processing failed.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (docId: string) => {
    if (!window.confirm('Are you sure you want to delete this document?')) return;
    try {
      await api.deleteDocument(docId);
      onRefresh();
      if (previewDoc?.id === docId) setPreviewDoc(null);
    } catch (err: any) {
      alert(err.message || 'Failed to delete file.');
    }
  };

  const filteredDocs = documents.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      d.originalName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || (d.category || 'lecture_slides') === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const getFormatBadge = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 uppercase border border-rose-200 dark:border-rose-800">PDF</span>;
      case 'pptx':
      case 'ppt':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 uppercase border border-amber-200 dark:border-amber-800">PPTX</span>;
      case 'docx':
      case 'doc':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 uppercase border border-sky-200 dark:border-sky-800">DOCX</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase border border-slate-200 dark:border-slate-700">{type}</span>;
    }
  };

  const getCategoryBadge = (cat?: string) => {
    switch (cat) {
      case 'case_study':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">Case Study</span>;
      case 'assignment':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">Assignment</span>;
      case 'project':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">Project</span>;
      case 'reference':
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700">Reference</span>;
      default:
        return <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">Lecture Slides</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setIsDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-200 ${
          isDragging
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30'
            : 'border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-500 bg-white dark:bg-slate-900 shadow-xs'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept=".pdf,.pptx,.ppt,.docx,.doc,.txt"
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
        <div className="max-w-md mx-auto space-y-3">
          <div className="w-14 h-14 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto border border-indigo-100 dark:border-indigo-900/50">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">
              {uploading ? 'Parsing Lecture Slides...' : 'Upload Subject Study Materials'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Drag & drop lecture presentations (PPTX), course syllabus (PDF), case packets (DOCX), or notes (TXT).
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-1.5 text-xs">
              <span className="font-semibold text-slate-500">Category:</span>
              <select
                value={uploadCategory}
                onChange={(e) => setUploadCategory(e.target.value)}
                className="bg-transparent font-bold text-slate-800 dark:text-slate-200 focus:outline-none cursor-pointer"
              >
                <option value="lecture_slides" className="dark:bg-slate-900">Lecture Slides (PPTX/PDF)</option>
                <option value="case_study" className="dark:bg-slate-900">Case Study (HBS/Stanford)</option>
                <option value="assignment" className="dark:bg-slate-900">Assignment / Problem Set</option>
                <option value="project" className="dark:bg-slate-900">Project / Term Paper</option>
                <option value="reference" className="dark:bg-slate-900">Reference Notes</option>
              </select>
            </div>

            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-xs transition disabled:opacity-50 flex items-center gap-2"
            >
              <FileUp className="w-4 h-4" />
              <span>{uploading ? 'Extracting Text...' : 'Select Files'}</span>
            </button>
          </div>

          <div className="text-[11px] text-slate-400 dark:text-slate-500">
            Slides parsed individually with slide titles & text • Preserves headings & tables • Max 35MB
          </div>
        </div>
      </div>

      {uploadError && (
        <div className="p-4 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-300 text-xs rounded-xl border border-red-200 dark:border-red-800 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
          <div className="flex-1">
            <p className="font-semibold">Upload Notice</p>
            <p className="mt-0.5">{uploadError}</p>
          </div>
        </div>
      )}

      {/* Materials List & Search */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Subject Document Library ({documents.length})</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Parsed slide-by-slide and isolated strictly for {subject.name} note synthesis and AI tutor citations.</p>
          </div>
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search documents..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 pr-3 py-1.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-slate-100"
            />
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800">
          {[
            { id: 'all', label: 'All Documents' },
            { id: 'lecture_slides', label: 'Lecture Slides' },
            { id: 'case_study', label: 'Case Studies' },
            { id: 'assignment', label: 'Assignments' },
            { id: 'project', label: 'Projects' },
            { id: 'reference', label: 'References' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition ${
                categoryFilter === cat.id
                  ? 'bg-indigo-600 text-white shadow-2xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {documents.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 flex items-center justify-center mx-auto">
              <FileText className="w-6 h-6" />
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto">
              No lecture documents uploaded yet. Upload your PPTX, PDF, or DOCX files above to generate notes and flashcards.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredDocs.map((doc) => (
              <div key={doc.id} className="py-3.5 flex items-center justify-between gap-4 group">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                    <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">{doc.title}</p>
                      {getFormatBadge(doc.fileType)}
                      {getCategoryBadge(doc.category)}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      <span>{(doc.fileSize / 1024).toFixed(0)} KB</span>
                      <span>•</span>
                      <span>{doc.pageCount} {doc.fileType === 'pptx' ? 'Slides' : 'Pages'}</span>
                      <span>•</span>
                      <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                      {doc.status === 'completed' && (
                        <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                          <CheckCircle2 className="w-3 h-3" /> Ready
                        </span>
                      )}
                      {doc.status === 'failed' && (
                        <span className="flex items-center gap-1 text-red-600 dark:text-red-400 font-semibold">
                          <AlertCircle className="w-3 h-3" /> Error
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setPreviewDoc(doc)}
                    className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition"
                    title="Preview Extracted Slides & Content"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc.id)}
                    className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 rounded-xl transition"
                    title="Delete Document"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Document Text & Slide Preview Drawer */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-3xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-900 dark:text-white text-sm flex items-center gap-2">
                  <span>{previewDoc.title}</span>
                  {getFormatBadge(previewDoc.fileType)}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {previewDoc.pageCount} {previewDoc.fileType === 'pptx' ? 'Slides' : 'Pages'} extracted & indexed for AI
                </p>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Slides / Content Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {previewDoc.pages && previewDoc.pages.length > 0 ? (
                previewDoc.pages.map((p, idx) => (
                  <div key={idx} className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-indigo-700 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/60 px-2.5 py-0.5 rounded-md border border-indigo-100 dark:border-indigo-900/50">
                        {p.title || `Slide ${p.index}`}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed font-normal">
                      {p.text}
                    </p>
                  </div>
                ))
              ) : (
                <div className="p-4 text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap leading-relaxed">
                  {previewDoc.extractedText || 'No text extracted.'}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between text-xs">
              <span className="text-slate-500 dark:text-slate-400">Ready for notes, flashcards, and tutor answers</span>
              <button
                onClick={() => {
                  setPreviewDoc(null);
                  onNavigateToNotes();
                }}
                className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-xs transition"
              >
                Generate Notes from this Material
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default StudyMaterialsSection;
