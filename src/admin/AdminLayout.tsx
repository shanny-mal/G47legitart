import { useState, useEffect, useRef, useCallback, type JSX } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../admin/AuthProvider";
import { motion, useReducedMotion } from "framer-motion";
import { FiMenu, FiX, FiLogOut, FiEye } from "react-icons/fi";

const navItems: { to: string; label: string }[] = [
  { to: "/admin", label: "Dashboard" },
  { to: "/admin/issues", label: "Issues" },
  { to: "/admin/issues/new", label: "New Issue" },
  { to: "/admin/contributors", label: "Contributors" },
];

function AvatarPlaceholder({ name = "A" }: { name?: string }) {
  const initial = (name || "A").charAt(0).toUpperCase();
  return (
    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 flex items-center justify-center text-white font-semibold text-sm">
      {initial}
    </div>
  );
}

export default function AdminLayout(): JSX.Element {
  const { logout, user, isAuthenticated } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const reduce = useReducedMotion();
  const [loggingOut, setLoggingOut] = useState(false);
  const mobileFirstLinkRef = useRef<HTMLAnchorElement | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      // if unauthenticated, bounce to login
      nav("/login", { replace: true });
    }
  }, [isAuthenticated, nav]);

  useEffect(() => {
    if (open) {
      const t = setTimeout(() => mobileFirstLinkRef.current?.focus(), 50);
      return () => clearTimeout(t);
    }
  }, [open]);

  // robust logout handler: always redirect to /login;
  // attempt logout() (sync or async) but do not rely on its return value.
  const doLogout = useCallback(async () => {
    setOpen(false);
    setLoggingOut(true);

    // debug: note start
    // console.debug("[AdminLayout] starting logout()");

    try {
      // call logout() safely whether it returns void or a Promise
      await Promise.resolve(logout?.());

      // optionally clear client-side storage here if needed:
      // localStorage.removeItem("token");
      // sessionStorage.removeItem("some-key");
    } catch (err) {
      // log the error so you can inspect it in DevTools
      // eslint-disable-next-line no-console
      console.warn("[AdminLayout] logout() threw:", err);
    } finally {
      setLoggingOut(false);

      // Primary navigation using react-router's navigate
      try {
        nav("/login", { replace: true });
        return;
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[AdminLayout] navigate to /login failed:", err);
      }

      // Fallback: hard redirect if navigate didn't work
      try {
        window.location.href = "/login";
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[AdminLayout] fallback location assignment failed:", err);
      }
    }
  }, [logout, nav]);

  const sidebarVariants = reduce
    ? {}
    : {
        hidden: { x: "-100%" },
        show: { x: 0, transition: { type: "spring", stiffness: 260, damping: 28 } },
      };

  const displayName =
    (user?.username as string | undefined) ||
    (user?.email as string | undefined) ||
    "Admin";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#041421] text-slate-900 dark:text-slate-100 flex flex-col">
      <header className="w-full border-b border-white/6 dark:border-slate-800 bg-white/90 dark:bg-[#041521] backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setOpen((s) => !s)}
                aria-expanded={open}
                aria-controls="admin-sidebar"
                className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-md text-slate-700 dark:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400/40"
                title="Toggle sidebar"
                type="button"
              >
                {open ? <FiX size={18} /> : <FiMenu size={18} />}
              </button>

              <Link to="/admin" className="inline-flex items-center gap-3 group">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-300 via-indigo-400 to-rose-300 flex items-center justify-center text-lg font-serif text-slate-900 shadow transform transition group-hover:scale-105">
                  KM
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-serif font-semibold text-slate-900 dark:text-slate-100">Admin</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Control panel</div>
                </div>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => nav("/")}
                className="hidden sm:inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/95 dark:bg-[#05232b] text-sm text-slate-700 dark:text-slate-100 border border-white/8 hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-indigo-300"
                title="View site"
                type="button"
              >
                <FiEye />
                <span>View site</span>
              </button>

              <button
                onClick={doLogout}
                disabled={loggingOut}
                className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-600 text-white text-sm shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-rose-400/40 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-label="Logout and return to login"
                title="Logout"
                type="button"
              >
                <FiLogOut />
                <span>{loggingOut ? "Signing out…" : "Logout"}</span>
              </button>

              <div className="hidden md:block">
                <AvatarPlaceholder name={displayName} />
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 flex overflow-hidden">
        <aside className="hidden md:block w-64 bg-white dark:bg-[#03121a] border-r dark:border-slate-800 p-4">
          <nav className="space-y-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6 border-t pt-4 border-white/6 dark:border-slate-700">
            <Link to="/admin/profile" className="flex items-center gap-3 text-sm hover:underline">
              <AvatarPlaceholder name={displayName} />
              <div>
                <div className="text-slate-900 dark:text-slate-100 font-medium">{displayName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">Manage account</div>
              </div>
            </Link>
          </div>
        </aside>

        <motion.aside
          id="admin-sidebar"
          className="md:hidden fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-[#03121a] border-r dark:border-slate-800 p-4"
          initial="hidden"
          animate={open ? "show" : "hidden"}
          variants={sidebarVariants as any}
          aria-hidden={!open}
          role="dialog"
        >
          <div className="flex items-center justify-between mb-4">
            <Link to="/admin" onClick={() => setOpen(false)} className="inline-flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-teal-300 via-indigo-400 to-rose-300 flex items-center justify-center text-lg font-serif text-slate-900 shadow">KM</div>
              <div className="text-sm font-semibold">Admin</div>
            </Link>
            <button onClick={() => setOpen(false)} className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none" aria-label="Close menu" type="button">
              <FiX />
            </button>
          </div>

          <nav className="flex flex-col gap-2">
            {navItems.map((item, idx) => (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-md text-sm font-medium transition ${
                    isActive
                      ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`
                }
                ref={idx === 0 ? mobileFirstLinkRef : undefined}
              >
                {item.label}
              </NavLink>
            ))}
          </nav>

          <div className="mt-6">
            <button onClick={doLogout} disabled={loggingOut} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-rose-600 text-white disabled:opacity-60 disabled:cursor-not-allowed" type="button">
              {loggingOut ? "Signing out…" : "Logout"}
            </button>
          </div>
        </motion.aside>

        <main className="flex-1 overflow-auto p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
