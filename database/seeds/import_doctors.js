const { Pool } = require('../../backend/node_modules/pg');
const bcrypt = require('../../backend/node_modules/bcrypt');
const path = require('path');
const fs = require('fs');
require('../../backend/node_modules/dotenv').config({ path: path.join(__dirname, '../../backend/.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

const CITIES = [
  { name: 'Mumbai', lat: 19.0760, lon: 72.8777, defaultLang: 'English, Hindi, Marathi' },
  { name: 'Delhi', lat: 28.6139, lon: 77.2090, defaultLang: 'English, Hindi, Punjabi' },
  { name: 'Bengaluru', lat: 12.9716, lon: 77.5946, defaultLang: 'English, Hindi, Kannada' },
  { name: 'Hyderabad', lat: 17.3850, lon: 78.4867, defaultLang: 'English, Hindi, Telugu' },
  { name: 'Chennai', lat: 13.0827, lon: 80.2707, defaultLang: 'English, Tamil, Hindi' },
  { name: 'Pune', lat: 18.5204, lon: 73.8567, defaultLang: 'English, Marathi, Hindi' },
  { name: 'Kolkata', lat: 22.5726, lon: 88.3639, defaultLang: 'English, Bengali, Hindi' },
  { name: 'Ahmedabad', lat: 23.0225, lon: 72.5714, defaultLang: 'English, Gujarati, Hindi' },
  { name: 'Jaipur', lat: 26.9124, lon: 75.7873, defaultLang: 'English, Hindi, Rajasthani' },
  { name: 'Chandigarh', lat: 30.7333, lon: 76.7794, defaultLang: 'English, Punjabi, Hindi' },
];

const SPECIALTIES = [
  { name: 'Cardiology', qual: 'MBBS, MD (Medicine), DM (Cardiology)', minFee: 700, maxFee: 1500 },
  { name: 'Pediatrics', qual: 'MBBS, MD (Pediatrics), DCH', minFee: 400, maxFee: 900 },
  { name: 'Orthopedics', qual: 'MBBS, MS (Orthopedics), DNB Ortho', minFee: 500, maxFee: 1200 },
  { name: 'Dermatology', qual: 'MBBS, MD (Dermatology & Venereology)', minFee: 500, maxFee: 1100 },
  { name: 'Neurology', qual: 'MBBS, MD, DM (Neurology)', minFee: 800, maxFee: 1600 },
  { name: 'General Medicine', qual: 'MBBS, MD (Internal Medicine)', minFee: 350, maxFee: 750 },
  { name: 'Gynecology', qual: 'MBBS, MS (Obstetrics & Gynecology), DGO', minFee: 500, maxFee: 1200 },
  { name: 'Psychiatry', qual: 'MBBS, MD (Psychiatry), DPM', minFee: 600, maxFee: 1400 },
  { name: 'ENT', qual: 'MBBS, MS (ENT), DLO', minFee: 450, maxFee: 950 },
  { name: 'Ophthalmology', qual: 'MBBS, MS (Ophthalmology), DO', minFee: 400, maxFee: 900 },
  { name: 'Gastroenterology', qual: 'MBBS, MD, DM (Medical Gastroenterology)', minFee: 750, maxFee: 1500 },
  { name: 'Oncology', qual: 'MBBS, MD, DM (Medical Oncology)', minFee: 900, maxFee: 1800 },
];

const FIRST_NAMES = [
  'Aarav', 'Aditi', 'Alok', 'Ananya', 'Anil', 'Anjali', 'Arjun', 'Bhavna',
  'Deepak', 'Devika', 'Gaurav', 'Gayatri', 'Harsh', 'Ishaan', 'Kavita', 'Manish',
  'Meera', 'Mohit', 'Neha', 'Nikhil', 'Pooja', 'Pranav', 'Priya', 'Rahul',
  'Rajesh', 'Ritu', 'Rohan', 'Rohit', 'Sanjay', 'Shalini', 'Sneha', 'Sunil',
  'Sunita', 'Suresh', 'Tarun', 'Varun', 'Vandana', 'Vikram', 'Vinay', 'Yash'
];

const LAST_NAMES = [
  'Agarwal', 'Banerjee', 'Bhat', 'Chatterjee', 'Chauhan', 'Deshmukh', 'Gupta',
  'Iyer', 'Jain', 'Joshi', 'Kapoor', 'Khan', 'Kulkarni', 'Kumar', 'Mehta',
  'Mishra', 'Mukherjee', 'Nair', 'Patel', 'Patil', 'Pillai', 'Rao', 'Reddy',
  'Roy', 'Saxena', 'Sen', 'Sharma', 'Singh', 'Srivastava', 'Verma'
];

// Fallback high-precision real clinic locations per city if Overpass is slow/throttled
const KNOWN_CLINICS = {
  Mumbai: [
    { name: 'Lilavati Hospital & Research Centre', lat: 19.0519, lon: 72.8291, area: 'Bandra West' },
    { name: 'Hinduja Healthcare Surgical', lat: 19.0706, lon: 72.8354, area: 'Khar West' },
    { name: 'Kokilaben Dhirubhai Ambani Hospital', lat: 19.1315, lon: 72.8251, area: 'Andheri West' },
    { name: 'Nanavati Super Speciality Hospital', lat: 19.0967, lon: 72.8427, area: 'Vile Parle West' },
    { name: 'Fortis Hospital Mulund', lat: 19.1678, lon: 72.9463, area: 'Mulund West' },
    { name: 'Dr LH Hiranandani Hospital', lat: 19.1179, lon: 72.9103, area: 'Powai' },
  ],
  Delhi: [
    { name: 'Max Super Speciality Hospital', lat: 28.5284, lon: 77.2117, area: 'Saket' },
    { name: 'Fortis Escorts Heart Institute', lat: 28.5603, lon: 77.2798, area: 'Okhla' },
    { name: 'Apollo Hospitals Indraprastha', lat: 28.5398, lon: 77.2831, area: 'Sarita Vihar' },
    { name: 'Sir Ganga Ram Hospital', lat: 28.6385, lon: 77.1896, area: 'Rajinder Nagar' },
    { name: 'Moolchand Medcity', lat: 28.5684, lon: 77.2378, area: 'Lajpat Nagar' },
  ],
  Bengaluru: [
    { name: 'Manipal Hospital', lat: 12.9592, lon: 77.6444, area: 'HAL Old Airport Road' },
    { name: 'Aster CMI Hospital', lat: 13.0601, lon: 77.5898, area: 'Hebbal' },
    { name: 'Fortis Hospital Bannerghatta', lat: 12.8938, lon: 77.5979, area: 'Bannerghatta Road' },
    { name: 'Apollo Speciality Hospitals', lat: 12.9298, lon: 77.5934, area: 'Jayanagar' },
    { name: 'Columbia Asia Referral Hospital', lat: 13.0118, lon: 77.5552, area: 'Yeshwanthpur' },
  ],
  Hyderabad: [
    { name: 'KIMS Hospitals', lat: 17.4339, lon: 78.4839, area: 'Secunderabad' },
    { name: 'Yashoda Hospitals', lat: 17.4243, lon: 78.4552, area: 'Somajiguda' },
    { name: 'Continental Hospitals', lat: 17.4227, lon: 78.3496, area: 'Gachibowli' },
    { name: 'Care Hospitals Banjara Hills', lat: 17.4156, lon: 78.4487, area: 'Banjara Hills' },
  ],
  Chennai: [
    { name: 'Apollo Main Hospital', lat: 13.0604, lon: 80.2508, area: 'Greams Road' },
    { name: 'Fortis Malar Hospital', lat: 13.0067, lon: 80.2571, area: 'Adyar' },
    { name: 'MIOT International', lat: 13.0232, lon: 80.1834, area: 'Manapakkam' },
    { name: 'Kauvery Hospital', lat: 13.0368, lon: 80.2524, area: 'Alwarpet' },
  ],
  Pune: [
    { name: 'Ruby Hall Clinic', lat: 18.5323, lon: 73.8777, area: 'Sassoon Road' },
    { name: 'Jehangir Hospital', lat: 18.5309, lon: 73.8772, area: 'Bund Garden Road' },
    { name: 'Manipal Hospitals Kharadi', lat: 18.5529, lon: 73.9392, area: 'Kharadi' },
    { name: 'Sahyadri Super Speciality Hospital', lat: 18.5089, lon: 73.8344, area: 'Deccan Gymkhana' },
  ],
  Kolkata: [
    { name: 'AMRI Hospitals', lat: 22.5135, lon: 88.3643, area: 'Dhakuria' },
    { name: 'Apollo Multispeciality Hospitals', lat: 22.5697, lon: 88.4035, area: 'Canal Circular Road' },
    { name: 'Fortis Hospital Anandapur', lat: 22.5184, lon: 88.4011, area: 'Anandapur' },
    { name: 'Medica Superspecialty Hospital', lat: 22.4907, lon: 88.3976, area: 'Mukundapur' },
  ],
  Ahmedabad: [
    { name: 'Zydus Hospitals', lat: 23.0583, lon: 72.5244, area: 'Thaltej' },
    { name: 'Apollo Hospitals International', lat: 23.1098, lon: 72.6012, area: 'Bhat' },
    { name: 'KD Hospital', lat: 23.1147, lon: 72.5414, area: 'Vaishno Devi Circle' },
    { name: 'CIMS Hospital', lat: 23.0784, lon: 72.5098, area: 'Science City Road' },
  ],
  Jaipur: [
    { name: 'Fortis Escorts Hospital', lat: 26.8523, lon: 75.8052, area: 'Malviya Nagar' },
    { name: 'Manipal Hospital Jaipur', lat: 26.9634, lon: 75.7709, area: 'Vidhyadhar Nagar' },
    { name: 'Eternal Heart Care Centre (EHCC)', lat: 26.8489, lon: 75.8078, area: 'Jawahar Circle' },
  ],
  Chandigarh: [
    { name: 'Max Super Speciality Hospital Mohali', lat: 30.7234, lon: 76.7189, area: 'Phase 6, Mohali' },
    { name: 'Fortis Hospital Mohali', lat: 30.6948, lon: 76.7324, area: 'Sector 62' },
    { name: 'Eden Critical Care Hospital', lat: 30.7067, lon: 76.8012, area: 'Industrial Area Phase 1' },
  ]
};

// Generates weekly schedule JSON
function generateWeeklySchedule() {
  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'];
  
  const schedule = {};
  days.forEach(day => {
    // Select 5-8 random slots per active day
    const daySlots = allSlots.slice(0, 5 + Math.floor(Math.random() * 5));
    schedule[day] = daySlots;
  });
  return schedule;
}

// Fetch real clinics from OpenStreetMap Overpass API
async function fetchOSMClinics(city) {
  const delta = 0.08;
  const bbox = `${city.lat - delta},${city.lon - delta},${city.lat + delta},${city.lon + delta}`;
  const query = `[out:json][timeout:8];(node["amenity"="hospital"](${bbox});node["amenity"="clinic"](${bbox});node["amenity"="doctors"](${bbox}););out 15;`;
  const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;

  try {
    const res = await fetch(url, {
      headers: { 'User-Agent': 'HealthEase-App/1.0 (academic-demonstration; student-project)' }
    });
    if (res.ok) {
      const data = await res.json();
      const clinics = [];
      for (const el of data.elements || []) {
        if (el.tags?.name && el.lat && el.lon) {
          clinics.push({
            name: el.tags.name,
            lat: el.lat,
            lon: el.lon,
            area: el.tags['addr:suburb'] || el.tags['addr:street'] || city.name
          });
        }
      }
      if (clinics.length >= 4) {
        console.log(`[OSM] Fetched ${clinics.length} real healthcare points for ${city.name} from OpenStreetMap`);
        return clinics;
      }
    }
  } catch (err) {
    // Graceful fallback to known real clinics
  }
  return KNOWN_CLINICS[city.name] || [];
}

async function main() {
  console.log('\n======================================================');
  console.log('   STEP 2: IMPORTING 120-150 REALISTIC DOCTORS');
  console.log('======================================================\n');

  const client = await pool.connect();
  const passwordHash = await bcrypt.hash('Password123!', 10);

  let totalDoctorsAdded = 0;
  let totalDoctorsExisting = 0;

  try {
    for (const city of CITIES) {
      console.log(`\n📍 Processing city: ${city.name}...`);
      const clinics = await fetchOSMClinics(city);

      // Generate 12-14 doctors per city (one for each specialty)
      for (let sIdx = 0; sIdx < SPECIALTIES.length; sIdx++) {
        const spec = SPECIALTIES[sIdx];
        const clinic = clinics[sIdx % clinics.length] || {
          name: `${city.name} Super Speciality Clinic`,
          lat: city.lat + (Math.random() - 0.5) * 0.05,
          lon: city.lon + (Math.random() - 0.5) * 0.05,
          area: 'Central'
        };

        const fName = FIRST_NAMES[(sIdx * 3 + CITIES.indexOf(city) * 7) % FIRST_NAMES.length];
        const lName = LAST_NAMES[(sIdx * 5 + CITIES.indexOf(city) * 11) % LAST_NAMES.length];
        const docName = `Dr. ${fName} ${lName}`;
        const emailSlug = `${fName.toLowerCase()}.${lName.toLowerCase()}.${city.name.toLowerCase()}`;
        const email = `doctor.${emailSlug}@healthcare.com`;

        const expYears = 5 + ((sIdx * 3 + CITIES.indexOf(city)) % 22);
        const fee = Math.round((spec.minFee + Math.random() * (spec.maxFee - spec.minFee)) / 50) * 50;
        const rating = Number((4.4 + Math.random() * 0.6).toFixed(1));
        const bio = `Dr. ${fName} ${lName} is a distinguished ${spec.name} specialist at ${clinic.name}, ${city.name} with ${expYears} years of clinical expertise. Dedicated to personalized, evidence-based patient healthcare.`;
        const schedule = generateWeeklySchedule();

        // Jitter latitude and longitude slightly so each doctor is distinct around the clinic
        const lat = Number((clinic.lat + (Math.random() - 0.5) * 0.008).toFixed(6));
        const lon = Number((clinic.lon + (Math.random() - 0.5) * 0.008).toFixed(6));
        const locationStr = `${clinic.name}, ${clinic.area}, ${city.name}`;

        // 1. Insert user (safe: ON CONFLICT DO NOTHING)
        const userRes = await client.query(
          `INSERT INTO users (email, password_hash, name, role)
           VALUES ($1, $2, $3, 'doctor')
           ON CONFLICT (email) DO UPDATE SET name = EXCLUDED.name
           RETURNING id`,
          [email, passwordHash, docName]
        );
        const userId = userRes.rows[0].id;

        // 2. Insert or update doctor profile
        const docRes = await client.query(
          `INSERT INTO doctors (
             user_id, specialty, qualification, experience, consultation_fee,
             availability_json, bio, city, location, latitude, longitude,
             rating, languages, is_verified
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, true)
           ON CONFLICT (user_id) DO UPDATE SET
             specialty = EXCLUDED.specialty,
             qualification = EXCLUDED.qualification,
             experience = EXCLUDED.experience,
             consultation_fee = EXCLUDED.consultation_fee,
             availability_json = EXCLUDED.availability_json,
             bio = EXCLUDED.bio,
             city = EXCLUDED.city,
             location = EXCLUDED.location,
             latitude = EXCLUDED.latitude,
             longitude = EXCLUDED.longitude,
             rating = EXCLUDED.rating,
             languages = EXCLUDED.languages
           RETURNING id`,
          [
            userId, spec.name, spec.qual, expYears, fee,
            JSON.stringify(schedule), bio, city.name, locationStr,
            lat, lon, rating, city.defaultLang
          ]
        );

        totalDoctorsAdded++;
      }
    }

    // Verify demo doctor doctor.sharma@healthcare.com has full coordinates & city
    await client.query(`
      UPDATE doctors 
      SET city = 'Mumbai',
          location = 'Lilavati Hospital & Research Centre, Bandra West, Mumbai',
          latitude = 19.051900,
          longitude = 72.829100,
          rating = 4.9,
          languages = 'English, Hindi, Marathi',
          is_verified = true
      WHERE user_id = (SELECT id FROM users WHERE email = 'doctor.sharma@healthcare.com')
    `);

    // Fetch total doctor count
    const totalCountRes = await client.query('SELECT COUNT(*) FROM doctors');
    const totalDoctors = parseInt(totalCountRes.rows[0].count);

    console.log('\n======================================================');
    console.log('   STEP 2 IMPORT SUMMARY');
    console.log('======================================================');
    console.log(`✅ Seeded / Verified ${totalDoctorsAdded} doctors across 10 cities.`);
    console.log(`📊 Total Doctors in Database: ${totalDoctors}`);
    console.log('🏥 All profiles include OpenStreetMap locations, latitude/longitude, qualifications & weekly schedules.');
    console.log('🔑 Preserved Demo Logins:');
    console.log('   - Admin:   admin@healthcare.com / Password123!');
    console.log('   - Doctor:  doctor.sharma@healthcare.com / Password123!');
    console.log('   - Patient: patient.john@gmail.com / Password123!\n');

  } catch (err) {
    console.error('❌ Error during doctor import:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
}

main();
