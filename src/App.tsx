import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import KMNavbar from "./components/navbar/KMNavbar";
import KMFooter from "./components/KMFooter";

/* Lazy pages (keeps bundle small) */
const Home = lazy(() => import("./pages/Home"));
const Issues = lazy(() => import("./pages/Issues"));
const Contributors = lazy(() => import("./pages/Contributors"));
const Subscribe = lazy(() => import("./pages/Subscribe"));
const Login = lazy(() => import("./pages/Login"));
const About = lazy(() => import("./components/About"));
const Contact = lazy(() => import("./components/Contact"));
const Services = lazy(() => import("./components/Services"));
const Terms = lazy(() => import("./pages/Terms"));
const Privacy = lazy(() => import("./pages/Privacy"));
const DiscussionPage = lazy(() => import("./pages/Discussion"));
const CommunityRules = lazy(() => import("./pages/CommunityRules"));

function PageLoader({ message = "Loading…" }: { message?: string }) {
  return (
    <div className="min-h-[40vh] flex items-center justify-center">
      <div
        role="status"
        aria-live="polite"
        className="inline-flex items-center gap-3 p-3 rounded-lg bg-white/90 dark:bg-slate-800 shadow-md"
      >
        <svg
          className="w-5 h-5 animate-spin text-slate-700 dark:text-slate-200"
          viewBox="0 0 24 24"
          fill="none"
          aria-hidden
        >
          <circle
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeOpacity="0.15"
            strokeWidth="3"
          />
          <path
            d="M22 12a10 10 0 00-10-10"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
          />
        </svg>
        <span className="text-sm text-slate-700 dark:text-slate-200">
          {message}
        </span>
      </div>
    </div>
  );
}

/* RouteTransition: animate pages in/out, but use `undefined` for variants when reduced */
function RouteTransition({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  const reduce = useReducedMotion();

  // Use `undefined` when reduced motion is preferred (avoids type errors)
  const variants = reduce
    ? undefined
    : ({
        initial: { opacity: 0, y: 8, scale: 0.998 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -6, scale: 0.998 },
      } as const);

  // keep transition simple and typed-friendly (no string `ease`)
  const transition = reduce ? { duration: 0 } : { duration: 0.36 };

  return (
    <motion.div
      className="w-full h-full"
      // when variants is undefined, motion will skip variants and not animate — that's intended for reduced motion
      variants={variants as any}
      initial={variants ? "initial" : undefined}
      animate={variants ? "animate" : undefined}
      exit={variants ? "exit" : undefined}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}

/* Scroll to top on route change (nice UX) */
function ScrollToTopOnNavigate(): null {
  const location = useLocation();
  useEffect(() => {
    try {
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch {
      window.scrollTo(0, 0);
    }
  }, [location.pathname]);
  return null;
}

export default function App(): React.ReactElement {
  const location = useLocation();
  const reduce = useReducedMotion();

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#04101a] dark:via-[#041521] dark:to-[#041924] text-slate-900 dark:text-slate-100">
      <KMNavbar />

      <main className="flex-1">
        <ScrollToTopOnNavigate />

        <Suspense fallback={<PageLoader />}>
          <AnimatePresence mode={reduce ? undefined : "wait"}>
            <Routes location={location} key={location.pathname}>
              <Route
                path="/"
                element={
                  <RouteTransition>
                    <Home />
                  </RouteTransition>
                }
              />

              <Route
                path="/issues"
                element={
                  <RouteTransition>
                    <Issues />
                  </RouteTransition>
                }
              />

              <Route
                path="/login"
                element={
                  <RouteTransition>
                    <Login />
                  </RouteTransition>
                }
              />

              <Route
                path="/contributors"
                element={
                  <RouteTransition>
                    <Contributors />
                  </RouteTransition>
                }
              />

              <Route
                path="/about"
                element={
                  <RouteTransition>
                    <About />
                  </RouteTransition>
                }
              />

              <Route
                path="/contact"
                element={
                  <RouteTransition>
                    <Contact />
                  </RouteTransition>
                }
              />

              <Route
                path="/services"
                element={
                  <RouteTransition>
                    <Services />
                  </RouteTransition>
                }
              />

              <Route
                path="/subscribe"
                element={
                  <RouteTransition>
                    <Subscribe />
                  </RouteTransition>
                }
              />

              <Route
                path="/terms"
                element={
                  <RouteTransition>
                    <Terms />
                  </RouteTransition>
                }
              />

              <Route
                path="/privacy"
                element={
                  <RouteTransition>
                    <Privacy />
                  </RouteTransition>
                }
              />

              <Route
                path="/discussion"
                element={
                  <RouteTransition>
                    <DiscussionPage />
                  </RouteTransition>
                }
              />

              <Route
                path="/community-rules"
                element={
                  <RouteTransition>
                    <CommunityRules />
                  </RouteTransition>
                }
              />

              <Route
                path="*"
                element={
                  <RouteTransition>
                    <div className="min-h-[40vh] flex items-center justify-center px-4">
                      <div className="text-center">
                        <h2 className="text-2xl font-semibold mb-2">
                          Page not found
                        </h2>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                          The page you requested doesn't exist.
                        </p>
                        <a
                          href="/"
                          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white shadow"
                        >
                          Go home
                        </a>
                      </div>
                    </div>
                  </RouteTransition>
                }
              />
            </Routes>
          </AnimatePresence>
        </Suspense>
      </main>

      <KMFooter />
    </div>
  );
}
