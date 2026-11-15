const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const db = require('./db');
const { parseDocument } = require('./parsers');
const { chunkDocument, searchChunks } = require('./rag');
const {
  testApiKey,
  generateNotes,
  generateFlashcards,
  generateQuestions,
  chatWithTutor,
  generateVisual
} = require('./ai');

const app = express();
const PORT = process.env.PORT || 5000;

// Setup upload directory
const UPLOAD_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, UPLOAD_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${uniqueSuffix}${ext}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 35 * 1024 * 1024 } // 35MB max
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    geminiKeySet: Boolean(db.getSettings().geminiApiKey || process.env.GEMINI_API_KEY)
  });
});

// ==========================================
// SETTINGS & PROFILE
// ==========================================

app.get('/api/settings', (req, res) => {
  const settings = db.getSettings();
  res.json({
    ...settings,
    geminiApiKeyMasked: settings.geminiApiKey ? '•'.repeat(16) + settings.geminiApiKey.slice(-4) : ''
  });
});

app.post('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.put('/api/settings', (req, res) => {
  const updated = db.updateSettings(req.body);
  res.json(updated);
});

app.post('/api/settings/test-gemini', async (req, res) => {
  const key = req.body.apiKey || db.getSettings().geminiApiKey;
  if (!key) {
    return res.status(400).json({ valid: false, error: 'Please enter a Gemini API Key to test.' });
  }
  const result = await testApiKey(key);
  res.json(result);
});

app.get('/api/user', (req, res) => {
  res.json(db.getUser());
});

app.put('/api/user', (req, res) => {
  const updated = db.updateUser(req.body);
  res.json(updated);
});

app.post('/api/auth/login', (req, res) => {
  const { name, email } = req.body;
  const currentUser = db.getUser();
  const updated = db.updateUser({
    name: name || currentUser?.name || 'Mahak',
    email: email || currentUser?.email || 'mahak@mba.edu'
  });
  res.json({ success: true, user: updated });
});

// ==========================================
// SUBJECTS
// ==========================================

app.get('/api/subjects', (req, res) => {
  const subjects = db.getSubjects();
  // Include item counts for each subject
  const allDocs = db.getDocuments();
  const allNotes = db.getNotes();
  const allCards = db.getFlashcards();
  const allQuizzes = db.getQuizAttempts();

  const enriched = subjects.map(s => ({
    ...s,
    docCount: allDocs.filter(d => d.subjectId === s.id).length,
    notesCount: allNotes.filter(n => n.subjectId === s.id).length,
    cardsCount: allCards.filter(c => c.subjectId === s.id).length,
    quizCount: allQuizzes.filter(q => q.subjectId === s.id).length
  }));

  res.json(enriched);
});

app.get('/api/subjects/:id', (req, res) => {
  const subject = db.getSubjectById(req.params.id);
  if (!subject) return res.status(404).json({ error: 'Subject not found' });
  res.json(subject);
});

app.post('/api/subjects', (req, res) => {
  const { name, code, description, icon, color, semester, creditHours } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Subject name is required.' });
  }
  const newSubject = db.createSubject({ name, code, description, icon, color, semester, creditHours });
  res.status(201).json(newSubject);
});

