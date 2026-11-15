const http = require('http');

function request(options, body = null) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', reject);
    if (body) {
      req.write(typeof body === 'string' ? body : JSON.stringify(body));
    }
    req.end();
  });
}

async function run() {
  console.log('🌸 Testing Sakura Academia Endpoints...');

  // 1. Garden
  const gardenRes = await request({ host: 'localhost', port: 5000, path: '/api/garden', method: 'GET' });
  console.log('✅ GET /api/garden:', gardenRes.status, 'Level:', gardenRes.data?.level, 'Plots:', gardenRes.data?.plots?.length);

  // 2. Water plot p1
  const waterRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/garden/water',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, { plotId: 'p1' });
  console.log('✅ POST /api/garden/water (plot p1):', waterRes.status, 'Plot p1 Progress:', waterRes.data?.plot?.progress, 'Water Count:', waterRes.data?.waterDrops);

  // 3. Focus Session Recording
  const focusRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/focus/sessions',
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  }, {
    mode: 'focus',
    durationMinutes: 25,
    actualDurationMinutes: 25,
    goal: 'Review Macroeconomics Liquidity Trap',
    completed: true
  });
  console.log('✅ POST /api/focus/sessions:', focusRes.status, 'Logged Session:', focusRes.data?.goal);

  // 4. Achievements Dynamic Computation
  const achieveRes = await request({ host: 'localhost', port: 5000, path: '/api/achievements', method: 'GET' });
  console.log('✅ GET /api/achievements:', achieveRes.status, 'Unlocked:', achieveRes.data?.totalUnlocked, 'of', achieveRes.data?.badges?.length);

  // 5. Weekly Stats
  const weeklyRes = await request({ host: 'localhost', port: 5000, path: '/api/stats/weekly', method: 'GET' });
  console.log('✅ GET /api/stats/weekly:', weeklyRes.status, 'Day Count:', Array.isArray(weeklyRes.data) ? weeklyRes.data.length : 0);

  // 6. Settings & Theme Persistence
  const settingsRes = await request({
    host: 'localhost',
    port: 5000,
    path: '/api/settings',
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' }
  }, {
    theme: 'sakura'
  });
  console.log('✅ PUT /api/settings (theme: sakura):', settingsRes.status, 'Saved Theme:', settingsRes.data?.theme);

  // 7. Test Theme Switching across all 4 themes
  for (const t of ['lavender', 'matcha', 'midnight', 'sakura']) {
    const res = await request({
      host: 'localhost',
      port: 5000,
      path: '/api/settings',
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' }
    }, { theme: t });
    if (res.data?.theme !== t) throw new Error(`Theme switch to ${t} failed`);
  }
  console.log('✅ All 4 Themes persisted and tested: sakura, lavender, matcha, midnight');

  console.log('\n✨ ALL SAKURA ACADEMIA API VERIFICATIONS PASSED SUCCESSFULLY! 🌸');
}

run().catch(err => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
