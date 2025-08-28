// src/components/About.tsx
import React, { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import AboutBg from "../assets/images/about/aboutbg.png";
import client from "../api/client";

/* ---------------------------
   Small presentational pieces
   --------------------------- */

const SectionTitle: React.FC<{ eyebrow?: string; title: React.ReactNode }> = ({
  eyebrow,
  title,
}) => (
  <div className="mb-6">
    {eyebrow && (
      <p className="text-sm font-semibold tracking-wide uppercase text-emerald-400">
        {eyebrow}
      </p>
    )}
    <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-slate-900 dark:text-slate-100 leading-tight">
      {title}
    </h2>
  </div>
);

/* Animated number (gentle, respects prefers-reduced-motion) */
const AnimatedNumber: React.FC<{ value: number | null; format?: (n: number) => string }> = ({
  value,
  format = (n) => (n >= 1000 ? `${(n / 1000).toFixed(1)}k` : String(n)),
}) => {
  const reduce = useReducedMotion();
  const [display, setDisplay] = useState<number>(value ?? 0);

  useEffect(() => {
    if (reduce || value == null) {
      setDisplay(value ?? 0);
      return;
    }
    // simple count-up
    const from = Math.max(0, Math.floor(display));
    const to = Math.max(0, Math.floor(value));
    const diff = to - from;
    if (diff <= 0) {
      setDisplay(to);
      return;
    }
    const duration = 700; // ms
    const steps = Math.min(36, Math.max(6, Math.floor(duration / 20)));
    let cur = from;
    let step = 0;
    const id = window.setInterval(() => {
      step++;
      cur = Math.round(from + (diff * (step / steps)));
      setDisplay(cur);
      if (step >= steps) {
        clearInterval(id);
        setDisplay(to);
      }
    }, Math.max(8, Math.floor(duration / steps)));
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (value == null) return <>—</>;
  return <>{format(display)}</>;
};

const StatSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="h-9 w-28 rounded-md bg-slate-200 dark:bg-slate-700 mb-2" />
    <div className="h-3 w-32 rounded bg-slate-200 dark:bg-slate-700" />
  </div>
);

const Stat: React.FC<{ value: number | null; label: string; loading?: boolean }> = ({
  value,
  label,
  loading = false,
}) => {
  const reduce = useReducedMotion();
  return (
    <div className="flex flex-col items-start">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 6 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="text-2xl sm:text-3xl font-extrabold text-current"
      >
        {loading ? <span className="text-transparent select-none">000</span> : <AnimatedNumber value={value} />}
      </motion.div>
      <div className="text-xs sm:text-sm text-current/80">{label}</div>
    </div>
  );
};

const FeatureCard: React.FC<{ title: string; body: string }> = ({ title, body }) => {
  const reduce = useReducedMotion();
  return (
    <motion.article
      role="article"
      aria-label={title}
      whileHover={reduce ? {} : { y: -6, boxShadow: "0 18px 40px rgba(16,24,40,0.08)" }}
      transition={{ duration: 0.28 }}
      className="relative overflow-hidden rounded-2xl p-5 bg-white dark:bg-slate-900/80 border border-white/6 dark:border-white/6 shadow-sm"
    >
      <div
        aria-hidden
        className="absolute -left-10 -top-10 w-40 h-40 rounded-full opacity-30 blur-2xl pointer-events-none"
        style={{
          background: "linear-gradient(135deg, rgba(79,70,229,0.9), rgba(6,182,212,0.9))",
        }}
      />
      <h4 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">{title}</h4>
      <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{body}</p>
    </motion.article>
  );
};

/* ---------------------------
   Helpers: API count extraction (supports DRF pagination)
   --------------------------- */

async function fetchCountFromEndpoint(path: string, params?: Record<string, any>) {
  try {
    const res = await client.get(path, { params });
    const d = res.data;
    if (typeof d?.count === "number") return d.count;
    if (Array.isArray(d)) return d.length;
    if (Array.isArray(d?.results)) return d.results.length ?? null;
    return null;
  } catch (err) {
    return null;
  }
}

/* ---------------------------
   Main About component
   --------------------------- */

const About: React.FC = () => {
  const features = useMemo(
    () => [
      {
        title: "Storytelling that matters",
        body:
          "Investigative features, long-form essays and photojournalism — crafted to inform and inspire.",
      },
      {
        title: "Visual-first approach",
        body:
          "Photo essays and thoughtfully designed layouts that celebrate photography and illustration.",
      },
      {
        title: "Community-driven",
        body:
          "Writers, photographers and readers contribute — share your story and join the conversation.",
      },
    ],
    []
  );

  // dynamic stats
  const [issuesTotal, setIssuesTotal] = useState<number | null>(null);
  const [issuesPublished, setIssuesPublished] = useState<number | null>(null);
  const [contributorsTotal, setContributorsTotal] = useState<number | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoadingStats(true);
      setStatsError(null);
      try {
        const [total, published, contribs] = await Promise.all([
          fetchCountFromEndpoint("/issues/"),
          fetchCountFromEndpoint("/issues/", { published: true }),
          fetchCountFromEndpoint("/contributors/"),
        ]);
        if (!mounted) return;
        setIssuesTotal(total);
        setIssuesPublished(published);
        setContributorsTotal(contribs);
      } catch (err: any) {
        if (!mounted) return;
        setStatsError("Could not load stats");
      } finally {
        if (mounted) setLoadingStats(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // friendly display helpers

  // preserve defaults if API fails
  const featuredIssuesNumber = issuesTotal ?? 29;
  const publishedStories = issuesPublished ?? 120;
  const contributorsNumber = contributorsTotal ?? 30;

  const reduce = useReducedMotion();

  return (
    <section className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left: Header + narrative */}
          <div className="lg:col-span-6">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <SectionTitle
                eyebrow="About"
                title={
                  <>
                    The{" "}
                    <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-emerald-400">
                      Kariba
                    </span>{" "}
                    Magazine
                  </>
                }
              />

              <p className="mt-4 text-base sm:text-lg text-slate-700 dark:text-slate-300 leading-relaxed">
                Welcome to <strong>The Kariba Magazine</strong>. We believe in the power of storytelling to connect communities,
                inspire curiosity, and shine light on the people and places of the Kariba basin. We are a collective of journalists,
                photographers, designers and readers who value depth, craft and truth.
              </p>

              <div className="mt-6 space-y-4">
                <p className="text-slate-700 dark:text-slate-300">
                  <strong>What we stand for</strong> — independent, courageous reporting that centers local voices; beautiful visual work
                  that respects its subjects; and editorial care that prioritizes nuance over noise.
                </p>

                <p className="text-slate-700 dark:text-slate-300">
                  <strong>Join us</strong> — read deeply, share widely and consider contributing. Whether you are a photographer, writer
                  or reader, your perspective helps build a richer picture of the region we cover.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right: features, stats and a featured card */}
          <div className="lg:col-span-6">
            <motion.div
              initial={reduce ? undefined : { opacity: 0, y: 10 }}
              animate={reduce ? undefined : { opacity: 1, y: 0 }}
              transition={{ delay: 0.08, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-2 gap-4"
            >
              {features.map((f) => (
                <FeatureCard key={f.title} title={f.title} body={f.body} />
              ))}
            </motion.div>

            <motion.div
              initial={reduce ? undefined : { opacity: 0, scale: 0.995 }}
              animate={reduce ? undefined : { opacity: 1, scale: 1 }}
              transition={{ delay: 0.12, duration: 0.55 }}
              className="mt-6 p-6 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 ring-1 ring-white/6 shadow-xl"
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-indigo-600 dark:text-indigo-300">Featured</div>
                  <div className="mt-2 text-lg font-semibold text-slate-900 dark:text-slate-100">
                    Season highlights — visual stories
                  </div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-slate-500 dark:text-slate-400">Issues</div>
                  <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">
                    <AnimatedNumber value={featuredIssuesNumber} />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-4">
                <div className="w-28 h-16 rounded-md overflow-hidden bg-gradient-to-br from-indigo-500 via-emerald-400 to-rose-400 flex items-center justify-center shadow-inner">
                  <img src={AboutBg} alt="featured thumbnail" className="w-full h-full object-cover" />
                </div>

                <div className="flex-1">
                  <div className="text-sm text-slate-700 dark:text-slate-300">
                    Photo essays, in-depth reporting and interviews from the Kariba basin — curated for context and visual impact.
                  </div>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-4">
                <div className="p-4 rounded-lg bg-white dark:bg-slate-800/70 border border-white/6 shadow-sm text-slate-900 dark:text-slate-100">
                  {loadingStats ? (
                    <StatSkeleton />
                  ) : (
                    <Stat value={publishedStories} label="Published stories" loading={loadingStats} />
                  )}
                </div>

                <div className="p-4 rounded-lg bg-white dark:bg-slate-800/70 border border-white/6 shadow-sm text-slate-900 dark:text-slate-100">
                  {loadingStats ? (
                    <StatSkeleton />
                  ) : (
                    <Stat value={contributorsNumber} label="Contributors" loading={loadingStats} />
                  )}
                </div>
              </div>

              {statsError && (
                <div className="mt-4 text-sm text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/10 p-3 rounded">
                  {statsError}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;
