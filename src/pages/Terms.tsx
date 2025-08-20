// src/pages/Terms.tsx
import React, { useEffect, useState, type JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const EFFECTIVE_DATE = "August 20, 2025";

const SECTIONS = [
  { id: "agreement", title: "Agreement" },
  { id: "accounts", title: "Accounts" },
  { id: "subscriptions", title: "Subscriptions & payments" },
  { id: "user-content", title: "User content & license" },
  { id: "prohibited", title: "Prohibited conduct" },
  { id: "ip", title: "Intellectual property" },
  { id: "links", title: "Third-party links" },
  { id: "disclaimer", title: "Disclaimers" },
  { id: "liability", title: "Limitation of liability" },
  { id: "governing", title: "Governing law" },
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
        // smooth scroll unless reduced motion requested — parent will handle motion preference
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

export default function Terms(): JSX.Element {
  const reduce = useReducedMotion();
  const [tocOpen, setTocOpen] = useState(false);
  const [activeId, setActiveId] = useState<string | null>(null);

  useEffect(() => {
    document.title = "Terms of Service — The Kariba Magazine";
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
        // choose the entry with largest intersectionRatio
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) {
          setActiveId(visible.target.id);
        }
      },
      {
        root: null,
        rootMargin: "0px 0px -30% 0px", // bias toward sections near top
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
    // on mobile, close toc after selecting
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
          {/* TOC - large screens */}
          <aside className="hidden lg:block w-72 sticky top-24 self-start">
            <div className="rounded-lg p-4 bg-white/90 dark:bg-[#05232b] border border-white/6 shadow-sm">
              <div className="text-xs uppercase text-slate-500 dark:text-slate-400 mb-3 font-medium">
                Contents
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

          <article className="flex-1">
            <header className="mb-6">
              <motion.h1
                className="text-3xl sm:text-4xl font-serif font-semibold text-slate-900 dark:text-white"
                {...motionProps}
              >
                Terms of Service
              </motion.h1>

              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <p className="text-sm text-slate-600 dark:text-slate-300 max-w-xl">
                  These Terms explain how you may use The Kariba Magazine
                  website and services. They include account rules, subscription
                  policies and limits on liability.
                </p>

                {/* mobile TOC toggle */}
                <div className="lg:hidden">
                  <button
                    onClick={() => setTocOpen((s) => !s)}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-50 to-white/90 dark:bg-[#04232c] border border-white/8 text-sm shadow-sm"
                    aria-expanded={tocOpen}
                    aria-controls="mobile-toc"
                  >
                    {tocOpen ? "Hide contents" : "Show contents"}
                  </button>
                </div>
              </div>
            </header>

            {/* mobile TOC panel */}
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
              id="agreement"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">1. Agreement</h2>
              <p>
                These Terms govern your access to and use of The Kariba Magazine
                website and services (the “Service”). By accessing or using the
                Service you agree to these Terms. If you do not agree, please do
                not use the Service.
              </p>
            </section>

            <section
              id="accounts"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">
                2. Who may use the Service / Accounts
              </h2>
              <p>
                You must be at least 13 years old . To access certain features you must create
                an account and keep your credentials confidential. Notify us
                immediately if you suspect unauthorized access.
              </p>
            </section>

            <section
              id="subscriptions"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">
                3. Subscriptions & Payments
              </h2>
              <p>
                We may offer free and paid tiers. Paid features are governed by
                the subscription terms shown at purchase. Payments are processed
                by third-party providers; you agree to their terms as well.
                Refunds and cancellations follow the policy at the time of
                purchase.
              </p>
            </section>

            <section
              id="user-content"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">4. User Content & License</h2>
              <p>
                You retain ownership of content you post (articles, images,
                comments). By submitting content you grant The Kariba Magazine a
                perpetual, worldwide, non-exclusive, royalty-free license to
                use, reproduce, distribute, and display that content in
                connection with the Service. You warrant you have the rights to
                submit the content.
              </p>
            </section>

            <section
              id="prohibited"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">5. Prohibited Conduct</h2>
              <p>You must not:</p>
              <ul>
                <li>Violate local laws or third-party rights;</li>
                <li>Post hateful, harassing, illegal or obscene content;</li>
                <li>Use automated scraping or abuse the Service;</li>
                <li>
                  Interfere with Service operations (DDoS, reverse-engineer).
                </li>
              </ul>
              <p>
                Violations may result in removal of content, suspension, or
                termination.
              </p>
            </section>

            <section id="ip" className="prose prose-lg dark:prose-invert mb-8">
              <h2 className="font-serif text-2xl">6. Intellectual Property</h2>
              <p>
                The site design, logos, editorial content and trademarks are
                protected by copyright and other IP laws. You may not reproduce
                or redistribute our content for commercial use without
                permission.
              </p>
            </section>

            <section
              id="links"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">7. Links to Third Parties</h2>
              <p>
                We may link to external websites. We do not control or endorse
                third-party content and are not responsible for it.
              </p>
            </section>

            <section
              id="disclaimer"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">8. Disclaimers</h2>
              <p>
                THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”. WE DISCLAIM
                WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY LAW. WE DO NOT
                GUARANTEE UNINTERRUPTED ACCESS OR THAT CONTENT IS ACCURATE.
              </p>
            </section>

            <section
              id="liability"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">
                9. Limitation of Liability
              </h2>
              <p>
                To the maximum extent permitted by law, The Kariba Magazine and
                its affiliates will not be liable for indirect, incidental,
                consequential, or special damages. Our aggregate liability for
                direct damages will be limited to the amount paid by you in the
                12 months preceding the claim, or USD 100 if you haven't paid
                us.
              </p>
            </section>

            <section
              id="governing"
              className="prose prose-lg dark:prose-invert mb-8"
            >
              <h2 className="font-serif text-2xl">
                10. Governing Law & Dispute Resolution
              </h2>
              <p>
                These Terms are governed by the laws of{" "}
                <em>[Zimbabwe]</em>. We
                prefer that disputes be resolved informally; if necessary
                parties may seek mediation or litigation in the courts of the
                chosen jurisdiction. Replace with arbitration if desired.
              </p>
            </section>

            <section
              id="contact"
              className="prose prose-lg dark:prose-invert mb-12"
            >
              <h2 className="font-serif text-2xl">11. Contact</h2>
              <p>
                For questions, DMCA notices, or legal requests contact:{" "}
                <a href="mailto:thekaribamagazine@gmail.com">
                  thekaribamagazine@gmail.com
                </a>
                .
              </p>
            </section>

            <footer className="border-t border-white/6 pt-4 text-sm text-slate-600 dark:text-slate-300">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                <div>© {new Date().getFullYear()} The Kariba Magazine</div>
                <div>
                  See also{" "}
                  <Link
                    to="/privacy"
                    className="text-indigo-600 dark:text-teal-300 hover:underline"
                  >
                    Privacy Policy
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
