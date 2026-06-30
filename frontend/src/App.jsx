import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";

import { getHealth } from "./lib/api";

const navItems = [
  { to: "/upload", label: "Upload", demoLabel: "Documents" },
  { to: "/chat", label: "Chat" },
  { to: "/quiz", label: "Quiz" },
  { to: "/summary", label: "Summary" },
];

export default function App() {
  const [demoMode, setDemoMode] = useState(false);

  useEffect(() => {
    getHealth()
      .then((data) => setDemoMode(Boolean(data.demo_mode)))
      .catch(() => setDemoMode(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      {demoMode ? (
        <div className="border-b border-brand-200 bg-brand-50 px-5 py-3 text-center text-sm text-brand-900">
          <strong>Live demo.</strong> Sample study notes are pre-loaded — explore chat,
          quiz, and summary below.
        </div>
      ) : null}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-3xl font-black uppercase tracking-[0.2em] text-brand-600">
              Study Smart
            </p>
            <p className="mt-1 text-sm text-slate-500">
              RAG study assistant with reranked retrieval
            </p>
          </div>
          <nav className="flex flex-wrap gap-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-full px-4 py-2 text-sm font-medium transition ${
                    isActive
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-brand-50"
                  }`
                }
              >
                {demoMode && item.demoLabel ? item.demoLabel : item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet context={{ demoMode }} />
      </main>
    </div>
  );
}
