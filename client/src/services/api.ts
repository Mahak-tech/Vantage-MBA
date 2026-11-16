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
  VisualMode,
  AcademicTerm,
  Assignment,
  AIConversation,
  TeachingMode,
  TodayStudyPlan
} from '../types';

const API_BASE = '/api';

// Fallback seed data in case client is deployed standalone on Vercel
const DEFAULT_TERMS: AcademicTerm[] = [
  {
    id: 'term-1',
    termNumber: 1,
    name: 'Term 1',
    status: 'completed',
    credits: 18,
    gpa: '3.85',
    startDate: '2026-07-01',
    endDate: '2026-10-15',
    description: 'Foundation MBA Core: Financial Accounting, Quantitative Methods, Marketing Management & Organizational Behavior',
    isCurrent: false
  },
  {
    id: 'term-2',
    termNumber: 2,
    name: 'Term 2',
    status: 'active',
    credits: 18,
    gpa: null,
    startDate: '2026-10-20',
    endDate: '2027-01-30',
    description: 'Active Term: Microeconomics, Market Research Methods, Corporate Finance & Business Analytics',
    isCurrent: true
  },
  {
    id: 'term-3',
    termNumber: 3,
    name: 'Term 3',
    status: 'upcoming',
    credits: 18,
    gpa: null,
    startDate: '2027-02-05',
    endDate: '2027-05-15',
    description: 'Advanced Operations, Supply Chain Strategy & Managerial Macroeconomics',
    isCurrent: false
  },
  {
    id: 'term-4',
    termNumber: 4,
    name: 'Term 4',
    status: 'upcoming',
    credits: 18,
    gpa: null,
    startDate: '2027-06-01',
    endDate: '2027-09-15',
    description: 'Product Leadership, Global Competitive Strategy & Technology Commercialization',
    isCurrent: false
  },
  {
    id: 'term-5',
    termNumber: 5,
    name: 'Term 5',
    status: 'upcoming',
    credits: 18,
    gpa: null,
    startDate: '2027-10-01',
    endDate: '2028-01-15',
    description: 'Venture Capital, Tech Entrepreneurship & Specialized Electives',
    isCurrent: false
  },
  {
    id: 'term-6',
    termNumber: 6,
    name: 'Term 6',
    status: 'upcoming',
    credits: 18,
    gpa: null,
    startDate: '2028-02-01',
    endDate: '2028-05-30',
    description: 'Capstone Consulting Immersion, Strategic Mergers & Executive Leadership',
    isCurrent: false
  }
];

const DEFAULT_USER: UserProfile = {
  id: 'user_default',
  name: 'Mahak',
  email: 'mahak@mba.edu',
  university: 'Hari Shankar Singhania School of Business',
  specialization: 'MBA Product Management',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  studyStreak: 1,
  todayStudyMinutes: 20,
  dailyGoalMinutes: 45,
  joinedDate: '2026-11-16T10:10:10.357Z'
};

const DEFAULT_SUBJECTS: Subject[] = [
  {
    id: 'subj_1794730047420_gvfs0q',
    name: 'MicroEconomics',
    code: 'Micro-201',
    description: 'Microeconomics for Product Managers: Demand, Supply, Pricing & Market Structure',
    icon: 'BookOpen',
    color: 'from-indigo-500 to-purple-600',
    semester: 'Semester 2',
    termId: 'term-2',
    termNumber: 2,
    creditHours: 3,
    assignmentCount: 1,
    createdAt: '2026-11-15T08:07:27.420Z',
    updatedAt: '2026-11-15T08:14:40.722Z'
  },
  {
    id: 'subj_1794730542677_g79h6r',
    name: 'Market Research Method',
    code: 'MRM-202',
    description: 'Quantitative & Qualitative Research Design, Consumer Insights & Survey Sampling',
    icon: 'BookOpen',
    color: 'from-purple-600 to-indigo-600',
    semester: 'Semester 2',
    termId: 'term-2',
    termNumber: 2,
    creditHours: 3,
    assignmentCount: 1,
    createdAt: '2026-11-15T08:15:42.677Z',
    updatedAt: '2026-11-15T08:15:42.677Z'
  }
];

