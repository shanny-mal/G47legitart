import React, { useEffect, useRef, useCallback } from "react";
import { Link } from "react-router-dom";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { LINKS } from "./NavLinks";
import {
  mobileMenuVariants,
  linksContainerVariants,
  linkItemVariants,
} from "./variants";

type Props = {
  isOpen: boolean;
  onClose: () => void;
};

const MobileMenu: React.FC<Props> = ({ isOpen, onClose }) => {
  const reduceMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Lock scroll when open
  useEffect(() => {
    if (!isOpen) return;
    const prev = document.documentElement.style.overflow;
    document.documentElement.style.overflow = "hidden";
    return () => {
      document.documentElement.style.overflow = prev || "";
    };
  }, [isOpen]);

  // focus management: focus first link when opened
  useEffect(() => {
    if (!isOpen) return;
    const el = containerRef.current;
    const first = el?.querySelector<HTMLAnchorElement>("a");
    first?.focus();
  }, [isOpen]);

  // simple focus trap: keep Tab within the menu
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key !== "Tab" || !isOpen || !containerRef.current) return;
      const focusables = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>(
          "a[href], button:not([disabled]), [tabindex]:not([tabindex='-1'])"
        )
      ).filter(Boolean);
      if (focusables.length === 0) return;

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const active = document.activeElement as HTMLElement | null;

      if (!e.shiftKey && active === last) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && active === first) {
        last.focus();
        e.preventDefault();
      }
    },
    [isOpen]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <AnimatePresence initial={false}>
      {isOpen && (
        <motion.div
          role="dialog"
          aria-modal="true"
          className="md:hidden fixed inset-x-0 top-[64px] z-40" // anchored below navbar
          initial="hidden"
          animate="visible"
          exit="exit"
          variants={reduceMotion ? undefined : mobileMenuVariants}
        >
          <div
            ref={containerRef}
            className="bg-karibaSand/98 dark:bg-karibaNavy/98 border-t border-karibaSand/80 dark:border-[#05202a] shadow-lg"
          >
            <motion.div
              variants={linksContainerVariants}
              initial="hidden"
              animate="visible"
              className="px-4 py-4 flex flex-col gap-1"
            >
              {LINKS.map((l) => (
                <motion.div key={l.to} variants={linkItemVariants}>
                  <Link
                    to={l.to}
                    onClick={() => onClose()}
                    className="block py-3 px-2 rounded text-base font-medium text-gray-800 dark:text-gray-100 hover:bg-white/10 focus:bg-white/10 focus:outline-none"
                  >
                    {l.label}
                  </Link>
                </motion.div>
              ))}

              <div className="mt-3 pt-3 border-t border-karibaSand/80 dark:border-[#05202a]">
                <Link
                  to="/subscribe"
                  onClick={() => onClose()}
                  className="block w-full text-center px-4 py-2 mt-2 bg-karibaCoral text-white rounded-full font-semibold shadow-sm"
                >
                  Subscribe
                </Link>
              </div>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default React.memo(MobileMenu);
