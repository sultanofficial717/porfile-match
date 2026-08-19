# AI Student & Professional Opportunity Matching Platform (MVP)

A Proof of Concept / Research & Experimentation Web Application built with **Next.js App Router**, **TypeScript**, **Prisma ORM**, **Tailwind CSS**, and **Multi-Model Semantic Embeddings (Qwen, Google Gemini, Ollama)**.

---

## 🌟 Core Philosophy: Hybrid Matching

This platform does **NOT** equate raw cosine similarity to candidate eligibility. Instead, it implements a strict two-stage matching pipeline:

```text
               Student Profile
                      ↓
        [ Stage 1: Hard Eligibility Filter ]
    (GPA, Degree Discipline, Min Experience,
     Mandatory Skills & Levels, Work Auth)
             /                   \
          [PASS]                [FAIL]
            ↓                      ↓
 [ Stage 2: Normalized Doc ]   [NOT ELIGIBLE]
 (Multi-Model Embeddings)      (Score: 0% Match)
            ↓
  [ Stage 3: Transparent ]
 [ Weighted Multi-Factor ]
  40% Semantic Similarity
  20% Skill Level Match
  15% Experience Match
  10% Education Match
  10% Profile Completeness
   5% Other Factors (Certifications/Leadership)
            ↓
  [ Threshold Notification Queue (≥92%) ]
```

---

## 🚀 Key Features

1. **Student / Professional Profile (LinkedIn / Notion style)**:
   - Comprehensive structured profiles: Education, GPA, Skills with Levels (*Beginner, Intermediate, Advanced, Expert*), Experience, Projects, Certifications, Community Work, Leadership, and Languages.
2. **AI CV / Resume Parser (`/profile/import`)**:
   - Paste or upload CVs to extract structured GPA, degree, skills, and projects with **side-by-side verification** before saving.
3. **Structured Opportunity Builder (`/recruiter/opportunities/new`)**:
   - Define mandatory Stage 1 rules (Min GPA, Degree list, Min years of experience) and required vs preferred skills with proficiency levels.
4. **Explainable Matching Engine**:
   - Detailed modal breakdown showing exactly why a candidate matched (✓ highlights) or which skills/requirements are missing (○).
5. **Multi-Model Comparison Lab (`/experiments`)**:
   - Compare **Qwen vs Google Gemini vs Local Ollama** concurrently.
   - Benchmark latency (ms), embedding dimensions, and top-k rankings.
   - Export full experiment benchmarks to **CSV**.
6. **Configurable Scoring Weights & Notification Threshold (`/admin/settings`)**:
   - Dynamic weight customization in the admin dashboard without hardcoding.
7. **Simulated Email Inbox & Notification Queue (`/notifications`)**:
   - Test high-score match alerts (≥92-95%) with manual *Send Test Email* triggers to prevent spam during development.
8. **Recruiter Evaluation Feedback Collection (`/recruiter/candidates`)**:
   - Collect ground-truth recruiter ratings (*Strong Match, Good Match, Weak Match, Wrong Match*) for future model evaluation and fine-tuning.

---

## 🛠️ Tech Stack & Architecture

- **Framework**: Next.js 15 (App Router, Server Actions, API Routes)
- **Language**: TypeScript 5
- **ORM & Database**: Prisma ORM (Relational schema supporting SQLite for zero-config local testing and PostgreSQL / pgvector)
- **Styling**: Tailwind CSS + Glassmorphism + Dark/Light Theme Tokens
- **AI SDKs & APIs**:
  - `@google/generative-ai` (Gemini `text-embedding-004`)
  - Alibaba DashScope / OpenAI compatible endpoint (Qwen `text-embedding-v3`)
  - Ollama REST API (`nomic-embed-text`, `all-minilm`)
  - Deterministic Semantic Mock Provider (offline fallback)
- **Testing**: Vitest automated test suite

---

## ⚡ Quick Start (Zero Config Local Setup)

### 1. Clone & Install Dependencies

```bash
git clone https://github.com/sultanofficial717/porfile-match.git
cd porfile-match
npm install
```

### 2. Configure Environment Variables

Create `.env` based on `.env.example`:

```env
# Database (Default SQLite for instant local zero-config testing)
DATABASE_URL="file:./dev.db"

# Gemini Embeddings (Optional - works with offline demo fallback if unset)
GEMINI_API_KEY=""
GEMINI_EMBEDDING_MODEL="text-embedding-004"

# Qwen Embeddings (Optional)
QWEN_API_KEY=""
QWEN_EMBEDDING_MODEL="text-embedding-v3"
QWEN_BASE_URL="https://dashscope-intl.aliyuncs.com/compatible-mode/v1"

# Local Ollama Embeddings (Optional)
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_EMBEDDING_MODEL="nomic-embed-text"

NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3. Generate Prisma Client & Push Database Schema

```bash
npx prisma generate
npx prisma db push
```

### 4. Seed Realistic Demo Data

Populate 6+ diverse student profiles and 6+ verified opportunities across AI/ML, Full-Stack, Data Science, Cybersecurity, and Fellowships:

```bash
node scripts/seed.mjs
```

### 5. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🧪 Running Automated Tests

Run the Vitest test suite covering Hard Eligibility constraints (GPA, Degree, Exp, Mandatory Skills), vector cosine similarity mathematics, weighted scoring algorithms, and provider conformity:

```bash
npm test
```

---

## 🦙 Ollama Local Setup Guide

To run local embeddings via Ollama:

1. Install Ollama from [ollama.ai](https://ollama.ai).
2. Pull an embedding model:
   ```bash
   ollama pull nomic-embed-text
   ```
3. Ensure Ollama is running (`http://localhost:11434`).
4. In `.env`, set `OLLAMA_EMBEDDING_MODEL="nomic-embed-text"`.

---

## 🐘 PostgreSQL & pgvector Setup (Production Option)

To connect to a PostgreSQL database with pgvector:

1. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
2. Set your `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/opportunity_matcher?schema=public"
   ```
3. Run migrations:
   ```bash
   npx prisma migrate dev --name init
   ```

---

## 📊 Demo Persona Switcher

The application features an instant 1-click **Persona Switcher** in the top navigation bar:
- **Ali Rehman** (`ali@student.edu`) — Student (CS, 3.62 GPA, PyTorch, ML)
- **Sara Qureshi** (`sara@student.edu`) — Student (Software Engineering, 3.85 GPA, Next.js)
- **Bilal Chaudhry** (`bilal@student.edu`) — Low GPA student (tests Stage 1 rejection)
- **Sarah Jenkins** (`recruiter@exampleai.com`) — Recruiter (Example AI Labs)
- **Dr. Arshad Khan** (`admin@match.ai`) — Platform Administrator