const DEFAULT_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg_1',
    termId: 'term-2',
    subjectId: 'subj_1794730047420_gvfs0q',
    title: 'Price Elasticity & Revenue Optimization Case Analysis',
    description: 'Analyze real customer price sensitivity data from Sessions 3-5 and propose optimal pricing tier for subscription SaaS.',
    dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
    priority: 'high',
    status: 'in_progress',
    estimatedHours: 6,
    progress: 45,
    notes: 'Include cross-price elasticity and arc elasticity formulas. Cite Session 3 slides.',
    attachments: [],
    submittedFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: 'asg_2',
    termId: 'term-2',
    subjectId: 'subj_1794730542677_g79h6r',
    title: 'Instagram Skincare Influencer Survey Design & Sampling',
    description: 'Construct a 15-question structured Likert scale survey evaluating influencer authenticity and purchase intention.',
    dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
    priority: 'medium',
    status: 'not_started',
    estimatedHours: 8,
    progress: 0,
    notes: 'Reference the uploaded assignment doc in MRM workspace.',
    attachments: [],
    submittedFiles: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

function getLocalStore<T>(key: string, defaultValue: T): T {
  try {
    const raw = localStorage.getItem(`vmba_${key}`);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setLocalStore<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`vmba_${key}`, JSON.stringify(value));
  } catch {}
}

