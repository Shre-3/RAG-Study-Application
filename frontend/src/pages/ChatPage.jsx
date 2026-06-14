import { useState } from "react";

import SourceChunks from "../components/SourceChunks";
import { askQuestion } from "../lib/api";

export default function ChatPage() {
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([]);
  const [latestSources, setLatestSources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!question.trim()) return;

    const userQuestion = question.trim();
    setMessages((current) => [...current, { role: "user", content: userQuestion }]);
    setQuestion("");
    setLoading(true);
    setError("");

    try {
      const result = await askQuestion(userQuestion);
      setMessages((current) => [...current, { role: "assistant", content: result.answer }]);
      setLatestSources(result.sources);
    } catch (chatError) {
      setError(chatError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Chat
        </p>
        <h2 className="mt-2 text-3xl font-bold">Ask questions from your notes</h2>

        <div className="mt-6 min-h-96 space-y-4 rounded-2xl bg-slate-50 p-4">
          {messages.length === 0 ? (
            <p className="text-slate-500">
              Try asking: "Explain photosynthesis in simple terms" after uploading notes.
            </p>
          ) : null}
          {messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`max-w-[85%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "ml-auto bg-brand-600 text-white"
                  : "bg-white text-slate-800 shadow-sm"
              }`}
            >
              <p className="whitespace-pre-wrap leading-7">{message.content}</p>
            </div>
          ))}
          {loading ? <p className="text-sm text-slate-500">Thinking with your notes...</p> : null}
        </div>

        <form onSubmit={handleSubmit} className="mt-4 flex gap-3">
          <input
            className="flex-1 rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-600"
            placeholder="Ask about your notes..."
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
          />
          <button
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !question.trim()}
          >
            Send
          </button>
        </form>
        {error ? (
          <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        ) : null}
      </section>

      <SourceChunks sources={latestSources} />
    </div>
  );
}
