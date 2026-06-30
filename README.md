# RAG Study Application: Study Smart 🧠

Study Smart is a **dockerized full-stack** **RAG-based study application** that turns uploaded PDFs into a searchable local knowledge base. It uses **LangChain** to orchestrate Advanced RAG techniques like: **reranking**, prompt construction, and calls to **LLM APIs** so students can **ask questions, view source chunks, view re-ranked chunk scores, generate summaries, and practice with multiple-choice quizzes.**

<p align="center">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" alt="React" />
  <img src="https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="Tailwind CSS" />
  <img src="https://img.shields.io/badge/LangChain-1C3C3C?style=for-the-badge&logo=langchain&logoColor=white" alt="LangChain" />
  <img src="https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white" alt="OpenAI" />
  <img src="https://img.shields.io/badge/Chroma-000000?style=for-the-badge&logo=chromadb&logoColor=white" alt="Chroma" />
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker" />
  <img src="https://img.shields.io/badge/Hugging_Face-FFD21E?style=for-the-badge&logo=huggingface&logoColor=black" alt="Hugging Face" />
</p>

## Live demo
https://rag-study-application.onrender.com

## RAG pipeline


| Stage                | Value                                                                                           |
| -------------------- | ----------------------------------------------------------------------------------------------- |
| **Chunking**         | **900** characters & overlap of: **160** characters (~18% overlap)                              |
| **Embedding**        | Model: `text-embedding-3-small` Vector dimensions: **1536**                                     |
| **Vector retrieval** | Chunks returned: **12** nearest candidate chunks                                                |
| **Reranking**        | Cross-encoder: `cross-encoder/ms-marco-MiniLM-L-6-v2` Output: **top 4** results after reranking |
| **LLM**              | Model: `gpt-4o-mini`, `temperature`: **0.2**                                                    |
| **Storage**          | Chroma DB                                                                                       |


## Stack

- **Backend:** FastAPI
- **Frontend:** React, Vite, Tailwind CSS
- **RAG:** LangChain (`RecursiveCharacterTextSplitter`, `Chroma`, `ChatPromptTemplate`)
- **LLM APIs:**  GPT-4o-mini through OpenAI
- **Embeddings:** `text-embedding-3-small`
- **Vector store:** local Chroma
- **Reranker:** `cross-encoder/ms-marco-MiniLM-L-6-v2` (Hugging Face `sentence-transformers`)

## Backend Setup

```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Create `backend/.env` from `backend/.env.example` and set `OPENAI_API_KEY`.

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

## Docker Setup 🐋 (recommended)

**Prerequisites:** [Docker Desktop](https://www.docker.com/products/docker-desktop/) with `docker compose` (Compose V2).

### One-time setup

```bash
cd "Study Smart"
cp backend/.env.example backend/.env
# Edit backend/.env and set OPENAI_API_KEY
```

### Start (every time)

**Windows (PowerShell):**
```powershell
.\docker.ps1 up
```

**Git Bash / Mac / Linux:**
```bash
chmod +x docker.sh
./docker.sh up
```

**Or plain Docker Compose (works everywhere):**
```bash
docker compose up --build -d
```

Open:

- **App:** http://localhost:5173
- **API health:** http://localhost:8000/health

Data (PDFs, Chroma index, Hugging Face model cache) is stored in Docker volumes / `backend/chroma_db` and survives restarts.

### Day-to-day commands

| Action | Command |
|--------|---------|
| **Start in background** | `docker compose up -d` |
| **Stop** | `docker compose down` |
| **View logs** | `docker compose logs -f` |
| **Check status** | `docker compose ps` |
| **After code or dependency changes** | `docker compose up --build -d` |
| **Full clean rebuild** (if build acts up) | `docker compose down` then `docker compose build --no-cache` then `docker compose up -d` |

Helper scripts wrap the same commands: `.\docker.ps1 down`, `.\docker.ps1 logs`, `.\docker.ps1 rebuild`, `.\docker.ps1 status` (or `./docker.sh …`).

### Notes

- First backend build can take **10–15 minutes** (ML dependencies). Later starts are fast.
- The backend image uses **CPU-only PyTorch** so builds stay reliable on Windows/Mac without CUDA.
- Containers use `restart: unless-stopped` — they come back after Docker Desktop or PC reboot when you run `docker compose up -d` once.

## Public demo mode

For portfolio deployments, set on the **backend**:

```env
DEMO_MODE=true
```

This disables public uploads/deletes while keeping chat, quiz, and summary live. Pre-index 1–2 **non-sensitive sample PDFs** (e.g. public course notes you authored) before deploying.

## Deployment (no credit card)

**Stack:** Hugging Face Space (backend) + Vercel (frontend)

### Before you deploy

1. **Push code** to GitHub.
2. **Seed demo data** (so chat works on the live site):
   - Run locally, upload 1–2 sample PDFs
   - Copy indexed data into `deploy/seed/` (see `deploy/seed/README.md`)
   - Commit `deploy/seed/uploads/` and `deploy/seed/chroma_db/`

### Part 1 — Backend (Hugging Face Space)

1. Go to [huggingface.co/new-space](https://huggingface.co/new-space)
2. **Space name:** `study-smart-api` (or similar)
3. **SDK:** Docker
4. **Hardware:** CPU basic (free)
5. Create the Space
6. **Settings → Repository** → link your GitHub repo
7. Set **Space directory** / Dockerfile path to `deploy/huggingface` (if prompted)
8. **Settings → Variables and secrets** → add:

| Secret | Value |
|--------|--------|
| `OPENAI_API_KEY` | your key |
| `DEMO_MODE` | `true` |
| `FRONTEND_ORIGIN` | `https://YOUR-APP.vercel.app` (set after Part 2) |

9. Wait for build (~15 min first time)
10. Test: `https://YOUR-USERNAME-study-smart-api.hf.space/health`  
    → `{"status":"ok","demo_mode":true}`

### Part 2 — Frontend (Vercel)

1. Go to [vercel.com](https://vercel.com) → **Add New Project**
2. Import your GitHub repo
3. **Root Directory:** `frontend`
4. **Framework:** Vite
5. **Environment variable:**

| Name | Value |
|------|--------|
| `VITE_API_BASE_URL` | `https://YOUR-USERNAME-study-smart-api.hf.space` |

6. Deploy → copy your URL, e.g. `https://study-smart.vercel.app`

### Part 3 — Connect them

1. Back on Hugging Face → update secret `FRONTEND_ORIGIN` to your Vercel URL
2. Restart / rebuild the Space if needed
3. Update this README **Live demo** table with your real URLs
4. Open the Vercel URL → you should see the **Live demo** banner, no upload button

### Deploy checklist

- [ ] Sample PDFs in `deploy/seed/`
- [ ] `DEMO_MODE=true` on HF only (keep `false` in local `.env`)
- [ ] `VITE_API_BASE_URL` on Vercel
- [ ] `FRONTEND_ORIGIN` on HF matches Vercel URL
- [ ] `/health` shows `demo_mode: true`
- [ ] Chat works on live site
