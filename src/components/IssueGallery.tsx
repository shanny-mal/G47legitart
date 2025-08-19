// src/components/IssueGallery.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

/* ---------------------------
   Types
   --------------------------- */
type Issue = {
  id: string;
  title: string;
  cover: { low: string; high: string };
  pdf: { low: string; high: string };
  published_at: string; // ISO date
};

/* ---------------------------
   Defaults / helpers
   --------------------------- */
const SAMPLE_ISSUES: Issue[] = [
  {
    id: "1",
    title: "Issue 01 – Kariba Stories",
    cover: {
      low: "/assets/issues/cover1-low.jpg",
      high: "/assets/issues/cover1-high.jpg",
    },
    pdf: {
      low: "/assets/issues/issue1-low.pdf",
      high: "/assets/issues/issue1-high.pdf",
    },
    published_at: "2025-01-01",
  },
  {
    id: "2",
    title: "Issue 02 – River Voices",
    cover: {
      low: "/assets/issues/cover2-low.jpg",
      high: "/assets/issues/cover2-high.jpg",
    },
    pdf: {
      low: "/assets/issues/issue2-low.pdf",
      high: "/assets/issues/issue2-high.pdf",
    },
    published_at: "2025-03-01",
  },
];

const formatDate = (iso?: string) => {
  try {
    if (!iso) return "";
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return iso ?? "";
  }
};

/* ---------------------------
   Small UI pieces
   --------------------------- */

/**
 * Upgraded QualityToggle:
 *  - animated sliding indicator
 *  - gradient active style
 */
function QualityToggle({
  quality,
  onChange,
}: {
  quality: "low" | "high";
  onChange: (q: "low" | "high") => void;
}) {
  const reduce = useReducedMotion();
  return (
    <div className="relative inline-flex items-center rounded-full bg-slate-100/40 dark:bg-slate-800/40 p-1 shadow-inner">
      <div className="absolute inset-0 rounded-full pointer-events-none" />
      <motion.button
        aria-pressed={quality === "low"}
        onClick={() => onChange("low")}
        className={`relative z-10 px-3 py-1 rounded-full text-sm font-medium transition ${
          quality === "low"
            ? "text-slate-900"
            : "text-slate-600 dark:text-slate-300"
        }`}
        whileHover={reduce ? undefined : { scale: 1.03 }}
      >
        Low
      </motion.button>

      <motion.button
        aria-pressed={quality === "high"}
        onClick={() => onChange("high")}
        className={`relative z-10 px-3 py-1 rounded-full text-sm font-medium transition ${
          quality === "high"
            ? "text-white"
            : "text-slate-600 dark:text-slate-300"
        }`}
        whileHover={reduce ? undefined : { scale: 1.03 }}
      >
        High
      </motion.button>

      {/* animated indicator */}
      <motion.div
        layout
        initial={false}
        transition={{ type: "spring", stiffness: 300, damping: 28 }}
        className={`absolute top-1/2 -translate-y-1/2 w-[48%] h-8 rounded-full shadow-md`}
        style={{
          left: quality === "low" ? "4px" : undefined,
          right: quality === "high" ? "4px" : undefined,
          background:
            quality === "high"
              ? "linear-gradient(90deg,#06b6d4,#fb7185)" // teal -> rose
              : "linear-gradient(90deg,#eef2ff,#dbeafe)", // soft indigo
        }}
        aria-hidden
      />
    </div>
  );
}

/* Skeleton card while loading */
const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-800/70 min-h-[260px] border border-slate-100 dark:border-slate-800 shadow-sm">
    <div className="w-full h-44 sm:h-52 rounded-lg bg-slate-200 dark:bg-slate-700 mb-4" />
    <div className="h-4 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2" />
    <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded w-1/3" />
  </div>
);

