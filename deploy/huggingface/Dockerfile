# Hugging Face Space — build context is the repository root
FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV TMPDIR=/app/tmp
ENV PORT=7860
ENV CHROMA_DIR=/app/chroma_db
ENV UPLOAD_DIR=/app/uploads

WORKDIR /app

COPY backend/requirements.txt .
RUN mkdir -p /app/tmp /app/uploads /app/chroma_db && \
    pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir --index-url https://download.pytorch.org/whl/cpu torch && \
    pip install --no-cache-dir -r requirements.txt

COPY backend/app ./app
COPY deploy/seed/chroma_db/ /app/chroma_db/
COPY deploy/seed/uploads/ /app/uploads/

EXPOSE 7860

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT}"]
