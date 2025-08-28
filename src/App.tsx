// src/App.tsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, useLocation, Link } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

import KMNavbar from "./components/navbar/KMNavbar";
import KMFooter from "./components/KMFooter";

// auth + admin route guard
import { AuthProvider } from "./admin/AuthProvider";
import PrivateRoute from "./admin/PrivateRoute";

/* -------------------------
   Lazy pages (keeps bundle small)
   ------------------------- */
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

/* -------------------------
   Admin area (lazy)
   ------------------------- */
const AdminLayout = lazy(() => import("./admin/AdminLayout"));
const AdminHome = lazy(() => import("./admin/AdminHome"));
const AdminProfile = lazy(() => import("./admin/AdminProfile"));
const IssueListAdmin = lazy(() => import("./admin/IssueList"));
const SubscriberList = lazy(() => import("./admin/SubscriberList"));
const ContactList = lazy(() => import("./admin/ContactList"));
const IssueEditorAdmin = lazy(() => import("./admin/IssueEditor"));
const ContributorListAdmin = lazy(() => import("./admin/ContributorList"));

/* -------------------------
   ErrorBoundary: prevents full-app crash when lazy fails
   ------------------------- */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error?: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  componentDidCatch(error: Error, info: any) {
    // log to an error service if you have one
    // eslint-disable-next-line no-console
    console.error("Uncaught error in ErrorBoundary:", error, info);
  }
  render() {
    if (this.state.hasError) {
      return (
        <main className="min-h-[40vh] flex items-center justify-center px-4">
          <div className="max-w-xl text-center p-6 bg-white/90 dark:bg-slate-800 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-700 dark:text-slate-300 mb-4">
              We couldn't load this part of the site. Try refreshing or come back
              later.
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/" className="px-4 py-2 rounded-md bg-karibaTeal text-white">
                Go home
              </Link>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 rounded-md bg-white border"
              >
                Reload
              </button>
            </div>
          </div>
        </main>
      );
    }
    return this.props.children as React.ReactElement;
  }
}

/* -------------------------
   PageLoader: small, accessible loading UI
   ------------------------- */
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
        <span className="text-sm text-slate-700 dark:text-slate-200">{message}</span>
      </div>
    </div>
  );
}

/* -------------------------
   RouteTransition: animate pages but respect reduced motion
   ------------------------- */
function RouteTransition({ children }: { children: React.ReactNode }) {
  const reduce = useReducedMotion();
  const variants = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 8, scale: 0.998 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -6, scale: 0.998 },
      } as const;
  const transition = reduce ? { duration: 0 } : { duration: 0.36, ease: "easeInOut" as any };

  return (
    <motion.div
      className="w-full h-full"
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

/* -------------------------
   Scroll to top on navigation with graceful behavior
   ------------------------- */
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

/* -------------------------
   Low-priority prefetch for lazy pages — helps reduce first paint on navigation
   ------------------------- */
function usePrefetchLazyPages() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    const prefersReduced = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;
    const load = () => {
      const work = () => {
        void import("./pages/Issues");
        void import("./pages/Contributors");
        void import("./pages/Subscribe");
        void import("./pages/Login");
        void import("./components/About");
        void import("./components/Contact");
        void import("./components/Services");
        void import("./pages/Terms");
        void import("./pages/Privacy");
        void import("./pages/Discussion");
        void import("./pages/CommunityRules");
        // admin area (low-priority)
        void import("./admin/IssueList");
        void import("./admin/IssueEditor");
        void import("./admin/ContributorList");
        void import("./admin/SubscriberList");
        void import("./admin/ContactList");
        void import("./admin/AdminHome");
        void import("./admin/AdminProfile");
      };
      if ("requestIdleCallback" in window) {
        (window as any).requestIdleCallback(work, { timeout: 2000 });
      } else {
        setTimeout(work, 1200);
      }
    };
    const t = setTimeout(load, 800);
    return () => clearTimeout(t);
  }, []);
}

/* -------------------------
   App root
   ------------------------- */
export default function App(): React.ReactElement {
  const location = useLocation();
  const reduce = useReducedMotion();

  usePrefetchLazyPages();

  // route key so AnimatePresence knows when to animate between pages
  const routeKey = location.pathname;

  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#04101a] dark:via-[#041521] dark:to-[#041924] text-slate-900 dark:text-slate-100">
        {/* Skip link for keyboard users */}
        <a
          href="#content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 px-3 py-2 rounded-md bg-karibaTeal text-white"
        >
          Skip to content
        </a>

        <KMNavbar />

        <main id="content" className="flex-1">
          <ScrollToTopOnNavigate />

          <ErrorBoundary>
            <Suspense fallback={<PageLoader />}>
              <AnimatePresence mode={reduce ? undefined : "wait"} initial={false}>
                <Routes location={location} key={routeKey}>
                  {/* Public pages */}
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

                  {/* -------------------------
                      Admin subtree (protected)
                      NOTE: AdminLayout handles the sidebar & Outlet for nested admin routes
                     ------------------------- */}
                  <Route
                    path="/admin/*"
                    element={
                      <RouteTransition>
                        <Suspense fallback={<PageLoader message="Loading admin…" />}>
                          <PrivateRoute>
                            <AdminLayout />
                          </PrivateRoute>
                        </Suspense>
                      </RouteTransition>
                    }
                  >
                    {/* nested admin routes (handled inside AdminLayout via Outlet) */}
                    <Route index element={<AdminHome />} />
                    <Route path="issues" element={<IssueListAdmin />} />
                    <Route path="issues/new" element={<IssueEditorAdmin />} />
                    <Route path="issues/:id" element={<IssueEditorAdmin />} />
                    <Route path="contributors" element={<ContributorListAdmin />} />
                    <Route path="profile" element={<AdminProfile/>} />

                    {/* admin lists */}
                    <Route
                      path="subscribers"
                      element={
                        <Suspense fallback={<PageLoader message="Loading subscribers…" />}>
                          <SubscriberList />
                        </Suspense>
                      }
                    />
                    <Route
                      path="contacts"
                      element={
                        <Suspense fallback={<PageLoader message="Loading contacts…" />}>
                          <ContactList />
                        </Suspense>
                      }
                    />
                  </Route>

                  {/* catch-all */}
                  <Route
                    path="*"
                    element={
                      <RouteTransition>
                        <div className="min-h-[40vh] flex items-center justify-center px-4">
                          <div className="text-center">
                            <h2 className="text-2xl font-semibold mb-2">Page not found</h2>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
                              The page you requested doesn't exist.
                            </p>
                            <Link
                              to="/"
                              className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white shadow"
                            >
                              Go home
                            </Link>
                          </div>
                        </div>
                      </RouteTransition>
                    }
                  />
                </Routes>
              </AnimatePresence>
            </Suspense>
          </ErrorBoundary>
        </main>

        <KMFooter />
      </div>
    </AuthProvider>
  );
}
