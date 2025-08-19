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

function QualityToggle({
  quality,
  onChange,
}: {
  quality: "low" | "high";
  onChange: (q: "low" | "high") => void;
}) {
  return (
    <div className="inline-flex items-center rounded-lg bg-white/6 dark:bg-white/4 p-1 shadow-sm">
      <button
        aria-pressed={quality === "low"}
        onClick={() => onChange("low")}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
          quality === "low"
            ? "bg-white/90 text-karibaNavy shadow-inner"
            : "text-gray-600 dark:text-gray-300 hover:bg-white/5"
        }`}
      >
        Low (preview)
      </button>

      <button
        aria-pressed={quality === "high"}
        onClick={() => onChange("high")}
        className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
          quality === "high"
            ? "bg-gradient-to-r from-karibaTeal to-karibaCoral text-black shadow"
            : "text-gray-600 dark:text-gray-300 hover:bg-white/5"
        }`}
      >
        High (full)
      </button>
    </div>
  );
}

/* Skeleton card while loading */
const SkeletonCard = () => (
  <div className="animate-pulse p-4 rounded-2xl bg-white/6 dark:bg-white/4 min-h-[240px]">
    <div className="w-full h-40 rounded bg-white/10 mb-4" />
    <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
    <div className="h-3 bg-white/10 rounded w-1/3" />
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
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const el = ref.current;
    // focus modal container
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
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.18 }}
            className="fixed inset-0 z-40 bg-black"
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
            <div className="w-full max-w-5xl h-[80vh] bg-white rounded-lg overflow-hidden shadow-xl">
              <div className="flex items-center justify-between p-3 border-b">
                <div className="text-sm font-medium">{title}</div>
                <div className="flex items-center gap-2">
                  <a
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1 rounded bg-white/6 hover:bg-white/8 text-sm"
                  >
                    Open in new tab
                  </a>
                  <button
                    onClick={onClose}
                    className="px-3 py-1 rounded bg-white/6 hover:bg-white/8 text-sm"
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
                className="w-full h-full border-0 bg-gray-50"
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
      whileHover={reduce ? {} : { y: -6 }}
      whileTap={reduce ? {} : { scale: 0.995 }}
      className="bg-white rounded-2xl shadow-sm dark:bg-[#052231] overflow-hidden border border-white/6"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className="relative">
        <picture>
          {/* if your covers include webp variants, you can replace or augment the <source> here */}
          <img
            src={coverSrc}
            alt={issue.title}
            className="w-full h-48 sm:h-56 object-cover"
            loading="lazy"
            decoding="async"
          />
        </picture>

        <div className="absolute left-3 top-3 px-2 py-1 rounded bg-white/90 text-xs font-medium text-karibaNavy">
          {formatDate(issue.published_at)}
        </div>
      </div>

      <div className="p-4">
        <h4 className="text-base font-semibold text-karibaNavy dark:text-karibaCoral">
          {issue.title}
        </h4>

        <div className="mt-3 flex flex-wrap gap-2">
          <button
            onClick={() => onPreview(pdfSrc, issue.title)}
            className="inline-flex items-center gap-2 px-3 py-2 bg-white/95 text-karibaNavy rounded-md text-sm font-medium shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-karibaTeal/30"
            aria-label={`Preview ${issue.title}`}
          >
            Preview
          </button>

          <a
            href={`/issues/${issue.id}`}
            className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm hover:bg-white/6 focus:outline-none"
            aria-label={`Read ${issue.title} online`}
          >
            Read online
          </a>

          <a
            href={pdfSrc}
            download
            className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-black rounded-md text-sm font-semibold shadow"
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
    <section className="py-12">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <h3 className="text-2xl font-serif text-karibaNavy dark:text-karibaSand">
              Issues & Archive
            </h3>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Download full issues or preview lower-resolution previews online.
            </p>
          </div>

          <div className="flex items-center gap-4">
            <label className="text-sm text-gray-600 dark:text-gray-300">
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
            <div className="col-span-full p-6 rounded-lg bg-white/6 dark:bg-white/4">
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
            whileTap={reduce ? {} : { scale: 0.98 }}
            href="/archive"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-karibaTeal to-karibaCoral text-black font-semibold shadow-lg"
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
