// src/pages/Discussion.tsx
import { useCallback, useState, type JSX } from "react";
import CommentForm from "../components/comments/CommentForm";
import CommentsList from "../components/comments/CommentsList";
import { motion, useReducedMotion } from "framer-motion";

/**
 * DiscussionPage
 *
 * - Single/global discussion example (DISCUSSION_ID)
 * - CommentForm -> onPosted triggers refreshKey increment to remount CommentsList
 * - Responsive: main column + sticky aside on wide screens, collapsible on mobile
 * - Subtle motion respects prefers-reduced-motion
 */

export default function DiscussionPage(): JSX.Element {
  const DISCUSSION_ID = "global-discussion";

  // naive refresh trigger. CommentsList is remounted when this changes.
  const [refreshKey, setRefreshKey] = useState(0);

  const handlePosted = useCallback((_c: any) => {
    // bump a key to cause CommentsList to re-mount / refresh page 1.
    setRefreshKey((k) => k + 1);
  }, []);

  const [guidelinesOpen, setGuidelinesOpen] = useState(false);
  const reduce = useReducedMotion();

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-[#04121a] dark:to-[#041c22] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.header
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.45 }}
          className="mb-6"
        >
          <h1 className="text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Community Discussion
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            A welcoming space for readers to discuss stories, ideas and share
            local perspectives. Please be respectful — moderation may apply.
          </p>

          <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:gap-4 gap-3">
            <div className="inline-flex items-center gap-3 rounded-lg bg-gradient-to-r from-indigo-500 to-emerald-400 text-white px-4 py-2 shadow-md">
              <svg
                className="w-4 h-4 opacity-90"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M12 20l9-5-9-11-9 11 9 5z"
                  stroke="currentColor"
                  strokeWidth="0"
                  fill="currentColor"
                />
              </svg>
              <span className="text-sm font-medium">Open conversation</span>
            </div>

            <div className="ml-auto flex items-center gap-2 text-sm text-slate-500 dark:text-slate-300">
              <button
                onClick={() => setGuidelinesOpen((s) => !s)}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/95 dark:bg-[#04232c] border border-white/8 text-slate-700 dark:text-slate-100 hover:brightness-95 transition"
                aria-expanded={guidelinesOpen}
                aria-controls="discussion-guidelines"
              >
                {guidelinesOpen ? "Hide guidelines" : "Show guidelines"}
              </button>

              <a
                href="/contact"
                className="inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-slate-700 dark:text-slate-100 hover:underline"
              >
                Contact moderators
              </a>
            </div>
          </div>
        </motion.header>

        <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: main column */}
          <div className="lg:col-span-2 space-y-6">
            <CommentForm discussionId={DISCUSSION_ID} onPosted={handlePosted} />

            <div key={refreshKey}>
              <CommentsList discussionId={DISCUSSION_ID} initialPageSize={12} />
            </div>
          </div>

          {/* Right: aside (sticky on desktop, collapsible on mobile) */}
          <aside className="lg:col-span-1">
            {/* Sticky card on large screens */}
            <div className="hidden lg:block sticky top-28 space-y-4">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100 dark:bg-[#04232b] dark:border-slate-700">
                <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Guidelines
                </h3>
                <ul className="mt-3 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                  <li>Be civil and respectful.</li>
                  <li>No hateful, harassing or illegal content.</li>
                  <li>Don't share personal data of others.</li>
                  <li>Keep conversation on-topic and constructive.</li>
                </ul>
                <div className="mt-3">
                  <a
                    href="/community-rules"
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    Full community rules
                  </a>
                </div>
              </div>
            </div>

            {/* Mobile collapsible guidelines */}
            <div className={`lg:hidden space-y-3`}>
              {guidelinesOpen && (
                <motion.div
                  id="discussion-guidelines"
                  initial={reduce ? undefined : { opacity: 0, y: 6 }}
                  animate={reduce ? undefined : { opacity: 1, y: 0 }}
                  transition={{ duration: 0.28 }}
                  className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 dark:bg-[#04232b] dark:border-slate-700"
                >
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                    Guidelines
                  </h3>
                  <ul className="mt-2 text-sm text-slate-600 dark:text-slate-300 space-y-2">
                    <li>Be civil and respectful.</li>
                    <li>No hateful, harassing or illegal content.</li>
                    <li>Don't share personal data of others.</li>
                    <li>Keep conversation on-topic and constructive.</li>
                  </ul>
                  <div className="mt-3">
                    <a
                      href="/community-rules"
                      className="text-sm text-indigo-600 hover:underline"
                    >
                      Full community rules
                    </a>
                  </div>
                </motion.div>
              )}

              <div className="bg-white rounded-xl p-3 shadow-sm border border-slate-100 dark:bg-[#04232b] dark:border-slate-700">
                <h4 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  Moderation & contact
                </h4>
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  To report a comment, contact moderators via{" "}
                  <a
                    href="/contact"
                    className="text-indigo-600 hover:underline"
                  >
                    our contact form
                  </a>
                  .
                </p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
