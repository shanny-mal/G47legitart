// src/pages/CommunityRules.tsx
import React from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Link } from "react-router-dom";
import {
  FiShield,
  FiUsers,
  FiSlash,
  FiAlertTriangle,
  FiMail,
  FiPrinter,
} from "react-icons/fi";

/**
 * CommunityRules page - TypeScript / Framer Motion-safe
 * - Improved colors, responsive layout
 * - Respects prefers-reduced-motion
 * - Fixes Variants typing error by typing variants as `Variants | undefined`
 */

const Section: React.FC<{
  id?: string;
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}> = ({ id, title, icon, children }) => {
  return (
    <section
      id={id}
      className="mb-6"
      aria-labelledby={id ? `${id}-title` : undefined}
    >
      <div className="flex items-start gap-3">
        {icon && (
          <div className="mt-1 text-indigo-500 dark:text-indigo-300">
            {icon}
          </div>
        )}
        <h3
          id={id ? `${id}-title` : undefined}
          className="text-lg sm:text-xl font-semibold text-slate-900 dark:text-slate-100"
        >
          {title}
        </h3>
      </div>

      <div className="mt-3 prose prose-sm sm:prose lg:prose-lg dark:prose-invert max-w-none text-slate-700 dark:text-slate-200">
        {children}
      </div>
    </section>
  );
};

