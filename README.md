# Resora v2.0.0

> **Major Version 2.0.0 Release** | Secure, ATS-optimized resume builder featuring Groq AI (Llama-3.3-70B) document parsing, rule-based heuristic ATS analytics & benchmarking across 12 target professions, zero-knowledge AES-256 client-side encryption, anonymous guest mode, and zero-watermark PDF exports.

---

## ⏱️ Development & Release
> **Version 2.0.0 Release** — *Updated July 2026*

---

## 🛠️ Technologies
*   **Frontend:** React 19, Vite 8, JavaScript (ES6+), Vanilla CSS
*   **AI & Parser Microservice:** Python 3, FastAPI, Uvicorn, Groq AI API (`llama-3.3-70b-versatile`), PyPDF, Python-Docx, Pydantic
*   **Node Service:** Node.js, Express.js
*   **Database & Auth:** Supabase (PostgreSQL), Row Level Security (RLS) policies, PL/pgSQL
*   **Security & Encryption:** CryptoJS (AES-256 & SHA-256)
*   **Third-Party Integration:** Web3Forms API (Serverless Email Submissions)

---

## 🌟 Key Features (v2.0.0)

1.  **Groq AI Document Parser (Llama-3.3-70B):** Upload PDF, DOCX, or TXT resumes and automatically extract 100% structured JSON fields (Name, Phone, Email, Location, GitHub, LinkedIn, Technical Skills, Education, Projects, Achievements, Certifications, and Experience) in ~400ms.
2.  **Weighted Industry Classifier:** Auto-detects target professions across 12 domains (*IT, Healthcare, Education, Management, Engineering, Safety, Customs, Business, Designer, Data, Sales, HR*) or gracefully falls back to the generic **"Resume Builder"** template.
3.  **Anonymous Guest Mode & Privacy Lifecycle:** Allows users to build and edit resumes without logging in. Guest edits automatically purge on browser close unless saved into an authenticated account, supported by a discreet bottom warning prompt bubble.
4.  **Creative Mascot Floating Upload Widget:** Animated bottom-right mascot badge widget featuring Resora's signature mascot emblem, dynamic pulse rings, and direct navigation to uploaded resumes.
5.  **Zero-Knowledge Client-Side Encryption:** Auto-encrypts resume data locally using AES-256 before syncing to Supabase, ensuring host servers cannot read personal information.
6.  **Instant Multi-Industry Scoring & Keywords Audit:** Evaluates resumes based on impact action verbs, quantitative metrics, and industry keywords tailored to target professions and user career tracks (Student / Professional).
7.  **Anti-Screenshot & Privacy Protection:** System visibility and focus listeners (`PrintScreen`, `blur`, `visibilitychange`) automatically obscure the resume canvas to prevent unauthorized layout grabs.
8.  **100% Free & Unlocked Tier:** All features—including AI diagnostics, multi-profession templates, and watermark-free downloads—are completely free and unlocked.

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
2. Open the SQL Editor and execute the schema definitions inside [database_setup.sql](file:///c:/Users/mapan/Documents/School%20Things/Practice%20Webs/ThirdWeb/random-web/backend-python/database_setup.sql).

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
