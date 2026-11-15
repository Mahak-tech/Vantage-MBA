const http = require('http');
const fs = require('fs');
const path = require('path');

// Test against local server
const BASE_URL = 'http://localhost:5000/api';

async function fetchJson(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const response = await fetch(url, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  });
  if (!response.ok) {
    const text = await response.text();
    throw new Error(`API ${endpoint} failed (${response.status}): ${text}`);
  }
  return response.json();
}

async function runJourney() {
  console.log('--- Starting MyMBA Companion Full User Journey Verification ---');

  // 1. Health check
  console.log('\n[1/12] Checking server health...');
  const health = await fetchJson('/health');
  console.log('✅ Server Health:', health);

  // 2. User Profile & Settings
  console.log('\n[2/12] Checking User Profile & Settings...');
  const user = await fetchJson('/user');
  console.log('✅ Current User:', user.name, '|', user.specialization);

  // 3. Create a Subject
  console.log('\n[3/12] Creating new subject workspace...');
  const newSubject = await fetchJson('/subjects', {
    method: 'POST',
    body: JSON.stringify({
      name: 'Financial Management & Corporate Valuation',
      code: 'FIN-601',
      description: 'Valuation methodologies (DCF, Multiples), Capital Budgeting (NPV, IRR), and Working Capital Optimization.',
      semester: 'Semester 1',
      creditHours: 3
    })
  });
  console.log('✅ Created Subject:', newSubject.id, newSubject.name);

  // 4. Create and Upload a Sample Study Document (PPTX or TXT)
  console.log('\n[4/12] Simulating document upload & parsing...');
  const sampleTextPath = path.join(__dirname, 'server', 'uploads', 'sample_lecture.txt');
  fs.writeFileSync(sampleTextPath, `
LECTURE 3: CAPITAL BUDGETING AND DISCOUNTED CASH FLOW (DCF) VALUATION
Professor: Dr. Raymond Vance
Course: Financial Management (FIN-601)

1. Executive Summary & Foundational Principles
Capital budgeting is defined as the planning process used by managerial teams to evaluate long-term capital investments.
The primary criterion is Net Present Value (NPV):
NPV = Sum of [ Cash Flow_t / (1 + WACC)^t ] - Initial Investment CAPEX

2. Key Metrics & Definitions
- WACC (Weighted Average Cost of Capital): The firm's blended hurdle rate across equity and debt.
- IRR (Internal Rate of Return): The discount rate that sets NPV exactly to zero.
- Opportunity Cost: The expected return forgone by allocating capital away from the next best alternative.

3. Business Case Application: Tesla Gigafactory Expansion
Tesla allocated $4.5B in CAPEX for the Berlin Gigafactory. With a projected WACC of 9.2% and estimated steady-state free cash flow of $950M annually starting Year 3, the project generated an NPV of +$1.8B, justifying expansion.
  `.trim());

  // Upload file via FormData
  const formData = new FormData();
  formData.append('subjectId', newSubject.id);
  const blob = new Blob([fs.readFileSync(sampleTextPath)], { type: 'text/plain' });
  formData.append('files', blob, 'Lecture_3_Capital_Budgeting.txt');

  const uploadRes = await fetch(`${BASE_URL}/documents/upload`, {
    method: 'POST',
    body: formData
  });
  const uploadedDocs = await uploadRes.json();
  const uploadedDoc = uploadedDocs[0];
  console.log('✅ Document Processed:', uploadedDoc.title, '| Pages:', uploadedDoc.pageCount, '| Status:', uploadedDoc.status);

  // 5. Generate Complete Notes
  console.log('\n[5/12] Generating Complete Notes...');
  const completeNote = await fetchJson('/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      docIds: [uploadedDoc.id],
      noteType: 'complete',
      topic: 'Capital Budgeting & DCF'
    })
  });
  console.log('✅ Generated Complete Note:', completeNote.title, `(${completeNote.content.length} chars)`);

  // 6. Generate Short and Revision Notes
  console.log('\n[6/12] Generating Revision Notes...');
  const revNote = await fetchJson('/notes/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      docIds: [uploadedDoc.id],
      noteType: 'revision',
      topic: 'Rapid Exam Refresher - WACC & NPV'
    })
  });
  console.log('✅ Generated Revision Note:', revNote.title);

  // 7. Generate Flashcards
  console.log('\n[7/12] Generating Flashcards with Spaced Repetition...');
  const flashcards = await fetchJson('/flashcards/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      docIds: [uploadedDoc.id],
      topic: 'Capital Budgeting Essentials',
      count: 4
    })
  });
  console.log('✅ Generated Flashcards:', flashcards.length, 'cards');
  console.log('   Sample Card Q:', flashcards[0]?.front);
  console.log('   Sample Card A:', flashcards[0]?.back);

  // 8. Generate MCQs & Practice Questions
  console.log('\n[8/12] Generating Practice MCQs...');
  const questions = await fetchJson('/questions/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      docIds: [uploadedDoc.id],
      topic: 'WACC & Capital Budgeting',
      count: 3,
      type: 'mcq',
      difficulty: 'intermediate'
    })
  });
  console.log('✅ Generated Questions:', questions.length);
  console.log('   Sample Question:', questions[0]?.question);
  console.log('   Correct Answer:', questions[0]?.correctAnswer);

  // 9. Take & Submit a Quiz
  console.log('\n[9/12] Submitting Mock Quiz Attempt...');
  const quizAttempt = await fetchJson('/quizzes/submit', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      title: 'FIN-601 Midterm Quiz #1',
      totalQuestions: 2,
      correctCount: 2,
      incorrectCount: 0,
      unattemptedCount: 0,
      score: 2,
      percentage: 100,
      timeTakenSeconds: 145,
      difficulty: 'intermediate',
      topicBreakdown: [{ topic: 'Capital Budgeting', total: 2, correct: 2, percentage: 100 }],
      recommendations: ['Strong mastery of Net Present Value!'],
      questions,
      userAnswers: { 0: questions[0]?.correctAnswer, 1: questions[1]?.correctAnswer }
    })
  });
  console.log('✅ Quiz Submitted:', quizAttempt.title, '| Score:', quizAttempt.percentage + '%');

  // 10. AI Tutor Chat with RAG citations
  console.log('\n[10/12] Testing AI Tutor with Course Citations...');
  const tutorReply = await fetchJson('/tutor/chat', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      message: 'Why is NPV preferred over Payback Period for MBA valuation?',
      actionPrompt: 'Explain Simply'
    })
  });
  console.log('✅ AI Tutor Response received:');
  console.log('   Preview:', tutorReply.content.substring(0, 180) + '...');
  console.log('   Citations count:', tutorReply.citations?.length || 0);

  // 11. Visual Learning Studio Generation (Flowchart & Simulation)
  console.log('\n[11/12] Generating Interactive Visual Model (Flowchart)...');
  const visualFlowchart = await fetchJson('/visual/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      topic: 'DCF Valuation Pipeline',
      mode: 'flowchart'
    })
  });
  console.log('✅ Visual Flowchart Generated:', visualFlowchart.title, '| Steps:', visualFlowchart.data?.steps?.length || 0);

  console.log('\n[11b/12] Generating Interactive Business Simulation...');
  const visualSim = await fetchJson('/visual/generate', {
    method: 'POST',
    body: JSON.stringify({
      subjectId: newSubject.id,
      topic: 'Price Elasticity & Revenue Optimization',
      mode: 'simulation'
    })
  });
  console.log('✅ Business Simulation Generated:', visualSim.title);

  // 12. Confirm Persistence Across Reload
  console.log('\n[12/12] Verifying Data Persistence...');
  const allSubjects = await fetchJson('/subjects');
  const currentSub = allSubjects.find(s => s.id === newSubject.id);
  console.log('✅ Subject in Database:', currentSub.name);
  console.log(`   - Materials: ${currentSub.docCount}`);
  console.log(`   - Notes: ${currentSub.notesCount}`);
  console.log(`   - Flashcards: ${currentSub.cardsCount}`);
  console.log(`   - Quiz Attempts: ${currentSub.quizCount}`);

  // Clean test file
  if (fs.existsSync(sampleTextPath)) fs.unlinkSync(sampleTextPath);

  console.log('\n🎉 ALL 12 USER JOURNEY TESTS PASSED WITH 100% SUCCESS!');
}

runJourney().catch(err => {
  console.error('❌ User Journey Error:', err);
  process.exit(1);
});
