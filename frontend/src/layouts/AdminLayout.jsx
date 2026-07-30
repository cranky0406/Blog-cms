import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import ProfileMenu from "../components/ProfileMenu";
import { FaBars } from "react-icons/fa";

export default function AdminLayout() {
  const [pinned,     setPinned]     = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Restore pinned state from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("sidebarPinned");
    if (saved === "true") setPinned(true);
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900 transition-colors duration-300">

      {/* Sidebar — handles its own mobile overlay */}
      <Sidebar
        pinned={pinned}
        setPinned={setPinned}
        isLoggedIn={true}
        mobileOpen={mobileOpen}
        setMobileOpen={setMobileOpen}
      />

      {/* ── Content wrapper — offset on tablet/desktop, full width on mobile ── */}
      <div
        className="
          min-h-screen flex flex-col
          transition-all duration-300
          md:pl-[68px]
        "
        style={{
          paddingLeft: undefined, // overridden by Tailwind class above on md+
        }}
      >
        {/* Override desktop padding when pinned */}
        <style>{`
          @media (min-width: 768px) {
            .admin-content-wrapper {
              padding-left: ${pinned ? "256px" : "68px"};
            }
          }
        `}</style>

        {/* ── Topbar (sticky, full width) ── */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-4 md:px-6 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700">
          {/* Hamburger — visible only on mobile */}
          <button
            onClick={() => setMobileOpen(true)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Open menu"
          >
            <FaBars size={18} />
          </button>

          {/* Brand — center on mobile, left on desktop */}
          <span className="md:hidden text-base font-bold tracking-tight text-slate-900 dark:text-white absolute left-1/2 -translate-x-1/2">
            UxismClub
          </span>

          {/* Desktop spacer so ProfileMenu stays right */}
          <div className="hidden md:block" />

          {/* Profile menu — always visible top right */}
          <ProfileMenu />
        </header>

        {/* ── Page content ── */}
        <main className="
          flex-1
          px-4 py-5
          sm:px-6 sm:py-6
          md:px-6 md:py-8
          lg:px-8 lg:py-8
        ">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
