import { useEffect, useState } from "react";

import { deleteUploadedPdf, listUploadedPdfs, uploadPdf } from "../lib/api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [uploadedPdfs, setUploadedPdfs] = useState([]);
  const [status, setStatus] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingFiles, setLoadingFiles] = useState(true);
  const [deletingFilename, setDeletingFilename] = useState("");

  useEffect(() => {
    refreshUploadedPdfs();
  }, []);

  async function handlePdfSubmit(event) {
    event.preventDefault();
    if (!file) return;
    await runUpload(() => uploadPdf(file));
  }

  async function runUpload(action) {
    setLoading(true);
    setError("");
    setStatus(null);
    try {
      const result = await action();
      setStatus(result);
      setFile(null);
      await refreshUploadedPdfs();
    } catch (uploadError) {
      setError(uploadError.message);
    } finally {
      setLoading(false);
    }
  }

  async function refreshUploadedPdfs() {
    setLoadingFiles(true);
    try {
      const result = await listUploadedPdfs();
      setUploadedPdfs(result.files);
    } catch (filesError) {
      setError(filesError.message);
    } finally {
      setLoadingFiles(false);
    }
  }

  async function handleDeletePdf(filename) {
    const confirmed = window.confirm(
      `Delete ${filename}? This also removes its indexed chunks.`,
    );
    if (!confirmed) return;

    setDeletingFilename(filename);
    setError("");
    setStatus(null);
    try {
      const result = await deleteUploadedPdf(filename);
      setStatus(result);
      await refreshUploadedPdfs();
    } catch (deleteError) {
      setError(deleteError.message);
    } finally {
      setDeletingFilename("");
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Ingestion
        </p>
        <h2 className="mt-2 text-3xl font-bold">Upload your study material</h2>

        <form onSubmit={handlePdfSubmit} className="mt-6 space-y-4">
          <label
            className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center transition hover:border-brand-600 hover:bg-brand-50"
            onDrop={(event) => {
              event.preventDefault();
              setFile(event.dataTransfer.files[0]);
            }}
            onDragOver={(event) => event.preventDefault()}
          >
            <span className="text-lg font-semibold">
              {file ? file.name : "Drag and drop a PDF here"}
            </span>
            <span className="mt-2 text-sm text-slate-500">
              or click to choose a file
            </span>
            <input
              className="sr-only"
              type="file"
              accept="application/pdf"
              onChange={(event) => setFile(event.target.files[0])}
            />
          </label>
          <button
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!file || loading}
          >
            {loading ? "Indexing..." : "Upload PDF"}
          </button>
        </form>

        {status ? (
          <div className="mt-5 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
            {status.status === "deleted"
              ? `Deleted ${status.filename} and ${status.deleted_chunks} indexed chunks.`
              : `Indexed ${status.chunks_indexed} chunks from ${status.filename}.`}
          </div>
        ) : null}
        {error ? (
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-xl font-bold">Uploaded PDFs</h3>
          <button
            className="rounded-lg bg-slate-100 px-3 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-200"
            onClick={refreshUploadedPdfs}
            disabled={loadingFiles}
          >
            Refresh
          </button>
        </div>

        {loadingFiles ? (
          <p className="mt-5 text-sm text-slate-500">
            Loading uploaded PDFs...
          </p>
        ) : null}

        {!loadingFiles && uploadedPdfs.length === 0 ? (
          <div className="mt-5 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center text-slate-500">
            No PDFs uploaded yet.
          </div>
        ) : null}

        {uploadedPdfs.length > 0 ? (
          <ul className="mt-5 space-y-3">
            {uploadedPdfs.map((pdf) => (
              <li
                key={pdf.filename}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3"
              >
                <span className="rounded-lg bg-brand-100 px-2 py-1 text-xs font-bold text-brand-700">
                  PDF
                </span>
                <span className="flex-1 break-all text-sm font-medium text-slate-800">
                  {pdf.filename}
                </span>
                <button
                  className="rounded-lg bg-red-50 px-3 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                  onClick={() => handleDeletePdf(pdf.filename)}
                  disabled={deletingFilename === pdf.filename}
                >
                  {deletingFilename === pdf.filename ? "Deleting..." : "Delete"}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </section>
    </div>
  );
}
