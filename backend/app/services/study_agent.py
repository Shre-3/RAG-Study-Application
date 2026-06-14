import json
import uuid
from pathlib import Path

import fitz
from langchain_chroma import Chroma
from langchain_core.documents import Document
from langchain_core.prompts import ChatPromptTemplate
from langchain_openai import ChatOpenAI, OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.config import Settings
from app.schemas import  QuizQuestion, SourceChunk


class StudyAgent:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.embeddings = OpenAIEmbeddings(
            model=settings.embedding_model,
            api_key=settings.openai_api_key,
        )
        self.vector_store = Chroma(
            collection_name=settings.collection_name,
            embedding_function=self.embeddings,
            persist_directory=settings.chroma_dir,
        )
        self.reranker = None
        self.llm = ChatOpenAI(
            model=settings.chat_model,
            temperature=0.2,
            api_key=settings.openai_api_key,
        )
        self.splitter = RecursiveCharacterTextSplitter(
            chunk_size=900,
            chunk_overlap=160,
            separators=["\n\n", "\n", ". ", " ", ""],
        )
 

    def ingest_pdf(self, path: Path, filename: str) -> tuple[str, int]:
        document_id = str(uuid.uuid4())
        docs: list[Document] = []

        with fitz.open(path) as pdf:
            for page_index, page in enumerate(pdf, start=1):
                text = page.get_text("text").strip()
                if not text:
                    continue
                docs.append(
                    Document(
                        page_content=text,
                        metadata={
                            "document_id": document_id,
                            "source": filename,
                            "page": page_index,
                        },
                    )
                )

        return document_id, self._index_documents(docs)


    def delete_source(self, filename: str) -> int:
        matches = self.vector_store.get(where={"source": filename}, include=[])
        ids = matches.get("ids", [])
        if ids:
            self.vector_store.delete(ids=ids)
        return len(ids)

    def answer_from_notes(self, question: str) -> tuple[str, list[SourceChunk]]:
        docs, sources = self._retrieve(question)
        context = self._format_context(docs)
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "You are Study Smart, a precise study assistant. Answer only from the provided notes. "
                    "If the notes do not contain enough information, say what is missing.",
                ),
                (
                    "human",
                    "Question: {question}\n\nNotes:\n{context}\n\n"
                    "Give a clear answer and mention the most relevant source names naturally.",
                ),
            ]
        )
        response = (prompt | self.llm).invoke({"question": question, "context": context})
        return response.content, sources 

    def summarize_topic(self, topic: str) -> tuple[str, list[SourceChunk]]:
        docs, sources = self._retrieve(topic)
        context = self._format_context(docs)
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Create student-friendly structured summaries from class notes. "
                    "Return clean Markdown only. Use this structure: "
                    "## Overview, ## Key Concepts, ## Important Details, ## Quick Revision Checklist. "
                    "Use bullet points, short paragraphs, and bold key terms where useful.",
                ),
                ("human", "Topic: {topic}\n\nNotes:\n{context}"),
            ]
        )
        response = (prompt | self.llm).invoke({"topic": topic, "context": context})
        return response.content, sources

    def generate_quiz(self, topic: str, num_questions: int) -> tuple[list[QuizQuestion], list[SourceChunk]]:
        docs, sources = self._retrieve(topic, top_n=6)
        context = self._format_context(docs)
        prompt = ChatPromptTemplate.from_messages(
            [
                (
                    "system",
                    "Generate multiple-choice quiz questions from notes. "
                    "Return valid JSON only with a top-level key named questions. "
                    "Each question must have question, options, answer, and explanation fields. "
                    "Options must contain exactly four strings and answer must exactly match one option.",
                ),
                (
                    "human",
                    "Topic: {topic}\nNumber of questions: {num_questions}\n\nNotes:\n{context}",
                ),
            ]
        )
        response = (prompt | self.llm).invoke(
            {"topic": topic, "num_questions": num_questions, "context": context}
        )
        payload = self._parse_json(response.content)
        questions = [QuizQuestion(**item) for item in payload.get("questions", [])]
        return questions, sources



    def _index_documents(self, docs: list[Document]) -> int:
        chunks = self.splitter.split_documents(docs)
        ids = [str(uuid.uuid4()) for _ in chunks]
        for chunk, chunk_id in zip(chunks, ids, strict=True):
            chunk.metadata["chunk_id"] = chunk_id
        if chunks:
            self.vector_store.add_documents(chunks, ids=ids)
        return len(chunks)

    def _retrieve(
        self,
        query: str,
        candidate_k: int = 12,
        top_n: int = 4,
    ) -> tuple[list[Document], list[SourceChunk]]:
        candidates = self.vector_store.similarity_search_with_score(query, k=candidate_k)
        if not candidates:
            return [], []

        pairs = [(query, doc.page_content) for doc, _ in candidates]
        rerank_scores = self._get_reranker().predict(pairs)
        ranked = sorted(
            ((doc, float(score)) for (doc, _), score in zip(candidates, rerank_scores, strict=True)),
            key=lambda item: item[1],
            reverse=True,
        )[:top_n]

        docs = [doc for doc, _ in ranked]
        sources = [
            SourceChunk(
                id=doc.metadata.get("chunk_id", ""),
                source=doc.metadata.get("source", "Unknown"),
                page=doc.metadata.get("page"),
                text=doc.page_content,
                score=score,
            )
            for doc, score in ranked
        ]
        return docs, sources

    def _get_reranker(self):
        if self.reranker is None:
            from sentence_transformers import CrossEncoder

            self.reranker = CrossEncoder(self.settings.reranker_model)
        return self.reranker

    @staticmethod
    def _format_context(docs: list[Document]) -> str:
        if not docs:
            return "No indexed notes were retrieved."
        blocks = []
        for index, doc in enumerate(docs, start=1):
            source = doc.metadata.get("source", "Unknown")
            page = doc.metadata.get("page")
            label = f"{source}, page {page}" if page else source
            blocks.append(f"[Chunk {index}: {label}]\n{doc.page_content}")
        return "\n\n".join(blocks)

    @staticmethod
    def _parse_json(content: str) -> dict:
        cleaned = content.strip()
        if cleaned.startswith("```"):
            cleaned = cleaned.removeprefix("```json").removeprefix("```").removesuffix("```").strip()
        return json.loads(cleaned)