function handleOfflineFallback<T>(endpoint: string, options: RequestInit = {}): T {
  const method = (options.method || 'GET').toUpperCase();
  const cleanEndpoint = endpoint.split('?')[0];

  if (cleanEndpoint === '/terms') {
    const terms = getLocalStore<AcademicTerm[]>('terms', DEFAULT_TERMS);
    return terms as unknown as T;
  }
  if (cleanEndpoint === '/terms/active') {
    const terms = getLocalStore<AcademicTerm[]>('terms', DEFAULT_TERMS);
    return (terms.find(t => t.status === 'active') || terms[1] || terms[0]) as unknown as T;
  }
  if (cleanEndpoint === '/user') {
    const user = getLocalStore<UserProfile>('user', DEFAULT_USER);
    return user as unknown as T;
  }
  if (cleanEndpoint === '/subjects') {
    const subs = getLocalStore<Subject[]>('subjects', DEFAULT_SUBJECTS);
    return subs as unknown as T;
  }
  if (cleanEndpoint === '/assignments') {
    const asgs = getLocalStore<Assignment[]>('assignments', DEFAULT_ASSIGNMENTS);
    return asgs as unknown as T;
  }
  if (cleanEndpoint === '/planner/today') {
    const asgs = getLocalStore<Assignment[]>('assignments', DEFAULT_ASSIGNMENTS);
    return {
      date: new Date().toISOString(),
      termId: 'term-2',
      summary: 'Focus on Price Elasticity Case & Spaced Recall',
      recommendations: [
        {
          id: 'rec_1',
          type: 'assignment',
          title: asgs[0]?.title || 'Price Elasticity Case',
          subjectName: 'MicroEconomics',
          description: 'High-priority assignment due in 3 days. Complete elasticity calculations.',
          priority: 'high',
          actionLabel: 'Continue Working',
          actionTab: 'assignments'
        },
        {
          id: 'rec_2',
          type: 'flashcard_review',
          title: 'Daily Spaced Repetition',
          subjectName: 'MicroEconomics',
          description: 'Review 5 flashcards due for optimal long-term memory retention.',
          priority: 'medium',
          actionLabel: 'Review Flashcards',
          actionTab: 'flashcards'
        }
      ]
    } as unknown as T;
  }
  if (cleanEndpoint === '/conversations') {
    const convs = getLocalStore<AIConversation[]>('conversations', []);
    return convs as unknown as T;
  }
  if (cleanEndpoint.startsWith('/conversations/') && cleanEndpoint.endsWith('/messages') && method === 'POST') {
    const body = options.body ? JSON.parse(options.body as string) : {};
    return {
      id: `msg_${Date.now()}`,
      role: 'assistant',
      content: `Hello! As your MBA Academic Mentor, here is an executive breakdown:\n\n### 💡 Key Concept\n${body.content || 'Your query'}\n\n### 📈 Strategic Application\nIn business management, this framework directly informs pricing strategy, customer lifetime value, and competitive positioning.\n\n### 🎓 Suggested Next Step\nWould you like me to convert this into a revision note, generate 3 practice MCQs, or explore a case scenario?`,
      citations: [
        {
          docId: 'doc_local',
          docTitle: 'Microeconomics_Sessions_1_to_10_Study_Notes',
          pageIndex: 3,
          pageTitle: 'Session 3: Elasticity of Demand',
          snippet: 'Price elasticity measures the responsiveness of quantity demanded to a change in price.'
        }
      ],
      timestamp: new Date().toISOString()
    } as unknown as T;
  }
  if (cleanEndpoint === '/notes') {
    return getLocalStore<Note[]>('notes', []) as unknown as T;
  }
  if (cleanEndpoint === '/flashcards') {
    return getLocalStore<Flashcard[]>('flashcards', []) as unknown as T;
  }
  if (cleanEndpoint === '/quizzes/attempts') {
    return getLocalStore<QuizAttempt[]>('quizzes', []) as unknown as T;
  }
  if (cleanEndpoint === '/calendar') {
    return getLocalStore<AcademicTask[]>('calendar', []) as unknown as T;
  }
  if (cleanEndpoint === '/documents') {
    return getLocalStore<StudyDocument[]>('documents', []) as unknown as T;
  }

  return [] as unknown as T;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const customKey = localStorage.getItem('gemini_api_key');
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {})
  };

  if (customKey) {
    headers['x-gemini-key'] = customKey;
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      // If server returns 404/500 (e.g. standalone client deployment on Vercel), fall back smoothly
      if (response.status === 404 || response.status === 502 || response.status === 503) {
        return handleOfflineFallback<T>(endpoint, options);
      }
      let errorMsg = `HTTP Error ${response.status}`;
      try {
        const errorJson = await response.json();
        if (errorJson.error) errorMsg = errorJson.error;
      } catch (e) {}
      throw new Error(errorMsg);
    }

    return await response.json();
  } catch (err: any) {
    // In case fetch failed due to offline or missing backend
    if (!navigator.onLine || err.message?.includes('Failed to fetch') || err.message?.includes('NetworkError')) {
      return handleOfflineFallback<T>(endpoint, options);
    }
    throw err;
  }
}

