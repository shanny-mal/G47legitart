// src/components/KMNavbar.tsx
import React, { useCallback, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo";
import NavLinks from "./NavLinks";
import SubscribeButton from "./SubscribeButton";
import ThemeToggle from "./ThemeToggle";
import MobileMenu from "./MobileMenu";

const KMNavbar: React.FC = () => {
  const [open, setOpen] = useState(false);
  const reduceMotion = Boolean(useReducedMotion());
  const toggle = useCallback(() => setOpen((o) => !o), []);
  const close = useCallback(() => setOpen(false), []);

  return (
    <header className="w-full sticky top-0 z-50 bg-white/60 dark:bg-[#04202a]/60 backdrop-blur-md border-b border-white/10 dark:border-[#05202a]">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Logo />
        </div>

        <NavLinks />

        <div className="flex items-center gap-3">
          <ThemeToggle />
          <SubscribeButton />

          <button
            onClick={toggle}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            className="md:hidden inline-flex items-center justify-center p-2 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/30"
          >
            <motion.svg
              viewBox="0 0 24 24"
              className="w-6 h-6 text-karibaNavy dark:text-karibaSand"
              initial={false}
              animate={
                open ? { rotate: 45, scale: 1.02 } : { rotate: 0, scale: 1 }
              }
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
      </div>

      <MobileMenu isOpen={open} onClose={close} />
    </header>
  );
};

export default React.memo(KMNavbar);
