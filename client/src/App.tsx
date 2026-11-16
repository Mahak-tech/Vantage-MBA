import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { SubjectModal } from './components/SubjectModal';
import { GlobalSearchModal } from './components/GlobalSearchModal';

import { LoginView } from './views/LoginView';
import { DashboardView } from './views/DashboardView';
import { SubjectWorkspaceView } from './views/SubjectWorkspaceView';
import { RevisionCentreView } from './views/RevisionCentreView';
import { AcademicCalendarView } from './views/AcademicCalendarView';
import { SettingsView } from './views/SettingsView';
import { VisualStudioSection } from './views/subject/VisualStudioSection';
import { MbaJourneyView } from './views/MbaJourneyView';
import { AssignmentManagerView } from './views/AssignmentManagerView';
import { AiTutorWorkspaceView } from './views/AiTutorWorkspaceView';

import { Subject, StudyDocument, Note, Flashcard, QuizAttempt, AcademicTask, UserProfile, AcademicTerm, Assignment } from './types';
import { api } from './services/api';
import { BookOpen } from 'lucide-react';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [terms, setTerms] = useState<AcademicTerm[]>([]);
  const [activeTermId, setActiveTermId] = useState<string>('term-2');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [aiInitialPrompt, setAiInitialPrompt] = useState<string>('');

  // Authentication State (default to true if previously logged in, or false to present login)
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => {
    return localStorage.getItem('vantage_auth') === 'true';
  });

  // Dark Mode State
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('mymba_dark_mode') === 'true';
  });

  // Global counts & caches
  const [documents, setDocuments] = useState<StudyDocument[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [quizzes, setQuizzes] = useState<QuizAttempt[]>([]);
  const [tasks, setTasks] = useState<AcademicTask[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [subjectModalOpen, setSubjectModalOpen] = useState(false);
  const [subjectToEdit, setSubjectToEdit] = useState<Subject | null>(null);
  const [searchModalOpen, setSearchModalOpen] = useState(false);

  useEffect(() => {
    loadAllData();
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem('mymba_dark_mode', 'true');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('mymba_dark_mode', 'false');
    }
  }, [darkMode]);

  const loadAllData = async () => {
    try {
      setLoading(true);
      const [u, subList, docList, nList, fList, qList, tList, termList, asgList] = await Promise.all([
        api.getUser().catch(() => null),
        api.getSubjects().catch(() => []),
        api.getDocuments().catch(() => []),
        api.getNotes().catch(() => []),
        api.getFlashcards().catch(() => []),
        api.getQuizAttempts().catch(() => []),
        api.getCalendarTasks().catch(() => []),
        api.getAcademicTerms().catch(() => []),
        api.getAssignments().catch(() => [])
      ]);

      if (u) setUser(u);
      setSubjects(subList || []);
      setDocuments(docList || []);
      setNotes(nList || []);
      setFlashcards(fList || []);
      setQuizzes(qList || []);
      setTasks(tList || []);
      setTerms(termList || []);
      setAssignments(asgList || []);

      if (termList && termList.length > 0) {
        const active = termList.find(t => t.status === 'active');
        if (active) setActiveTermId(active.id);
      }

      if (subList && subList.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(subList[0].id);
      }
    } catch (err) {
      console.error('Failed to load application data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (name: string, email: string) => {
    try {
      const res = await api.login({ name, email });
      if (res?.user) {
        setUser(res.user);
      } else {
        const updated = await api.updateUser({ name, email });
        setUser(updated);
      }
    } catch (err) {
      console.error('Login sync error:', err);
    }
    localStorage.setItem('vantage_auth', 'true');
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('vantage_auth');
    setIsAuthenticated(false);
  };

  const handleCreateOrUpdateSubject = async (data: Partial<Subject>) => {
    if (subjectToEdit) {
      await api.updateSubject(subjectToEdit.id, data);
    } else {
      const created = await api.createSubject(data);
      setSelectedSubjectId(created.id);
      setCurrentTab('subjects');
    }
    await loadAllData();
    setSubjectToEdit(null);
  };

  const handleDeleteSubject = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this subject workspace? All associated notes, flashcards, and documents will be deleted.')) {
      return;
    }
    try {
      await api.deleteSubject(id);
      if (selectedSubjectId === id) {
        setSelectedSubjectId(null);
      }
      await loadAllData();
      setCurrentTab('dashboard');
    } catch (err: any) {
      alert(err.message || 'Failed to delete subject.');
    }
  };

  const handleLogStudyMinutes = async () => {
    if (!user) return;
    try {
      const updated = await api.updateUser({
        todayStudyMinutes: (user.todayStudyMinutes || 0) + 15
      });
      setUser(updated);
    } catch (err) {
      console.error(err);
    }
  };

  const handleNavigate = (tab: string, subjectId?: string) => {
    if (subjectId) {
      setSelectedSubjectId(subjectId);
    }
    setCurrentTab(tab);
  };

  const activeSubject = subjects.find(s => s.id === selectedSubjectId) || subjects[0] || null;

  // Map global tabs to Subject sub-sections
  const getSubjectTabFromGlobalTab = (tab: string) => {
    switch (tab) {
      case 'materials': return 'materials';
      case 'notes': return 'complete_notes';
      case 'flashcards': return 'flashcards';
      case 'practice': return 'practice';
      case 'tutor': return 'tutor';
      case 'visual': return 'visual';
      default: return 'materials';
    }
  };

  // If not logged in, render the Login View
  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={handleLogin}
        defaultUser={user}
        darkMode={darkMode}
        onToggleDarkMode={() => setDarkMode(prev => !prev)}
      />
    );
  }

  return (
    <div className="flex h-screen overflow-hidden font-sans text-slate-900 dark:text-slate-100 bg-slate-50 dark:bg-slate-950 transition-colors">
      {/* Sidebar */}
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        subjects={subjects}
        selectedSubjectId={selectedSubjectId}
        setSelectedSubjectId={setSelectedSubjectId}
        openCreateSubjectModal={() => {
          setSubjectToEdit(null);
          setSubjectModalOpen(true);
        }}
        user={user}
        onLogout={handleLogout}
        assignmentsCount={assignments.filter(a => a.status !== 'completed' && a.status !== 'submitted').length}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header
          subjects={subjects}
          selectedSubjectId={selectedSubjectId}
          setSelectedSubjectId={setSelectedSubjectId}
          openSearchModal={() => setSearchModalOpen(true)}
          openCreateSubjectModal={() => {
            setSubjectToEdit(null);
            setSubjectModalOpen(true);
          }}
          darkMode={darkMode}
          onToggleDarkMode={() => setDarkMode(prev => !prev)}
          user={user}
          activeTermName={terms.find(t => t.id === activeTermId)?.name || 'Term 2'}
          onNavigateToJourney={() => setCurrentTab('journey')}
          onLogStudyMinutes={handleLogStudyMinutes}
          onLogout={handleLogout}
        />

        {/* Dynamic View Container */}
        <main className="flex-1 overflow-y-auto">
          {/* 1. DASHBOARD */}
          {currentTab === 'dashboard' && (
            <DashboardView
              user={user}
              subjects={subjects}
              documents={documents}
              notes={notes}
              flashcards={flashcards}
              quizzes={quizzes}
              tasks={tasks}
              terms={terms}
              activeTermId={activeTermId}
              onNavigate={handleNavigate}
              openCreateSubjectModal={() => {
                setSubjectToEdit(null);
                setSubjectModalOpen(true);
              }}
              onLogStudyMinutes={handleLogStudyMinutes}
            />
          )}

          {/* 2. MY MBA JOURNEY (Six Terms) */}
          {currentTab === 'journey' && (
            <MbaJourneyView
              terms={terms}
              subjects={subjects}
              activeTermId={activeTermId}
              onSelectTerm={(termId) => setActiveTermId(termId)}
              onRefreshTerms={loadAllData}
              onNavigate={handleNavigate}
              openCreateSubjectModal={(_termId) => {
                setSubjectToEdit(null);
                setSubjectModalOpen(true);
              }}
            />
          )}

          {/* 3. ASSIGNMENT & DEADLINE MANAGER */}
          {currentTab === 'assignments' && (
            <AssignmentManagerView
              subjects={subjects}
              terms={terms}
              activeTermId={activeTermId}
              onNavigateToAiTutor={(subId, prompt) => {
                setSelectedSubjectId(subId);
                setAiInitialPrompt(prompt || '');
                setCurrentTab('tutor');
              }}
            />
          )}

          {/* 4. ADVANCED SUBJECT-SPECIFIC AI TUTOR WORKSPACE */}
          {currentTab === 'tutor' && (
            <AiTutorWorkspaceView
              subjects={subjects}
              terms={terms}
              activeTermId={activeTermId}
              initialSubjectId={selectedSubjectId || undefined}
              initialPrompt={aiInitialPrompt || undefined}
            />
          )}

          {/* 2. MY SUBJECTS (Workspace with 11 Sections) */}
          {currentTab === 'subjects' && (
            activeSubject ? (
              <SubjectWorkspaceView
                subject={activeSubject}
                subjects={subjects}
                onSelectSubject={setSelectedSubjectId}
                onEditSubject={(sub) => {
                  setSubjectToEdit(sub);
                  setSubjectModalOpen(true);
                }}
                onDeleteSubject={handleDeleteSubject}
                initialTab="materials"
              />
            ) : (
              <div className="p-12 max-w-lg mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">No Subjects Created Yet</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Start by creating a workspace for your MBA subject (e.g. Microeconomics, Product Strategy, Corporate Valuation).
                </p>
                <button
                  onClick={() => {
                    setSubjectToEdit(null);
                    setSubjectModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  + Create Your First Subject
                </button>
              </div>
            )
          )}

          {/* 3 - 6: Direct Feature Tabs (Materials, Notes, Flashcards, Practice) */}
          {['materials', 'notes', 'flashcards', 'practice'].includes(currentTab) && (
            activeSubject ? (
              <SubjectWorkspaceView
                subject={activeSubject}
                subjects={subjects}
                onSelectSubject={setSelectedSubjectId}
                onEditSubject={(sub) => {
                  setSubjectToEdit(sub);
                  setSubjectModalOpen(true);
                }}
                onDeleteSubject={handleDeleteSubject}
                initialTab={getSubjectTabFromGlobalTab(currentTab)}
              />
            ) : (
              <div className="p-12 max-w-md mx-auto text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto text-2xl border border-indigo-100 dark:border-indigo-900/50">
                  <BookOpen className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-slate-900 dark:text-white text-base">Select or Create a Subject</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Study materials, notes, and questions are organized inside your dedicated subject workspaces.
                </p>
                <button
                  onClick={() => {
                    setSubjectToEdit(null);
                    setSubjectModalOpen(true);
                  }}
                  className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold shadow-sm transition"
                >
                  + Create Subject Workspace
                </button>
              </div>
            )
          )}

          {/* 8. Standalone Visual Learning Studio */}
          {currentTab === 'visual' && (
            <div className="p-8 max-w-7xl mx-auto space-y-6 animate-in fade-in">
              <VisualStudioSection
                subject={activeSubject || {
                  id: 'global',
                  name: 'General MBA Frameworks',
                  code: 'MBA-CORE',
                  description: 'Universal Business & Strategic Models'
                }}
                documents={documents}
              />
            </div>
          )}

          {/* 9. REVISION CENTRE */}
          {currentTab === 'revision' && (
            <RevisionCentreView
              subjects={subjects}
              onNavigate={handleNavigate}
            />
          )}

          {/* 10. ACADEMIC CALENDAR */}
          {currentTab === 'calendar' && (
            <AcademicCalendarView
              subjects={subjects}
            />
          )}

          {/* 11. SETTINGS */}
          {currentTab === 'settings' && (
            <SettingsView
              user={user}
              onRefreshUser={loadAllData}
              darkMode={darkMode}
              onToggleDarkMode={() => setDarkMode(prev => !prev)}
            />
          )}
        </main>
      </div>

      {/* Global Subject Modal */}
      <SubjectModal
        isOpen={subjectModalOpen}
        onClose={() => setSubjectModalOpen(false)}
        onSave={handleCreateOrUpdateSubject}
        initialData={subjectToEdit}
      />

      {/* Global Search Modal (Ctrl+K) */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onNavigate={handleNavigate}
      />
    </div>
  );
}

export default App;
