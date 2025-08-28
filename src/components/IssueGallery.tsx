import { useEffect, useState, type JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";
import client from "../api/client";

type Issue = {
  id: number;
  title: string;
  slug?: string;
  summary?: string;
  cover_low_url?: string | null;
  cover_high_url?: string | null;
  pdf_high_url?: string | null;
  pdf_low_url?: string | null;
  published: boolean;
  published_at?: string | null;
};

export default function IssueGallery(): JSX.Element {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<"low" | "high">("high");
  const reduce = useReducedMotion();

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);

    client
      .get("/issues/")
      .then((res) => {
        const data = res.data?.results ?? res.data;
        if (!mounted) return;
        setIssues(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.warn("Failed to load issues", e);
        if (mounted) setError("Failed to load issues. Please try again later.");
      })
      .finally(() => mounted && setLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  const formatDate = (iso?: string | null) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, { year: "numeric", month: "short" });
    } catch {
      return "";
    }
  };

  const containerVariants = !reduce
    ? {
        hidden: { opacity: 0 },
        show: { opacity: 1, transition: { staggerChildren: 0.06 } },
      }
    : undefined;

  const itemVariants = !reduce
    ? {
        hidden: { opacity: 0, y: 8 },
        show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
      }
    : undefined;

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 rounded-2xl bg-white/5 dark:bg-white/3">
              <div className="w-full h-44 sm:h-48 md:h-52 bg-slate-200 dark:bg-slate-700 rounded-lg" />
              <div className="mt-3 h-4 bg-slate-200 dark:bg-slate-700 w-3/4 rounded" />
              <div className="mt-2 h-3 bg-slate-200 dark:bg-slate-700 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="rounded-lg bg-rose-50 dark:bg-rose-900/10 p-6 text-rose-700 dark:text-rose-200">
          {error}
        </div>
      </div>
    );
  }

  if (!issues.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-slate-500 dark:text-slate-400">
        No issues found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-2xl md:text-3xl font-serif text-slate-900 dark:text-slate-100">Issues & Archive</h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">Browse our back catalogue — preview and download issues.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="text-sm text-slate-500 dark:text-slate-300">Preview quality</label>
          <div className="flex items-center gap-2 bg-white/6 dark:bg-slate-800 p-1 rounded-md">
            <button
              onClick={() => setQuality("low")}
              aria-pressed={quality === "low"}
              className={`px-3 py-1 rounded-md text-sm transition ${
                quality === "low"
                  ? "bg-gradient-to-r from-karibaTeal to-karibaCoral text-white shadow"
                  : "text-slate-800 dark:text-slate-200 hover:bg-white/10"
              }`}
            >
              Low
            </button>
            <button
              onClick={() => setQuality("high")}
              aria-pressed={quality === "high"}
              className={`px-3 py-1 rounded-md text-sm transition ${
                quality === "high"
                  ? "bg-gradient-to-r from-karibaTeal to-karibaCoral text-white shadow"
                  : "text-slate-800 dark:text-slate-200 hover:bg-white/10"
              }`}
            >
              High
            </button>
          </div>
        </div>
      </div>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6"
        initial="hidden"
        animate="show"
        variants={containerVariants as any}
      >
        {issues.map((it) => {
          const img =
            (quality === "high" ? it.cover_high_url : it.cover_low_url) ??
            it.cover_high_url ??
            it.cover_low_url ??
            null;
          const pdfHref = (quality === "high" ? it.pdf_high_url : it.pdf_low_url) ?? it.pdf_high_url ?? it.pdf_low_url ?? null;
          const dateStr = formatDate(it.published_at);

          return (
            <motion.article
              key={it.id}
              className="relative bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-sm border border-white/6 hover:shadow-lg transition-transform"
              variants={itemVariants as any}
              whileHover={!reduce ? { scale: 1.02, y: -6 } : undefined}
            >
              <div className="relative w-full">
                {img ? (
                  <img
                    src={img}
                    alt={it.title}
                    loading="lazy"
                    className="w-full object-cover"
                    // clamp height on mobile so images are not huge
                    style={{ height: "16rem", maxHeight: "42vh" }}
                  />
                ) : (
                  <div className="w-full h-44 bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center text-white">
                    <div className="text-center px-4">
                      <div className="text-xs uppercase text-slate-200">No cover</div>
                      <div className="mt-2 font-semibold">{it.title}</div>
                    </div>
                  </div>
                )}

                {/* published badge */}
                <div className="absolute left-4 top-4">
                  <span className={`inline-flex items-center gap-2 text-xs px-2.5 py-1 rounded-full font-medium ${
                    it.published ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-800"
                  }`}>
                    {it.published ? "Published" : "Draft"}
                    {dateStr ? <small className="ml-2 text-xs text-slate-600">{dateStr}</small> : null}
                  </span>
                </div>
              </div>

              <div className="p-4">
                <h4 className="font-semibold text-slate-900 dark:text-slate-100">{it.title}</h4>
                {it.summary ? (
                  <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 line-clamp-3">{it.summary}</p>
                ) : (
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">No summary available.</p>
                )}

                <div className="mt-4 flex flex-wrap gap-2 items-center">
                  {pdfHref ? (
                    <a
                      href={pdfHref}
                      download
                      className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-black rounded-md text-sm shadow-sm hover:brightness-95 transition"
                    >
                      Download
                    </a>
                  ) : null}

                  {it.slug ? (
                    <a
                      href={`/issues/${it.slug}`}
                      className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-800 rounded-md text-sm text-slate-800 dark:text-slate-100 hover:bg-white/6 transition"
                    >
                      Read online
                    </a>
                  ) : null}

                  <div className="ml-auto text-xs text-slate-500 dark:text-slate-400">
                    Issue #{it.id}
                  </div>
                </div>
              </div>
            </motion.article>
          );
        })}
      </motion.div>
    </div>
  );
}
