// src/pages/CommunityRules.tsx
import React from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="mb-8">
    <h3 className="text-xl font-semibold text-karibaNavy dark:text-karibaSand mb-3">
      {title}
    </h3>
    <div className="prose prose-invert text-sm text-white/90 max-w-none">
      {children}
    </div>
  </section>
);

export default function CommunityRules(): React.ReactElement {
  const reduce = useReducedMotion();

  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#041c22] py-12">
      <div className="max-w-5xl mx-auto px-4">
        <motion.header
          initial={reduce ? undefined : { opacity: 0, y: 8 }}
          animate={reduce ? undefined : { opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-6"
        >
          <div className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-karibaTeal to-karibaCoral flex items-center justify-center text-white font-bold shadow-lg">
              K
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-serif text-karibaNavy dark:text-karibaSand">
                Community rules & guidelines
              </h1>
              <p className="text-sm text-gray-500 dark:text-gray-300 mt-1">
                A safe, constructive space for discussion and storytelling.
              </p>
            </div>
          </div>
        </motion.header>

        <motion.article
          initial={reduce ? undefined : { opacity: 0 }}
          animate={reduce ? undefined : { opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.08 }}
          className="bg-white/4 dark:bg-white/3 rounded-xl p-6 shadow-sm ring-1 ring-white/6"
        >
          <Section title="Our principles">
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Respect:</strong> Treat others with courtesy. Disagree
                without being disagreeable.
              </li>
              <li>
                <strong>Constructive dialogue:</strong> Aim to add information,
                context or perspective.
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

          <Section title="What’s allowed">
            <p>
              Open, topical discussion related to The Kariba Magazine’s content:
              article responses, corrections, thoughtful analysis, and
              constructive feedback. Personal experience and community resources
              are welcome.
            </p>
          </Section>

          <Section title="Prohibited content">
            <p>
              The following content will not be tolerated and will be removed:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>
                <strong>Hate speech</strong> or content attacking people based
                on protected characteristics.
              </li>
              <li>
                <strong>Harassment & threats:</strong> Targeted harassment,
                doxxing or violent threats.
              </li>
              <li>
                <strong>Spam & self-promotion:</strong> Repetitive advertising,
                spammy links, MLM recruitment.
              </li>
              <li>
                <strong>Misinformation:</strong> Deliberate falsehoods presented
                as fact (especially safety/health claims).
              </li>
              <li>
                <strong>Illegal content:</strong> Anything facilitating or
                praising criminal activity.
              </li>
            </ul>
          </Section>

          <Section title="Moderation policy">
            <p>
              We moderate to keep the discussion safe and useful. Moderation
              actions include: hiding, editing, or removing content; temporarily
              suspending accounts; and permanently banning repeat offenders. We
              aim to be consistent and transparent.
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
                <strong>Appeals:</strong> If your content was removed in error,
                you may request a review (see below).
              </li>
            </ol>
          </Section>

          <Section title="How to report content">
            <p>
              Use the “Report” control visible on each comment or post. Provide
              a short reason and any links or context. If you need to contact us
              directly for urgent issues, email{" "}
              <a
                href="mailto:moderation@karibamagazine.example"
                className="text-karibaTeal hover:underline"
              >
                moderation@karibamagazine.example
              </a>
              .
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Don’t use reporting for simple disagreements—reports are for
              genuine policy or safety concerns.
            </p>
          </Section>

          <Section title="Appeals & transparency">
            <p>
              If you believe a moderation decision was incorrect, please contact
              us at{" "}
              <a
                href="mailto:moderation@karibamagazine.example"
                className="text-karibaTeal hover:underline"
              >
                moderation@karibamagazine.example
              </a>
              . Include the link to the content and a brief explanation. We will
              review and respond within 5–10 business days.
            </p>
          </Section>

          <Section title="Privacy & data retention">
            <p>
              Comments are public. We store author names, comment text,
              timestamps and IP metadata for moderation and abuse prevention.
              Personal data retention is limited — you can request deletion of
              your comments and personal data by emailing{" "}
              <a
                href="mailto:privacy@karibamagazine.example"
                className="text-karibaTeal hover:underline"
              >
                privacy@karibamagazine.example
              </a>
              .
            </p>
          </Section>

          <Section title="Best practices for posters">
            <ul className="list-disc pl-5 space-y-2">
              <li>Keep comments concise and on-topic.</li>
              <li>
                Check sources before sharing facts; link to reputable sources
                when possible.
              </li>
              <li>
                If replying to a specific paragraph, quote it so context is
                clear.
              </li>
            </ul>
          </Section>

          <Section title="Special notes for contributors & guests">
            <p>
              Contributors are asked to engage respectfully with readers. Paid
              contributors or sponsored content should follow our disclosure
              rules (see Terms). Editorial staff reserve the right to correct or
              remove comments that compromise a reporter’s safety or an ongoing
              investigation.
            </p>
          </Section>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Link
              to="/discussion"
              className="inline-flex items-center gap-2 px-4 py-2 bg-karibaTeal text-white rounded-md shadow hover:brightness-95"
            >
              Go to Discussion
            </Link>

            <a
              href="/privacy"
              className="inline-flex items-center gap-2 px-4 py-2 border border-white/8 rounded-md text-white/90 hover:bg-white/6"
            >
              Read Privacy Policy
            </a>

            <button
              onClick={() => window.print()}
              className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/6 hover:bg-white/8 text-sm"
            >
              Print
            </button>
          </div>

          <div className="mt-6 text-xs text-gray-400">
            <strong>Effective:</strong> August 20, 2025. We may update these
            rules periodically—when we do, we will post a notice.
          </div>
        </motion.article>
      </div>
    </main>
  );
}
