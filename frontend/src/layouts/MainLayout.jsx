import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import Sidebar from "../components/Sidebar";
import API_BASE from "../api";

export default function MainLayout() {
  const [pinned,     setPinned]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE}/api/auth/me`, { credentials: "include" })
      .then((res) => setIsLoggedIn(res.ok))
      .catch(() => setIsLoggedIn(false));
  }, []);

  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">

      {/* SIDEBAR — handles its own mobile overlay + desktop rail */}
      <Sidebar
        pinned={pinned}
        setPinned={setPinned}
        isLoggedIn={isLoggedIn}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* Spacer — only on md+ where sidebar is a fixed rail, not an overlay */}
      <div
        style={{ width: pinned ? "256px" : "68px" }}
        className="hidden md:block flex-shrink-0 transition-all duration-300"
      />

      {/* MAIN CONTENT */}
      <main className="flex-1 min-w-0 overflow-x-hidden transition-all duration-300 text-slate-800 dark:text-slate-100">

        {/* Mobile top bar — hamburger button, only visible on mobile */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-20">
          <button
            onClick={() => setMobileOpen(true)}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
            aria-label="Open menu"
          >
            <FaBars size={16} />
          </button>
          <span className="font-bold text-slate-800 dark:text-white text-lg">UxismClub</span>
        </div>

        {/* Page content */}
        <div className="px-4 py-5 sm:px-6 lg:px-8 min-w-0">
          <Outlet />
        </div>

      </main>

    </div>
  );
}
