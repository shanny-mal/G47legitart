// src/pages/Privacy.tsx
import React, { useEffect, useState, type JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "August 20, 2025";

const SECTIONS = [
  { id: "introduction", title: "Introduction" },
  { id: "scope", title: "Scope" },
  { id: "data-collected", title: "Data we collect" },
  { id: "use", title: "How we use data" },
  { id: "sharing", title: "Sharing & disclosure" },
  { id: "cookies", title: "Cookies & tracking" },
  { id: "rights", title: "Your rights" },
  { id: "retention", title: "Data retention" },
  { id: "security", title: "Security" },
  { id: "children", title: "Children" },
  { id: "changes", title: "Changes" },
  { id: "contact", title: "Contact" },
];

const SectionAnchor: React.FC<{
  id: string;
  title: string;
  active?: boolean;
  onClick?: (id: string) => void;
}> = ({ id, title, active, onClick }) => {
  return (
    <a
      href={`#${id}`}
      onClick={(e) => {
        e.preventDefault();
        onClick?.(id);
      }}
      className={`text-sm block px-2 py-1 rounded-md transition-colors duration-200 ${
        active
          ? "bg-gradient-to-r from-indigo-600 to-teal-400 text-white font-medium shadow-sm"
          : "text-slate-500 hover:bg-white/6 hover:text-slate-900 dark:hover:text-white"
      }`}
    >
      {title}
    </a>
  );
};

export default function Privacy(): JSX.Element {
  const reduce = useReducedMotion();
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Privacy Policy — The Kariba Magazine";
  }, []);

  // scrollspy: observe sections and set activeId
  useEffect(() => {
    const ids = SECTIONS.map((s) => s.id);
    const elems = ids
      .map((id) => document.getElementById(id))
      .filter(Boolean) as HTMLElement[];

    if (elems.length === 0) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -30% 0px",
        threshold: [0.15, 0.35, 0.6],
      }
    );

    elems.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, []);

  // click handler for TOC anchors (smooth scroll)
  const goTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (reduce) {
      el.scrollIntoView({ block: "start" });
    } else {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
    setTocOpen(false);
  };

  const motionProps = reduce
    ? {}
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.42 },
      };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-rose-50 dark:from-[#041c22] dark:via-[#051e24] dark:to-[#041622] py-12">
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <div className="flex flex-col lg:flex-row items-start gap-8">
          {/* Desktop TOC */}
          <aside className="hidden lg:block w-72 sticky top-24 self-start">
            <div className="rounded-lg p-4 bg-white/90 dark:bg-[#05232b] border border-white/6 shadow-sm">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-3 font-medium">
                On this page
              </div>

              <nav className="flex flex-col gap-2">
                {SECTIONS.map((s) => (
                  <SectionAnchor
                    key={s.id}
                    id={s.id}
                    title={s.title}
                    active={activeId === s.id}
                    onClick={goTo}
                  />
                ))}
              </nav>

              <div className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                Effective date:{" "}
                <strong className="text-slate-700 dark:text-white">
                  {EFFECTIVE_DATE}
                </strong>
              </div>
            </div>
          </aside>

          {/* Main article */}
          <article className="flex-1">
            <header className="mb-6">
              <motion.h1
                className="text-3xl sm:text-4xl font-serif font-semibold text-slate-900 dark:text-white"
                {...motionProps}
              >
                Privacy Policy
              </motion.h1>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  We respect your privacy. This page explains what data we
                  collect, why we collect it, how it is used, and the rights
                  available to you.
                </p>

                {/* mobile TOC toggle */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setTocOpen((s) => !s)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-50 to-white/90 dark:bg-[#04232c] border border-white/8 text-sm shadow-sm"
                    aria-expanded={tocOpen}
                    aria-controls="mobile-toc"
                  >
                    {tocOpen ? "Hide sections" : "Show sections"}
                  </button>
                </div>
              </div>
            </header>

            {/* Mobile TOC */}
            {tocOpen && (
              <motion.div
                id="mobile-toc"
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-6 rounded-md bg-white/90 dark:bg-[#05232b] p-3 shadow-sm lg:hidden"
              >
                <nav className="flex flex-col gap-2">
                  {SECTIONS.map((s) => (
                    <SectionAnchor
                      key={s.id}
                      id={s.id}
                      title={s.title}
                      active={activeId === s.id}
                      onClick={goTo}
                    />
                  ))}
                </nav>
              </motion.div>
            )}

            {/* Sections */}
            <section
              id="introduction"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">1. Introduction</h2>
              <p>
                The Kariba Magazine (“we”, “us”, “our”) respects your privacy
                and is committed to protecting your personal data. This Privacy
                Policy explains what personal data we collect, why we collect
                it, how we use it, and your rights in relation to your data.
              </p>
              <p>
                <strong>Contact:</strong>{" "}
                <a href="mailto:cacyiaray@gmail.com">cacyiaray@gmail.com</a>
              </p>
            </section>

            <section
              id="scope"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">2. Scope</h2>
              <p>This policy applies to personal data collected:</p>
              <ul>
                <li>via our websites and apps;</li>
                <li>
                  when you use our services (subscribe, comment, upload, etc.);
                </li>
                <li>
                  and offline when you provide information (events, print
                  subscriptions).
                </li>
              </ul>
            </section>

            <section
              id="data-collected"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">3. Data we collect</h2>

              <h3 className="text-lg font-semibold">
                3.1 Information you provide directly
              </h3>
              <p>
                Account details, subscription emails, contact form messages,
                contributions (text/images), and profile preferences.
              </p>

              <h3 className="text-lg font-semibold">
                3.2 Automatically collected information
              </h3>
              <p>
                Usage data (pages visited, time spent), device and browser info,
                IP address, and analytics data.
              </p>

              <h3 className="text-lg font-semibold">3.3 Third-party sources</h3>
              <p>
                Information from social login providers, payment processors, or
                public sources when you interact as a contributor.
              </p>
            </section>

            <section id="use" className="prose prose-lg dark:prose-invert mb-8">
              <h2 className="font-serif text-2xl">4. How we use your data</h2>
              <p>We use data to:</p>
              <ul>
                <li>provide and improve services;</li>
                <li>communicate (newsletters, transactional messages);</li>
                <li>process payments and subscriptions;</li>
                <li>personalize content and recommendations;</li>
                <li>ensure security and prevent fraud.</li>
              </ul>
              <p>
                Legal bases include consent (newsletters), contract performance
                (subscriptions), and legitimate interests (analytics and fraud
                prevention).
              </p>
            </section>

            <section
              id="sharing"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">5. Sharing & disclosure</h2>
              <p>We share data with:</p>
              <ul>
                <li>
                  Service providers (hosting, email, payments) under contract;
                </li>
                <li>
                  Publishers/partners when you submit content for publication;
                </li>
                <li>Law enforcement or authorities when required by law;</li>
                <li>
                  In the event of a business transfer (sale, merger), under
                  confidentiality protections.
                </li>
              </ul>
              <p>We do not sell personal data for advertising.</p>
            </section>

            <section
              id="cookies"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">6. Cookies & tracking</h2>
              <p>
                We use cookies and similar technologies for essential site
                operation, session management, analytics, and personalization.
                You can control cookies via your browser or our cookie
                preference banner (if implemented). Blocking cookies may reduce
                functionality.
              </p>
            </section>

            <section
              id="rights"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">7. Your rights</h2>
              <p>
                Depending on where you live, you may have rights to access,
                correct, export, or delete your personal data, and to restrict
                or object to processing. To exercise your rights, contact{" "}
                <a href="mailto:cacyiaray@gmail.com">cacyiaray@gmail.com</a>. We
                may require identity verification before fulfilling requests.
              </p>
            </section>

            <section
              id="retention"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">8. Data retention</h2>
              <p>
                We retain account and subscription data as long as necessary to
                provide our services and meet legal obligations. Content you
                post will be retained until you remove it or we remove it under
                policy. Contact us to request deletion or export.
              </p>
            </section>

            <section
              id="security"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">9. Security</h2>
              <p>
                We use administrative, technical and physical measures — HTTPS,
                access controls, and regular audits — to protect your data. No
                method is completely secure; in the event of a breach we will
                notify affected users and regulators as required.
              </p>
            </section>

            <section
              id="children"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">10. Children</h2>
              <p>
                We do not knowingly collect information from children under 16
                without parental consent. If you believe we have collected such
                data, contact us to request deletion.
              </p>
            </section>

            <section
              id="changes"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">
                11. Changes to this policy
              </h2>
              <p>
                We may update this policy. Material changes will be posted with
                a revised effective date. For significant changes we will try to
                notify users by email or a prominent website notice.
              </p>
            </section>

            <section
              id="contact"
              className="prose prose-lg dark:prose-invert mb-12"
            >
              <h2 className="font-serif text-2xl">12. Contact</h2>
              <p>
                Questions or requests:{" "}
                <a href="mailto:cacyiaray@gmail.com">cacyiaray@gmail.com</a>.
              </p>
            </section>

            <footer className="border-t border-white/6 pt-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>© {new Date().getFullYear()} The Kariba Magazine</div>
                <div>
                  See also{" "}
                  <Link
                    to="/terms"
                    className="text-indigo-600 dark:text-teal-300 hover:underline"
                  >
                    Terms of Service
                  </Link>
                  .
                </div>
              </div>
            </footer>
          </article>
        </div>
      </div>
    </main>
  );
}
