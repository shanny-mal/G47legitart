// src/pages/ContributorList.tsx
import  { useEffect, useMemo, useState, type JSX } from "react";
import client from "../api/client";
import { motion, useReducedMotion } from "framer-motion";
import { Link } from "react-router-dom";

type Contributor = {
  id: number;
  name: string;
  bio?: string;
  avatar?: string | null;
};

function initials(name?: string) {
  if (!name) return "A";
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function paletteFor(name?: string) {
  // deterministic-ish palette choice based on name char codes
  const seed = (name || "").split("").reduce((s, ch) => s + ch.charCodeAt(0), 0);
  const idx = seed % 6;
  const map = [
    "from-indigo-500 to-emerald-400",
    "from-rose-400 to-amber-300",
    "from-teal-400 to-indigo-400",
    "from-fuchsia-500 to-rose-400",
    "from-emerald-400 to-teal-300",
    "from-sky-500 to-indigo-500",
  ];
  return map[idx];
}

const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-2xl bg-white/6 dark:bg-white/4 min-h-[120px]">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-full bg-white/12" />
      <div className="flex-1">
        <div className="h-4 bg-white/12 w-3/4 rounded mb-2" />
        <div className="h-3 bg-white/12 w-1/2 rounded mb-3" />
        <div className="h-6 bg-white/12 w-full rounded" />
      </div>
    </div>
  </div>
);

export default function ContributorList(): JSX.Element {
  const [list, setList] = useState<Contributor[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await client.get("/contributors/");
        const data = res.data?.results ?? res.data ?? [];
        if (!mounted) return;
        setList(Array.isArray(data) ? data : []);
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load contributors", err);
        if (!mounted) return;
        setError("Unable to load contributors. Try again later.");
        setList([]);
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const gridItems = useMemo(() => {
    if (!list) return [];
    return list;
  }, [list]);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <header className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Contributors
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
            Journalists, photographers and visual storytellers from the region.
            Click a profile to learn more or get in touch.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/contributors/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-medium shadow hover:brightness-95 transition"
          >
            Add contributor
          </Link>
          <Link
            to="/contributors"
            className="text-sm text-slate-700 dark:text-slate-200 hover:underline"
          >
            View all
          </Link>
        </div>
      </header>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      ) : error ? (
        <div className="rounded-lg p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-200">
          {error}
        </div>
      ) : gridItems.length === 0 ? (
        <div className="rounded-lg p-6 bg-white/6 dark:bg-white/4 text-slate-700 dark:text-slate-200">
          No contributors found.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {gridItems.map((c) => {
            const hasAvatar = Boolean(c.avatar);
            const initialsText = initials(c.name);
            const palette = paletteFor(c.name);

            return (
              <motion.article
                key={c.id}
                layout
                initial={reduce ? undefined : { opacity: 0, y: 8 }}
                animate={reduce ? undefined : { opacity: 1, y: 0 }}
                transition={{ duration: 0.32, delay: 0.02 * (c.id % 6) }}
                whileHover={reduce ? undefined : { translateY: -6, boxShadow: "0 12px 30px rgba(2,6,23,0.08)" }}
                className="relative overflow-hidden rounded-2xl p-4 bg-white shadow-sm border border-slate-100 dark:bg-[#04232b] dark:border-slate-700"
                aria-label={`${c.name} — contributor card`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-none">
                    {hasAvatar ? (
                      <img
                        src={c.avatar as string}
                        alt={c.name}
                        className="w-16 h-16 rounded-full object-cover border border-slate-100 dark:border-slate-700"
                        loading="lazy"
                        decoding="async"
                        style={{ backgroundColor: "rgba(0,0,0,0.04)" }}
                      />
                    ) : (
                      <div
                        className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-semibold text-lg bg-gradient-to-br ${palette}`}
                        aria-hidden
                      >
                        {initialsText}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start gap-3">
                      <div className="min-w-0">
                        <Link
                          to={`/contributors/${c.id}`}
                          className="block text-base font-semibold text-slate-900 dark:text-slate-100 truncate hover:underline"
                        >
                          {c.name}
                        </Link>
                        {c.bio && (
                          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 line-clamp-3">
                            {c.bio}
                          </p>
                        )}
                      </div>

                      <div className="ml-auto flex items-center gap-2">
                        <Link
                          to={`/contributors/${c.id}`}
                          className="text-sm inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/95 dark:bg-[#02242b] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-100 hover:brightness-95 transition"
                        >
                          View profile
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>

                {/* optional footer (small) */}
                <div className="mt-3 text-xs text-slate-500 dark:text-slate-400">
                  Contributor ID: {c.id}
                </div>
              </motion.article>
            );
          })}
        </div>
      )}
    </div>
  );
}
