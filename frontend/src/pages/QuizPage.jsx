import { useState } from "react";

import SourceChunks from "../components/SourceChunks";
import { generateQuiz } from "../lib/api";

export default function QuizPage() {
  const [topic, setTopic] = useState("");
  const [numQuestions, setNumQuestions] = useState(5);
  const [questions, setQuestions] = useState([]);
  const [sources, setSources] = useState([]);
  const [revealed, setRevealed] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setError("");
    setQuestions([]);
    setSources([]);
    setRevealed({});

    try {
      const result = await generateQuiz(topic, Number(numQuestions));
      setQuestions(result.questions);
      setSources(result.sources);
    } catch (quizError) {
      setError(quizError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_0.85fr]">
      <section className="rounded-3xl bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-brand-600">
          Quiz
        </p>
        <h2 className="mt-2 text-3xl font-bold">Practice with generated MCQs</h2>

        <form onSubmit={handleSubmit} className="mt-6 grid gap-3 md:grid-cols-[1fr_140px_auto]">
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-600"
            placeholder="Topic, e.g. cell division"
            value={topic}
            onChange={(event) => setTopic(event.target.value)}
          />
          <input
            className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-brand-600"
            type="number"
            min="1"
            max="10"
            value={numQuestions}
            onChange={(event) => setNumQuestions(event.target.value)}
          />
          <button
            className="rounded-xl bg-brand-600 px-5 py-3 font-semibold text-white transition hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading || !topic.trim()}
          >
            Generate
          </button>
        </form>

        {loading ? <p className="mt-6 text-sm text-slate-500">Creating quiz...</p> : null}
        <div className="mt-6 space-y-4">
          {questions.map((item, index) => (
            <article key={`${item.question}-${index}`} className="rounded-2xl bg-slate-50 p-5">
              <h3 className="font-semibold">
                {index + 1}. {item.question}
              </h3>
              <div className="mt-4 grid gap-2">
                {item.options.map((option) => (
                  <div key={option} className="rounded-xl border border-slate-200 bg-white px-4 py-3">
                    {option}
                  </div>
                ))}
              </div>
              <button
                className="mt-4 rounded-lg bg-ink px-4 py-2 text-sm font-semibold text-white"
                onClick={() =>
                  setRevealed((current) => ({ ...current, [index]: !current[index] }))
                }
              >
                {revealed[index] ? "Hide answer" : "Reveal answer"}
              </button>
              {revealed[index] ? (
                <div className="mt-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-900">
                  <p className="font-semibold">Answer: {item.answer}</p>
                  <p className="mt-2">{item.explanation}</p>
                </div>
              ) : null}
            </article>
          ))}
        </div>
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
