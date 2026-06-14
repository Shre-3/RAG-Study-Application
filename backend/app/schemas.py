from pydantic import BaseModel, Field


class SourceChunk(BaseModel):
    id: str
    source: str
    page: int | None = None
    text: str
    score: float | None = None


class UploadResponse(BaseModel):
    document_id: str
    filename: str
    chunks_indexed: int
    status: str = "indexed"


class UploadedPdf(BaseModel):
    filename: str


class UploadedPdfListResponse(BaseModel):
    files: list[UploadedPdf]


class DeletePdfResponse(BaseModel):
    filename: str
    deleted_chunks: int
    status: str = "deleted"


class TextUploadRequest(BaseModel):
    title: str = Field(min_length=1)
    text: str = Field(min_length=1)


class ChatRequest(BaseModel):
    question: str = Field(min_length=1)


class ChatResponse(BaseModel):
    answer: str
    sources: list[SourceChunk]


class TopicRequest(BaseModel):
    topic: str = Field(min_length=1)


class SummaryResponse(BaseModel):
    topic: str
    summary: str
    sources: list[SourceChunk]


class QuizRequest(BaseModel):
    topic: str = Field(min_length=1)
    num_questions: int = Field(default=5, ge=1, le=10)


class QuizQuestion(BaseModel):
    question: str
    options: list[str]
    answer: str
    explanation: str


class QuizResponse(BaseModel):
    topic: str
    questions: list[QuizQuestion]
    sources: list[SourceChunk]