/* Modal / Preview viewer with focus trap + Esc close */
function PdfModal({
  url,
  title,
  open,
  onClose,
}: {
  url: string;
  title: string;
  open: boolean;
  onClose: () => void;
}) {
  // motion.dialog may wrap a native dialog; keep ref typed to HTMLDialogElement|null
  const ref = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    el?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);

  // focus trap (simple)
  useEffect(() => {
    if (!open) return;
    const el = ref.current;
    if (!el) return;
    const handle = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return;
      const focusables = el.querySelectorAll<HTMLElement>(
        "a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex='-1'])"
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (!e.shiftKey && document.activeElement === last) {
        first.focus();
        e.preventDefault();
      } else if (e.shiftKey && document.activeElement === first) {
        last.focus();
        e.preventDefault();
      }
    };
    window.addEventListener("keydown", handle);
    return () => window.removeEventListener("keydown", handle);
  }, [open]);

  const reduce = useReducedMotion();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.22 }}
            className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
            aria-hidden
          />

          <motion.dialog
            key="modal"
            ref={ref}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.99 }}
            transition={{ duration: reduce ? 0 : 0.25 }}
            role="dialog"
            aria-modal="true"
            aria-label={`Preview ${title}`}
          >
            <div className="w-full max-w-6xl h-[84vh] bg-white dark:bg-slate-900 rounded-xl overflow-hidden shadow-2xl ring-1 ring-slate-200 dark:ring-slate-800">
              <div className="flex items-center justify-between p-3 border-b border-slate-100 dark:border-slate-800">
                <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                  {title}
                </div>
                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded-md bg-gradient-to-r from-indigo-100 to-emerald-100 text-slate-900 text-sm hover:brightness-95"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 rounded-md bg-slate-100 dark:bg-slate-800 text-sm"
                    aria-label="Close preview"
                  >
                    Close
                  </button>
                </div>
              </div>

              {/* PDF viewer */}
              <iframe
                src={url}
                title={title}
                className="w-full h-full border-0 bg-white dark:bg-slate-900"
                sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
              />
            </div>
          </motion.dialog>
        </>
      )}
    </AnimatePresence>
  );
}

