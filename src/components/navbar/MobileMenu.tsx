import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { LINKS } from "./NavLinks";
import { menuVariants, linkItemVariants } from "./variants";

const MobileMenu: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const reduceMotion = Boolean(useReducedMotion());
  const containerRef = useRef<HTMLDivElement | null>(null);

  // body scroll lock
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [isOpen]);

  // focus first link on open
  useEffect(() => {
    if (!isOpen) return;
    const first = containerRef.current?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
  }, [isOpen]);

  // escape closes
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  // tab trap
  useEffect(() => {
    if (!isOpen || !containerRef.current) return;
    const el = containerRef.current;
    const handle = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = Array.from(
        el.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),[tabindex]:not([tabindex="-1"])'
        )
      ).filter(Boolean);
      if (focusables.length === 0) return;
      const first = focusables[0],
        last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", handle);
    return () => document.removeEventListener("keydown", handle);
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduceMotion ? 0 : 0.18 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.aside
            key="sheet"
            aria-modal="true"
            role="dialog"
            initial="closed"
            animate="open"
            exit="closed"
            variants={reduceMotion ? undefined : menuVariants}
            className="fixed inset-x-0 top-16 z-50 origin-top bg-white/98 dark:bg-[#021a20]/98 border-t border-white/10 dark:border-black/20 shadow-2xl"
          >
            <div ref={containerRef} className="px-4 py-6">
              <div className="flex flex-col gap-2">
                {LINKS.map((l) => (
                  <motion.div key={l.to} variants={linkItemVariants}>
                    <Link
                      to={l.to}
                      onClick={onClose}
                      className="block w-full text-left px-4 py-3 rounded-md text-lg font-medium text-karibaNavy dark:text-karibaSand hover:bg-karibaTeal/6 focus:bg-karibaTeal/8 focus:outline-none"
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                ))}
              </div>

              <div className="mt-6 pt-4 border-t border-karibaSand/80 dark:border-black/20">
                <Link
                  to="/subscribe"
                  onClick={onClose}
                  className="block w-full text-center px-4 py-3 rounded-full bg-gradient-to-r from-karibaTeal to-karibaCoral text-white font-semibold shadow-lg"
                >
                  Subscribe
                </Link>
              </div>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
};

export default React.memo(MobileMenu);
