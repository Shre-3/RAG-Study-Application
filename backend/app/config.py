from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    openai_api_key: str = ""
    chroma_dir: str = "./chroma_db"
    upload_dir: str = "./uploads"
    frontend_origin: str = "http://localhost:5173"
    chat_model: str = "gpt-4o-mini"
    embedding_model: str = "text-embedding-3-small"
    reranker_model: str = "cross-encoder/ms-marco-MiniLM-L-6-v2"
    collection_name: str = "study_notes"

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")


@lru_cache
def get_settings() -> Settings:
    return Settings()
