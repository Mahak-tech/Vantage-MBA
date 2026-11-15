import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderOpen,
  FileText,
  Zap,
  RotateCcw,
  Layers,
  HelpCircle,
  Database,
  Award,
  MessageSquare,
  Sparkles,
  TrendingUp,
  Edit2,
  Trash2
} from 'lucide-react';
import { Subject, StudyDocument, Note, Flashcard, Question, QuizAttempt } from '../types';
import { api } from '../services/api';

import { StudyMaterialsSection } from './subject/StudyMaterialsSection';
import { NotesSection } from './subject/NotesSection';
import { FlashcardsSection } from './subject/FlashcardsSection';
import { PracticeQuestionsSection } from './subject/PracticeQuestionsSection';
import { QuizSection } from './subject/QuizSection';
import { AiTutorSection } from './subject/AiTutorSection';
import { VisualStudioSection } from './subject/VisualStudioSection';
import { LearningProgressSection } from './subject/LearningProgressSection';

interface SubjectWorkspaceViewProps {
  subject: Subject;
  subjects: Subject[];
  onSelectSubject: (id: string) => void;
  onEditSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
  initialTab?: string;
}

export const SubjectWorkspaceView: React.FC<SubjectWorkspaceViewProps> = ({
  subject,
  subjects,
  onSelectSubject,
  onEditSubject,
  onDeleteSubject,
  initialTab = 'materials'
}) => {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [quizAttempts, setQuizAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSubjectData();
  }, [subject.id]);

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);

  const loadSubjectData = async () => {
    try {
      setLoading(true);
      const [docs, nList, fList, qList, qAtts] = await Promise.all([
        api.getDocuments(subject.id).catch(() => []),
        api.getNotes(subject.id).catch(() => []),
        api.getFlashcards(subject.id).catch(() => []),
        api.getQuestions(subject.id).catch(() => []),
        api.getQuizAttempts(subject.id).catch(() => [])
      ]);
      setDocuments(docs || []);
      setNotes(nList || []);
      setFlashcards(fList || []);
      setQuestions(qList || []);
      setQuizAttempts(qAtts || []);
    } catch (err) {
      console.error('Failed to load subject resources:', err);
    } finally {
      setLoading(false);
    }
  };

  const tabs = [
    { id: 'materials', label: '1. Study Materials', icon: FolderOpen, badge: documents.length },
    { id: 'complete_notes', label: '2. Complete Notes', icon: FileText, badge: notes.filter(n => n.type === 'complete').length },
    { id: 'short_notes', label: '3. Short Notes', icon: Zap, badge: notes.filter(n => n.type === 'short').length },
    { id: 'revision_notes', label: '4. Revision Notes', icon: RotateCcw, badge: notes.filter(n => n.type === 'revision').length },
    { id: 'flashcards', label: '5. Flashcards', icon: Layers, badge: flashcards.length },
    { id: 'practice', label: '6. Practice Questions', icon: HelpCircle, badge: questions.length },
    { id: 'mcq_bank', label: '7. MCQ Bank', icon: Database },
    { id: 'quizzes', label: '8. Quizzes & Tests', icon: Award, badge: quizAttempts.length },
    { id: 'tutor', label: '9. AI Tutor', icon: MessageSquare },
    { id: 'visual', label: '10. Visual Studio', icon: Sparkles },
    { id: 'progress', label: '11. Progress', icon: TrendingUp },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in duration-200">
      {/* Subject Header Banner */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 sm:p-7 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-indigo-200 dark:shadow-none">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950 px-2.5 py-0.5 rounded-full">
                {subject.code || subject.semester || 'Subject Workspace'}
              </span>
              <span className="text-xs text-slate-500">• {subject.creditHours || 3} Credits</span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-1">{subject.name}</h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">{subject.description || 'Dedicated academic workspace for MBA coursework, lecture slides, notes, and revision.'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-center">
          <button
            onClick={() => onEditSubject(subject)}
            className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition border border-slate-200 dark:border-slate-800"
            title="Edit Subject"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={() => onDeleteSubject(subject.id)}
            className="p-2 text-slate-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition border border-slate-200 dark:border-slate-800"
            title="Delete Subject Workspace"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 11 Navigation Sections Tabs Bar */}
      <div className="bg-white dark:bg-slate-900 p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs flex items-center gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Section Content Router */}
      <div className="min-h-[500px]">
        {/* 1. Study Materials */}
        {activeTab === 'materials' && (
          <StudyMaterialsSection
            subject={subject}
            documents={documents}
            onRefresh={loadSubjectData}
            onNavigateToNotes={() => setActiveTab('complete_notes')}
          />
        )}

        {/* 2. Complete Notes */}
        {activeTab === 'complete_notes' && (
          <NotesSection
            subject={subject}
            documents={documents}
            notes={notes}
            onRefresh={loadSubjectData}
            defaultType="complete"
          />
        )}

        {/* 3. Short Notes */}
        {activeTab === 'short_notes' && (
          <NotesSection
            subject={subject}
            documents={documents}
            notes={notes}
            onRefresh={loadSubjectData}
            defaultType="short"
          />
        )}

        {/* 4. Revision Notes */}
        {activeTab === 'revision_notes' && (
          <NotesSection
            subject={subject}
            documents={documents}
            notes={notes}
            onRefresh={loadSubjectData}
            defaultType="revision"
          />
        )}

        {/* 5. Flashcards */}
        {activeTab === 'flashcards' && (
          <FlashcardsSection
            subject={subject}
            documents={documents}
            flashcards={flashcards}
            onRefresh={loadSubjectData}
          />
        )}

        {/* 6. Practice Questions */}
        {activeTab === 'practice' && (
          <PracticeQuestionsSection
            subject={subject}
            documents={documents}
            questions={questions}
            onRefresh={loadSubjectData}
            isBankMode={false}
          />
        )}

        {/* 7. MCQ Bank */}
        {activeTab === 'mcq_bank' && (
          <PracticeQuestionsSection
            subject={subject}
            documents={documents}
            questions={questions}
            onRefresh={loadSubjectData}
            isBankMode={true}
          />
        )}

        {/* 8. Quizzes & Tests */}
        {activeTab === 'quizzes' && (
          <QuizSection
            subject={subject}
            documents={documents}
            questions={questions}
            onRefresh={loadSubjectData}
          />
        )}

        {/* 9. AI Tutor */}
        {activeTab === 'tutor' && (
          <AiTutorSection
            subject={subject}
            documents={documents}
          />
        )}

        {/* 10. Visual Learning Studio */}
        {activeTab === 'visual' && (
          <VisualStudioSection
            subject={subject}
            documents={documents}
          />
        )}

        {/* 11. Learning Progress */}
        {activeTab === 'progress' && (
          <LearningProgressSection
            subject={subject}
            documents={documents}
            notes={notes}
            flashcards={flashcards}
            quizzes={quizAttempts}
            onNavigateToTab={(tabId) => setActiveTab(tabId)}
          />
        )}
      </div>
    </div>
  );
};
