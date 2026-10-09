-- ====================================================================
-- Sample Seed Data for Healthcare Appointment System
-- Target: PostgreSQL 14+ / Local / Cloud
-- Password for all accounts: Password123!
-- ====================================================================

-- 1. Create Core Users
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'System Admin', 'admin'),
('doctor.sharma@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Rajesh Sharma', 'doctor'),
('doctor.patel@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Anjali Patel', 'doctor'),
('doctor.verma@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Vikram Verma', 'doctor'),
('doctor.reddy@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Sunita Reddy', 'doctor'),
('doctor.khan@healthcare.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Dr. Sameer Khan', 'doctor'),
('patient.john@gmail.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'John Doe', 'patient'),
('patient.sarah@gmail.com', '$2b$10$pm2bNh6befvP6AbRVMaI3O.zOGNmFvdo3S92PYopyufZyJe.60xF.', 'Sarah Connor', 'patient')
ON CONFLICT (email) DO UPDATE SET password_hash = EXCLUDED.password_hash;

-- 2. Create Initial Doctor Profiles
INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)
SELECT id, 'Cardiology', 'MD, DM Cardiology', 15, 800.00, 
'{"monday": ["09:00", "09:30", "10:00", "10:30", "11:00"], "tuesday": ["09:00", "10:00", "11:00"], "wednesday": ["09:00", "09:30", "10:00"], "thursday": ["09:00", "10:00", "11:00"], "friday": ["09:00", "09:30", "10:00"]}',
'Senior Cardiologist with 15 years of experience in heart care.',
'Mumbai', 'Lilavati Hospital & Research Centre, Bandra West, Mumbai', 19.051900, 72.829100, 4.9, 'English, Hindi, Marathi', true
FROM users WHERE email = 'doctor.sharma@healthcare.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)
SELECT id, 'Pediatrics', 'MBBS, MD Pediatrics', 8, 500.00,
'{"monday": ["14:00", "14:30", "15:00", "15:30", "16:00"], "tuesday": ["14:00", "15:00", "16:00"], "wednesday": ["14:00", "14:30", "15:00"], "thursday": ["14:00", "15:00", "16:00"], "friday": ["14:00", "14:30", "15:00"]}',
'Compassionate pediatrician specializing in newborn and child healthcare.',
'Mumbai', 'Hitech Medical Center, Andheri, Mumbai', 19.113600, 72.869700, 4.8, 'English, Hindi', true
FROM users WHERE email = 'doctor.patel@healthcare.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)
SELECT id, 'Orthopedics', 'MS Orthopedics', 12, 600.00,
'{"monday": ["10:00", "10:30", "11:00"], "wednesday": ["10:00", "10:30", "11:00"], "friday": ["10:00", "10:30", "11:00"]}',
'Expert in joint replacement and sports injuries.',
'Mumbai', 'Hitech Medical Center, Andheri, Mumbai', 19.113600, 72.869700, 4.7, 'English, Hindi', true
FROM users WHERE email = 'doctor.verma@healthcare.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)
SELECT id, 'Dermatology', 'MD Dermatology', 10, 700.00,
'{"tuesday": ["11:00", "11:30", "12:00"], "thursday": ["11:00", "11:30", "12:00"]}',
'Specialist in clinical and cosmetic dermatology.',
'Mumbai', 'Hitech Medical Center, Andheri, Mumbai', 19.113600, 72.869700, 4.8, 'English, Hindi', true
FROM users WHERE email = 'doctor.reddy@healthcare.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio, city, location, latitude, longitude, rating, languages, is_verified)
SELECT id, 'Neurology', 'MD, DM Neurology', 18, 1000.00,
'{"monday": ["09:00", "10:00", "11:00"], "wednesday": ["09:00", "10:00", "11:00"], "friday": ["09:00", "10:00", "11:00"]}',
'Highly experienced neurologist specializing in stroke and epilepsy.',
'Mumbai', 'Hitech Medical Center, Andheri, Mumbai', 19.113600, 72.869700, 4.9, 'English, Hindi', true
FROM users WHERE email = 'doctor.khan@healthcare.com'
ON CONFLICT (user_id) DO NOTHING;

-- 3. Create Patient Profiles
INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json, emergency_contact)
SELECT id, '1990-05-15', 'O+', '{"allergies": ["Peanuts", "Penicillin"], "previous_surgeries": ["Appendectomy"]}', '+919876543210'
FROM users WHERE email = 'patient.john@gmail.com'
ON CONFLICT (user_id) DO NOTHING;

INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json, emergency_contact)
SELECT id, '1995-08-22', 'A+', '{"allergies": ["Sulfa"], "chronic_conditions": []}', '+919876543211'
FROM users WHERE email = 'patient.sarah@gmail.com'
ON CONFLICT (user_id) DO NOTHING;
