const http = require('http');

function post(path, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data)
      }
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

function get(path) {
  return new Promise((resolve, reject) => {
    const req = http.request({
      host: 'localhost',
      port: 5000,
      path,
      method: 'GET'
    }, res => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(resData) });
        } catch {
          resolve({ status: res.statusCode, raw: resData });
        }
      });
    });
    req.on('error', reject);
    req.end();
  });
}

async function testAll() {
  console.log('Testing Core LMS Endpoints...');

  // 1. Get subjects
  const subs = await get('/api/subjects');
  console.log('1. GET /api/subjects:', subs.status, 'Count:', subs.body?.length);
  const testSubId = subs.body?.[0]?.id;

  if (!testSubId) {
    console.error('No subject found to test with!');
    return;
  }

  // 2. Generate Notes
  const notesRes = await post('/api/notes/generate', {
    subjectId: testSubId,
    noteType: 'complete',
    topic: 'Discounted Cash Flow Analysis'
  });
  console.log('2. POST /api/notes/generate:', notesRes.status, 'Title:', notesRes.body?.title);

  // 3. Generate Flashcards
  const flashRes = await post('/api/flashcards/generate', {
    subjectId: testSubId,
    topic: 'Financial Metrics',
    count: 3
  });
  console.log('3. POST /api/flashcards/generate:', flashRes.status, 'Count:', flashRes.body?.length);

  // 4. Generate Questions
  const questRes = await post('/api/questions/generate', {
    subjectId: testSubId,
    topic: 'Valuation & Multiples',
    count: 3,
    type: 'mcq'
  });
  console.log('4. POST /api/questions/generate:', questRes.status, 'Count:', questRes.body?.length);

  // 5. Visual Studio Generation
  const visualRes = await post('/api/visual/generate', {
    subjectId: testSubId,
    topic: 'Supply and Demand Equilibrium',
    mode: 'equilibrium'
  });
  console.log('5. POST /api/visual/generate:', visualRes.status, 'Title:', visualRes.body?.title);

  // 6. AI Tutor Chat
  const tutorRes = await post('/api/tutor/chat', {
    subjectId: testSubId,
    message: 'What is the weighted average cost of capital (WACC)?',
    actionPrompt: 'Explain Simply'
  });
  console.log('6. POST /api/tutor/chat:', tutorRes.status, 'Response len:', tutorRes.body?.content?.length);

  // 7. Revision Centre
  const revRes = await get('/api/revision');
  console.log('7. GET /api/revision:', revRes.status, 'Weak topics:', revRes.body?.weakTopics?.length);

  // 8. Calendar
  const calRes = await get('/api/calendar');
  console.log('8. GET /api/calendar:', calRes.status, 'Tasks:', calRes.body?.length);

  // 9. Search
  const searchRes = await get('/api/search?q=capital');
  console.log('9. GET /api/search:', searchRes.status, 'Notes found:', searchRes.body?.notes?.length);

  console.log('Finished testing.');
}

testAll().catch(console.error);
