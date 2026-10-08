# Healthcare Appointment System
A full-stack web platform where patients can find doctors, book appointments, pay online, and consult over in-browser video calls. It has separate Patient, Doctor and Admin dashboards with role-based access control.
Live Demo: [Add your Vercel link here] 🎥 Demo Video: [Add your video link here]

Note: The backend runs on a free hosting tier and may sleep when idle. The first load can take 30-60 seconds. Please wait and refresh once.

**Screenshots**
Landing Page
<!-- Add screenshot here -->
Login / Registration
<!-- Add screenshot here -->
Patient Dashboard
<!-- Add screenshot here -->
Doctor Listing and Booking
<!-- Add screenshot here -->
Payment (Razorpay)
<!-- Add screenshot here -->
Video Consultation
<!-- Add screenshot here -->
Doctor Dashboard and Queue Management
<!-- Add screenshot here -->
Medicine Reminders
<!-- Add screenshot here -->
Admin Dashboard
<!-- Add screenshot here -->

**Features**
**Main Features**
Secure Authentication: JWT login, bcrypt password hashing, role-based access control (Patient / Doctor / Admin)
Appointment Booking: search doctors by specialty, view real-time slot availability, book, reschedule and cancel
Video Consultation: peer-to-peer video calls with WebRTC and a Socket.io signaling server
Online Payments: Razorpay (test mode) with order creation, payment verification, receipts and refunds
Real-Time Queue Management: live waiting time and queue position through WebSockets
Medicine Reminders: automated SMS (Twilio) and email (Nodemailer) reminders scheduled with node-cron
Doctor Ratings and Reviews: only patients with completed appointments can review (verified badge)
Medicine Information: OpenFDA API integration through a separate Python Flask microservice

**Other Features**

Email notifications for booking, reminders and cancellations
Doctor availability calendar
Admin panel to manage doctors, patients and appointments
Responsive, modern UI with smooth animations

**Tech Stack**

Layer	Technologies
Frontend : Next.js, React, TypeScript, Tailwind CSS, Framer Motion
Backend : Node.js, Express.js, Python (Flask), REST APIs
Database : PostgreSQL
Real-Time : WebRTC, Socket.io, WebSockets
Authentication : JWT, NextAuth.js, bcrypt
Integrations : Razorpay, Twilio, Nodemailer, OpenFDA API
Tools : Git, GitHub, Postman, VS Code

**Architecture**

Next.js Frontend  ──►  Node.js + Express API  ──►  PostgreSQL
 (UI, dashboards)       (auth, booking, payments,
                         queue, Socket.io signaling)
                                  │
                                  ├──►  Python Flask Service ──► OpenFDA API
                                  ├──►  Razorpay (payments)
                                  └──►  Twilio / Nodemailer (notifications)

Doctor ◄────── WebRTC (peer-to-peer video) ──────► Patient

**Project Structure**

healthcare-appointment-system/
├── frontend/              # Next.js app (pages, components, dashboards)
├── backend/               # Node.js + Express API, Socket.io, services
├── python-service/        # Flask microservice for medicine lookup
├── database/              # schema.sql, migrations, seed data
└── phase-documentation/   # Phase-wise explanation of what was built

**Demo Login Accounts**

Role	Email	Password
Patient - patient@demo.com	Add password
Doctor - doctor@demo.com	Add password
Admin - admin@demo.com	Add password

**Security Practices**
Passwords hashed with bcrypt
JWT authentication with expiry
Role-based route protection on frontend and backend
Parameterized SQL queries to prevent SQL injection
Input validation and sanitization
CORS restricted to the frontend origin
Secrets stored in environment variables
