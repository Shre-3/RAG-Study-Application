# Study Smart 🧠

Study Smart is a** dockerized full-stack** **RAG-based study application** that turns uploaded PDFs into a searchable local knowledge base. It uses **LangChain** to orchestrate Advanced RAG techniques like: **reranking**, prompt construction, and calls to **LLM APIs** so students can **ask questions, view source chunks, view re-ranked chunk scores, generate summaries, and practice with multiple-choice quizzes.**

## Stack

- Backend: FastAPI
- Frontend: React, Vite, Tailwind CSS
- RAG
- LangChain
- LLM APIs: GPT-4o-mini through OpenAI
- Embeddings: `text-embedding-3-small`
- Vector store: local Chroma
- Reranker: `cross-encoder/ms-marco-MiniLM-L-6-v2`

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

## Docker Setup 🐋


```bash
cp backend/.env.example backend/.env
# edit backend/.env and set OPENAI_API_KEY
docker compose up --build
```

Open:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:8000`


