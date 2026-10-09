# Free Cloud Deployment Guide — HealthEase

This guide walks you through deploying the complete HealthEase system **100% free of charge** using **Neon** (PostgreSQL), **Render** (Backend & Python Microservice), and **Vercel** (Next.js Frontend).

---

## 📋 Architecture & Hosting Overview

| Component | Service | Free Tier Limits | Target URL Example |
| :--- | :--- | :--- | :--- |
| **Database** | [Neon.tech](https://neon.tech/) | 0.5 GB storage, serverless compute | `postgresql://...@ep-pooler.neon.tech/neondb` |
| **Backend API** | [Render.com](https://render.com/) | 750 free hours/month, auto-sleep on idle | `https://healthease-backend.onrender.com` |
| **Python Service** | [Render.com](https://render.com/) | 750 free hours/month | `https://healthease-medicine.onrender.com` |
| **Frontend UI** | [Vercel.com](https://vercel.com/) | Unlimited bandwidth for personal projects | `https://healthease.vercel.app` |

---

## STEP 1: Deploy Database on Neon (Free Cloud PostgreSQL)

1. Go to **[https://neon.tech/](https://neon.tech/)** and sign up with GitHub or Google.
2. Click **Create a project**.
   - Project name: `healthease-db`
   - Postgres version: `16`
   - Region: Choose the closest region (e.g., `AWS Asia Pacific (Singapore)` or `US East`).
3. Once created, you will see your **Connection Details** dashboard:
   - Select **Pooled connection** checkbox (Recommended for serverless).
   - Copy the connection string. It looks like:
     ```
     postgresql://neondb_owner:npg_xxxxxx@ep-cool-snowflake-a5xxxxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require
     ```
   - **Save this connection string** — you will use it as `DATABASE_URL` in Step 2.
4. **Seed the database with schema and 120+ doctors**:
   - In your Neon project sidebar, click on **SQL Editor**.
   - Open [database/schema.sql](database/schema.sql) on your computer, copy all text, paste it into Neon SQL Editor, and click **Run**.
   - Next, open [database/seeds/doctors_data.sql](database/seeds/doctors_data.sql), copy all text, paste it into Neon SQL Editor, and click **Run**.
   - Verify by running: `SELECT COUNT(*) FROM doctors;` (Should return `129`).

---

## STEP 2: Deploy Python Medicine Microservice on Render

1. Go to **[https://render.com/](https://render.com/)** and sign up with GitHub.
2. Click **New +** -> **Web Service**.
3. Select **Build and deploy from a Git repository**, and choose your repository: `rohangawande2303/healthcare-appointment-system`.
4. Configure the service settings:
   - **Name:** `healthease-medicine-api`
   - **Root Directory:** `python-service`
   - **Environment:** `Python 3`
   - **Region:** Same region as your database if possible
   - **Branch:** `main`
   - **Build Command:** `pip install -r requirements.txt`
   - **Start Command:** `gunicorn run:app`
   - **Instance Type:** `Free`
5. Click **Create Web Service**.
6. When deployment finishes, copy your Python service URL (e.g. `https://healthease-medicine-api.onrender.com`).
   - Test it in your browser: `https://healthease-medicine-api.onrender.com/health` (should return `{"status":"healthy"}`).

---

## STEP 3: Deploy Node.js Express Backend on Render

1. In Render dashboard, click **New +** -> **Web Service**.
2. Select your repository: `rohangawande2303/healthcare-appointment-system`.
3. Configure the settings:
   - **Name:** `healthease-backend-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Branch:** `main`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Instance Type:** `Free`
4. Scroll down to **Environment Variables** and add the following keys:

| Key | Value | Description |
| :--- | :--- | :--- |
| `NODE_ENV` | `production` | Enables production optimizations |
| `PORT` | `5000` | Render injects this or defaults |
| `DATABASE_URL` | *(Paste your Neon Pooled Connection String from Step 1)* | Cloud DB connection |
| `JWT_SECRET` | *(Generate a 32+ character random string)* | JWT Token encryption key |
| `JWT_EXPIRE` | `7d` | Token lifetime |
| `PYTHON_SERVICE_URL` | `https://healthease-medicine-api.onrender.com` | Your Render Python URL from Step 2 |
| `FRONTEND_URL` | `https://your-app.vercel.app` *(update after Step 4)* | Allowed CORS origin |
| `RAZORPAY_KEY_ID` | `rzp_test_placeholder_key` *(or your test key)* | Razorpay Key ID |
| `RAZORPAY_KEY_SECRET` | `placeholder_secret` *(or your test secret)* | Razorpay Secret |

5. Click **Create Web Service**.
6. When deployed, copy the backend URL (e.g. `https://healthease-backend-api.onrender.com`).
   - Test in your browser: `https://healthease-backend-api.onrender.com/api/health`
   - Should return HTTP 200 with `{"status":"ok","services":{"database":"connected","python_service":"connected"}}`.

---

## STEP 4: Deploy Next.js Frontend on Vercel

1. Go to **[https://vercel.com/](https://vercel.com/)** and sign in with GitHub.
2. Click **Add New...** -> **Project**.
3. Import your repository: `healthcare-appointment-system`.
4. Configure Project:
   - **Framework Preset:** `Next.js`
   - **Root Directory:** Click **Edit** and select `frontend` (Important!).
5. Expand **Environment Variables** and add:

| Key | Value | Notes |
| :--- | :--- | :--- |
| `NEXT_PUBLIC_API_URL` | `https://healthease-backend-api.onrender.com/api` | Note the `/api` at the end |
| `NEXT_PUBLIC_SOCKET_URL` | `https://healthease-backend-api.onrender.com` | Base URL without `/api` |
| `NEXTAUTH_SECRET` | *(Same random string used for JWT_SECRET)* | Session cookie encryption |
| `NEXTAUTH_URL` | `https://your-vercel-domain.vercel.app` | Your Vercel app domain |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | `rzp_test_placeholder_key` | Public Razorpay key |

6. Click **Deploy**.
7. Vercel will build and publish your Next.js frontend in about 1-2 minutes!
8. Copy your live Vercel domain (e.g. `https://healthease-rohan.vercel.app`).
9. **Final step:** Go back to Render -> `healthease-backend-api` -> **Environment** -> Update `FRONTEND_URL` to your live Vercel domain so CORS matches.

---

## 🧪 Post-Deployment Verification Checklist

1. [ ] **Homepage loads:** Open your Vercel URL.
2. [ ] **Login works:** Login as `patient.john@gmail.com` with `Password123!`.
3. [ ] **Doctor Catalog:** Check that 120+ doctors appear with city filters and location details.
4. [ ] **Doctor Profile & Slots:** Open any doctor's profile; verify available time slots load.
5. [ ] **Medicine Search:** Go to medicine search and query `paracetamol` (tests Python microservice).
6. [ ] **Admin Dashboard:** Login as `admin@healthcare.com` with `Password123!` to test doctor verification.
