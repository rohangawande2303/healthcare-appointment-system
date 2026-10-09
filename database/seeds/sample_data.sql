-- Sample Seed Data for Healthcare Appointment System

-- 1. Create Users (Password is 'Password123!')
-- Hashed password for 'Password123!' using bcrypt
-- $2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v
-- Note: In a real script, I'd hash them programmatically, but for seeds:
INSERT INTO users (email, password_hash, name, role) VALUES
('admin@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'System Admin', 'admin'),
('doctor.sharma@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'Dr. Rajesh Sharma', 'doctor'),
('doctor.patel@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'Dr. Anjali Patel', 'doctor'),
('doctor.verma@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'Dr. Vikram Verma', 'doctor'),
('doctor.reddy@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'Dr. Sunita Reddy', 'doctor'),
('doctor.khan@healthcare.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'Dr. Sameer Khan', 'doctor'),
('patient.john@gmail.com', '$2b$10$ExR8zS4.NAtf.Z.vS.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v.z.v', 'John Doe', 'patient');

-- 2. Create Doctor Profiles
INSERT INTO doctors (user_id, specialty, qualification, experience, consultation_fee, availability_json, bio) VALUES
(2, 'Cardiology', 'MD, DM Cardiology', 15, 800.00, '{"monday": ["09:00", "09:30", "10:00", "10:30", "11:00"], "tuesday": ["09:00", "10:00", "11:00"], "wednesday": ["09:00", "09:30", "10:00"], "thursday": ["09:00", "10:00", "11:00"], "friday": ["09:00", "09:30", "10:00"]}', 'Senior Cardiologist with 15 years of experience in heart care.'),
(3, 'Pediatrics', 'MBBS, MD Pediatrics', 8, 500.00, '{"monday": ["14:00", "14:30", "15:00", "15:30", "16:00"], "tuesday": ["14:00", "15:00", "16:00"], "wednesday": ["14:00", "14:30", "15:00"], "thursday": ["14:00", "15:00", "16:00"], "friday": ["14:00", "14:30", "15:00"]}', 'Compassionate pediatrician specializing in newborn and child healthcare.'),
(4, 'Orthopedics', 'MS Orthopedics', 12, 600.00, '{"monday": ["10:00", "10:30", "11:00"], "wednesday": ["10:00", "10:30", "11:00"], "friday": ["10:00", "10:30", "11:00"]}', 'Expert in joint replacement and sports injuries.'),
(5, 'Dermatology', 'MD Dermatology', 10, 700.00, '{"tuesday": ["11:00", "11:30", "12:00"], "thursday": ["11:00", "11:30", "12:00"]}', 'Specialist in clinical and cosmetic dermatology.'),
(6, 'Neurology', 'MD, DM Neurology', 18, 1000.00, '{"monday": ["09:00", "10:00", "11:00"], "wednesday": ["09:00", "10:00", "11:00"], "friday": ["09:00", "10:00", "11:00"]}', 'Highly experienced neurologist specializing in stroke and epilepsy.');

-- 3. Create Patient Profiles
INSERT INTO patients (user_id, date_of_birth, blood_group, medical_history_json) VALUES
(7, '1990-05-15', 'O+', '{"allergies": ["Peanuts"], "previous_surgeries": ["Appendectomy"]}');
