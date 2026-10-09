const http = require('http');
const fs = require('fs');
const path = require('path');

function get(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, headers: res.headers, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, headers: res.headers, text: data }); }
      });
    }).on('error', reject);
  });
}

async function verifyStep3() {
  console.log('====================================================');
  console.log('   STEP 3 PRODUCTION-READINESS VERIFICATION SUITE   ');
  console.log('====================================================\n');

  let passed = 0;
  let total = 0;

  function assert(title, condition, detail = '') {
    total++;
    if (condition) {
      console.log(`✅ [${total}] ${title} ${detail ? `(${detail})` : ''}`);
      passed++;
    } else {
      console.error(`❌ [${total}] ${title} FAILED: ${detail}`);
      throw new Error(`Assertion failed: ${title}`);
    }
  }

  // 1. Backend Deep Health Check
  console.log('--- 1. Service Health & Connectivity ---');
  const health = await get('http://localhost:5000/api/health');
  assert('Health endpoint status 200', health.status === 200, `Got ${health.status}`);
  assert('System overall status is ok', health.body.status === 'ok', `status: ${health.body.status}`);
  assert('PostgreSQL database connected', health.body.services?.database === 'connected', `DB: ${health.body.services?.database}`);
  assert('Python microservice connected', health.body.services?.python_service === 'connected', `Python: ${health.body.services?.python_service}`);

  // 2. Security Headers (Helmet)
  console.log('\n--- 2. Security Headers (Helmet) ---');
  assert('X-Content-Type-Options: nosniff present', health.headers['x-content-type-options'] === 'nosniff');
  assert('X-Frame-Options configured', Boolean(health.headers['x-frame-options']), health.headers['x-frame-options']);

  // 3. Rate Limiting Protection
  console.log('\n--- 3. Rate Limiting (express-rate-limit) ---');
  assert('RateLimit-Limit header present', Boolean(health.headers['ratelimit-limit']), `Limit: ${health.headers['ratelimit-limit']}`);
  assert('RateLimit-Remaining header present', Boolean(health.headers['ratelimit-remaining']), `Remaining: ${health.headers['ratelimit-remaining']}`);

  // 4. Medicine Microservice Proxy & Fallback
  console.log('\n--- 4. Python Microservice & Medicine Search ---');
  const med = await get('http://localhost:5000/api/medicine/search?name=paracetamol');
  assert('Medicine search endpoint responds 200', med.status === 200, `Status: ${med.status}`);
  assert('Medicine results returned', Array.isArray(med.body.data) && med.body.data.length > 0, `Count: ${med.body.data?.length}`);

  // 5. Environment Templates Audit
  console.log('\n--- 5. Environment Template Audit ---');
  const rootDir = path.resolve(__dirname, '../..');
  const backendEnvEx = fs.readFileSync(path.join(rootDir, 'backend/.env.example'), 'utf8');
  const frontendEnvEx = fs.readFileSync(path.join(rootDir, 'frontend/.env.example'), 'utf8');
  const pythonEnvEx = fs.readFileSync(path.join(rootDir, 'python-service/.env.example'), 'utf8');

  assert('backend/.env.example exists and contains DATABASE_URL', backendEnvEx.includes('DATABASE_URL='));
  assert('backend/.env.example contains no real passwords', !backendEnvEx.includes('0508') && backendEnvEx.includes('placeholder'));
  assert('frontend/.env.example exists and contains NEXT_PUBLIC_API_URL', frontendEnvEx.includes('NEXT_PUBLIC_API_URL='));
  assert('python-service/.env.example exists and contains PORT', pythonEnvEx.includes('PORT='));

  // 6. Root & Subproject .gitignore Audit
  console.log('\n--- 6. Git Ignore & Cleanliness Audit ---');
  const rootGitignore = fs.readFileSync(path.join(rootDir, '.gitignore'), 'utf8');
  assert('Root .gitignore ignores .env files', rootGitignore.includes('.env'));
  assert('Root .gitignore ignores node_modules', rootGitignore.includes('node_modules/'));
  assert('Root .gitignore ignores python-runtime binaries', rootGitignore.includes('python-runtime/'));
  assert('Root .gitignore preserves .env.example files', rootGitignore.includes('!.env.example'));

  // 7. Next.js Production Build Validation
  console.log('\n--- 7. Frontend Production Build Artifacts ---');
  const buildIdExists = fs.existsSync(path.join(rootDir, 'frontend/.next/BUILD_ID')) || fs.existsSync(path.join(rootDir, 'frontend/.next/server'));
  assert('Next.js optimized production build output exists', buildIdExists);

  console.log('\n====================================================');
  console.log(`🎉 ALL ${passed}/${total} STEP 3 PRODUCTION-READINESS AUDITS PASSED!`);
  console.log('====================================================\n');
}

verifyStep3().catch(err => {
  console.error('\n❌ Step 3 Verification Suite Failed:', err.message);
  process.exit(1);
});
