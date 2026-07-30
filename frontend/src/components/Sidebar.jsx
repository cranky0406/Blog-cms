import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  FaHome, FaPen, FaFolder, FaFileAlt,
  FaGlobe, FaSignOutAlt, FaBars, FaTimes,
} from "react-icons/fa";
import API_BASE from "../api";
import { authFetch } from "../utils/csrfUtils";

/* ─────────────────────────────────────────────────────────────
   Sidebar
   · Mobile  (<768px): hidden by default, slides in as overlay drawer
   · Tablet  (768-1024px): fixed narrow icon-only rail (68px)
   · Desktop (>1024px): icon-only (68px) or full (256px) via pin/hover
───────────────────────────────────────────────────────────── */
export default function Sidebar({ pinned, setPinned, isLoggedIn, mobileOpen, setMobileOpen }) {
  const [hovered,    setHovered]    = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Close mobile drawer on route change / resize
  useEffect(() => {
    const close = () => { if (window.innerWidth >= 768) setMobileOpen(false); };
    window.addEventListener("resize", close);
    return () => window.removeEventListener("resize", close);
  }, [setMobileOpen]);

  const expanded = pinned || hovered; // desktop-only concept

  const handleLogout = async () => {
    setLoggingOut(true);
    setHovered(false);
    setPinned(false);
    setMobileOpen(false);
    try {
      await authFetch(`${API_BASE}/api/auth/logout`, { method: "POST" });
    } catch (err) {
      console.error("Logout request failed:", err);
    } finally {
      localStorage.removeItem("sidebarPinned");
      localStorage.removeItem("pinned");
      localStorage.removeItem("sidebar");
      window.location.replace("/login");
    }
  };

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      {/* ── Mobile backdrop overlay ─────────────────────────── */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 backdrop-blur-sm md:hidden"
          onClick={closeMobile}
          aria-hidden="true"
        />
      )}

      {/* ── Sidebar panel ──────────────────────────────────── */}
      <aside
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        className={`
          fixed left-0 top-0 z-40 h-screen flex flex-col px-3 py-5
          bg-gradient-to-b from-[#0b1120] via-[#0f172a] to-[#111827]
          border-r border-slate-800/70 shadow-2xl
          transition-all duration-300 overflow-hidden

          /* Mobile: off-screen by default, slides in when open */
          -translate-x-full md:translate-x-0
          ${mobileOpen ? "translate-x-0 w-64" : ""}

          /* Tablet+: always visible, icon-only */
          md:w-[68px]

          /* Desktop: expand on pin or hover */
          ${expanded ? "lg:w-64" : "lg:w-[68px]"}
        `}
      >
        {/* ── Header ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 px-2 mb-8 min-h-[44px] flex-shrink-0">
          {/* Mobile: show brand + close button */}
          {mobileOpen && (
            <div className="flex-1 min-w-0 md:hidden">
              <h2 className="text-xl font-bold tracking-tight text-white truncate">UxismClub</h2>
              {isLoggedIn && <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>}
            </div>
          )}

          {/* Desktop: show brand when expanded */}
          <div className={`hidden lg:block flex-1 min-w-0 ${expanded ? "" : "lg:hidden"}`}>
            {expanded && (
              <>
                <h2 className="text-xl font-bold tracking-tight text-white truncate">UxismClub</h2>
                {isLoggedIn && <p className="text-xs text-slate-400 mt-0.5">Admin Panel</p>}
              </>
            )}
          </div>

          {/* Mobile close button */}
          {mobileOpen && (
            <button
              onClick={closeMobile}
              className="md:hidden ml-auto text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              aria-label="Close menu"
            >
              <FaTimes size={16} />
            </button>
          )}

          {/* Desktop pin/unpin button */}
          <button
            onClick={() => {
              const next = !pinned;
              setPinned(next);
              localStorage.setItem("sidebarPinned", String(next));
            }}
            title={pinned ? "Unpin sidebar" : "Pin sidebar open"}
            className={`
              hidden lg:flex
              ${expanded ? "ml-auto" : "mx-auto"}
              transition-colors p-1 rounded-lg
              ${pinned ? "text-blue-400 hover:text-blue-300" : "text-slate-400 hover:text-white"}
            `}
          >
            <FaBars size={16} />
          </button>
        </div>

        {/* ── Navigation ─────────────────────────────────── */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto overflow-x-hidden"
          onClick={closeMobile} /* Close mobile drawer on nav click */
        >
          {isLoggedIn ? (
            <>
              <SidebarItem to="/admin"             icon={<FaHome />}    label="Dashboard"   expanded={expanded} mobileOpen={mobileOpen} end />
              <SidebarItem to="/admin/create-post" icon={<FaPen />}     label="Create Post"  expanded={expanded} mobileOpen={mobileOpen} />
              <SidebarItem to="/admin/posts"       icon={<FaFolder />}  label="All Posts"    expanded={expanded} mobileOpen={mobileOpen} />
              <SidebarItem to="/admin/drafts"      icon={<FaFileAlt />} label="Drafts"       expanded={expanded} mobileOpen={mobileOpen} />
            </>
          ) : (
            <>
              <SidebarItem to="/login"  icon={<FaSignOutAlt />} label="Login"  expanded={expanded} mobileOpen={mobileOpen} />
              <SidebarItem to="/signup" icon={<FaPen />}        label="Signup" expanded={expanded} mobileOpen={mobileOpen} />
            </>
          )}
          <SidebarItem to="/" icon={<FaGlobe />} label="View Website" expanded={expanded} mobileOpen={mobileOpen} end />
        </nav>

        {/* ── Bottom ─────────────────────────────────────── */}
        <div
          className="mt-auto space-y-3 pt-3"
        >
          {(expanded || mobileOpen) && isLoggedIn && (
            <div className="rounded-2xl border border-slate-800 bg-white/5 backdrop-blur-sm p-4">
              <p className="text-sm font-semibold text-white">Administrator</p>
              <p className="text-xs text-slate-400 mt-1">Secure session active</p>
            </div>
          )}

          {isLoggedIn && (
            <button
              onClick={handleLogout}
              disabled={loggingOut}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl bg-red-600 hover:bg-red-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-semibold transition-all duration-300 shadow-lg shadow-red-600/20 min-h-[44px]"
            >
              <FaSignOutAlt className="flex-shrink-0" />
              {(expanded || mobileOpen) && (
                <span className="truncate">{loggingOut ? "Logging out..." : "Logout"}</span>
              )}
            </button>
          )}

          {(expanded || mobileOpen) && (
            <p className="text-center text-[11px] text-slate-500 pb-1">Version 1.0</p>
          )}
        </div>
      </aside>
    </>
  );
}

/* ─────────────────────────────────────────────────────────────
   SidebarItem
───────────────────────────────────────────────────────────── */
function SidebarItem({ to, icon, label, expanded, mobileOpen, end }) {
  const showLabel = expanded || mobileOpen;
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `relative flex items-center
        ${showLabel ? "gap-3 px-4" : "justify-center px-0"}
        py-3 rounded-2xl font-medium transition-all duration-300 min-h-[44px]
        ${isActive
          ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-600/20"
          : "text-slate-300 hover:bg-slate-800/80 hover:text-white"
        }`
      }
    >
      {({ isActive }) => (
        <>
          {isActive && showLabel && (
            <span className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full bg-white" />
          )}
          <span className="text-[15px] flex-shrink-0">{icon}</span>
          {showLabel && <span className="truncate">{label}</span>}
        </>
      )}
    </NavLink>
  );
}
