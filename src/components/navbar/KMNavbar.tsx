import React, { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SubscribeButton from "./SubscribeButton";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";
import { useAuth } from "../../admin/AuthProvider"; // adjust path if needed

const KMNavbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);
  const navigate = useNavigate();

  const auth = useAuth();
  const isAuthenticated = Boolean(auth?.isAuthenticated);
  const user = auth?.user ?? null;

  const onLogout = useCallback(async () => {
    try {
      await auth.logout();
    } catch {
      /* ignore */
    } finally {
      // After logout go to login page (or home)
      navigate("/login", { replace: true });
    }
  }, [auth, navigate]);

  return (
    <header
      className="w-full sticky top-0 z-50 backdrop-blur-md bg-gradient-to-b from-white/60 to-white/40 dark:from-[#02151a]/70 dark:to-[#02151a]/60 border-b border-white/10 dark:border-black/20"
      aria-label="Primary"
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <NavLinks />

        <div className="flex items-center gap-3">
          <ThemeToggle />

          {isAuthenticated ? (
            // show compact user area
            <div className="hidden md:flex items-center gap-3">
              <div className="flex flex-col items-end text-right mr-2">
                <span className="text-sm font-medium text-karibaNavy dark:text-karibaSand">
                  {user?.username ?? user?.email ?? "User"}
                </span>
                {user?.is_staff && (
                  <span className="text-xs text-gray-600 dark:text-gray-300">
                    Admin
                  </span>
                )}
              </div>

              <div className="flex items-center gap-2">
                <div
                  className="w-9 h-9 rounded-full bg-white/8 dark:bg-white/6 flex items-center justify-center overflow-hidden text-sm font-semibold text-white/90"
                  aria-hidden
                >
                  {(user?.username ?? user?.email ?? "U")
                    .toString()
                    .charAt(0)
                    .toUpperCase()}
                </div>

                <button
                  onClick={onLogout}
                  className="px-3 py-1 rounded-md bg-white/8 text-white hover:bg-white/12 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/30"
                >
                  Sign out
                </button>
              </div>
            </div>
          ) : (
            // show subscribe + login link for unauthenticated users
            <div className="flex items-center gap-3">
              <SubscribeButton />
              <Link
                to="/login"
                className="hidden md:inline-flex items-center gap-2 px-3 py-1 rounded-md border border-white/8 text-karibaNavy dark:text-karibaSand bg-white/8 hover:bg-white/12 transition"
              >
                Login
              </Link>
            </div>
          )}

          {/* mobile menu toggle */}
          <button
            onClick={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTheal/30"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-karibaNavy dark:text-karibaSand"
              initial={false}
              animate={open ? { rotate: 45, scale: 1.02 } : { rotate: 0, scale: 1 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
              aria-hidden
            >
              <path
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"}
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
              />
            </motion.svg>
          </button>
        </div>
      </div>

      <MobileMenu isOpen={open} onClose={close} />
    </header>
  );
};

export default React.memo(KMNavbar);
