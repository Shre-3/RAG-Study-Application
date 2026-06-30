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
docker compose up 
```

