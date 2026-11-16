const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const isVercel = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const DATA_DIR = isVercel ? '/tmp/data' : path.join(__dirname, 'data');
const DB_FILE = isVercel ? path.join(DATA_DIR, 'db.json') : path.join(__dirname, 'data', 'db.json');

// Ensure data directory exists if possible
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {
  // Ignored in read-only environments
}

// Default Six MBA Terms
const defaultAcademicTerms = [
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

// Initial Database Structure
const initialData = {
  settings: {
    geminiApiKey: process.env.GEMINI_API_KEY || '',
    supabaseUrl: process.env.SUPABASE_URL || '',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
    preferredModel: 'gemini-1.5-flash',
    dailyGoalMinutes: 45
  },
  user: {
    id: 'user_default',
    name: 'Mahak',
    email: 'mahak@mba.edu',
    university: 'Stanford Graduate School of Business',
    specialization: 'MBA - Tech Product & Strategic Management',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    studyStreak: 1,
    todayStudyMinutes: 20,
    dailyGoalMinutes: 45,
    joinedDate: new Date().toISOString()
  },
  academicTerms: defaultAcademicTerms,
  subjects: [],
  documents: [],
  notes: [],
  assignments: [],
  conversations: [],
  flashcardDecks: [],
  flashcards: [],
  questions: [],
  quizzes: [],
  quizAttempts: [],
  tutorMessages: [],
  visualStudioItems: [],
  calendarTasks: [],
  revisionItems: []
};

// In-memory cache
let dbCache = null;

function loadDb() {
  if (dbCache) return dbCache;
  if (isVercel && !fs.existsSync(DB_FILE)) {
    try {
      if (!fs.existsSync(DATA_DIR)) {
        fs.mkdirSync(DATA_DIR, { recursive: true });
      }
      const initialSeedFile = path.join(__dirname, 'data', 'db.json');
      if (fs.existsSync(initialSeedFile)) {
        fs.copyFileSync(initialSeedFile, DB_FILE);
      } else {
        saveDb(initialData);
      }
    } catch (e) {
      console.warn('Could not seed /tmp/data/db.json on Vercel:', e.message);
    }
  }
  if (!fs.existsSync(DB_FILE)) {
    saveDb(initialData);
    dbCache = JSON.parse(JSON.stringify(initialData));
    return dbCache;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    dbCache = JSON.parse(raw);
    // Ensure all top-level keys exist
    for (const key of Object.keys(initialData)) {
      if (dbCache[key] === undefined) {
        dbCache[key] = initialData[key];
      }
    }

    let dirty = false;

    // Auto-migrate Academic Terms (Six Terms)
    if (!Array.isArray(dbCache.academicTerms) || dbCache.academicTerms.length < 6) {
      dbCache.academicTerms = JSON.parse(JSON.stringify(defaultAcademicTerms));
      dirty = true;
    }

    // Ensure assignments list exists and has initial Term 2 assignments if empty
    if (!Array.isArray(dbCache.assignments) || dbCache.assignments.length === 0) {
      dbCache.assignments = [
        {
          id: 'asg_1',
          termId: 'term-2',
          subjectId: dbCache.subjects[0]?.id || 'subj_1794730047420_gvfs0q',
          title: 'Price Elasticity & Revenue Optimization Case Analysis',
          description: 'Analyze real customer price sensitivity data from Sessions 3-5 and propose optimal pricing tier for subscription SaaS.',
          dueDate: new Date(Date.now() + 3 * 86400000).toISOString(),
          priority: 'high',
          status: 'in_progress',
          estimatedHours: 6,
          progress: 45,
          notes: 'Include cross-price elasticity and arc elasticity formulas. Cite Session 3 slides.',
          attachments: [],
          submittedFiles: []
        },
        {
          id: 'asg_2',
          termId: 'term-2',
          subjectId: dbCache.subjects[1]?.id || 'subj_1794730542677_g79h6r',
          title: 'Instagram Skincare Influencer Survey Design & Sampling',
          description: 'Construct a 15-question structured Likert scale survey evaluating influencer authenticity and purchase intention.',
          dueDate: new Date(Date.now() + 6 * 86400000).toISOString(),
          priority: 'medium',
          status: 'not_started',
          estimatedHours: 8,
          progress: 0,
          notes: 'Reference the uploaded assignment doc in MRM workspace.',
          attachments: [],
          submittedFiles: []
        }
      ];
      dirty = true;
    }

    // Ensure conversations list exists
    if (!Array.isArray(dbCache.conversations)) {
      dbCache.conversations = [];
    }

    // Ensure subjects have termId set to 'term-2' by default (Term 2 Active)
    if (Array.isArray(dbCache.subjects)) {
      dbCache.subjects.forEach(s => {
        if (!s.termId) {
          s.termId = 'term-2';
          s.termNumber = 2;
          dirty = true;
        }
      });
    }

    // Ensure documents have termId and category
    if (Array.isArray(dbCache.documents)) {
      dbCache.documents.forEach(d => {
        if (!d.termId) {
          d.termId = 'term-2';
          dirty = true;
        }
        if (!d.category) {
          d.category = 'lecture_slides';
          dirty = true;
        }
      });
    }

    // Ensure notes have termId
    if (Array.isArray(dbCache.notes)) {
      dbCache.notes.forEach(n => {
        if (!n.termId) {
          n.termId = 'term-2';
          dirty = true;
        }
      });
    }

    if (dirty) {
      saveDb(dbCache);
    }

    return dbCache;
  } catch (err) {
    console.error('Error reading db.json, creating new one:', err);
    saveDb(initialData);
    dbCache = JSON.parse(JSON.stringify(initialData));
    return dbCache;
  }
}

function saveDb(data) {
  dbCache = data;
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    const tempFile = `${DB_FILE}.tmp`;
    fs.writeFileSync(tempFile, JSON.stringify(data, null, 2), 'utf8');
    fs.renameSync(tempFile, DB_FILE);
  } catch (err) {
    console.warn('File write notice (using in-memory cache):', err.message);
  }
}

