// src/components/About.tsx
import React, { useMemo } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AboutBg from "../assets/images/about/aboutbg.png";

/* ---------------------------
   Small presentational pieces
   --------------------------- */

const SectionTitle: React.FC<{ eyebrow?: string; title: React.ReactNode }> = ({
  eyebrow,
  title,
}) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="text-sm font-semibold tracking-wider uppercase text-emerald-300">
        {eyebrow}
      </p>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
      {title}
    </h2>
  </div>
);

const Stat: React.FC<{ value: string; label: string }> = ({ value, label }) => {
  return (
    <div className="flex flex-col items-start">
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-2xl sm:text-3xl font-extrabold text-current"
      >
        {value}
      </motion.div>
      <div className="text-xs sm:text-sm text-current/80">{label}</div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; body: string }> = ({
  title,
  body,
}) => {
  const reduce = useReducedMotion();
  return (
    <motion.article
      role="article"
      aria-label={title}
      whileHover={
        reduce ? {} : { y: -6, boxShadow: "0 18px 40px rgba(16,24,40,0.12)" }
      }
      transition={{ duration: 0.35 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-white/6 dark:border-white/6 shadow-sm"
    >
      <div
        aria-hidden
        className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-gradient-to-br from-emerald-200 to-pink-300 opacity-30 blur-2xl pointer-events-none"
      />
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
        {title}
      </h4>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
        {body}
      </p>
    </motion.article>
  );
};

/* ---------------------------
   Main About component
   --------------------------- */

const About: React.FC = () => {
  const features = useMemo(
    () => [
      {
        title: "Storytelling that matters",
        body: "Investigative features, long-form essays and photojournalism — crafted to inform and inspire.",
      },
      {
        title: "Visual-first approach",
        body: "Photo essays and thoughtfully designed layouts that celebrate photography and illustration.",
      },
      {
        title: "Community-driven",
        body: "Writers, photographers and readers contribute — share your story and join the conversation.",
      },
    ],
    []
  );

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Header + narrative */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionTitle
                eyebrow="About"
                title={
                  <>
                    The <span className="text-emerald-400">Kariba</span>{" "}
                    Magazine
                  </>
                }
              />

              <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Welcome to <strong>The Kariba Magazine</strong>. We believe in
                the power of storytelling to connect communities, inspire
                curiosity, and shine light on the people and places of the
                Kariba basin. We are a collective of journalists, photographers,
                designers and readers who value depth, craft and truth.
              </p>

              <div className="mt-6 space-y-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>What we stand for</strong> — independent, courageous
                  reporting that centers local voices; beautiful visual work
                  that respects its subjects; and editorial care that
                  prioritizes nuance over noise.
                </p>

                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Join us</strong> — read deeply, share widely and
                  consider contributing. Whether you are a photographer, writer
                  or reader, your perspective helps build a richer picture of
                  the region we cover.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: features, stats and a featured card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {features.map((f) => (
                <FeatureCard key={f.title} title={f.title} body={f.body} />
              ))}
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.995 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.14, duration: 0.55 }}
              className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-emerald-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 ring-1 ring-white/6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-emerald-600 dark:text-emerald-300">
                    Featured
                  </div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Season highlights — visual stories
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Issues
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    29
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="w-28 h-16 rounded-md overflow-hidden bg-gradient-to-br from-emerald-400 to-rose-400 flex items-center justify-center shadow-inner">
                  {/* decorative thumbnail (keeps visual continuity) */}
                  <img
                    src={AboutBg}
                    alt="featured thumbnail"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Photo essays, in-depth reporting and interviews from the
                    Kariba basin — curated for context and visual impact.
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800/70 border border-white/6 shadow-sm text-slate-900 dark:text-slate-100">
                  <Stat value="120+" label="Published stories" />
                </div>
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800/70 border border-white/6 shadow-sm text-slate-900 dark:text-slate-100">
                  <Stat value="30+" label="Contributors" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
