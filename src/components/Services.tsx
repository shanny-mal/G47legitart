// src/components/Services.tsx
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";

type Service = {
  title: string;
  desc: string;
  /** small decorative svg (keeps vector crisp) */
  icon: React.ReactNode;
  href?: string;
};

/* ---------- Motion variants (defined once) ---------- */
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.06,
      delayChildren: 0.06,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 10, scale: 0.995 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: "spring", stiffness: 320, damping: 28, mass: 0.9 },
  },
};

const hoverSpring = { type: "spring", stiffness: 380, damping: 30 };

/* ---------- Small presentational card ---------- */
const ServiceCard: React.FC<{ s: Service }> = React.memo(({ s }) => {
  const reduce = useReducedMotion();

  // Root element changes to anchor when href exists (makes whole card clickable)
  const Root: any = s.href ? motion.a : motion.article;
  const rootProps = s.href ? { href: s.href } : {};

  return (
    <Root
      {...rootProps}
      role="article"
      aria-label={s.title}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.18 }}
      variants={cardVariants}
      whileHover={reduce ? {} : { y: -8, scale: 1.02 }}
      whileTap={reduce ? {} : { scale: 0.995 }}
      transition={hoverSpring}
      className="group relative overflow-hidden rounded-2xl p-6 bg-white dark:bg-slate-900/90 border border-gray-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-shadow duration-300 focus-within:shadow-2xl focus-within:outline-none focus-within:ring-2 focus-within:ring-indigo-400/30"
      tabIndex={0}
    >
      {/* Decorative accent: large blurred gradient circle */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-10 -top-8 w-44 h-44 rounded-full blur-[40px] opacity-60 transition-opacity duration-500 group-hover:opacity-95"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(99,102,241,0.18), rgba(16,185,129,0.06) 40%, transparent 60%)",
        }}
      />

      <div className="flex items-start gap-4 relative z-10">
        <div
          className="flex-none w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-inner"
          style={{
            background: "linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)",
          }}
        >
          {/* Icon sized and using currentColor so its stroke/fill inherits white */}
          <div className="w-6 h-6 text-white">{s.icon}</div>
        </div>

        <div className="flex-1">
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-50">
            {s.title}
          </h3>

          <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {s.desc}
          </p>

          <div className="mt-4">
            <a
              href={s.href ?? "#"}
              className="inline-flex items-center gap-2 text-sm font-medium text-indigo-600 dark:text-indigo-300 hover:underline focus:outline-none"
              aria-label={`Learn more about ${s.title}`}
            >
              Learn more
              <svg
                className="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M5 12h14"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M12 5l7 7-7 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </a>
          </div>
        </div>
      </div>
    </Root>
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
        href: "/services/editorial",
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
        href: "/services/layout",
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
        href: "/services/photo-editing",
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
        href: "/services/ads",
      },
      // You can add more services here if desired (keeps grid balanced)
    ],
    []
  );

  const reduce = useReducedMotion();

  return (
    <section
      className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-[#041827]"
      aria-labelledby="services-heading"
    >
      <div className="max-w-7xl mx-auto px-4">
        <div className="mb-8 text-center">
          <h2
            id="services-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-serif font-semibold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-teal-400"
          >
            What we offer
          </h2>
          <p className="mt-2 text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto">
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
            whileHover={reduce ? {} : { y: -3, scale: 1.02 }}
            whileTap={reduce ? {} : { scale: 0.98 }}
            href="/contact"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-600 to-teal-400 text-white font-semibold shadow-xl focus:outline-none focus:ring-2 focus:ring-indigo-400/30 transition-transform"
          >
            Get a quote
            <svg
              viewBox="0 0 24 24"
              className="w-4 h-4"
              fill="none"
              aria-hidden
            >
              <path
                d="M5 12h14"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 5l7 7-7 7"
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
