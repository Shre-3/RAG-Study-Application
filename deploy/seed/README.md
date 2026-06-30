# Demo seed data (for public deploy)

Put pre-indexed sample files here **before** deploying to Hugging Face:

```
deploy/seed/
  uploads/          ← 1–2 sample PDFs
  chroma_db/        ← Chroma index (copy from backend/chroma_db after local upload)
```

## How to generate

1. Run the app locally with `DEMO_MODE=false`
2. Upload your sample PDF(s) at http://localhost:5173
3. Copy folders:

```bash
cp -r backend/uploads/* deploy/seed/uploads/
cp -r backend/chroma_db/* deploy/seed/chroma_db/
```

4. Commit `deploy/seed/` (only non-sensitive sample notes)

The Hugging Face Dockerfile copies this folder into the image.
