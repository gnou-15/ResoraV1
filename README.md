# Resora v2.5.3

> **Major Version 2.5.3 Release** | Secure, state-of-the-art ATS-optimized resume builder featuring high-speed Groq AI (`groq/compound-mini`, `llama-3.3-70b-versatile`) document parsing, real-time chunking stage pipeline & percentage tracking, 5-second button-embedded confirmation fill, soft 3D Neumorphic card aesthetics, zero-knowledge AES-256 client-side encryption, SHA-256 in-memory LRU caching (<5ms duplicate parsing), and IP rate-limiting anti-abuse protection.

---

## ⏱️ Development & Release
> **Version 2.5.3 Release** — *Updated August 2026*

---

## 🛠️ Technologies
*   **Frontend:** React 19, Vite 8, JavaScript (ES6+), Vanilla CSS
*   **AI & Parser Microservice:** Python 3, FastAPI, Uvicorn, Groq AI API (`groq/compound-mini`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), PyPDF, Python-Docx, Pydantic, SHA-256 Hashing
*   **Node Service:** Node.js, Express.js
*   **Database & Auth:** Supabase (PostgreSQL), Row Level Security (RLS) policies, PL/pgSQL
*   **Security & Encryption:** CryptoJS (AES-256 & SHA-256), IP Rate-Limiting Guard
*   **Third-Party Integration:** Web3Forms API (Serverless Email Submissions)

---

## 🌟 Key Features (v2.5.3 Complete Feature Matrix)

1.  **High-Speed Groq AI Document Parsing Pipeline:** Upload PDF, DOCX, or TXT resumes and automatically extract 100% structured JSON fields (Name, Phone, Email, Location, GitHub, LinkedIn, Technical Skills, Education, Projects, Achievements, Certifications, and Experience) powered by multi-model fallback chains (`groq/compound-mini`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`) with strict 4.0s timeouts.
2.  **Real-Time Chunking & Progress Stage Modal:** Interactive upload loader featuring dynamic stage pipeline checkmarks (*Reading PDF*, *Chunking Text*, *AI Keyword Extraction*, *ATS Layout Generation*), filename pill badge, and a smooth live percentage counter (`0% → 99%`).
3.  **SHA-256 In-Memory LRU Cache (<5ms Duplicate Parsing):** Hashes raw PDF text streams with SHA-256 and caches structured parse JSON, returning instant results (<5ms) for re-uploaded files without spending API credits.
4.  **Button-Embedded 5-Second Confirmation Grace Period:** Destructive action modals (like **Reset Resume**) feature a button-embedded left-to-right fill animation over 5 seconds with an instant **Cancel / Abort** guard.
5.  **Soft 3D Neumorphic Design System:** Sculpted cards with 30px rounded corners, dual ambient light/shadow elevation, right-to-left hover underline physics, and seamless auth card state shifts.
6.  **Instant Page Reload & Session State Isolation (Zero Flash):** Frame-0 synchronous session initialization (`getInitialCachedUser`) eliminates page load layout flashes, paired with automatic storage sanitization on logout to prevent logged-out state leaks.
7.  **Instant Upload Button Reset Event Bus:** Custom `resora-upload-cleared` event listener instantly resets the landing page upload widget button when clearing resume data (0s delay).
8.  **Responsive 1.5s Live AI Auto-Analysis Sync:** Reduced live resume edit analysis sync delay from 10s down to 1.5s, backed by a 3.0s `AbortController` timeout guard for zero UI freezing.
9.  **Anti-Abuse & Rate-Limiting Safeguards:** Enforces client/server 5MB max file size limits and IP-based rate limiting (5 uploads/min) to prevent server resource exhaustion.
10. **Weighted Industry Classifier:** Auto-detects target professions across 12 domains (*IT, Healthcare, Education, Management, Engineering, Safety, Customs, Business, Designer, Data, Sales, HR*) or gracefully falls back to the generic **"Resume Builder"** template.
11. **Zero-Knowledge Client-Side Encryption:** Auto-encrypts resume data locally using AES-256 before syncing to Supabase, ensuring host servers cannot read personal information.
12. **Instant Multi-Industry Scoring & Keywords Audit:** Evaluates resumes based on impact action verbs, quantitative metrics, and industry keywords tailored to target professions and user career tracks (Student / Professional).
13. **100% Free & Unlocked Tier:** All features—including AI diagnostics, multi-profession templates, and watermark-free PDF downloads—are completely free and unlocked.

---

## ⌨️ Keyboard Shortcuts
*   `PrintScreen` / `Win + Shift + S` — Blurs the resume preview window automatically to protect watermarked layouts from unauthorized screenshots.
*   `Esc` (Escape) — Closes active overlay dialogs and system modals instantly.

---

## 🚀 How to Run Locally

### Prerequisites
*   Node.js (v18+)
*   Python (3.9+)
*   Supabase Account
*   Groq API Key *(Free at [console.groq.com](https://console.groq.com/keys))*

### 1. Database Setup
1. Log in to your Supabase Console.
2. Open the SQL Editor and execute the schema definitions inside `database_setup.sql`.

### 2. Python Backend Installation (`backend-python`)
1. Open a terminal in `/backend-python`.
2. Create virtual environment and install dependencies:
    ```bash
    python -m venv .venv
    # Windows:
    .venv\Scripts\activate
    pip install -r requirements.txt
    ```
3. Create a `.env` file inside `/backend-python`:
    ```env
    GROQ_API_KEY=gsk_your_groq_api_key_here
    ```
4. Launch the API server:
    ```bash
    uvicorn main:app --reload --port 8000
    ```

### 3. Node.js Backend Installation (`backend-node`)
1. Open a terminal in `/backend-node`.
2. Install dependencies and start Node server:
    ```bash
    npm install
    npm run dev
    ```

### 4. Frontend Installation (`frontend`)
1. Open a terminal in `/frontend`.
2. Create `.env` based on `.env.example`:
    ```env
    VITE_SUPABASE_URL=https://your-project.supabase.co
    VITE_SUPABASE_ANON_KEY=your-anon-public-key
    VITE_WEB3FORMS_ACCESS_KEY=your-web3forms-key
    VITE_PYTHON_BACKEND_URL=http://localhost:8000
    ```
3. Install dependencies and start Vite dev server:
    ```bash
    npm install
    npm run dev
    ```

---

## 🌐 Production Deployment Guide

*   **Frontend (Vercel)**:
    Set environment variables in Vercel settings: `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_PYTHON_BACKEND_URL` pointing to your deployed Python backend (e.g. `https://resorav1-production.up.railway.app`).
*   **Python Backend (Railway / Render)**:
    Root Directory: `backend-python`  
    Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`  
    Environment Variable: `GROQ_API_KEY`

---

## 🍿 Video
https://github.com/user-attachments/assets/e39611a4-899b-480a-aa76-3e0512889d87