// Supabase client instance (if configured)
function getSupabaseClient() {
  const db = loadDb();
  const url = db.settings.supabaseUrl || process.env.SUPABASE_URL;
  const key = db.settings.supabaseAnonKey || process.env.SUPABASE_ANON_KEY;
  if (url && key) {
    try {
      return createClient(url, key);
    } catch (err) {
      console.error('Supabase init failed:', err);
    }
  }
  return null;
}

// Repository Methods
const db = {
  // Database Operations
  getDb: () => loadDb(),
  save: (data) => saveDb(data),

  // Settings
  getSettings: () => loadDb().settings,
  updateSettings: (newSettings) => {
    const data = loadDb();
    data.settings = { ...data.settings, ...newSettings };
    saveDb(data);
    return data.settings;
  },

  // User Profile
  getUser: () => loadDb().user,
  updateUser: (updates) => {
    const data = loadDb();
    data.user = { ...data.user, ...updates };
    saveDb(data);
    return data.user;
  },

  // ==========================================
  // ACADEMIC TERMS (SIX-TERM JOURNEY)
  // ==========================================
  getAcademicTerms: () => {
    const data = loadDb();
    const terms = data.academicTerms || defaultAcademicTerms;
    const subjects = data.subjects || [];
    const documents = data.documents || [];
    const assignments = data.assignments || [];

    return terms.map(term => {
      const termSubjects = subjects.filter(s => (s.termId === term.id || s.termNumber === term.termNumber));
      const termSubjectIds = new Set(termSubjects.map(s => s.id));
      const termDocs = documents.filter(d => (d.termId === term.id || termSubjectIds.has(d.subjectId)));
      const termAssignments = assignments.filter(a => (a.termId === term.id || termSubjectIds.has(a.subjectId)));
      const pendingAsg = termAssignments.filter(a => a.status !== 'completed' && a.status !== 'submitted');

      return {
        ...term,
        subjectCount: termSubjects.length,
        docCount: termDocs.length,
        assignmentCount: termAssignments.length,
        pendingAssignments: pendingAsg.length,
        subjects: termSubjects.map(s => ({ id: s.id, name: s.name, code: s.code, color: s.color, icon: s.icon }))
      };
    });
  },

  getAcademicTermById: (id) => {
    const data = loadDb();
    const terms = data.academicTerms || defaultAcademicTerms;
    return terms.find(t => t.id === id || String(t.termNumber) === String(id));
  },

  updateAcademicTerm: (id, updates) => {
    const data = loadDb();
    if (!data.academicTerms) data.academicTerms = JSON.parse(JSON.stringify(defaultAcademicTerms));
    const idx = data.academicTerms.findIndex(t => t.id === id || String(t.termNumber) === String(id));
    if (idx === -1) return null;

    // If making this term active, we can mark it as active
    if (updates.status === 'active') {
      data.academicTerms.forEach(t => {
        if (t.id !== id && t.status === 'active') {
          // keep previous status or allow single active term
        }
      });
    }

    data.academicTerms[idx] = {
      ...data.academicTerms[idx],
      ...updates
    };
    saveDb(data);
    return data.academicTerms[idx];
  },

  getActiveTerm: () => {
    const data = loadDb();
    const terms = data.academicTerms || defaultAcademicTerms;
    const active = terms.find(t => t.status === 'active');
    return active || terms[1] || terms[0]; // Default to Term 2 (index 1)
  },

  // ==========================================
  // SUBJECTS (TERM-AWARE)
  // ==========================================
  getSubjects: (termId) => {
    const data = loadDb();
    let subjects = data.subjects || [];
    if (termId && termId !== 'all') {
      subjects = subjects.filter(s => s.termId === termId || String(s.termNumber) === String(termId.replace('term-', '')));
    }
    return subjects;
  },

  getSubjectById: (id) => loadDb().subjects.find(s => s.id === id),

  createSubject: (subject) => {
    const data = loadDb();
    const targetTermId = subject.termId || 'term-2';
    const termNum = subject.termNumber || (targetTermId.startsWith('term-') ? parseInt(targetTermId.replace('term-', ''), 10) : 2);

    const newSubject = {
      id: subject.id || `subj_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      termId: targetTermId,
      termNumber: termNum,
      name: subject.name,
      code: subject.code || '',
      description: subject.description || '',
      icon: subject.icon || 'BookOpen',
      color: subject.color || 'from-indigo-500 to-purple-600',
      semester: subject.semester || `Term ${termNum}`,
      creditHours: subject.creditHours || 3,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.subjects.push(newSubject);
    saveDb(data);
    return newSubject;
  },

  updateSubject: (id, updates) => {
    const data = loadDb();
    const index = data.subjects.findIndex(s => s.id === id);
    if (index === -1) return null;
    data.subjects[index] = {
      ...data.subjects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(data);
    return data.subjects[index];
  },

  deleteSubject: (id) => {
    const data = loadDb();
    data.subjects = data.subjects.filter(s => s.id !== id);
    // Cascade delete related items
    data.documents = data.documents.filter(d => d.subjectId !== id);
    data.notes = data.notes.filter(n => n.subjectId !== id);
    data.flashcards = data.flashcards.filter(f => f.subjectId !== id);
    data.flashcardDecks = data.flashcardDecks.filter(d => d.subjectId !== id);
    data.questions = data.questions.filter(q => q.subjectId !== id);
    data.quizzes = data.quizzes.filter(q => q.subjectId !== id);
    data.tutorMessages = data.tutorMessages.filter(m => m.subjectId !== id);
    if (data.conversations) {
      data.conversations = data.conversations.filter(c => c.subjectId !== id);
    }
    if (data.assignments) {
      data.assignments = data.assignments.filter(a => a.subjectId !== id);
    }
    data.visualStudioItems = data.visualStudioItems.filter(v => v.subjectId !== id);
    data.calendarTasks = data.calendarTasks.filter(t => t.subjectId !== id);
    saveDb(data);
    return true;
  },

  // ==========================================
  // STUDY MATERIALS & DOCUMENTS (WITH CATEGORIES)
  // ==========================================
  getDocuments: (subjectId, termId, category) => {
    let docs = loadDb().documents || [];
    if (subjectId) {
      docs = docs.filter(d => d.subjectId === subjectId);
    }
    if (termId && termId !== 'all') {
      docs = docs.filter(d => d.termId === termId);
    }
    if (category && category !== 'all') {
      docs = docs.filter(d => d.category === category);
    }
    return docs;
  },

  getDocumentById: (id) => loadDb().documents.find(d => d.id === id),

  createDocument: (doc) => {
    const data = loadDb();
    // Inherit termId from subject if available
    let termId = doc.termId;
    if (!termId && doc.subjectId) {
      const parentSubj = data.subjects.find(s => s.id === doc.subjectId);
      if (parentSubj) termId = parentSubj.termId;
    }

    const newDoc = {
      id: doc.id || `doc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: doc.subjectId,
      termId: termId || 'term-2',
      title: doc.title,
      fileName: doc.fileName,
      originalName: doc.originalName,
      fileType: doc.fileType,
      fileSize: doc.fileSize,
      category: doc.category || 'lecture_slides', // lecture_slides, case_study, assignment, project, reference
      uploadDate: new Date().toISOString(),
      status: doc.status || 'completed',
      error: doc.error || null,
      extractedText: doc.extractedText || '',
      pageCount: doc.pageCount || 1,
      pages: doc.pages || [],
      summary: doc.summary || '',
      module: doc.module || 'General'
    };
    data.documents.push(newDoc);
    saveDb(data);
    return newDoc;
  },
  updateDocument: (id, updates) => {
    const data = loadDb();
    const idx = data.documents.findIndex(d => d.id === id);
    if (idx === -1) return null;
    data.documents[idx] = { ...data.documents[idx], ...updates };
    saveDb(data);
    return data.documents[idx];
  },
  deleteDocument: (id) => {
    const data = loadDb();
    data.documents = data.documents.filter(d => d.id !== id);
    saveDb(data);
    return true;
  },

  // Notes
  getNotes: (subjectId) => {
    const notes = loadDb().notes;
    return subjectId ? notes.filter(n => n.subjectId === subjectId) : notes;
  },
  getNoteById: (id) => loadDb().notes.find(n => n.id === id),
  createNote: (note) => {
    const data = loadDb();
    const newNote = {
      id: note.id || `note_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: note.subjectId,
      sourceDocIds: note.sourceDocIds || [],
      title: note.title,
      type: note.type || 'complete', // complete, short, revision, exam_oriented
      topic: note.topic || 'General Topic',
      content: note.content,
      tags: note.tags || [],
      isFavorite: Boolean(note.isFavorite),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.notes.push(newNote);
    saveDb(data);
    return newNote;
  },
  updateNote: (id, updates) => {
    const data = loadDb();
    const idx = data.notes.findIndex(n => n.id === id);
    if (idx === -1) return null;
    data.notes[idx] = {
      ...data.notes[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(data);
    return data.notes[idx];
  },
  deleteNote: (id) => {
    const data = loadDb();
    data.notes = data.notes.filter(n => n.id !== id);
    saveDb(data);
    return true;
  },

  // Flashcards & Decks
  getFlashcards: (subjectId) => {
    const cards = loadDb().flashcards;
    return subjectId ? cards.filter(c => c.subjectId === subjectId) : cards;
  },
  createFlashcard: (card) => {
    const data = loadDb();
    const newCard = {
      id: card.id || `fc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: card.subjectId,
      topic: card.topic || 'General',
      deckTitle: card.deckTitle || 'Default Deck',
      front: card.front,
      back: card.back,
      sourceDocId: card.sourceDocId || null,
      status: card.status || 'learning', // learning, mastered, unlearned
      interval: card.interval || 1, // days
      repetitions: card.repetitions || 0,
      easeFactor: card.easeFactor || 2.5,
      nextReviewDate: card.nextReviewDate || new Date().toISOString(),
      lastReviewedAt: null,
      createdAt: new Date().toISOString()
    };
    data.flashcards.push(newCard);
    saveDb(data);
    return newCard;
  },
  createFlashcardsBatch: (cardsArray) => {
    const data = loadDb();
    const newCards = cardsArray.map(card => ({
      id: card.id || `fc_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: card.subjectId,
      topic: card.topic || 'General',
      deckTitle: card.deckTitle || 'Default Deck',
      front: card.front,
      back: card.back,
      sourceDocId: card.sourceDocId || null,
      status: 'learning',
      interval: 1,
      repetitions: 0,
      easeFactor: 2.5,
      nextReviewDate: new Date().toISOString(),
      lastReviewedAt: null,
      createdAt: new Date().toISOString()
    }));
    data.flashcards.push(...newCards);
    saveDb(data);
    return newCards;
  },
  updateFlashcard: (id, updates) => {
    const data = loadDb();
    const idx = data.flashcards.findIndex(c => c.id === id);
    if (idx === -1) return null;
    data.flashcards[idx] = { ...data.flashcards[idx], ...updates };
    saveDb(data);
    return data.flashcards[idx];
  },
  deleteFlashcard: (id) => {
    const data = loadDb();
    data.flashcards = data.flashcards.filter(c => c.id !== id);
    saveDb(data);
    return true;
  },

  // Practice Questions / MCQ Bank
  getQuestions: (subjectId) => {
    const qList = loadDb().questions;
    return subjectId ? qList.filter(q => q.subjectId === subjectId) : qList;
  },
  createQuestion: (q) => {
    const data = loadDb();
    const newQ = {
      id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: q.subjectId,
      topic: q.topic || 'General Topic',
      type: q.type || 'mcq', // mcq, true_false, fill_in_the_blank, short_answer, case_based, application_based, numerical
      difficulty: q.difficulty || 'intermediate', // beginner, intermediate, advanced
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      wrongOptionsExplanation: q.wrongOptionsExplanation || {},
      sourceRef: q.sourceRef || '',
      saved: q.saved !== undefined ? q.saved : true,
      createdAt: new Date().toISOString()
    };
    data.questions.push(newQ);
    saveDb(data);
    return newQ;
  },
  createQuestionsBatch: (questionsArray) => {
    const data = loadDb();
    const newItems = questionsArray.map(q => ({
      id: q.id || `q_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: q.subjectId,
      topic: q.topic || 'General Topic',
      type: q.type || 'mcq',
      difficulty: q.difficulty || 'intermediate',
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      wrongOptionsExplanation: q.wrongOptionsExplanation || {},
      sourceRef: q.sourceRef || '',
      saved: true,
      createdAt: new Date().toISOString()
    }));
    data.questions.push(...newItems);
    saveDb(data);
    return newItems;
  },
  deleteQuestion: (id) => {
    const data = loadDb();
    data.questions = data.questions.filter(q => q.id !== id);
    saveDb(data);
    return true;
  },

  // Quizzes & Results
  getQuizAttempts: (subjectId) => {
    const attempts = loadDb().quizAttempts;
    return subjectId ? attempts.filter(a => a.subjectId === subjectId) : attempts;
  },
  saveQuizAttempt: (attempt) => {
    const data = loadDb();
    const newAttempt = {
      id: attempt.id || `qa_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: attempt.subjectId,
      title: attempt.title,
      totalQuestions: attempt.totalQuestions,
      correctCount: attempt.correctCount,
      incorrectCount: attempt.incorrectCount,
      unattemptedCount: attempt.unattemptedCount,
      score: attempt.score,
      percentage: attempt.percentage,
      timeTakenSeconds: attempt.timeTakenSeconds,
      difficulty: attempt.difficulty,
      topicBreakdown: attempt.topicBreakdown || [],
      recommendations: attempt.recommendations || [],
      questions: attempt.questions || [],
      userAnswers: attempt.userAnswers || {},
      completedAt: new Date().toISOString()
    };
    data.quizAttempts.push(newAttempt);
    
    // Also track weak topics into revision centre
    if (attempt.topicBreakdown) {
      attempt.topicBreakdown.forEach(topic => {
        if (topic.percentage < 70) {
          const revExists = data.revisionItems.find(r => r.topic === topic.topic && r.subjectId === attempt.subjectId);
          if (revExists) {
            revExists.missCount = (revExists.missCount || 1) + 1;
            revExists.lastMissedAt = new Date().toISOString();
          } else {
            data.revisionItems.push({
              id: `rev_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
              subjectId: attempt.subjectId,
              topic: topic.topic,
              reason: `Scored ${topic.percentage}% on recent quiz`,
              difficulty: 'high',
              missCount: 1,
              scheduledDate: new Date(Date.now() + 86400000).toISOString(),
              lastMissedAt: new Date().toISOString()
            });
          }
        }
      });
    }

    saveDb(data);
    return newAttempt;
  },

  // AI Tutor Messages
  getTutorMessages: (subjectId) => {
    const msgs = loadDb().tutorMessages;
    return subjectId ? msgs.filter(m => m.subjectId === subjectId) : msgs;
  },
  saveTutorMessage: (msg) => {
    const data = loadDb();
    const newMsg = {
      id: msg.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: msg.subjectId,
      role: msg.role, // 'user' | 'assistant'
      content: msg.content,
      citations: msg.citations || [],
      timestamp: new Date().toISOString()
    };
    data.tutorMessages.push(newMsg);
    saveDb(data);
    return newMsg;
  },
  clearTutorMessages: (subjectId) => {
    const data = loadDb();
    data.tutorMessages = data.tutorMessages.filter(m => m.subjectId !== subjectId);
    saveDb(data);
    return true;
  },

  // ==========================================
  // MULTI-CONVERSATION AI TUTOR WORKSPACE
  // ==========================================
  getConversations: (filter = {}) => {
    const data = loadDb();
    let convs = data.conversations || [];
    if (filter.subjectId) {
      convs = convs.filter(c => c.subjectId === filter.subjectId);
    }
    if (filter.termId && filter.termId !== 'all') {
      convs = convs.filter(c => !c.termId || c.termId === filter.termId);
    }
    if (filter.mode) {
      convs = convs.filter(c => c.mode === filter.mode);
    }
    return convs.sort((a, b) => new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime());
  },

  getConversationById: (id) => {
    const data = loadDb();
    const convs = data.conversations || [];
    return convs.find(c => c.id === id);
  },

  createConversation: (conv) => {
    const data = loadDb();
    if (!data.conversations) data.conversations = [];
    const newConv = {
      id: conv.id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: conv.subjectId,
      termId: conv.termId || 'term-2',
      title: conv.title || 'New Tutoring Session',
      mode: conv.mode || 'teach_me', // teach_me, notes_maker, practice_me, exam_prep, case_study, assignment_assistant, doubt_solver, visual_teacher
      messages: conv.messages || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    data.conversations.unshift(newConv);
    saveDb(data);
    return newConv;
  },

  updateConversation: (id, updates) => {
    const data = loadDb();
    if (!data.conversations) data.conversations = [];
    const idx = data.conversations.findIndex(c => c.id === id);
    if (idx === -1) return null;
    data.conversations[idx] = {
      ...data.conversations[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    saveDb(data);
    return data.conversations[idx];
  },

  deleteConversation: (id) => {
    const data = loadDb();
    if (!data.conversations) data.conversations = [];
    data.conversations = data.conversations.filter(c => c.id !== id);
    saveDb(data);
    return true;
  },

  addMessageToConversation: (id, message) => {
    const data = loadDb();
    if (!data.conversations) data.conversations = [];
    const idx = data.conversations.findIndex(c => c.id === id);
    if (idx === -1) return null;

    const newMsg = {
      id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      role: message.role, // 'user' | 'assistant'
      content: message.content,
      citations: message.citations || [],
      timestamp: new Date().toISOString()
    };

    if (!Array.isArray(data.conversations[idx].messages)) {
      data.conversations[idx].messages = [];
    }
    data.conversations[idx].messages.push(newMsg);
    data.conversations[idx].updatedAt = new Date().toISOString();

    // Auto-update conversation title from first user message if default
    if (message.role === 'user' && data.conversations[idx].messages.length <= 2 && data.conversations[idx].title.startsWith('New Tutoring')) {
      data.conversations[idx].title = message.content.substring(0, 45) + (message.content.length > 45 ? '...' : '');
    }

    saveDb(data);
    return newMsg;
  },

  // ==========================================
  // ASSIGNMENTS & DEADLINE MANAGER
  // ==========================================
  getAssignments: (filters = {}) => {
    const data = loadDb();
    let asgs = data.assignments || [];
    if (filters.subjectId) {
      asgs = asgs.filter(a => a.subjectId === filters.subjectId);
    }
    if (filters.termId && filters.termId !== 'all') {
      asgs = asgs.filter(a => !a.termId || a.termId === filters.termId);
    }
    if (filters.status) {
      asgs = asgs.filter(a => a.status === filters.status);
    }
    if (filters.priority) {
      asgs = asgs.filter(a => a.priority === filters.priority);
    }

    // Auto-check overdue status
    const now = new Date();
    asgs.forEach(a => {
      if (a.status !== 'completed' && a.status !== 'submitted' && a.dueDate) {
        if (new Date(a.dueDate) < now) {
          a.isOverdue = true;
        }
      }
    });

    return asgs.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  },

  getAssignmentById: (id) => {
    const data = loadDb();
    const asgs = data.assignments || [];
    return asgs.find(a => a.id === id);
  },

  createAssignment: (asg) => {
    const data = loadDb();
    if (!data.assignments) data.assignments = [];

    // Derive termId from subject if not provided
    let termId = asg.termId;
    if (!termId && asg.subjectId) {
      const parentSubj = data.subjects.find(s => s.id === asg.subjectId);
      if (parentSubj) termId = parentSubj.termId;
    }

    const newAsg = {
      id: asg.id || `asg_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: asg.subjectId,
      termId: termId || 'term-2',
      title: asg.title,
      description: asg.description || '',
      dueDate: asg.dueDate || new Date(Date.now() + 7 * 86400000).toISOString(),
      priority: asg.priority || 'medium', // low, medium, high
      status: asg.status || 'not_started', // not_started, in_progress, completed, submitted, overdue
      estimatedHours: asg.estimatedHours || 4,
      progress: asg.progress || 0, // 0 - 100
      notes: asg.notes || '',
      attachments: asg.attachments || [],
      submittedFiles: asg.submittedFiles || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.assignments.push(newAsg);
    saveDb(data);
    return newAsg;
  },

  updateAssignment: (id, updates) => {
    const data = loadDb();
    if (!data.assignments) data.assignments = [];
    const idx = data.assignments.findIndex(a => a.id === id);
    if (idx === -1) return null;

    data.assignments[idx] = {
      ...data.assignments[idx],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    // If marked completed or submitted, set progress to 100
    if (updates.status === 'completed' || updates.status === 'submitted') {
      data.assignments[idx].progress = 100;
    }

    saveDb(data);
    return data.assignments[idx];
  },

  deleteAssignment: (id) => {
    const data = loadDb();
    if (!data.assignments) data.assignments = [];
    data.assignments = data.assignments.filter(a => a.id !== id);
    saveDb(data);
    return true;
  },

  // ==========================================
  // PERSONALIZED STUDY PLANNER ("WHAT SHOULD I STUDY TODAY?")
  // ==========================================
  getTodayStudyPlan: (termId = 'term-2') => {
    const data = loadDb();
    const subjects = data.subjects.filter(s => !termId || termId === 'all' || s.termId === termId);
    const assignments = (data.assignments || []).filter(a => !termId || termId === 'all' || a.termId === termId);
    const quizzes = data.quizAttempts || [];
    const allCards = data.flashcards || [];
    const user = data.user || {};

    const now = new Date();
    const sevenDaysFromNow = new Date(Date.now() + 7 * 86400000);

    // 1. Urgent Assignments
    const urgentAssignments = assignments.filter(a => {
      if (a.status === 'completed' || a.status === 'submitted') return false;
      const due = new Date(a.dueDate);
      return due <= sevenDaysFromNow;
    });

    // 2. Weak Topics (<70% on quizzes)
    const weakTopics = [];
    quizzes.forEach(q => {
      if (q.topicBreakdown) {
        q.topicBreakdown.forEach(tb => {
          if (tb.percentage < 70) {
            const subj = subjects.find(s => s.id === q.subjectId);
            weakTopics.push({
              subjectName: subj?.name || 'MBA Core',
              subjectId: q.subjectId,
              topic: tb.topic,
              percentage: tb.percentage
            });
          }
        });
      }
    });

    // 3. Due Flashcards (Spaced Repetition)
    const dueCards = allCards.filter(c => {
      if (!c.nextReviewDate) return true;
      return new Date(c.nextReviewDate) <= now;
    });

    // Synthesize structured recommendations
    const recommendations = [];

    if (urgentAssignments.length > 0) {
      const topAsg = urgentAssignments[0];
      const subj = subjects.find(s => s.id === topAsg.subjectId);
      const daysLeft = Math.max(1, Math.round((new Date(topAsg.dueDate).getTime() - now.getTime()) / 86400000));
      recommendations.push({
        id: 'rec_asg',
        type: 'assignment',
        priority: 'high',
        title: `Work on "${topAsg.title}"`,
        subjectName: subj?.name || 'Coursework',
        subjectId: topAsg.subjectId,
        actionUrl: 'assignments',
        description: `Due in ${daysLeft} days. Current progress is ${topAsg.progress}%. Use Assignment Assistant to outline next section.`,
        durationMinutes: 45
      });
    }

    if (weakTopics.length > 0) {
      const topWeak = weakTopics[0];
      recommendations.push({
        id: 'rec_weak',
        type: 'revision',
        priority: 'high',
        title: `Revise "${topWeak.topic}" in ${topWeak.subjectName}`,
        subjectName: topWeak.subjectName,
        subjectId: topWeak.subjectId,
        actionUrl: 'tutor',
        description: `Scored ${topWeak.percentage}% on recent quiz. Open AI Tutor in "Teach Me" mode to master this concept.`,
        durationMinutes: 20
      });
    }

    if (dueCards.length > 0) {
      recommendations.push({
        id: 'rec_cards',
        type: 'flashcards',
        priority: 'medium',
        title: `Active Recall: ${Math.min(10, dueCards.length)} Flashcards Due`,
        subjectName: 'Retention Workout',
        actionUrl: 'flashcards',
        description: `Spaced repetition scheduled for today. Review these cards to retain core MBA definitions.`,
        durationMinutes: 10
      });
    }

    // Default subject practice if fewer than 3 recommendations
    if (recommendations.length < 3 && subjects.length > 0) {
      const sub = subjects[0];
      recommendations.push({
        id: 'rec_practice',
        type: 'practice',
        priority: 'medium',
        title: `Take a 5-minute Mock Quiz in ${sub.name}`,
        subjectName: sub.name,
        subjectId: sub.id,
        actionUrl: 'practice',
        description: `Practice 5 exam-predicted questions to strengthen exam readiness.`,
        durationMinutes: 15
      });
    }

    return {
      date: now.toISOString(),
      dailyGoalMinutes: user.dailyGoalMinutes || 45,
      todayStudyMinutes: user.todayStudyMinutes || 0,
      studyStreak: user.studyStreak || 1,
      recommendations,
      urgentAssignmentsCount: urgentAssignments.length,
      weakTopicsCount: weakTopics.length,
      dueFlashcardsCount: dueCards.length
    };
  },

  // Visual Learning Studio Items
  getVisualItems: (subjectId) => {
    const items = loadDb().visualStudioItems;
    return subjectId ? items.filter(v => v.subjectId === subjectId) : items;
  },
  getVisualItemById: (id) => loadDb().visualStudioItems.find(v => v.id === id),
  saveVisualItem: (item) => {
    const data = loadDb();
    const newItem = {
      id: item.id || `vis_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: item.subjectId,
      title: item.title,
      topic: item.topic,
      mode: item.mode, // 'flowchart' | 'concept_map' | 'diagram' | 'animated_explanation' | 'simulation' | 'comparison' | 'storytelling'
      data: item.data || {},
      explanation: item.explanation || '',
      sourceDocId: item.sourceDocId || null,
      createdAt: new Date().toISOString()
    };
    data.visualStudioItems.push(newItem);
    saveDb(data);
    return newItem;
  },
  deleteVisualItem: (id) => {
    const data = loadDb();
    data.visualStudioItems = data.visualStudioItems.filter(v => v.id !== id);
    saveDb(data);
    return true;
  },

  // Academic Calendar Tasks
  getCalendarTasks: () => loadDb().calendarTasks,
  createCalendarTask: (task) => {
    const data = loadDb();
    const newTask = {
      id: task.id || `task_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      subjectId: task.subjectId || null,
      title: task.title,
      type: task.type || 'assignment', // 'exam', 'assignment', 'presentation', 'project', 'study_session'
      dueDate: task.dueDate,
      reminderDate: task.reminderDate || null,
      completed: Boolean(task.completed),
      notes: task.notes || '',
      priority: task.priority || 'medium',
      createdAt: new Date().toISOString()
    };
    data.calendarTasks.push(newTask);
    saveDb(data);
    return newTask;
  },
  updateCalendarTask: (id, updates) => {
    const data = loadDb();
    const idx = data.calendarTasks.findIndex(t => t.id === id);
    if (idx === -1) return null;
    data.calendarTasks[idx] = { ...data.calendarTasks[idx], ...updates };
    saveDb(data);
    return data.calendarTasks[idx];
  },
  deleteCalendarTask: (id) => {
    const data = loadDb();
    data.calendarTasks = data.calendarTasks.filter(t => t.id !== id);
    saveDb(data);
    return true;
  },

  // Revision Centre
  getRevisionItems: () => loadDb().revisionItems,
  removeRevisionItem: (id) => {
    const data = loadDb();
    data.revisionItems = data.revisionItems.filter(r => r.id !== id);
    saveDb(data);
    return true;
  },

  // Study Garden
  getGarden: () => {
    const data = loadDb();
    if (!data.garden) {
      data.garden = {
        growthPoints: 45,
        level: 1,
        waterDrops: 3,
        plots: [
          { id: 'p1', name: 'Sakura Blossom', type: 'flower', plantName: 'Cherry Blossom', stage: 'sprout', progress: 50, requirement: 'Daily Study Goals' },
          { id: 'p2', name: 'Lavender Sprig', type: 'herb', plantName: 'Cozy Lavender', stage: 'sprout', progress: 35, requirement: 'Focus Room Pomodoro' },
          { id: 'p3', name: 'Matcha Mint', type: 'herb', plantName: 'Fresh Mint', stage: 'seedling', progress: 20, requirement: 'Study Materials' },
          { id: 'p4', name: 'Golden Sunflower', type: 'flower', plantName: 'Sun Gold', stage: 'seedling', progress: 15, requirement: 'Quiz Master' },
          { id: 'p5', name: 'Bonsai Pine', type: 'tree', plantName: 'Scholar Bonsai', stage: 'locked', progress: 0, requirement: 'Master 1 Subject' },
          { id: 'p6', name: 'Grand Sakura Tree', type: 'tree', plantName: 'Grand Sakura', stage: 'locked', progress: 0, requirement: 'Level 5 Scholar' }
        ],
        history: [
          { id: 'h1', action: 'Planted Sakura Sprout in Study Garden', points: 15, timestamp: new Date().toISOString() }
        ]
      };
      saveDb(data);
    }
    return data.garden;
  },
  waterGardenPlot: (plotId) => {
    const data = loadDb();
    const garden = db.getGarden();
    if (garden.waterDrops <= 0) {
      throw new Error('No water drops remaining! Complete study sessions or quizzes to collect more water.');
    }
    const plot = garden.plots.find(p => p.id === plotId);
    if (!plot) throw new Error('Plot not found');
    if (plot.stage === 'locked') throw new Error('Plot is currently locked');

    garden.waterDrops -= 1;
    plot.progress = Math.min(100, plot.progress + 25);
    garden.growthPoints += 15;

    // Check stage evolution
    if (plot.progress >= 100) {
      if (plot.type === 'tree') {
        plot.stage = 'tree';
      } else {
        plot.stage = 'blooming';
      }
    } else if (plot.progress >= 60) {
      plot.stage = 'bud';
    } else if (plot.progress >= 30) {
      plot.stage = 'sprout';
    }

    garden.level = Math.floor(garden.growthPoints / 100) + 1;
    garden.history.unshift({
      id: `gh_${Date.now()}`,
      action: `Watered ${plot.name} (+15 Growth Points)`,
      points: 15,
      timestamp: new Date().toISOString()
    });

    data.garden = garden;
    saveDb(data);
    return garden;
  },
  addGardenGrowth: (points, action) => {
    const data = loadDb();
    const garden = db.getGarden();
    garden.growthPoints += points;
    garden.waterDrops = Math.min(10, garden.waterDrops + 1);
    garden.level = Math.floor(garden.growthPoints / 100) + 1;

    // Grow unlocked plots proportionally
    garden.plots.forEach(p => {
      if (p.stage !== 'locked' && p.progress < 100) {
        p.progress = Math.min(100, p.progress + Math.round(points / 3));
        if (p.progress >= 100) p.stage = p.type === 'tree' ? 'tree' : 'blooming';
        else if (p.progress >= 60) p.stage = 'bud';
        else if (p.progress >= 30) p.stage = 'sprout';
      }
    });

    garden.history.unshift({
      id: `gh_${Date.now()}`,
      action,
      points,
      timestamp: new Date().toISOString()
    });

    data.garden = garden;
    saveDb(data);
    return garden;
  },

  // Focus Room Sessions
  getFocusSessions: () => {
    const data = loadDb();
    return data.focusSessions || [];
  },
  saveFocusSession: (session) => {
    const data = loadDb();
    if (!data.focusSessions) data.focusSessions = [];
    const newSession = {
      id: `focus_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      subjectId: session.subjectId || null,
      subjectName: session.subjectName || 'General Focus',
      durationMinutes: session.durationMinutes || 25,
      goal: session.goal || 'Deep study session',
      ambientSound: session.ambientSound || 'none',
      completedAt: new Date().toISOString()
    };
    data.focusSessions.unshift(newSession);

    // Also credit user today study minutes
    if (data.user) {
      data.user.todayStudyMinutes = (data.user.todayStudyMinutes || 0) + newSession.durationMinutes;
    }

    // Award Garden growth points
    db.addGardenGrowth(20, `Completed ${newSession.durationMinutes}m Pomodoro Focus Session`);

    saveDb(data);
    return newSession;
  },

  // Achievements (evaluated against real database metrics!)
  getAchievements: () => {
    const data = loadDb();
    const subjects = data.subjects || [];
    const docs = data.documents || [];
    const notes = data.notes || [];
    const flashcards = data.flashcards || [];
    const quizzes = data.quizAttempts || [];
    const focusSessions = data.focusSessions || [];
    const garden = db.getGarden();
    const streak = data.user?.studyStreak || 1;

    const badges = [
      {
        id: 'first_subject',
        title: 'First Step',
        subtitle: 'Created your first MBA subject workspace',
        category: 'academic',
        icon: 'GraduationCap',
        color: 'from-purple-400 to-indigo-400',
        unlocked: subjects.length >= 1,
        progress: Math.min(100, subjects.length * 100),
        reward: '+10 Garden Points'
      },
      {
        id: 'first_doc',
        title: "Scholar's Quill",
        subtitle: 'Uploaded & parsed lecture materials',
        category: 'academic',
        icon: 'FolderOpen',
        color: 'from-emerald-400 to-teal-400',
        unlocked: docs.length >= 1,
        progress: Math.min(100, docs.length * 100),
        reward: '+15 Garden Points'
      },
      {
        id: 'notes_master',
        title: 'Master Note-Taker',
        subtitle: 'Synthesized Complete & Revision notes',
        category: 'synthesis',
        icon: 'FileText',
        color: 'from-pink-400 to-rose-400',
        unlocked: notes.some(n => n.type === 'complete') && notes.some(n => n.type === 'revision'),
        progress: Math.min(100, notes.length * 35),
        reward: '+20 Garden Points'
      },
      {
        id: 'flashcard_explorer',
        title: 'Flashcard Explorer',
        subtitle: 'Mastered 3+ flashcards with active recall',
        category: 'retention',
        icon: 'Layers',
        color: 'from-amber-400 to-orange-400',
        unlocked: flashcards.filter(f => f.status === 'mastered').length >= 3,
        progress: Math.min(100, Math.round((flashcards.filter(f => f.status === 'mastered').length / 3) * 100)),
        reward: '+25 Garden Points'
      },
      {
        id: 'quiz_champion',
        title: 'Quiz Champion',
        subtitle: 'Scored 80%+ on an exam or mock test',
        category: 'mastery',
        icon: 'Award',
        color: 'from-violet-400 to-purple-500',
        unlocked: quizzes.some(q => q.percentage >= 80),
        progress: quizzes.length > 0 ? Math.min(100, Math.max(...quizzes.map(q => q.percentage))) : 0,
        reward: 'Golden Watering Can'
      },
      {
        id: 'streak_star',
        title: 'Sakura Streak',
        subtitle: 'Built a multi-day consistent study habit',
        category: 'consistency',
        icon: 'Flame',
        color: 'from-rose-400 to-pink-500',
        unlocked: streak >= 2,
        progress: Math.min(100, Math.round((streak / 3) * 100)),
        reward: '+30 Garden Points'
      },
      {
        id: 'pomodoro_focus',
        title: 'Deep Focus',
        subtitle: 'Finished a Cozy Focus Room session',
        category: 'focus',
        icon: 'Timer',
        color: 'from-cyan-400 to-blue-400',
        unlocked: focusSessions.length >= 1,
        progress: Math.min(100, focusSessions.length * 100),
        reward: 'Lo-Fi Rain Soundscape'
      },
      {
        id: 'garden_bloom',
        title: 'Green Thumb',
        subtitle: 'Brought a plant to full bloom in Study Garden',
        category: 'garden',
        icon: 'Sparkles',
        color: 'from-emerald-400 to-lime-400',
        unlocked: garden.plots.some(p => p.progress >= 100) || garden.growthPoints >= 100,
        progress: Math.min(100, garden.growthPoints),
        reward: 'Bonsai Seed'
      }
    ];

    return {
      badges,
      totalUnlocked: badges.filter(b => b.unlocked).length,
      totalBadges: badges.length
    };
  },

  // Weekly Study Activity (Mon - Sun)
  getWeeklyStats: () => {
    const data = loadDb();
    const today = new Date();
    const currentDayIdx = today.getDay(); // 0 is Sun, 1 is Mon...
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    // Provide realistic study pattern based on today's study minutes
    const baseMinutes = [25, 45, 30, 50, 40, 35, 20];
    baseMinutes[currentDayIdx] = Math.max(baseMinutes[currentDayIdx], data.user?.todayStudyMinutes || 20);

    return [
      { day: 'Mon', minutes: baseMinutes[1], label: 'Monday' },
      { day: 'Tue', minutes: baseMinutes[2], label: 'Tuesday' },
      { day: 'Wed', minutes: baseMinutes[3], label: 'Wednesday' },
      { day: 'Thu', minutes: baseMinutes[4], label: 'Thursday' },
      { day: 'Fri', minutes: baseMinutes[5], label: 'Friday' },
      { day: 'Sat', minutes: baseMinutes[6], label: 'Saturday' },
      { day: 'Sun', minutes: baseMinutes[0], label: 'Sunday' }
    ];
  }
};

module.exports = db;
