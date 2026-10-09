const http = require('http');

function get(path) {
  return new Promise((resolve, reject) => {
    http.get('http://localhost:5000' + path, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try { resolve({ status: res.statusCode, body: JSON.parse(data) }); }
        catch (e) { resolve({ status: res.statusCode, text: data }); }
      });
    }).on('error', reject);
  });
}

async function verifyStep2() {
  console.log('--- STEP 2 VERIFICATION ---');

  // 1. Verify Cities
  console.log('\n[1] Testing Cities Endpoint (GET /api/doctors/cities)...');
  const citiesRes = await get('/api/doctors/cities');
  if (citiesRes.status !== 200 || !citiesRes.body.success) {
    throw new Error('Cities endpoint failed: ' + JSON.stringify(citiesRes));
  }
  console.log(`✅ Success! Found ${citiesRes.body.data.length} distinct cities:`, citiesRes.body.data.join(', '));

  // 2. Verify Search by City
  console.log('\n[2] Testing Doctor Search by City (Mumbai)...');
  const mumbaiRes = await get('/api/doctors?city=Mumbai&page=1&limit=5');
  if (mumbaiRes.status !== 200 || !mumbaiRes.body.success) {
    throw new Error('Mumbai search failed: ' + JSON.stringify(mumbaiRes));
  }
  console.log(`✅ Success! Found ${mumbaiRes.body.pagination.total} doctors in Mumbai.`);
  console.log(`Pagination info: Page ${mumbaiRes.body.pagination.page} of ${mumbaiRes.body.pagination.totalPages}`);
  const sample = mumbaiRes.body.data[0];
  console.log(`Sample doctor: ${sample.name} | ${sample.specialty} | Rating: ${sample.rating} ⭐ | Fee: ₹${sample.consultation_fee}`);
  console.log(`Location: ${sample.location}`);
  console.log(`Languages: ${sample.languages}`);

  // 3. Verify Near Me / Proximity Search
  console.log('\n[3] Testing Proximity Search (Near Mumbai BKC / Bandra: lat 19.0657, lng 72.8683)...');
  const nearRes = await get('/api/doctors?lat=19.0657&lng=72.8683&radius=30&limit=5');
  if (nearRes.status !== 200 || !nearRes.body.success) {
    throw new Error('Near-me search failed: ' + JSON.stringify(nearRes));
  }
  console.log(`✅ Success! Found ${nearRes.body.data.length} doctors within 30km radius:`);
  nearRes.body.data.forEach((d, i) => {
    console.log(`   ${i + 1}. ${d.name} (${d.specialty}) — Distance: ${d.distance_km} km | Clinic: ${d.location}`);
  });

  // 4. Verify Specialties
  console.log('\n[4] Testing Specialty Search (Cardiology in Delhi)...');
  const specialtyRes = await get('/api/doctors?city=Delhi&specialty=Cardiology');
  if (specialtyRes.status !== 200 || !specialtyRes.body.success) {
    throw new Error('Specialty search failed: ' + JSON.stringify(specialtyRes));
  }
  console.log(`✅ Success! Found ${specialtyRes.body.pagination.total} Cardiologist(s) in Delhi.`);

  console.log('\n🎉 ALL STEP 2 API VERIFICATIONS PASSED SUCCESSFULLY!');
}

verifyStep2().catch(err => {
  console.error('❌ Step 2 verification error:', err);
  process.exit(1);
});
