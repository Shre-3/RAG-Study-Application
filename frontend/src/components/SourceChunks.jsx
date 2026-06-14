export default function SourceChunks({ sources = [] }) {
  if (!sources.length) {
    return null;
  }

  return (
    <section className="mt-6 rounded-2xl border border-slate-200 bg-[#363737] p-6 shadow-sm">
      <h3 className="text-lg font-bold text-white">Source chunks used</h3>
      <div className="mt-5 space-y-5">
        {sources.map((source, index) => (
          <article
            key={source.id || index}
            className="rounded-2xl border border-[#4b4c4c] bg-[#242424] p-5"
          >
            <div className="flex flex-wrap items-center gap-3 text-sm font-semibold text-white">
              <span className="break-all">{source.source}</span>
              {source.page ? <span>Page {source.page}</span> : null}
              {typeof source.score === "number" ? (
                <span className="rounded-full bg-brand-100 px-3 py-1 text-xs text-white">
                  Rerank {source.score.toFixed(2)}
                </span>
              ) : null}
            </div>
            <p className="mt-4 line-clamp-6 whitespace-pre-wrap text-sm leading-7 text-white">
              {source.text}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
