# Resora v2.5.5

> **Major Version 2.5.5 Release** | Secure, state-of-the-art ATS-optimized resume builder featuring high-speed Groq AI (`groq/compound-mini`, `llama-3.3-70b-versatile`) document parsing, real-time chunking stage pipeline & percentage tracking, 5-second button-embedded confirmation fill, soft 3D Neumorphic card aesthetics, zero-knowledge AES-256 client-side encryption, SHA-256 in-memory LRU caching (<5ms duplicate parsing), and weekly IP rate-limiting anti-abuse protection (3 uploads / week).

---

## ⏱️ Development & Release
> **Version 2.5.5 Release** — *Updated August 2026*

---

## 🛠️ Technologies
*   **Frontend:** React 19, Vite 8, JavaScript (ES6+), Vanilla CSS
*   **AI & Parser Microservice:** Python 3, FastAPI, Uvicorn, Groq AI API (`groq/compound-mini`, `llama-3.3-70b-versatile`, `llama-3.1-8b-instant`), PyPDF, Python-Docx, Pydantic, SHA-256 Hashing
*   **Node Service:** Node.js, Express.js
*   **Database & Auth:** Supabase (PostgreSQL), Row Level Security (RLS) policies, PL/pgSQL
*   **Security & Encryption:** CryptoJS (AES-256 & SHA-256), IP Rate-Limiting Guard
*   **Third-Party Integration:** Web3Forms API (Serverless Email Submissions)

---

## 🌟 Key Features (v2.5.5)

1.  **⚡ High-Speed Groq AI Document Parser:** Automatically parses PDF, DOCX, or TXT resumes into 100% structured JSON fields (Name, Contact, Technical Skills, Experience, Education, Projects, Certifications) using multi-model AI pipelines (`groq/compound-mini`, `llama-3.3-70b-versatile`) with sub-second SHA-256 result caching (<5ms re-parsing).
2.  **📊 Real-Time Chunking & Progress Stage Pipeline:** Interactive upload modal featuring dynamic stage pipeline checkmarks (*Reading PDF*, *Chunking Text*, *AI Keyword Extraction*, *ATS Layout Generation*), filename pill badge, and a smooth live percentage counter (`0% → 99%`).
3.  **🔒 Zero-Knowledge Client-Side Encryption:** Protects user privacy by auto-encrypting resume data locally using AES-256 before syncing to cloud databases, ensuring host servers can never read personal information.
4.  **⏱️ Button-Embedded 5-Second Confirmation Grace Period:** Destructive action modals (like **Reset Resume**) feature a smooth left-to-right fill progress animation embedded directly inside the Confirm button with an instant **Cancel / Abort** guard.
5.  **🎨 Soft 3D Neumorphic Design System:** Sculpted interface aesthetics featuring 30px rounded cards, ambient light/shadow elevation, right-to-left hover underline physics, and reactive mascot mood animations.
6.  **🎯 Weighted Industry Classifier & ATS Keyword Scoring:** Auto-classifies candidate profiles across 12 target professions (*IT, Healthcare, Education, Management, Engineering, Safety, Customs, Business, Designer, Data, Sales, HR*) and audits action verbs, metrics, and ATS compatibility.
7.  **🛡️ Anti-Abuse & Rate-Limiting Safeguards:** Enforces client/server 5MB max file size limits and sliding-window IP rate limiting (3 uploads / week) with real-time remaining quota counter indicators and delayed explanation tooltips.
8.  **🚀 100% Free & Watermark-Free PDF Exports:** Unlimited access to AI diagnostics, multi-profession templates, and clean, high-resolution PDF exports with zero watermarks or subscription paywalls.

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
