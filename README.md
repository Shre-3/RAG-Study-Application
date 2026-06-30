# Study Smart

A full-stack RAG app for studying from PDF notes. Upload PDFs, ask questions with source citations, generate summaries, and take quizzes.

**Stack:** FastAPI · React · LangChain · Chroma · OpenAI · Docker

## Live demo

| | URL |
|--|-----|
| **App** | _Render URL — add after deploy_ |
| **API** | https://shre03-studysmart.hf.space/health |

The live site runs in read-only demo mode (`DEMO_MODE=true`) with pre-indexed sample notes. Clone and run locally for uploads.

## RAG pipeline

| Stage | Detail |
|-------|--------|
| Chunking | 900 chars, 160 overlap |
| Embeddings | `text-embedding-3-small` |
| Retrieval | Top 12 chunks from Chroma |
| Reranking | `cross-encoder/ms-marco-MiniLM-L-6-v2` → top 4 |
| LLM | `gpt-4o-mini`, temperature 0.2 |

## Run locally

### Docker (easiest)

```bash
cp backend/.env.example backend/.env   # add OPENAI_API_KEY
docker compose up --build -d
```

- App: http://localhost:5173
- API: http://localhost:8000/health

```bash
docker compose down          # stop
docker compose logs -f       # logs
docker compose up --build -d # after code changes
```

First build takes ~10–15 min (ML deps). Later starts are quick.

### Without Docker

**Backend:**
```bash
cd backend
python -m venv .venv
source .venv/Scripts/activate   # Windows Git Bash
pip install -r requirements.txt
uvicorn app.main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Copy `backend/.env.example` → `backend/.env` and set `OPENAI_API_KEY`.

## Deploy

Backend is on [Hugging Face Spaces](https://huggingface.co/spaces/Shre03/StudySmart). Frontend on Render:

1. [render.com](https://render.com) → **New Static Site** → this repo
2. Root directory: `frontend`
3. Build: `npm install && npm run build`
4. Publish directory: `dist`
5. Region: **Frankfurt** (optional, faster in EU)
6. Env: `VITE_API_BASE_URL=https://shre03-studysmart.hf.space`
7. After deploy, set HF secret `FRONTEND_ORIGIN` to your Render URL

`deploy/huggingface/` holds the Dockerfile used for the HF Space (pushed to a separate HF git repo).