export default function CommunityRules(): React.ReactElement {
  const reduce = useReducedMotion();

  // container animation props (object or undefined)
  const headerMotion = reduce
    ? undefined
    : {
        initial: { opacity: 0, y: 8 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.45 },
      };

  // section variants typed as Variants | undefined to satisfy TS
  const sectionVariants: Variants | undefined = reduce
    ? undefined
    : ({
        hidden: { opacity: 0, y: 8 },
        // `show` is a function that accepts custom (index) to stagger
        show: (i = 0) => ({
          opacity: 1,
          y: 0,
          transition: { delay: 0.05 * i, duration: 0.35, ease: "easeOut" },
        }),
      } as Variants);

  return (
    <main className="min-h-screen py-12 bg-gradient-to-b from-slate-50 via-white to-slate-50 dark:from-[#05121a] dark:via-[#041722] dark:to-[#04121a]">
      <div className="max-w-4xl mx-auto px-4">
        <motion.header {...(headerMotion ?? {})} className="mb-6">
          <div className="flex items-start gap-4">
            <div className="flex-none w-14 h-14 rounded-lg bg-gradient-to-br from-indigo-500 via-emerald-400 to-rose-400 flex items-center justify-center text-white text-xl font-bold shadow-2xl">
              K
            </div>

            <div className="flex-1">
              <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-slate-900 dark:text-slate-100">
                Community rules & guidelines
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                We want conversations to be civil, useful and safe. These rules
                explain what’s expected from contributors and readers, and how
                moderation works.
              </p>

              <div className="mt-4 flex flex-wrap gap-3">
                <Link
                  to="/discussion"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-400 text-white shadow hover:brightness-95 transition"
                >
                  Go to discussion
                </Link>

                <Link
                  to="/privacy"
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-white/3 hover:bg-white/95 transition"
                >
                  Read privacy policy
                </Link>

                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 text-sm text-slate-800 dark:text-slate-100 transition"
                  aria-label="Print community rules"
                >
                  <FiPrinter className="w-4 h-4" />
                  Print
                </button>
              </div>
            </div>
          </div>
        </motion.header>

        <motion.article
          initial={reduce ? undefined : "hidden"}
          animate={reduce ? undefined : "show"}
          className="bg-gradient-to-br from-white/70 to-white/50 dark:from-[#05202a]/70 dark:to-[#04202a]/60 rounded-2xl p-6 shadow-lg ring-1 ring-slate-100 dark:ring-0"
          role="article"
        >
          <motion.div variants={sectionVariants} custom={0}>
            <Section
              id="principles"
              title="Our principles"
              icon={<FiShield className="w-5 h-5" />}
            >
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Respect:</strong> Treat others with courtesy. Disagree
                  without being disagreeable.
                </li>
                <li>
                  <strong>Constructive dialogue:</strong> Aim to add
                  information, context or perspective.
                </li>
                <li>
                  <strong>Evidence & attribution:</strong> Support claims with
                  facts or links where possible.
                </li>
                <li>
                  <strong>Privacy & safety:</strong> Don’t post other people’s
                  private information.
                </li>
              </ul>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={1}>
            <Section
              id="allowed"
              title="What’s allowed"
              icon={<FiUsers className="w-5 h-5" />}
            >
              <p>
                Open, topical discussion related to The Kariba Magazine’s
                content: article responses, corrections, thoughtful analysis,
                and constructive feedback. Personal experience and community
                resources are welcome — please keep contributions on-topic.
              </p>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={2}>
            <Section
              id="prohibited"
              title="Prohibited content"
              icon={<FiSlash className="w-5 h-5" />}
            >
              <p>
                The following content will not be tolerated and will be removed:
              </p>
              <ul className="list-disc pl-5 space-y-2 mt-2">
                <li>
                  <strong>Hate speech:</strong> content attacking people based
                  on protected characteristics.
                </li>
                <li>
                  <strong>Harassment & threats:</strong> targeted harassment,
                  doxxing or violent threats.
                </li>
                <li>
                  <strong>Spam & self-promotion:</strong> repetitive advertising
                  or spammy links.
                </li>
                <li>
                  <strong>Misinformation:</strong> deliberate falsehoods
                  presented as fact.
                </li>
                <li>
                  <strong>Illegal content:</strong> anything facilitating or
                  praising criminal activity.
                </li>
              </ul>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={3}>
            <Section
              id="moderation"
              title="Moderation policy"
              icon={<FiAlertTriangle className="w-5 h-5" />}
            >
              <p>
                We moderate to protect the community and keep conversations
                useful. Actions include hiding, editing or removing content;
                temporary suspensions; and permanent bans for repeat offenders.
                We strive to act consistently and transparently.
              </p>

              <ol className="list-decimal pl-5 space-y-2 mt-3">
                <li>
                  <strong>Notice:</strong> We will notify users where possible
                  when content is removed or edited.
                </li>
                <li>
                  <strong>Escalation:</strong> Repeated violations may lead to
                  temporary or permanent suspension.
                </li>
                <li>
                  <strong>Appeals:</strong> If your content was removed in
                  error, you may request a review (see below).
                </li>
              </ol>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={4}>
            <Section
              id="report"
              title="How to report content"
              icon={<FiMail className="w-5 h-5" />}
            >
              <p>
                Use the “Report” control visible on each comment or post and
                include a short reason and any links or context. For urgent
                matters or safety concerns, email{" "}
                <a
                  href="mailto: thekaribamagazine@gmail.com"
                  className="text-indigo-600 hover:underline"
                >
                  thekaribamagazine@gmail.com
                </a>
                .
              </p>
              <p className="text-xs text-slate-500 mt-2">
                Reports are for genuine policy or safety concerns, not for
                disagreements.
              </p>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={5}>
            <Section id="appeals" title="Appeals & transparency">
              <p>
                If you believe a moderation decision was incorrect, contact us
                at{" "}
                <a
                  href="mailto:thekaribamagazine@gmail.com"
                  className="text-indigo-600 hover:underline"
                >
                  thekaribamagazine@gmail.com
                </a>
                . Include the content link and a brief explanation. We aim to
                respond within 5–10 business days.
              </p>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={6}>
            <Section id="privacy" title="Privacy & data retention">
              <p>
                Comments are public. We store author names, comment text,
                timestamps and IP metadata for moderation and abuse prevention.
                Personal data retention is limited — you can request deletion by
                emailing{" "}
                <a
                  href="mailto:thekaribamagazine@gmail.com"
                  className="text-indigo-600 hover:underline"
                >
                  thekaribamagazine@gmail.com
                </a>
                .
              </p>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={7}>
            <Section id="best-practices" title="Best practices for posters">
              <ul className="list-disc pl-5 space-y-2">
                <li>Keep comments concise and on-topic.</li>
                <li>
                  Check sources before sharing facts; link reputable sources
                  when possible.
                </li>
                <li>
                  If replying to a specific paragraph, quote it so context is
                  clear.
                </li>
              </ul>
            </Section>
          </motion.div>

          <motion.div variants={sectionVariants} custom={8}>
            <Section
              id="contributors"
              title="Special notes for contributors & guests"
            >
              <p>
                Contributors are asked to engage respectfully with readers. Paid
                contributors or sponsored content should follow our disclosure
                rules (see Terms). Editorial staff may remove or correct
                comments that compromise a reporter’s safety or an ongoing
                investigation.
              </p>
            </Section>
          </motion.div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Link
              to="/discussion"
              className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-md shadow hover:brightness-95 transition"
            >
              Go to discussion
            </Link>

            <Link
              to="/privacy"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 bg-white/90 dark:bg-white/3 hover:bg-white/95 transition"
            >
              Read privacy policy
            </Link>

            <button
              onClick={() => window.print()}
              className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 text-sm transition"
              aria-label="Print rules"
            >
              <FiPrinter className="w-4 h-4" />
              Print
            </button>
          </div>

          <div className="mt-6 text-xs text-slate-500 dark:text-slate-400">
            <strong>Effective:</strong> August 20, 2025. These rules may be
            updated periodically; we'll post notices for material changes.
          </div>
        </motion.article>
      </div>
    </main>
  );
}
