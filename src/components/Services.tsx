import React, { useMemo, type JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Service = {
  title: string;
  desc: string;
  /** small decorative svg (keeps vector crisp) */
  icon: JSX.Element;
  href?: string;
};

/* ---------- Motion variants (defined once) ---------- */
const containerVariants = {
  visible: {
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
  hidden: {},
};

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45 } },
};

/* ---------- Small presentational card ---------- */
const ServiceCard: React.FC<{ s: Service }> = React.memo(({ s }) => {
  const reduce = useReducedMotion();

  return (
    <motion.article
      role="article"
      aria-label={s.title}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.2 }}
      variants={cardVariants}
      whileHover={reduce ? {} : { translateY: -6, scale: 1.01 }}
      whileFocus={reduce ? {} : { translateY: -4, scale: 1.005 }}
      className="group relative overflow-hidden rounded-2xl p-6 bg-white/90 dark:bg-[#052231]/90 border border-white/6 dark:border-white/6 shadow-sm transition-shadow focus-within:shadow-lg focus-within:outline-none focus-within:ring-2 focus-within:ring-karibaTeal/30"
      tabIndex={0}
    >
      {/* Decorative accent */}
      <div
        className="absolute -top-6 -right-10 w-40 h-40 rounded-full bg-gradient-to-br from-karibaTeal/20 to-karibaCoral/10 blur-3xl pointer-events-none opacity-60 group-hover:opacity-90 transition-opacity"
        aria-hidden
      />

      <div className="flex items-start gap-4">
        <div className="flex-none w-12 h-12 rounded-xl bg-white/6 dark:bg-white/5 flex items-center justify-center text-karibaNavy dark:text-karibaSand text-xl shadow-inner">
          {s.icon}
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-karibaNavy dark:text-karibaSand">
            {s.title}
          </h3>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-300 leading-snug">
            {s.desc}
          </p>

          <div className="mt-4">
            <a
              href={s.href ?? "/contact"}
              className="inline-flex items-center gap-2 text-sm font-medium text-karibaTeal dark:text-karibaTeal hover:underline focus:outline-none"
              aria-label={`Learn more about ${s.title}`}
            >
              Learn more
              <span aria-hidden>→</span>
            </a>
          </div>
        </div>
      </div>
    </motion.article>
  );
});
ServiceCard.displayName = "ServiceCard";

/* ---------- Main Services component ---------- */
const Services: React.FC = () => {
  const services = useMemo<Service[]>(
    () => [
      {
        title: "Editorial & Copyediting",
        desc: "Professional editing for long-form features, headlines and web pieces — meticulous, culturally aware copy.",
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden>
            <path
              d="M4 20h16"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M7 7l10-3-3 10L7 7z"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        title: "Layout & Typesetting",
        desc: "Magazine-grade layout for print and responsive web — typography-first approach for legible, beautiful pages.",
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden>
            <rect
              x="3"
              y="4"
              width="18"
              height="16"
              rx="2"
              stroke="currentColor"
              strokeWidth="1.6"
            />
            <path
              d="M7 8h10M7 12h10M7 16h6"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ),
      },
      {
        title: "Photo Editing",
        desc: "Color grading, retouching and restoration — preserving texture and tone while respecting the subject.",
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden>
            <path
              d="M21 15V7a2 2 0 0 0-2-2h-4l-2-2H8a2 2 0 0 0-2 2v10"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle
              cx="12"
              cy="14"
              r="3"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        ),
      },
      {
        title: "Advertising & Sponsorship",
        desc: "Native sponsored content, display packages and bespoke campaigns tuned for our readership.",
        icon: (
          <svg viewBox="0 0 24 24" className="w-6 h-6" fill="none" aria-hidden>
            <path
              d="M4 17h16M4 7h8"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <rect
              x="4"
              y="10"
              width="16"
              height="4"
              rx="1"
              stroke="currentColor"
              strokeWidth="1.6"
            />
          </svg>
        ),
      },
    ],
    []
  );

  const reduce = useReducedMotion();

  return (
    <section
      className="py-16 bg-gray-50 dark:bg-[#072231]"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h2
            id="services-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-karibaNavy dark:text-karibaSand"
          >
            What we offer
          </h2>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Editorial production services tailored for magazines, brands and
            storytellers — from copy to print-ready layout.
          </p>
        </div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={containerVariants}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          {services.map((s) => (
            <ServiceCard key={s.title} s={s} />
          ))}
        </motion.div>

        <div className="mt-10 text-center">
          <motion.a
            whileHover={reduce ? {} : { y: -3 }}
            whileTap={reduce ? {} : { scale: 0.98 }}
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-karibaTeal to-karibaCoral text-black font-semibold shadow-lg focus:outline-none focus:ring-2 focus:ring-karibaTeal/30"
          >
            Get a quote
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14M12 5l7 7-7 7"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </motion.a>
        </div>
      </div>
    </section>
  );
};

export default React.memo(Services);
