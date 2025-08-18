import { useEffect, useRef, useState, type JSX } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  motion,
  AnimatePresence,
  useReducedMotion,
  type Variants,
} from "framer-motion";
import ThemeToggle from "./ThemeToggle";
import kmlogo from "../assets/images/logos/kmlogo.jpg";

type LinkItem = { to: string; label: string };

const links: LinkItem[] = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/issues", label: "Issues" },
  { to: "/contributors", label: "Contributors" },
  { to: "/services", label: "Services" },
  { to: "/login", label: "Login" },
];

function KMNavbar(): JSX.Element {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement | null>(null);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current) return;
      if (open && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const isActive = (to: string) => {
    if (to === "/") return location.pathname === "/";
    return location.pathname.startsWith(to);
  };

  // motion variants (typed)
  const logoAnim = shouldReduceMotion
    ? undefined
    : {
        animate: {
          y: [0, -4, 0],
          transition: {
            duration: 3.5,
            repeat: Infinity,
            ease: "easeInOut" as const,
          },
        },
      };

  const mobileMenu: Variants = {
    initial: { opacity: 0, scaleY: 0.98 },
    animate: {
      opacity: 1,
      scaleY: 1,
      transition: { type: "spring" as const, stiffness: 300, damping: 28 },
    },
    exit: { opacity: 0, scaleY: 0.98, transition: { duration: 0.18 } },
  };

  const linksContainer: Variants = {
    initial: {},
    animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
  };

  const linkItem: Variants = {
    initial: { opacity: 0, y: -6 },
    animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
    exit: { opacity: 0, y: -4, transition: { duration: 0.12 } },
  };

  return (
    <header
      className="w-full sticky top-0 z-50 bg-karibaSand/95 dark:bg-karibaNavy/95 backdrop-blur-md
                 border-b border-karibaSand/70 dark:border-[#05202a] shadow-sm"
    >
      <nav className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo + Name */}
        <Link
          to="/"
          aria-label="TheKaribaMagazine home"
          className="flex items-center gap-3 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/40"
        >
          <motion.div
            {...(logoAnim ?? {})}
            className="w-12 h-12 rounded-md overflow-hidden flex items-center justify-center bg-white/10 shadow-sm"
            title="TheKaribaMagazine"
            aria-hidden="false"
          >
            <img
              src={kmlogo}
              alt="TheKaribaMagazine logo"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </motion.div>

          <span className="font-serif text-lg text-karibaNavy dark:text-karibaSand">
            TheKaribaMagazine
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center space-x-6">
          {links.map((l) => {
            const active = isActive(l.to);
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`group relative px-1 py-1 text-sm font-medium transition-colors duration-200
                  ${
                    active
                      ? "text-karibaTeal"
                      : "text-gray-800 dark:text-gray-100 hover:text-karibaTeal"
                  }
                  focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/40 rounded`}
              >
                {l.label}
                <span
                  className={`absolute left-0 -bottom-1 h-[2px] bg-karibaTeal transition-all duration-300
                    ${active ? "w-full" : "w-0 group-hover:w-full"}`}
                  aria-hidden
                />
              </Link>
            );
          })}
        </div>

        {/* Right controls */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          {/* SUBSCRIBE - ensure visibility: use text-white */}
          <Link
            to="/subscribe"
            className="hidden md:inline-flex items-center gap-2 px-4 py-2 bg-karibaCoral text-black rounded shadow-sm
                       transform transition duration-300 hover:-translate-y-0.5 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaCoral/40"
            aria-label="Subscribe"
          >
            <svg
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <path
                d="M3 8l9 6 9-6"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M21 16v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-sm font-medium">Subscribe</span>
          </Link>

          {/* Mobile menu button */}
          <button
            className="md:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-karibaTeal/40"
            onClick={() => setOpen((s) => !s)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            title={open ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6 text-gray-800 dark:text-gray-100"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden
            >
              <path
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                d={open ? "M6 18L18 6M6 6l12 12" : "M4 8h16M4 16h16"}
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            id="mobile-menu"
            ref={menuRef}
            initial="initial"
            animate="animate"
            exit="exit"
            variants={mobileMenu}
            style={{ originY: 0 }}
            className="md:hidden overflow-hidden border-t border-karibaSand/80 dark:border-[#05202a] bg-karibaSand/95 dark:bg-karibaNavy/95"
            aria-hidden={!open}
          >
            <motion.div
              variants={linksContainer}
              className="px-4 py-3 flex flex-col"
            >
              {links.map((l) => {
                const active = isActive(l.to);
                return (
                  <motion.div key={l.to} variants={linkItem} className="w-full">
                    <Link
                      to={l.to}
                      onClick={() => setOpen(false)}
                      className={`block py-2 rounded text-sm font-medium transition-all duration-300
                           ${
                             active
                               ? "text-karibaTeal"
                               : "text-gray-800 dark:text-gray-100 hover:text-karibaTeal"
                           }
                           focus:outline-none focus:bg-gray-100 dark:focus:bg-gray-800`}
                    >
                      {l.label}
                    </Link>
                  </motion.div>
                );
              })}

              <div className="mt-2 pt-2 border-t border-karibaSand/80 dark:border-[#05202a]">
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <Link
                    to="/subscribe"
                    onClick={() => setOpen(false)}
                    className="block w-full text-center px-4 py-2 mt-2 bg-karibaCoral text-black rounded font-semibold shadow-sm hover:opacity-95"
                  >
                    Subscribe
                  </Link>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

export default KMNavbar;