app.put('/api/subjects/:id', (req, res) => {
  const updated = db.updateSubject(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Subject not found' });
  res.json(updated);
});

app.delete('/api/subjects/:id', (req, res) => {
  db.deleteSubject(req.params.id);
  res.json({ success: true, message: 'Subject and all associated resources deleted.' });
});

// ==========================================
// STUDY MATERIALS / DOCUMENT UPLOAD & PARSING
// ==========================================

app.get('/api/documents', (req, res) => {
  const subjectId = req.query.subjectId;
  const docs = db.getDocuments(subjectId);
  res.json(docs);
});

app.post('/api/documents/upload', upload.array('files', 10), async (req, res) => {
  try {
    const { subjectId, moduleName } = req.body;
    if (!subjectId) {
      return res.status(400).json({ error: 'subjectId is required for document upload.' });
    }

    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: 'No files provided for upload.' });
    }

    const processedDocs = [];

    for (const file of req.files) {
      const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
      let parsed = null;
      let status = 'completed';
      let error = null;

      try {
        parsed = await parseDocument(file.path, file.originalname);
      } catch (parseErr) {
        status = 'failed';
        error = parseErr.message || 'Failed to extract text from document.';
      }

      const docRecord = db.createDocument({
        subjectId,
        title: path.basename(file.originalname, path.extname(file.originalname)),
        fileName: file.filename,
        originalName: file.originalname,
        fileType: ext,
        fileSize: file.size,
        status,
        error,
        extractedText: parsed ? parsed.text : '',
        pageCount: parsed ? parsed.pageCount : 1,
        pages: parsed ? parsed.pages : [],
        module: moduleName || 'General'
      });

      processedDocs.push(docRecord);
    }

    res.status(201).json(processedDocs);
  } catch (err) {
    console.error('Upload processing failed:', err);
    res.status(500).json({ error: err.message || 'File processing failed.' });
  }
});

app.delete('/api/documents/:id', (req, res) => {
  const doc = db.getDocumentById(req.params.id);
  if (doc && doc.fileName) {
    const filePath = path.join(UPLOAD_DIR, doc.fileName);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
  }
  db.deleteDocument(req.params.id);
  res.json({ success: true });
});

// ==========================================
// AI NOTES GENERATOR
// ==========================================

app.get('/api/notes', (req, res) => {
  const { subjectId } = req.query;
  res.json(db.getNotes(subjectId));
});

app.post('/api/notes', (req, res) => {
  const note = db.createNote(req.body);
  res.status(201).json(note);
});

app.put('/api/notes/:id', (req, res) => {
  const updated = db.updateNote(req.params.id, req.body);
  if (!updated) return res.status(404).json({ error: 'Note not found' });
  res.json(updated);
});

app.delete('/api/notes/:id', (req, res) => {
  db.deleteNote(req.params.id);
  res.json({ success: true });
});

app.post('/api/notes/generate', async (req, res) => {
  try {
    const { subjectId, docIds, noteType, topic } = req.body;
    const subject = db.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    let sourceContent = '';
    const selectedDocs = [];
    if (docIds && docIds.length > 0) {
      for (const id of docIds) {
        const doc = db.getDocumentById(id);
        if (doc && doc.extractedText) {
          sourceContent += `\n\n--- DOCUMENT: ${doc.title} ---\n${doc.extractedText}`;
          selectedDocs.push(doc.id);
        }
      }
    } else {
      // Use all documents in this subject if no specific doc selected
      const docs = db.getDocuments(subjectId);
      for (const d of docs) {
        if (d.extractedText) {
          sourceContent += `\n\n--- DOCUMENT: ${d.title} ---\n${d.extractedText}`;
          selectedDocs.push(d.id);
        }
      }
    }

    const markdownNotes = await generateNotes({
      subjectName: subject.name,
      docContent: sourceContent,
      noteType: noteType || 'complete',
      topic: topic || '',
      apiKey: req.headers['x-gemini-key']
    });

    const typeTitleMap = {
      complete: 'Complete Notes',
      short: 'Short Notes',
      revision: 'Revision Notes',
      exam_oriented: 'Exam-Oriented Notes'
    };

    const newNote = db.createNote({
      subjectId,
      sourceDocIds: selectedDocs,
      title: `${topic || subject.name} - ${typeTitleMap[noteType] || 'Study Notes'}`,
      type: noteType || 'complete',
      topic: topic || 'Key Topics',
      content: markdownNotes,
      tags: [noteType, subject.name]
    });

    res.status(201).json(newNote);
  } catch (err) {
    console.error('Note generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate notes.' });
  }
});

// ==========================================
// AI FLASHCARDS
// ==========================================

app.get('/api/flashcards', (req, res) => {
  const { subjectId } = req.query;
  res.json(db.getFlashcards(subjectId));
});

