// src/components/KMNavbar.tsx (lazy ThemeToggle)
import React, { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SubscribeButton from "./SubscribeButton";
import MobileMenu from "./MobileMenu";

// lazy import ThemeToggle to split it out of initial bundle
const ThemeToggle = React.lazy(() => import("../ThemeToggle"));

const KMNavbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const reduceMotion = useReducedMotion();

  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="w-full sticky top-0 z-50 bg-karibaSand/95 dark:bg-karibaNavy/95 backdrop-blur-md border-b border-karibaSand/70 dark:border-[#05202a]">
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <NavLinks />

        <div className="flex items-center gap-3">
          {/* Lazy load ThemeToggle with a small fallback */}
          <React.Suspense
            fallback={
              <div className="w-8 h-8 rounded bg-white/5" aria-hidden />
            }
          >
            <ThemeToggle />
          </React.Suspense>

          <SubscribeButton />

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/40"
            onClick={toggle}
            aria-controls="mobile-menu"
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            <motion.svg
              className="w-6 h-6 text-gray-800 dark:text-gray-100"
              viewBox="0 0 24 24"
              initial={false}
              animate={open ? { rotate: 45 } : { rotate: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.18 }}
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
      </nav>

      <MobileMenu isOpen={open} onClose={close} />
    </header>
  );
};

export default React.memo(KMNavbar);
