from functools import lru_cache
from pathlib import Path
from shutil import copyfileobj

from fastapi import Depends, FastAPI, File, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from app.config import Settings, get_settings
from app.schemas import (
    ChatRequest,
    ChatResponse,
    DeletePdfResponse,
    QuizRequest,
    QuizResponse,
    SummaryResponse,
    TextUploadRequest,
    TopicRequest,
    UploadedPdf,
    UploadedPdfListResponse,
    UploadResponse,
)
from app.services.study_agent import StudyAgent


app = FastAPI(title="Study Smart API", version="0.1.0")


@lru_cache
def get_agent() -> StudyAgent:
    config = get_settings()
    if not config.openai_api_key:
        raise HTTPException(status_code=500, detail="OPENAI_API_KEY is not configured.")
    return StudyAgent(config)


settings = get_settings()
allowed_origins = {
    settings.frontend_origin,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
}
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(allowed_origins),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(config: Settings = Depends(get_settings)) -> dict[str, str | bool]:
    return {"status": "ok", "demo_mode": config.demo_mode}


def _ensure_writes_allowed(config: Settings) -> None:
    if config.demo_mode:
        raise HTTPException(
            status_code=403,
            detail="Uploads and deletions are disabled on the public demo.",
        )


@app.get("/documents/pdfs", response_model=UploadedPdfListResponse)
def list_uploaded_pdfs(config: Settings = Depends(get_settings)) -> UploadedPdfListResponse:
    upload_dir = Path(config.upload_dir)
    if not upload_dir.exists():
        return UploadedPdfListResponse(files=[])

    files = [
        UploadedPdf(filename=path.name)
        for path in sorted(upload_dir.glob("*.pdf"), key=lambda item: item.stat().st_mtime, reverse=True)
    ]
    return UploadedPdfListResponse(files=files)


@app.delete("/documents/pdfs/{filename}", response_model=DeletePdfResponse)
def delete_uploaded_pdf(
    filename: str,
    config: Settings = Depends(get_settings),
    agent: StudyAgent = Depends(get_agent),
) -> DeletePdfResponse:
    _ensure_writes_allowed(config)
    if Path(filename).name != filename or not filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Invalid PDF filename.")

    upload_dir = Path(config.upload_dir)
    target = upload_dir / filename
    if not target.exists():
        raise HTTPException(status_code=404, detail="PDF not found.")

    target.unlink()
    deleted_chunks = agent.delete_source(filename)
    return DeletePdfResponse(filename=filename, deleted_chunks=deleted_chunks)


@app.post("/upload/pdf", response_model=UploadResponse)
def upload_pdf(
    file: UploadFile = File(...),
    config: Settings = Depends(get_settings),
    agent: StudyAgent = Depends(get_agent),
) -> UploadResponse:
    _ensure_writes_allowed(config)
    if file.content_type != "application/pdf":
        raise HTTPException(status_code=400, detail="Only PDF uploads are supported.")

    upload_dir = Path(config.upload_dir)
    upload_dir.mkdir(parents=True, exist_ok=True)
    destination = upload_dir / file.filename

    with destination.open("wb") as buffer:
        copyfileobj(file.file, buffer)

    document_id, chunk_count = agent.ingest_pdf(destination, file.filename)
    return UploadResponse(
        document_id=document_id,
        filename=file.filename,
        chunks_indexed=chunk_count,
    )




@app.post("/chat", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    agent: StudyAgent = Depends(get_agent),
) -> ChatResponse:
    answer, sources = agent.answer_from_notes(request.question)
    return ChatResponse(answer=answer, sources=sources)


@app.post("/summary", response_model=SummaryResponse)
def summary(
    request: TopicRequest,
    agent: StudyAgent = Depends(get_agent),
) -> SummaryResponse:
    answer, sources = agent.summarize_topic(request.topic)
    return SummaryResponse(topic=request.topic, summary=answer, sources=sources)


@app.post("/quiz", response_model=QuizResponse)
def quiz(
    request: QuizRequest,
    agent: StudyAgent = Depends(get_agent),
) -> QuizResponse:
    try:
        questions, sources = agent.generate_quiz(request.topic, request.num_questions)
    except Exception as exc:
        raise HTTPException(status_code=502, detail="Quiz generation returned invalid output.") from exc
    return QuizResponse(topic=request.topic, questions=questions, sources=sources)


