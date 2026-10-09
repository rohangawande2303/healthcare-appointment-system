-- Healthcare Appointment System Database Schema
-- Target: PostgreSQL 14+

-- 1. Users Table
-- Stores base authentication data for all roles
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('patient', 'doctor', 'admin')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- 2. Doctors Table
-- Extended profile for users with role 'doctor'
CREATE TABLE IF NOT EXISTS doctors (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    specialty VARCHAR(100) NOT NULL,
    qualification TEXT NOT NULL,
    experience INTEGER NOT NULL, -- years
    consultation_fee DECIMAL(10, 2) NOT NULL,
    availability_json JSONB DEFAULT '{}',
    bio TEXT,
    city VARCHAR(100) DEFAULT 'Mumbai',
    location VARCHAR(255) DEFAULT 'Hitech Medical Center',
    latitude DECIMAL(9, 6),
    longitude DECIMAL(9, 6),
    rating DECIMAL(2, 1) DEFAULT 4.8,
    languages VARCHAR(255) DEFAULT 'English, Hindi',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_doctors_specialty ON doctors(specialty);
CREATE INDEX IF NOT EXISTS idx_doctors_city ON doctors(city);
CREATE INDEX IF NOT EXISTS idx_doctors_location ON doctors(location);

-- 3. Patients Table
-- Extended profile for users with role 'patient'
CREATE TABLE IF NOT EXISTS patients (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    date_of_birth DATE NOT NULL,
    blood_group VARCHAR(5) NOT NULL,
    medical_history_json JSONB DEFAULT '{}',
    emergency_contact VARCHAR(15),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Appointments Table
CREATE TABLE IF NOT EXISTS appointments (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    appointment_date DATE NOT NULL,
    time_slot VARCHAR(20) NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'completed', 'cancelled')),
    type VARCHAR(20) DEFAULT 'in-person' CHECK (type IN ('in-person', 'video')),
    payment_status VARCHAR(20) DEFAULT 'pending' CHECK (payment_status IN ('pending', 'paid', 'refunded')),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, appointment_date, time_slot)
);

CREATE INDEX idx_appointments_patient ON appointments(patient_id);
CREATE INDEX idx_appointments_doctor ON appointments(doctor_id);
CREATE INDEX idx_appointments_date ON appointments(appointment_date);

-- 5. Prescriptions Table
CREATE TABLE IF NOT EXISTS prescriptions (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    medicines_json JSONB NOT NULL, -- [{name, dosage, frequency, duration}]
    diagnosis TEXT NOT NULL,
    doctor_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Medicine Reminders Table
CREATE TABLE IF NOT EXISTS medicine_reminders (
    id SERIAL PRIMARY KEY,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    medicine_name VARCHAR(100) NOT NULL,
    dosage VARCHAR(50) NOT NULL,
    frequency VARCHAR(20) NOT NULL, -- once, twice, thrice
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    reminder_times_json JSONB NOT NULL, -- ["08:00", "20:00"]
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Payments Table
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    appointment_id INTEGER UNIQUE NOT NULL REFERENCES appointments(id) ON DELETE CASCADE,
    amount DECIMAL(10, 2) NOT NULL,
    razorpay_order_id VARCHAR(255) UNIQUE NOT NULL,
    razorpay_payment_id VARCHAR(255) UNIQUE,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. Reviews Table
CREATE TABLE IF NOT EXISTS reviews (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    patient_id INTEGER NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(doctor_id, patient_id) -- One review per patient-doctor pair
);

-- 9. Queue Status Table
CREATE TABLE IF NOT EXISTS queue_status (
    id SERIAL PRIMARY KEY,
    doctor_id INTEGER UNIQUE NOT NULL REFERENCES doctors(id) ON DELETE CASCADE,
    current_patient_id INTEGER REFERENCES patients(id),
    estimated_wait_time INTEGER DEFAULT 0, -- in minutes
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