/* Card for each issue */
const IssueCard: React.FC<{
  issue: Issue;
  quality: "low" | "high";
  onPreview: (url: string, title: string) => void;
}> = ({ issue, quality, onPreview }) => {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  const coverSrc = quality === "high" ? issue.cover.high : issue.cover.low;
  const pdfSrc = quality === "high" ? issue.pdf.high : issue.pdf.low;

  // Preload high-res cover on hover/focus (non-blocking)
  useEffect(() => {
    if (!hovered) return;
    const img = new Image();
    img.src = issue.cover.high;
  }, [hovered, issue.cover.high]);

  return (
    <motion.article
      layout
      whileHover={reduce ? {} : { y: -8, scale: 1.01 }}
      whileTap={reduce ? {} : { scale: 0.995 }}
      className="bg-white dark:bg-slate-900 rounded-2xl overflow-hidden border border-slate-100 dark:border-slate-800 shadow-sm"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative group">
        <picture>
          <img
            src={coverSrc}
            alt={issue.title}
            className="w-full h-48 sm:h-56 object-cover rounded-t-2xl"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div className="absolute left-4 top-4 px-2 py-1 rounded-full bg-white/95 text-xs font-medium text-slate-900 shadow-sm">
          {formatDate(issue.published_at)}
        </div>

        {/* accent glow on hover */}
        <div
          aria-hidden
          className={`pointer-events-none absolute inset-x-0 bottom-0 h-12 blur-3xl opacity-0 transition-all ${
            hovered ? "opacity-90" : "opacity-0"
          }`}
          style={{
            background:
              "linear-gradient(90deg, rgba(99,102,241,0.14), rgba(6,182,212,0.16), rgba(251,113,133,0.12))",
          }}
        />
      </div>

      <div className="p-4">
        <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
          {issue.title}
        </h4>

        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={() => onPreview(pdfSrc, issue.title)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-emerald-400 text-white rounded-md text-sm font-medium shadow hover:scale-[1.01] focus:outline-none focus:ring-2 focus:ring-indigo-300"
            aria-label={`Preview ${issue.title}`}
          >
            Preview
          </button>

          <a
            href={`/issues/${issue.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-slate-700 rounded-md text-sm hover:bg-slate-50 dark:hover:bg-slate-800 focus:outline-none"
            aria-label={`Read ${issue.title} online`}
          >
            Read online
          </a>

          <a
            href={pdfSrc}
            download
            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-rose-400 to-amber-300 text-slate-900 rounded-md text-sm font-semibold shadow"
            aria-label={`Download ${issue.title}`}
          >
            Download
          </a>
        </div>
      </div>
    </motion.article>
  );
};

/* ---------------------------
   Main IssueGallery component
   --------------------------- */
const CACHE_KEY = "kariba_issues_v1";

const IssueGallery: React.FC = () => {
  const [issues, setIssues] = useState<Issue[] | null>(null);
  const [quality, setQuality] = useState<"low" | "high">("high");
  const [preview, setPreview] = useState<{ url: string; title: string } | null>(
    null
  );
  const mounted = useRef(true);

  // Load cached first
  useEffect(() => {
    mounted.current = true;
    const cached = (() => {
      try {
        const s = sessionStorage.getItem(CACHE_KEY);
        if (!s) return null;
        const parsed = JSON.parse(s) as Issue[];
        return Array.isArray(parsed) ? parsed : null;
      } catch {
        return null;
      }
    })();
    if (cached) setIssues(cached);

    const ctrl = new AbortController();
    (async () => {
      try {
        const res = await fetch("/api/issues", { signal: ctrl.signal });
        if (!res.ok) throw new Error("network");
        const data = (await res.json()) as Issue[];
        if (!mounted.current) return;
        if (Array.isArray(data) && data.length > 0) {
          setIssues(data);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(data));
          } catch {
            /* ignore */
          }
        } else {
          // fallback if API returned empty
          setIssues(SAMPLE_ISSUES);
        }
      } catch {
        if (!mounted.current) return;
        // fallback
        setIssues((prev) => prev ?? SAMPLE_ISSUES);
      }
    })();

    return () => {
      mounted.current = false;
      ctrl.abort();
    };
  }, []);

  const onPreview = useCallback((url: string, title: string) => {
    setPreview({ url, title });
  }, []);

  const closePreview = useCallback(() => setPreview(null), []);

  const reduce = useReducedMotion();

  return (
    <section className="py-12 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-3xl font-serif text-slate-900 dark:text-slate-100">
              Issues & Archive
            </h3>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
              Download complete issues or preview lower-resolution copies.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-slate-600 dark:text-slate-300">
              Preview quality
            </label>
            <QualityToggle quality={quality} onChange={setQuality} />
          </div>
        </div>

        {/* grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {issues === null ? (
            // loading skeletons
            <>
              <SkeletonCard />
              <SkeletonCard />
              <SkeletonCard />
            </>
          ) : issues.length === 0 ? (
            <div className="col-span-full p-6 rounded-lg bg-slate-100 dark:bg-slate-800 text-center">
              No issues found.
            </div>
          ) : (
            issues.map((it) => (
              <IssueCard
                key={it.id}
                issue={it}
                quality={quality}
                onPreview={onPreview}
              />
            ))
          )}
        </div>

        {/* optional: small CTA */}
        <div className="mt-8 text-center">
          <motion.a
            whileHover={reduce ? {} : { y: -3 }}
            whileTap={reduce ? {} : { scale: 0.985 }}
            href="/archive"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-semibold shadow-lg"
          >
            View full archive
          </motion.a>
        </div>
      </div>

      {/* preview modal */}
      <PdfModal
        open={Boolean(preview)}
        url={preview?.url ?? ""}
        title={preview?.title ?? ""}
        onClose={closePreview}
      />
    </section>
  );
};

export default React.memo(IssueGallery);
