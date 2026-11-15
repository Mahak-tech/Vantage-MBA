const fs = require('fs');
const path = require('path');

async function testUpload() {
  const form = new FormData();
  form.append('subjectId', 'sub-1');
  form.append('moduleName', 'Module 1');
  
  const blob = new Blob(['MBA Microeconomics Lecture 1: Supply and Demand Curves, Elasticity, and Marginal Utility.'], { type: 'text/plain' });
  form.append('files', blob, 'test_sample.txt');

  const res = await fetch('http://localhost:5000/api/documents/upload', {
    method: 'POST',
    body: form
  });

  console.log('Upload Status:', res.status);
  const data = await res.json();
  console.log('Upload Result:', data);
}

testUpload().catch(console.error);
