import {
  Subject,
  StudyDocument,
  Note,
  Flashcard,
  Question,
  QuizAttempt,
  TutorMessage,
  VisualStudioItem,
  AcademicTask,
  UserProfile,
  Settings,
  NoteType,
  QuestionType,
  DifficultyLevel,
  VisualMode
} from '../types';

const API_BASE = '/api';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const customKey = localStorage.getItem('gemini_api_key');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMsg = `HTTP Error ${response.status}`;
    try {
      const errorJson = await response.json();
      if (errorJson.error) errorMsg = errorJson.error;
    } catch (e) {}
    throw new Error(errorMsg);
  }

  return response.json();
}

export const api = {
  // Settings & Profile
  getSettings: () => request<Settings>('/settings'),
  updateSettings: (settings: Partial<Settings>) =>
    request<Settings>('/settings', { method: 'POST', body: JSON.stringify(settings) }),
  testGeminiKey: (apiKey: string) =>
    request<{ valid: boolean; message?: string; error?: string }>('/settings/test-gemini', {
      method: 'POST',
      body: JSON.stringify({ apiKey })
    }),
  getUser: () => request<UserProfile>('/user'),
  updateUser: (updates: Partial<UserProfile>) =>
    request<UserProfile>('/user', { method: 'PUT', body: JSON.stringify(updates) }),
  login: (data: { name: string; email?: string }) =>
    request<{ success: boolean; user: UserProfile }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Subjects
  getSubjects: () => request<Subject[]>('/subjects'),
  getSubject: (id: string) => request<Subject>(`/subjects/${id}`),
  createSubject: (subject: Partial<Subject>) =>
    request<Subject>('/subjects', { method: 'POST', body: JSON.stringify(subject) }),
  updateSubject: (id: string, updates: Partial<Subject>) =>
    request<Subject>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteSubject: (id: string) =>
    request<{ success: boolean }>(`/subjects/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (subjectId?: string) =>
    request<StudyDocument[]>(`/documents${subjectId ? `?subjectId=${subjectId}` : ''}`),
  uploadDocuments: async (subjectId: string, files: File[], moduleName?: string) => {
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    if (moduleName) formData.append('moduleName', moduleName);
    files.forEach(f => formData.append('files', f));

    const response = await fetch(`${API_BASE}/documents/upload`, {
      method: 'POST',
      body: formData
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to upload files.');
    }
    return response.json() as Promise<StudyDocument[]>;
  },
  deleteDocument: (id: string) =>
    request<{ success: boolean }>(`/documents/${id}`, { method: 'DELETE' }),

  // Notes
  getNotes: (subjectId?: string) =>
    request<Note[]>(`/notes${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createNote: (note: Partial<Note>) =>
    request<Note>('/notes', { method: 'POST', body: JSON.stringify(note) }),
  updateNote: (id: string, updates: Partial<Note>) =>
    request<Note>(`/notes/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteNote: (id: string) =>
    request<{ success: boolean }>(`/notes/${id}`, { method: 'DELETE' }),
  generateNotes: (params: { subjectId: string; docIds?: string[]; noteType: NoteType; topic?: string }) =>
    request<Note>('/notes/generate', { method: 'POST', body: JSON.stringify(params) }),

  // Flashcards
  getFlashcards: (subjectId?: string) =>
    request<Flashcard[]>(`/flashcards${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createFlashcard: (card: Partial<Flashcard>) =>
    request<Flashcard>('/flashcards', { method: 'POST', body: JSON.stringify(card) }),
  updateFlashcard: (id: string, updates: Partial<Flashcard>) =>
    request<Flashcard>(`/flashcards/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteFlashcard: (id: string) =>
    request<{ success: boolean }>(`/flashcards/${id}`, { method: 'DELETE' }),
  generateFlashcards: (params: { subjectId: string; docIds?: string[]; topic?: string; count?: number }) =>
    request<Flashcard[]>('/flashcards/generate', { method: 'POST', body: JSON.stringify(params) }),

  // Questions
  getQuestions: (subjectId?: string) =>
    request<Question[]>(`/questions${subjectId ? `?subjectId=${subjectId}` : ''}`),
  createQuestion: (q: Partial<Question>) =>
    request<Question>('/questions', { method: 'POST', body: JSON.stringify(q) }),
  deleteQuestion: (id: string) =>
    request<{ success: boolean }>(`/questions/${id}`, { method: 'DELETE' }),
  generateQuestions: (params: {
    subjectId: string;
    docIds?: string[];
    topic?: string;
    count?: number;
    type?: QuestionType;
    difficulty?: DifficultyLevel;
  }) => request<Question[]>('/questions/generate', { method: 'POST', body: JSON.stringify(params) }),

  // Quizzes
  getQuizAttempts: (subjectId?: string) =>
    request<QuizAttempt[]>(`/quizzes/attempts${subjectId ? `?subjectId=${subjectId}` : ''}`),
  submitQuiz: (attempt: Partial<QuizAttempt>) =>
    request<QuizAttempt>('/quizzes/submit', { method: 'POST', body: JSON.stringify(attempt) }),

  // AI Tutor
  getTutorMessages: (subjectId: string) =>
    request<TutorMessage[]>(`/tutor/messages?subjectId=${subjectId}`),
  clearTutorMessages: (subjectId: string) =>
    request<{ success: boolean }>(`/tutor/messages?subjectId=${subjectId}`, { method: 'DELETE' }),
  sendTutorChat: (params: { subjectId: string; message: string; actionPrompt?: string }) =>
    request<TutorMessage>('/tutor/chat', { method: 'POST', body: JSON.stringify(params) }),

  // Visual Learning Studio
  getVisualItems: (subjectId?: string) =>
    request<VisualStudioItem[]>(`/visual${subjectId ? `?subjectId=${subjectId}` : ''}`),
  generateVisual: (params: { subjectId: string; topic: string; mode: VisualMode; docIds?: string[] }) =>
    request<VisualStudioItem>('/visual/generate', { method: 'POST', body: JSON.stringify(params) }),
  saveVisual: (item: Partial<VisualStudioItem>) =>
    request<VisualStudioItem>('/visual/save', { method: 'POST', body: JSON.stringify(item) }),
  deleteVisual: (id: string) =>
    request<{ success: boolean }>(`/visual/${id}`, { method: 'DELETE' }),

  // Academic Calendar
  getCalendarTasks: () => request<AcademicTask[]>('/calendar'),
  createCalendarTask: (task: Partial<AcademicTask>) =>
    request<AcademicTask>('/calendar', { method: 'POST', body: JSON.stringify(task) }),
  updateCalendarTask: (id: string, updates: Partial<AcademicTask>) =>
    request<AcademicTask>(`/calendar/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteCalendarTask: (id: string) =>
    request<{ success: boolean }>(`/calendar/${id}`, { method: 'DELETE' }),

  // Revision Centre
  getRevisionData: () =>
    request<{
      weakTopics: any[];
      dueFlashcardsCount: number;
      dueFlashcards: Flashcard[];
      recentNotes: Note[];
    }>('/revision'),
  dismissRevisionItem: (id: string) =>
    request<{ success: boolean }>(`/revision/${id}`, { method: 'DELETE' }),

  // Global Search
  search: (query: string) =>
    request<{
      subjects: Subject[];
      documents: any[];
      notes: any[];
      flashcards: any[];
      questions: any[];
      visualItems: any[];
    }>(`/search?q=${encodeURIComponent(query)}`),

  // Study Garden
  getGarden: () => request<any>('/garden'),
  waterGardenPlot: (plotId: string) =>
    request<any>('/garden/water', { method: 'POST', body: JSON.stringify({ plotId }) }),
  growGarden: (points: number, action: string) =>
    request<any>('/garden/grow', { method: 'POST', body: JSON.stringify({ points, action }) }),

  // Focus Room Sessions
  getFocusSessions: () => request<any[]>('/focus/sessions'),
  saveFocusSession: (session: { subjectId?: string | null; subjectName?: string; durationMinutes: number; goal: string; ambientSound: string }) =>
    request<any>('/focus/sessions', { method: 'POST', body: JSON.stringify(session) }),

  // Achievements
  getAchievements: () => request<any>('/achievements'),

  // Weekly Stats
  getWeeklyStats: () => request<any[]>('/stats/weekly')
};