app.post('/api/flashcards', (req, res) => {
  const card = db.createFlashcard(req.body);
  res.status(201).json(card);
});

app.put('/api/flashcards/:id', (req, res) => {
  const updated = db.updateFlashcard(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/flashcards/:id', (req, res) => {
  db.deleteFlashcard(req.params.id);
  res.json({ success: true });
});

app.post('/api/flashcards/generate', async (req, res) => {
  try {
    const { subjectId, docIds, topic, count } = req.body;
    const subject = db.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    let sourceContent = '';
    if (docIds && docIds.length > 0) {
      docIds.forEach(id => {
        const d = db.getDocumentById(id);
        if (d && d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    } else {
      const docs = db.getDocuments(subjectId);
      docs.forEach(d => {
        if (d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    }

    const cardsData = await generateFlashcards({
      subjectName: subject.name,
      docContent: sourceContent,
      count: parseInt(count, 10) || 8,
      topic: topic || '',
      apiKey: req.headers['x-gemini-key']
    });

    const formattedCards = cardsData.map(c => ({
      subjectId,
      topic: topic || 'Key Concepts',
      deckTitle: `${subject.name} - ${topic || 'Core Deck'}`,
      front: c.front,
      back: c.back
    }));

    const savedCards = db.createFlashcardsBatch(formattedCards);
    res.status(201).json(savedCards);
  } catch (err) {
    console.error('Flashcard generation error:', err);
    res.status(500).json({ error: err.message || 'Failed to generate flashcards.' });
  }
});

// ==========================================
// PRACTICE QUESTIONS & MCQ BANK
// ==========================================

app.get('/api/questions', (req, res) => {
  const { subjectId } = req.query;
  res.json(db.getQuestions(subjectId));
});

app.post('/api/questions', (req, res) => {
  const q = db.createQuestion(req.body);
  res.status(201).json(q);
});

app.delete('/api/questions/:id', (req, res) => {
  db.deleteQuestion(req.params.id);
  res.json({ success: true });
});

app.post('/api/questions/generate', async (req, res) => {
  try {
    const { subjectId, docIds, topic, count, type, difficulty } = req.body;
    const subject = db.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found.' });

    let sourceContent = '';
    if (docIds && docIds.length > 0) {
      docIds.forEach(id => {
        const d = db.getDocumentById(id);
        if (d && d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    } else {
      const docs = db.getDocuments(subjectId);
      docs.forEach(d => {
        if (d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    }

    const rawQuestions = await generateQuestions({
      subjectName: subject.name,
      docContent: sourceContent,
      count: parseInt(count, 10) || 5,
      type: type || 'mcq',
      difficulty: difficulty || 'intermediate',
      topic: topic || '',
      apiKey: req.headers['x-gemini-key']
    });

    const formatted = rawQuestions.map(q => ({
      subjectId,
      topic: topic || 'Core Topic',
      type: q.type || type || 'mcq',
      difficulty: q.difficulty || difficulty || 'intermediate',
      question: q.question,
      options: q.options || [],
      correctAnswer: q.correctAnswer,
      explanation: q.explanation || '',
      wrongOptionsExplanation: q.wrongOptionsExplanation || {},
      sourceRef: q.sourceRef || subject.name
    }));

    const saved = db.createQuestionsBatch(formatted);
    res.status(201).json(saved);
  } catch (err) {
    console.error('Question generation failed:', err);
    res.status(500).json({ error: err.message || 'Failed to generate practice questions.' });
  }
});

// ==========================================
// QUIZZES & ATTEMPTS
// ==========================================

app.get('/api/quizzes/attempts', (req, res) => {
  const { subjectId } = req.query;
  res.json(db.getQuizAttempts(subjectId));
});

app.post('/api/quizzes/submit', (req, res) => {
  const savedAttempt = db.saveQuizAttempt(req.body);
  res.status(201).json(savedAttempt);
});

// ==========================================
// AI TUTOR CONVERSATION
// ==========================================

app.get('/api/tutor/messages', (req, res) => {
  const { subjectId } = req.query;
  if (!subjectId) return res.status(400).json({ error: 'subjectId required' });
  res.json(db.getTutorMessages(subjectId));
});

app.delete('/api/tutor/messages', (req, res) => {
  const { subjectId } = req.query;
  if (!subjectId) return res.status(400).json({ error: 'subjectId required' });
  db.clearTutorMessages(subjectId);
  res.json({ success: true });
});

app.post('/api/tutor/chat', async (req, res) => {
  try {
    const { subjectId, message, actionPrompt } = req.body;
    const subject = db.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    // Save user message
    db.saveTutorMessage({
      subjectId,
      role: 'user',
      content: message
    });

    // Chunk all subject documents for RAG
    const docs = db.getDocuments(subjectId);
    const allChunks = [];
    for (const d of docs) {
      if (d.extractedText) {
        const chunks = chunkDocument(d);
        allChunks.push(...chunks);
      }
    }

    // Retrieve most relevant chunks for this query
    const relevantChunks = searchChunks(allChunks, message, 4);

    // Get previous messages for conversation history
    const conversationHistory = db.getTutorMessages(subjectId);

    const tutorResponse = await chatWithTutor({
      subjectName: subject.name,
      messages: conversationHistory,
      docChunks: relevantChunks,
      actionPrompt: actionPrompt || '',
      apiKey: req.headers['x-gemini-key']
    });

    // Save assistant response
    const savedMsg = db.saveTutorMessage({
      subjectId,
      role: 'assistant',
      content: tutorResponse.content,
      citations: tutorResponse.citations
    });

    res.json(savedMsg);
  } catch (err) {
    console.error('Tutor chat failed:', err);
    res.status(500).json({ error: err.message || 'AI Tutor chat failed.' });
  }
});

// ==========================================
// VISUAL LEARNING STUDIO
// ==========================================

app.get('/api/visual', (req, res) => {
  const { subjectId } = req.query;
  res.json(db.getVisualItems(subjectId));
});

app.post('/api/visual/generate', async (req, res) => {
  try {
    const { subjectId, topic, mode, docIds } = req.body;
    const subject = db.getSubjectById(subjectId);
    if (!subject) return res.status(404).json({ error: 'Subject not found' });

    let sourceContent = '';
    if (docIds && docIds.length > 0) {
      docIds.forEach(id => {
        const d = db.getDocumentById(id);
        if (d && d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    } else {
      const docs = db.getDocuments(subjectId);
      docs.forEach(d => {
        if (d.extractedText) sourceContent += `\n${d.extractedText}`;
      });
    }

    const visualConfig = await generateVisual({
      subjectName: subject.name,
      topic: topic || 'Core Business Framework',
      mode: mode || 'flowchart',
      docContent: sourceContent,
      apiKey: req.headers['x-gemini-key']
    });

    const saved = db.saveVisualItem({
      subjectId,
      title: visualConfig.title || `${topic} - ${mode}`,
      topic: topic || 'Core Framework',
      mode: mode || 'flowchart',
      data: visualConfig.data,
      explanation: visualConfig.explanation
    });

    res.status(201).json(saved);
  } catch (err) {
    console.error('Visual generation failed:', err);
    res.status(500).json({ error: err.message || 'Failed to generate visual learning item.' });
  }
});

app.post('/api/visual/save', (req, res) => {
  const saved = db.saveVisualItem(req.body);
  res.status(201).json(saved);
});

app.delete('/api/visual/:id', (req, res) => {
  db.deleteVisualItem(req.params.id);
  res.json({ success: true });
});

// ==========================================
// ACADEMIC CALENDAR & TASKS
// ==========================================

app.get('/api/calendar', (req, res) => {
  res.json(db.getCalendarTasks());
});

app.post('/api/calendar', (req, res) => {
  const task = db.createCalendarTask(req.body);
  res.status(201).json(task);
});

app.put('/api/calendar/:id', (req, res) => {
  const updated = db.updateCalendarTask(req.params.id, req.body);
  res.json(updated);
});

app.delete('/api/calendar/:id', (req, res) => {
  db.deleteCalendarTask(req.params.id);
  res.json({ success: true });
});

// ==========================================
// SMART REVISION CENTRE
// ==========================================

app.get('/api/revision', (req, res) => {
  const items = db.getRevisionItems();
  const allCards = db.getFlashcards();
  const dueCards = allCards.filter(c => {
    if (!c.nextReviewDate) return true;
    return new Date(c.nextReviewDate) <= new Date();
  });

  res.json({
    weakTopics: items,
    dueFlashcardsCount: dueCards.length,
    dueFlashcards: dueCards.slice(0, 15),
    recentNotes: db.getNotes().slice(0, 5)
  });
});

app.delete('/api/revision/:id', (req, res) => {
  db.removeRevisionItem(req.params.id);
  res.json({ success: true });
});

// ==========================================
// STUDY GARDEN (GAMIFIED PROGRESS)
// ==========================================

app.get('/api/garden', (req, res) => {
  res.json(db.getGarden());
});

app.post('/api/garden/water', (req, res) => {
  try {
    const { plotId } = req.body;
    const updated = db.waterGardenPlot(plotId);
    res.json(updated);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/garden/grow', (req, res) => {
  const { points, action } = req.body;
  const updated = db.addGardenGrowth(points || 15, action || 'Study Achievement');
  res.json(updated);
});

// ==========================================
// COZY FOCUS ROOM (POMODORO & SESSIONS)
// ==========================================

app.get('/api/focus/sessions', (req, res) => {
  res.json(db.getFocusSessions());
});

app.post('/api/focus/sessions', (req, res) => {
  const session = db.saveFocusSession(req.body);
  res.status(201).json(session);
});

// ==========================================
// ACHIEVEMENTS & REWARDS
// ==========================================

app.get('/api/achievements', (req, res) => {
  res.json(db.getAchievements());
});

// ==========================================
// WEEKLY STUDY STATISTICS
// ==========================================

app.get('/api/stats/weekly', (req, res) => {
  res.json(db.getWeeklyStats());
});

// ==========================================
// GLOBAL SEARCH
// ==========================================

app.get('/api/search', (req, res) => {
  const q = (req.query.q || '').toLowerCase().trim();
  if (!q) return res.json({ subjects: [], documents: [], notes: [], flashcards: [], questions: [], visualItems: [] });

  const subjects = db.getSubjects().filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  const documents = db.getDocuments().filter(d => d.title.toLowerCase().includes(q) || d.extractedText.toLowerCase().includes(q));
  const notes = db.getNotes().filter(n => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q));
  const flashcards = db.getFlashcards().filter(f => f.front.toLowerCase().includes(q) || f.back.toLowerCase().includes(q));
  const questions = db.getQuestions().filter(qt => qt.question.toLowerCase().includes(q) || qt.topic.toLowerCase().includes(q));
  const visualItems = db.getVisualItems().filter(v => v.title.toLowerCase().includes(q) || v.topic.toLowerCase().includes(q));

  res.json({
    subjects,
    documents: documents.map(d => ({ id: d.id, subjectId: d.subjectId, title: d.title, fileType: d.fileType })),
    notes: notes.map(n => ({ id: n.id, subjectId: n.subjectId, title: n.title, type: n.type })),
    flashcards: flashcards.map(f => ({ id: f.id, subjectId: f.subjectId, front: f.front })),
    questions: questions.map(q => ({ id: q.id, subjectId: q.subjectId, question: q.question, type: q.type })),
    visualItems: visualItems.map(v => ({ id: v.id, subjectId: v.subjectId, title: v.title, mode: v.mode }))
  });
});

// Serve client build in production / unified server
const clientDist = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api')) return next();
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Vantage MBA Backend running on http://localhost:${PORT}`);
  console.log(`📚 AI Document Processing & RAG Engine Active`);
  console.log(`====================================================`);
});
