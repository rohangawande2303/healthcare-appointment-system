-- ====================================================================
-- DEMO ACCOUNTS SEED SCRIPT (Safe to run multiple times)
-- Target: PostgreSQL 14+ / Neon / Supabase / Local
-- Password for all accounts: Password123!
-- ====================================================================

-- 1. Insert or Update User Logins (Bcrypt hash: 10 rounds for 'Password123!')
INSERT INTO users (email, password_hash, name, role)
VALUES 
    ('admin@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'System Admin', 'admin'),
    ('patient.john@gmail.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'John Doe', 'patient'),
    ('patient.sarah@gmail.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Sarah Connor', 'patient'),
    ('doctor.sharma@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Rajesh Sharma', 'doctor')
ON CONFLICT (email) DO UPDATE 
SET password_hash = EXCLUDED.password_hash,
    name = EXCLUDED.name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;

-- 2. Insert or Update Patient Profiles
INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json, emergency_contact)
SELECT 
    id, 
    '1990-05-15', 
    'O+', 
    '{"allergies": ["Penicillin", "Peanuts"], "chronic_conditions": ["Mild Asthma"]}', 
    '+919876543210'
FROM users WHERE email = 'patient.john@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET date_of_birth = EXCLUDED.date_of_birth,
    blood_group = EXCLUDED.blood_group,
    medical_history_json = EXCLUDED.medical_history_json,
    emergency_contact = EXCLUDED.emergency_contact;

INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json, emergency_contact)
SELECT 
    id, 
    '1995-08-22', 
    'A+', 
    '{"allergies": ["Sulfa drugs"], "chronic_conditions": []}', 
    '+919876543211'
FROM users WHERE email = 'patient.sarah@gmail.com'
ON CONFLICT (user_id) DO UPDATE 
SET date_of_birth = EXCLUDED.date_of_birth,
    blood_group = EXCLUDED.blood_group,
    medical_history_json = EXCLUDED.medical_history_json,
    emergency_contact = EXCLUDED.emergency_contact;

-- 3. Insert or Update Doctor Profile for Dr. Rajesh Sharma
INSERT INTO doctors (
    user_id, specialty, qualification, experience, consultation_fee, 
    availability_json, bio, city, location, latitude, longitude, 
    rating, languages, is_verified
)
SELECT 
    id,
    'Cardiology',
    'MBBS, MD, DM (Cardiology)',
    15,
    800.00,
    '{"monday":["09:00","09:30","10:00","10:30","11:00"],"tuesday":["09:00","10:00","11:00"],"wednesday":["09:00","09:30","10:00"],"thursday":["09:00","10:00","11:00"],"friday":["09:00","09:30","10:00"]}',
    'Senior Interventional Cardiologist with 15+ years of clinical experience in cardiac diagnostics and heart wellness.',
    'Mumbai',
    'Lilavati Hospital & Research Centre, Bandra West, Mumbai',
    19.051900,
    72.829100,
    4.9,
    'English, Hindi, Marathi',
    true
FROM users WHERE email = 'doctor.sharma@healthcare.com'
ON CONFLICT (user_id) DO UPDATE 
SET specialty = EXCLUDED.specialty,
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
    languages = EXCLUDED.languages,
    is_verified = EXCLUDED.is_verified;
