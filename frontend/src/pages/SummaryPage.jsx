import { useState } from "react";
import ReactMarkdown from "react-markdown";

import SourceChunks from "../components/SourceChunks";
import { summarizeTopic } from "../lib/api";

export default function SummaryPage() {
  const [topic, setTopic] = useState("");
  const [summary, setSummary] = useState("");
  const [sources, setSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setSummary("");
    setSources([]);

    try {
      const result = await summarizeTopic(topic);
      setSummary(result.summary);
      setSources(result.sources);
    } catch (summaryError) {
      setError(summaryError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Summary
        </p>
        <h2 className="mt-2 text-3xl font-bold">
          Generate a structured topic summary
        </h2>

        <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-600"
            placeholder="Topic, e.g. Newton's laws"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          <button
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !topic.trim()}
          >
            Summarize
          </button>
        </form>

        {loading ? (
          <p className="mt-6 text-sm text-slate-500">Building summary...</p>
        ) : null}
        {summary ? (
          <article className="prose-lite mt-6 rounded-2xl bg-slate-50 p-5 leading-7">
            <ReactMarkdown>{summary}</ReactMarkdown>
          </article>
        ) : null}
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <SourceChunks sources={sources} />
    </div>
  );
}