export const api = {
  // Academic Terms (Six Terms)
  getAcademicTerms: () => request<AcademicTerm[]>('/terms'),
  getActiveTerm: () => request<AcademicTerm>('/terms/active'),
  updateAcademicTerm: (id: string, updates: Partial<AcademicTerm>) =>
    request<AcademicTerm>(`/terms/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),

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

  // Subjects (Term-Aware)
  getSubjects: (termId?: string) =>
    request<Subject[]>(`/subjects${termId ? `?termId=${termId}` : ''}`),
  getSubject: (id: string) => request<Subject>(`/subjects/${id}`),
  createSubject: (subject: Partial<Subject>) =>
    request<Subject>('/subjects', { method: 'POST', body: JSON.stringify(subject) }),
  updateSubject: (id: string, updates: Partial<Subject>) =>
    request<Subject>(`/subjects/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteSubject: (id: string) =>
    request<{ success: boolean }>(`/subjects/${id}`, { method: 'DELETE' }),

  // Documents
  getDocuments: (subjectId?: string, termId?: string, category?: string) => {
    const params = new URLSearchParams();
    if (subjectId) params.append('subjectId', subjectId);
    if (termId) params.append('termId', termId);
    if (category) params.append('category', category);
    const qs = params.toString();
    return request<StudyDocument[]>(`/documents${qs ? `?${qs}` : ''}`);
  },
  uploadDocuments: async (subjectId: string, files: File[], moduleName?: string, category?: string, termId?: string) => {
    const formData = new FormData();
    formData.append('subjectId', subjectId);
    if (moduleName) formData.append('moduleName', moduleName);
    if (category) formData.append('category', category);
    if (termId) formData.append('termId', termId);
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

  // Assignments & Deadlines
  getAssignments: (params?: { termId?: string; subjectId?: string; status?: string; priority?: string }) => {
    const query = new URLSearchParams();
    if (params?.termId) query.append('termId', params.termId);
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    if (params?.status) query.append('status', params.status);
    if (params?.priority) query.append('priority', params.priority);
    const qs = query.toString();
    return request<Assignment[]>(`/assignments${qs ? `?${qs}` : ''}`);
  },
  getAssignment: (id: string) => request<Assignment>(`/assignments/${id}`),
  createAssignment: (asg: Partial<Assignment>) =>
    request<Assignment>('/assignments', { method: 'POST', body: JSON.stringify(asg) }),
  updateAssignment: (id: string, updates: Partial<Assignment>) =>
    request<Assignment>(`/assignments/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteAssignment: (id: string) =>
    request<{ success: boolean }>(`/assignments/${id}`, { method: 'DELETE' }),

  // Multi-Conversation AI Tutor Workspace
  getConversations: (params?: { subjectId?: string; termId?: string; mode?: string }) => {
    const query = new URLSearchParams();
    if (params?.subjectId) query.append('subjectId', params.subjectId);
    if (params?.termId) query.append('termId', params.termId);
    if (params?.mode) query.append('mode', params.mode);
    const qs = query.toString();
    return request<AIConversation[]>(`/conversations${qs ? `?${qs}` : ''}`);
  },
  getConversation: (id: string) => request<AIConversation>(`/conversations/${id}`),
  createConversation: (data: { subjectId: string; termId?: string; title?: string; mode?: TeachingMode }) =>
    request<AIConversation>('/conversations', { method: 'POST', body: JSON.stringify(data) }),
  updateConversation: (id: string, updates: Partial<AIConversation>) =>
    request<AIConversation>(`/conversations/${id}`, { method: 'PUT', body: JSON.stringify(updates) }),
  deleteConversation: (id: string) =>
    request<{ success: boolean }>(`/conversations/${id}`, { method: 'DELETE' }),
  sendConversationMessage: (id: string, data: { content: string; mode?: TeachingMode; actionPrompt?: string }) =>
    request<any>(`/conversations/${id}/messages`, { method: 'POST', body: JSON.stringify(data) }),

  convertChatToNote: (data: { subjectId: string; title: string; content: string; type?: string; topic?: string }) =>
    request<Note>('/conversations/convert/note', { method: 'POST', body: JSON.stringify(data) }),
  convertChatToFlashcards: (data: { subjectId: string; cards: Array<{ front: string; back: string }>; topic?: string }) =>
    request<Flashcard[]>('/conversations/convert/flashcards', { method: 'POST', body: JSON.stringify(data) }),
  convertChatToMcqs: (data: { subjectId: string; questions: any[]; topic?: string }) =>
    request<Question[]>('/conversations/convert/mcqs', { method: 'POST', body: JSON.stringify(data) }),

  // Personalized Study Planner ("What Should I Study Today?")
  getTodayStudyPlan: (termId?: string) =>
    request<TodayStudyPlan>(`/planner/today${termId ? `?termId=${termId}` : ''}`),

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
