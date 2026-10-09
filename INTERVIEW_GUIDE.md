# Healthcare Appointment & Telemedicine System — Comprehensive Interview & Viva Guide

> **Target Audience:** Computer Science / IT Engineering student defending this final-year / capstone project or presenting it in a technical interview.
> **Key Goal:** Explain complex system engineering choices clearly, confidently, and without buzzword jargon.

---

## 1. Project Elevator Pitch (30-Second Summary)

> *"HealthEase is a full-stack, location-aware healthcare platform that connects patients with doctors for in-clinic visits and real-time WebRTC video consultations. It solves patient waiting anxiety with a live queue tracking system, integrates automated medicine reminders, provides drug information via an OpenFDA Python microservice, and handles secure transactions using Razorpay's HMAC-SHA256 verified payment workflow."*

---

## 2. System Architecture

```
                                    +-----------------------------------------+
                                    |         User Browser / Mobile           |
                                    |   Next.js 16 (App Router + Tailwind)    |
                                    +--------------------+--------------------+
                                                         |
                                      HTTPS REST APIs    |   WebSocket (WSS)
                                      Axios + NextAuth   |   Socket.io Client
                                                         v
                                    +--------------------+--------------------+
                                    |         Node.js / Express API           |
                                    |      (Port 5000 / Render Cloud)         |
                                    |                                         |
                                    |  * JWT Auth & Role Check (RBAC)         |
                                    |  * Doctor Search (Haversine Formula)    |
                                    |  * Razorpay HMAC-SHA256 Verification    |
                                    |  * WebRTC Signaling via Socket.io       |
                                    |  * node-cron Reminders (Nodemailer)     |
                                    +---------+--------------------+----------+
                                              |                    |
                         Internal HTTP GET    |                    | SQL Pool
                         (Port 8001)          |                    | (SSL require)
                                              v                    v
+------------------------------------+        |      +------------------------+
|       Python Flask Microservice    |        |      |  PostgreSQL Database   |
|   (OpenFDA Drug Safety Lookup)     |<-------+      |  (Neon Cloud / Local)  |
|                                    |               |                        |
| * 5s Timeout + Resilient Fallback  |               | * 8 Relational Tables  |
| * Brand & Generic Drug Information |               | * Indexes on City/GPS  |
+------------------------------------+               +------------------------+
```

---

## 3. Technology Stack & Why Each Was Chosen

| Technology | Role | Why Chosen over Alternatives? |
| :--- | :--- | :--- |
| **Next.js 16 (React 19)** | Frontend Framework | Server Components provide fast First Contentful Paint (FCP), Turbopack ensures instant builds, and the App Router makes role-based routing (`/patient`, `/doctor`, `/admin`) declarative and clean. |
| **Tailwind CSS + Lucide Icons** | UI Styling | Utility-first styling eliminated bulky CSS bundles and enabled bespoke medical UI tokens (teal/cyan health themes, micro-animations, glassmorphism) without UI library bloat. |
| **Node.js + Express** | Core Backend API | Event-driven, non-blocking I/O allows thousands of concurrent WebRTC signaling connections and real-time Socket.io events with minimal CPU overhead. |
| **Socket.io** | Real-Time Engine | Provides automatic fallback to HTTP long-polling if WebSockets are blocked on corporate/hospital firewalls, and room abstractions simplify peer-to-peer signaling and patient queues. |
| **Python Flask** | Microservice | Python's standard `requests` and JSON tooling make it ideal for consuming external third-party data science and pharma APIs (OpenFDA), keeping drug processing decoupled from the main Node server. |
| **PostgreSQL (Neon)** | Relational Database | ACID transactions are mandatory for appointments and payments (preventing double-booking). Relational tables with foreign keys and compound indexes enforce strict data integrity. |
| **WebRTC** | Telemedicine Video | True peer-to-peer audio/video streaming with zero video data passing through our servers, minimizing server bandwidth costs and providing end-to-end encrypted privacy. |
| **Razorpay** | Payment Gateway | Industry standard in India with sandbox test mode, UPI/Card support, and cryptographic webhook/return signature verification. |

---

## 4. Database Schema Breakdown

The system uses **8 relational tables** designed with third normal form (3NF) principles:

1. **`users`**:
   - `id`, `name`, `email` (UNIQUE), `password_hash` (bcrypt), `role` (`'patient' | 'doctor' | 'admin'`), `created_at`.
   - Central authentication table.
2. **`doctors`**:
   - `id`, `user_id` (FK -> users), `specialty`, `qualification`, `experience`, `consultation_fee`, `availability_json`, `bio`, `city`, `location`, `latitude`, `longitude`, `rating`, `languages`, `is_verified`.
   - Contains geospatial coordinates and working hours JSON for dynamic appointment slot calculation.
3. **`patients`**:
   - `id`, `user_id` (FK -> users), `date_of_birth`, `gender`, `blood_group`, `emergency_contact`, `medical_history`.
