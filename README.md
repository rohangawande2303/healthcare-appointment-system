# HealthEase — Healthcare Appointment & Telemedicine System

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.0-blue?style=for-the-badge&logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?style=for-the-badge&logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=for-the-badge&logo=postgresql)](https://www.postgresql.org/)
[![Socket.io](https://img.shields.io/badge/Socket.io-4.8-black?style=for-the-badge&logo=socket.io)](https://socket.io/)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-orange?style=for-the-badge&logo=webrtc)](https://webrtc.org/)
[![Python](https://img.shields.io/badge/Python-3.11-3776AB?style=for-the-badge&logo=python)](https://www.python.org/)

**HealthEase** is a full-stack healthcare appointment and telemedicine platform. It bridges patients and healthcare providers through location-aware doctor discovery, real-time consultation queue tracking, peer-to-peer WebRTC video visits, automated appointment and medicine reminders, and cryptographic Razorpay payment verification.

---

## 🏛️ System Architecture

```
                            +---------------------------------------+
                            |          Client Web Browser           |
                            |  Next.js 16 (App Router + Tailwind)   |
                            +-------------------+-------------------+
                                                |
                             HTTPS REST API     |    WSS (WebSocket)
                             Axios + NextAuth   |    Socket.io Client
                                                v
                            +-------------------+-------------------+
                            |       Node.js / Express API           |
                            |   (Port 5000 / Render Web Service)    |
                            |                                       |
                            |  * JWT Auth & Role-Based Access       |
                            |  * Doctor Search (Haversine Formula)  |
                            |  * Razorpay HMAC-SHA256 Verification  |
                            |  * WebRTC Signaling via Socket.io     |
                            |  * node-cron Reminders (Nodemailer)   |
                            |  * Security: Helmet & Rate Limiters   |
                            +---------+--------------------+--------+
                                      |                    |
                 Internal HTTP GET    |                    | SQL Pool
                 (Port 8001)          |                    | (SSL require)
                                      v                    v
+------------------------------------+        +---------------------+
|     Python Flask Microservice      |        | PostgreSQL Database |
|    (Port 8001 / OpenFDA API)       |        | (Neon Cloud / Local)|
|                                    |        |                     |
| * 5-second Timeout & Fallback      |        | * 8 Relational Tab. |
| * Drug Label & Safety Lookup       |        | * Indexes on City/GPS
+------------------------------------+        +---------------------+
```

---

## ✨ Key Features

- **Location-Aware Doctor Discovery:** Search by specialty, name, city (Mumbai, Delhi, Bengaluru, Hyderabad, Chennai, Pune, Kolkata, Ahmedabad, Jaipur, Chandigarh), or use the **Near Me** GPS button to calculate distances via the Haversine formula in PostgreSQL.
- **120+ Seeded Specialists:** Real clinic and hospital coordinates sourced from the OpenStreetMap Overpass API across 12 specialties.
- **Real-Time Live Queue:** Socket.io powered waiting room tokens showing real-time consultation progress and estimated wait times.
- **Encrypted Telemedicine (WebRTC):** Direct peer-to-peer video consultations with STUN/TURN fallback.
- **Razorpay Payment Gateway:** Secure test-mode payments with backend HMAC-SHA256 cryptographic verification.
- **Medicine Safety Microservice:** Dedicated Python Flask service communicating with the FDA OpenFDA API with automatic fallback caching.
- **Background Cron Automation:** Hourly email reminders (Nodemailer) and scheduled medicine dosage alerts (`node-cron`).
- **Role-Based Access Control (RBAC):** Distinct dashboards for **Patients**, **Doctors**, and **Administrators**.

---

## 🔑 Default Demo Accounts

All demo accounts use the standard password: `Password123!`

| Role | Email | Password | Access / Capabilities |
| :--- | :--- | :--- | :--- |
| **Admin** | `admin@healthcare.com` | `Password123!` | Verify doctors, view platform analytics, inspect all appointments |
| **Doctor** | `doctor.sharma@healthcare.com` | `Password123!` | View daily appointments, manage consultation queue, start video calls |
| **Patient** | `patient.john@gmail.com` | `Password123!` | Search doctors, book slots, pay via Razorpay, join video consultations |

> *Note: Doctor profiles, consultation fees, and schedules are realistic demo data for presentation purposes. Real medical clinic coordinates were sourced from OpenStreetMap.*

---

## 🚀 Local Development Quickstart

### Prerequisites
- **Node.js** v18+ (tested on v20 and v24)
- **Python** 3.10+
- **PostgreSQL** 14+ (or a free [Neon](https://neon.tech/) cloud database)

### 1. Clone Repository
```bash
git clone https://github.com/rohangawande2303/healthcare-appointment-system.git
cd healthcare-appointment-system
```

### 2. Database Setup
Create a PostgreSQL database named `healthcare_db` and run the schema and seed files:
```bash
# Using psql:
psql -U postgres -c "CREATE DATABASE healthcare_db;"
psql -U postgres -d healthcare_db -f database/schema.sql
psql -U postgres -d healthcare_db -f database/seeds/doctors_data.sql
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# Edit .env with your local PostgreSQL password
npm install
npm run dev
# Backend runs on http://localhost:5000
```

### 4. Python Medicine Microservice Setup
```bash
cd ../python-service
cp .env.example .env
pip install -r requirements.txt
python run.py
# Microservice runs on http://localhost:8001
```

### 5. Frontend Setup
```bash
cd ../frontend
cp .env.example .env.local
npm install
npm run dev
# Frontend runs on http://localhost:3000
```

---

## 🔒 Security Hardening

- **Helmet:** Applies standard HTTP security headers (`nosniff`, `SAMEORIGIN`, XSS protection).
- **Rate Limiting:** Protects `/api/auth` (max 30 requests / 15 min) and `/api/payments` (max 30 requests / 15 min).
- **Parameterized Queries:** All SQL queries use `$1, $2` parameterized inputs, preventing SQL injection.
- **Password Hashing:** Passwords hashed with `bcrypt` (10 rounds).
- **HMAC SHA-256 Signatures:** Razorpay payment callbacks cryptographically verified before marking appointments as paid.
- **Graceful Shutdown:** Handles `SIGTERM` and `SIGINT` signals to flush connection pools and stop background jobs cleanly.

---

## 📁 Repository Structure

```
├── backend/                  # Node.js + Express REST API & Socket.io
│   ├── src/
│   │   ├── config/           # Database pool & SSL config
│   │   ├── controllers/      # Auth, Doctors, Appointments, Payments, etc.
│   │   ├── middleware/       # JWT auth, RBAC, Rate limiter, Error handler
│   │   ├── routes/           # REST endpoints
│   │   ├── services/         # Scheduler, Nodemailer, Twilio, Razorpay
│   │   └── socket/           # WebRTC signaling & Queue events
│   ├── scripts/              # Automated verification test suites
│   └── .env.example          # Clean backend template
├── frontend/                 # Next.js 16 (App Router) + Tailwind CSS
│   ├── app/                  # (auth), (dashboard) [admin, doctor, patient]
│   ├── components/           # Booking flow, VideoCall, Queue, UI primitives
│   ├── lib/                  # Axios API instance, auth helpers
│   └── .env.example          # Clean frontend template
├── python-service/           # Flask microservice for OpenFDA drug lookup
│   ├── run.py                # Drug search with 5s timeout & fallback cache
│   └── requirements.txt      # Python dependencies
├── database/                 # PostgreSQL migrations & seed data
│   ├── schema.sql            # Table definitions, constraints, indexes
│   └── seeds/
│       └── doctors_data.sql  # 120+ realistic doctors with OSM coordinates
├── INTERVIEW_GUIDE.md        # Comprehensive viva / interview defense guide
├── DEPLOYMENT.md             # Free cloud deployment guide (Neon + Render + Vercel)
└── README.md
```

---

## 📜 API Endpoints Overview

| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/health` | Public | Deep health monitor (DB & Python service) |
| `POST` | `/api/auth/register` | Public | Register new patient |
| `POST` | `/api/auth/login` | Public | Authenticate user & return JWT token |
| `GET` | `/api/doctors` | Public | Filter doctors by city, specialty, or GPS |
| `GET` | `/api/doctors/cities` | Public | List all 10 available cities |
| `GET` | `/api/doctors/:id/availability` | Public | Get available appointment time slots |
| `POST` | `/api/appointments` | Patient | Book new appointment |
| `POST` | `/api/payments/create-order` | Patient | Create Razorpay order |
| `POST` | `/api/payments/verify` | Patient | Verify Razorpay HMAC signature |
| `GET` | `/api/medicine/search?name=` | Public | Search drug safety via Python/OpenFDA |
| `GET` | `/api/queue/:doctorId` | Public | Live queue status & current token |
| `PATCH` | `/api/doctors/:id/verify` | Admin | Verify doctor credentials |

---

## 📄 License & Credits

Developed by **Rohan Gawande** ([@rohangawande2303](https://github.com/rohangawande2303)).
Open-source under the MIT License.
