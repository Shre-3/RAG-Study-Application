import { NavLink, Outlet } from "react-router-dom";

const navItems = [
  { to: "/upload", label: "Upload" },
  { to: "/chat", label: "Chat" },
  { to: "/quiz", label: "Quiz" },
  { to: "/summary", label: "Summary" },
];

export default function App() {
  return (
    <div className="min-h-screen bg-slate-100 text-ink">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-3xl font-black uppercase tracking-[0.2em] text-brand-600">
              Study Smart
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
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Outlet />
      </main>
    </div>
  );
}