4. **`appointments`**:
   - `id`, `patient_id` (FK), `doctor_id` (FK), `appointment_date`, `time_slot`, `type` (`'in_clinic' | 'video'`), `status` (`'pending' | 'confirmed' | 'cancelled' | 'completed'`), `payment_status` (`'pending' | 'paid' | 'failed'`).
   - Guarded against double-booking through validation before slot reservation.
5. **`payments`**:
   - `id`, `appointment_id` (FK), `razorpay_order_id`, `razorpay_payment_id`, `razorpay_signature`, `amount`, `currency`, `status`.
6. **`reviews`**:
   - `id`, `appointment_id` (FK), `patient_id` (FK), `doctor_id` (FK), `rating` (1 to 5), `comment`.
7. **`medicine_reminders`**:
   - `id`, `patient_id` (FK), `medicine_name`, `dosage`, `frequency`, `reminder_times_json`, `start_date`, `end_date`, `is_active`.
8. **`queue_entries`**:
   - `id`, `doctor_id` (FK), `patient_id` (FK), `appointment_id` (FK), `token_number`, `status` (`'waiting' | 'in_consultation' | 'completed' | 'cancelled'`), `entry_time`.

---

## 5. Deep Technical Workflows

### A. Geolocation & Haversine Proximity Search
When a user clicks **"Near Me"**, the browser's HTML5 Geolocation API retrieves `latitude` and `longitude`. The backend computes the distance to all clinics using the **Haversine formula** directly in PostgreSQL:

$$\text{distance} = 6371 \times \arccos\left(\sin(\text{lat}_1) \cdot \sin(\text{lat}_2) + \cos(\text{lat}_1) \cdot \cos(\text{lat}_2) \cdot \cos(\text{lng}_2 - \text{lng}_1)\right)$$

- **Why in SQL?** Computing spherical distance in the database engine allows ordering by distance (`ORDER BY distance ASC`) and paginating without pulling all 120+ doctors into Node.js memory.

### B. WebRTC Peer-to-Peer Video Call Signaling
1. **Join Room**: Patient and Doctor join a unique Socket.io room based on the `appointment_id`.
2. **Offer**: The caller acquires user media (`navigator.mediaDevices.getUserMedia`), creates an SDP offer (`pc.createOffer()`), sets local description, and emits `offer` through Socket.io.
3. **Answer**: The callee receives `offer`, sets remote description, generates an SDP answer (`pc.createAnswer()`), sets local description, and returns `answer` via Socket.io.
4. **ICE Candidates**: Both peers exchange ICE (Interactive Connectivity Establishment) candidates through the signaling server to determine the best direct network path (via STUN servers).
5. **Direct Media Stream**: Once connected, audio and video stream directly between the two browsers using DTLS-SRTP encryption with zero server media load.

### C. Cryptographic Razorpay Payment Verification
Payment flow follows a secure two-step handshake:
1. **Order Creation (Server-side)**:
   - Backend calls Razorpay API: `razorpay.orders.create({ amount: fee * 100, currency: 'INR' })`.
   - Returns `order_id` to the frontend checkout modal.
2. **Client Checkout**:
   - The user completes payment in the Razorpay iframe.
   - Razorpay returns `razorpay_order_id`, `razorpay_payment_id`, and `razorpay_signature`.
3. **Cryptographic Verification (Backend)**:
   - To prevent spoofed payments, the backend recreates the HMAC digest:
     $$\text{expected\_signature} = \text{HMAC-SHA256}(\text{order\_id} + "|" + \text{payment\_id}, \text{KEY\_SECRET})$$
   - If `expected_signature === razorpay_signature`, the payment is verified, the database is updated to `'paid'`, and appointment status is set to `'confirmed'`.

---

## 6. Top 20 Viva / Interview Questions & Answers

### Q1: What happens if two patients try to book the same doctor slot simultaneously?
> **Answer:** In our application, we run a check query before creating an appointment to see if an appointment with `status IN ('pending', 'confirmed')` already exists for that `doctor_id`, `appointment_date`, and `time_slot`. In a production scale system, we enforce a database UNIQUE constraint on `(doctor_id, appointment_date, time_slot)` with `WHERE status != 'cancelled'`, or use a Redis distributed lock (`SET slot_key NX EX 300`) to hold the slot for 5 minutes during checkout.

### Q2: Why did you use WebSockets instead of HTTP polling for the Queue system?
> **Answer:** HTTP polling wastes server CPU and bandwidth because clients make hundreds of redundant requests asking *"Is it my turn yet?"*. WebSockets (via Socket.io) maintain a persistent bidirectional TCP socket. The server only pushes an update when a doctor actually clicks "Call Next Patient", reducing network traffic by over 90%.

### Q3: Why is the medicine search a separate Python microservice instead of being in Node.js?
> **Answer:** Separation of concerns. Node.js manages business logic, WebRTC signaling, and user sessions. The Python microservice isolates external third-party API dependencies (OpenFDA). If OpenFDA goes down or changes its API format, the main doctor booking app never crashes. It also allows adding machine learning drug-drug interaction models in Python in the future without touching the Node.js backend.

### Q4: How is user authentication secured?
> **Answer:** Passwords are never stored in plain text; they are hashed using `bcrypt` with a work factor (salt rounds) of 10. Authentication uses JSON Web Tokens (JWT) signed with a private secret. The token payload contains `userId` and `role`. Protected endpoints run the `protect` middleware to verify the token and the `authorize(roles)` middleware for Role-Based Access Control (RBAC).

### Q5: How do you prevent SQL Injection?
> **Answer:** We never concatenate raw user inputs into SQL strings. Every database call uses PostgreSQL parameterized queries (e.g. `SELECT * FROM doctors WHERE city = $1 AND specialty = $2`, `[city, specialty]`). The database driver escapes and types all arguments, preventing SQL injection completely.

### Q6: How does the app handle slow or offline OpenFDA responses?
> **Answer:** In `python-service/run.py`, we set a strict 5-second HTTP request timeout. If the OpenFDA API times out or returns an error, the microservice catches the exception and immediately falls back to a curated local pharmaceutical cache (e.g., Paracetamol, Amoxicillin, Cetirizine), ensuring zero downtime for end users.

### Q7: Why do we need STUN/TURN servers in WebRTC?
> **Answer:** Most devices are behind NAT firewalls or routers that hide their public IP addresses. A **STUN** (Session Traversal Utilities for NAT) server tells the browser its public IP and port so it can communicate with the other peer. If both peers are on strict symmetric NAT firewalls (like cellular networks or hospital Wi-Fi) where direct peer-to-peer connection is blocked, a **TURN** (Traversal Using Relays around NAT) server acts as a fallback relay.

### Q8: What is Rate Limiting and why did you add it?
> **Answer:** We implemented `express-rate-limit` to prevent denial-of-service (DoS) and brute-force attacks. We applied strict limits on `/api/auth` (max 30 attempts per 15 minutes) to block password-guessing bots, and on `/api/payments` (max 30 requests per 15 minutes) to prevent fraudulent order flooding.

### Q9: How do appointment and medicine reminders work?
> **Answer:** We use `node-cron` running background worker jobs:
> 1. An hourly cron job queries for appointments scheduled for tomorrow (`CURRENT_DATE + INTERVAL '1 day'`) and sends reminder emails via `nodemailer`.
> 2. A minute-level cron job checks active `medicine_reminders` for the current `HH:MM` timestamp and sends automated notifications.

### Q10: How does your database handle cloud deployment on Neon?
> **Answer:** Neon is a serverless cloud PostgreSQL provider that pools connections and requires TLS/SSL encryption. We configured the `pg` connection pool to automatically detect cloud environments (`sslmode=require` or `.neon.tech`) and enable `ssl: { rejectUnauthorized: false }` while maintaining non-SSL connections for local development.

### Q11: What is the difference between In-Clinic and Telemedicine bookings in your system?
> **Answer:** In-clinic appointments generate a token number for the clinic's digital live waiting queue. Telemedicine appointments generate a secure room ID and WebRTC consultation link that unlocks when the appointment becomes active.

### Q12: Why did you use Next.js App Router instead of standard React with CRA (Create React App)?
> **Answer:** CRA is deprecated. Next.js App Router gives us Server-Side Rendering (SSR) for search engine optimization, built-in route protection via `proxy.ts`, automatic route code-splitting, and faster production builds with Turbopack.

### Q13: How does the Admin dashboard verify doctors?
> **Answer:** When doctors sign up, their `is_verified` column is `false`. The Admin dashboard calls `PATCH /api/doctors/:id/verify` to validate medical registration numbers and approve profiles before they appear in public patient searches.

### Q14: How are environment secrets protected?
> **Answer:** No real credentials, API keys, or database passwords are ever committed to Git. The project uses `.env.example` templates with clear placeholders, and a root `.gitignore` blocks `.env`, `.env.local`, and build directories. In production, variables are injected securely via Render and Vercel dashboards.

### Q15: What is Graceful Shutdown in Node.js?
> **Answer:** When hosting on platforms like Render or Docker, servers are stopped or restarted using OS signals (`SIGTERM` / `SIGINT`). Rather than abruptly killing ongoing payments or video calls, our server catches these signals, stops accepting new requests, halts background cron tasks cleanly, closes the database connection pool, and exits with code 0.

---

## 7. Scalability & Future Improvements Talking Points

If the interviewer asks: *"How would you scale this to 100,000 daily active users?"*
1. **Database Caching:** Add **Redis** to cache doctor listing queries and city lists with a 15-minute Time-To-Live (TTL).
2. **Socket.io Horizontal Scaling:** Deploy multiple Node instances behind an Application Load Balancer using `@socket.io/redis-adapter` so users on different backend instances can still video call each other.
3. **Database Read Replicas:** Use PostgreSQL read-replicas for heavy doctor search traffic, reserving the primary database instance for appointment writes.
4. **Media Relaying (SFU):** For group consultations (e.g. Patient + Doctor + Family member), replace mesh WebRTC with a Selective Forwarding Unit (SFU) like Mediasoup or LiveKit.
5. **Object Storage:** Store medical prescriptions and lab reports on AWS S3 with signed private URLs instead of storing them on local disks.
