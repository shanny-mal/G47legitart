// src/components/Testimonials.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import axios from "axios";
import { motion, useReducedMotion } from "framer-motion";

/* ---------------------------
   Types & defaults
   --------------------------- */
type Review = {
  id: string;
  author: string;
  rating: number;
  text: string;
  avatar?: string | null;
  time?: string | null; // optional time/date string
};

const DEFAULT_REVIEWS: Review[] = [
  {
    id: "1",
    author: "S. Chipezeze",
    rating: 5,
    text: "Beautiful stories and stunning photography.",
  },
  {
    id: "2",
    author: "R. Kasiyabvumba",
    rating: 4,
    text: "Great editorial depth and well-written features.",
  },
  {
    id: "3",
    author: "A. Mwangi",
    rating: 5,
    text: "Wonderful production values and powerful reporting.",
  },
];

/* ---------------------------
   Helpers
   --------------------------- */

function normalizeReviews(data: any): Review[] {
  if (!data) return [];

  const arr =
    Array.isArray(data) && data.length
      ? data
      : Array.isArray(data.reviews)
      ? data.reviews
      : Array.isArray(data.result?.reviews)
      ? data.result.reviews
      : Array.isArray(data.results)
      ? data.results
      : Array.isArray(data.items)
      ? data.items
      : [];

  return arr.map((item: any, idx: number) => {
    const id =
      item.id ??
      item.review_id ??
      item.place_id ??
      item._id ??
      item.uuid ??
      item.name ??
      `${Date.now()}-${idx}`;

    const author =
      (item.author_name ??
        item.author ??
        item.name ??
        item.username ??
        "Anonymous") + "";

    const rating = Math.max(
      0,
      Math.min(5, Number(item.rating ?? item.stars ?? item.score ?? 0) || 0)
    );

    const text =
      (item.text ?? item.review ?? item.content ?? item.comment ?? "") + "";

    const avatar =
      item.profile_photo_url ??
      item.avatar ??
      item.picture ??
      item.photo ??
      item.profile_photo_url_mobile ??
      null;

    const time =
      (item.time ?? item.created_at ?? item.published_at ?? null) as
        | string
        | null;

    return {
      id: String(id),
      author,
      rating,
      text,
      avatar,
      time,
    } as Review;
  });
}

/* deterministic color seed derived from text */
function seedGradient(name = "") {
  // simple hash -> hue pair
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h << 5) - h + name.charCodeAt(i);
  const hue = Math.abs(h) % 360;
  // pick two hues for gradient near each other
  const h2 = (hue + 35) % 360;
  return `linear-gradient(135deg, hsl(${hue} 72% 52%), hsl(${h2} 72% 46%))`;
}

/* ---------------------------
   Presentational pieces
   --------------------------- */

/** star (filled) */
const StarSVG: React.FC<{ filled?: boolean; size?: number }> = ({
  filled = true,
  size = 14,
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill={filled ? "currentColor" : "none"}
    stroke="currentColor"
    strokeWidth={filled ? 0 : 1.2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden
    className={filled ? "text-amber-400" : "text-amber-300/60"}
  >
    <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
  </svg>
);

/** star rating row */
const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Math.round(Math.max(0, Math.min(5, rating)));
  return (
    <div className="flex items-center gap-1" aria-hidden>
      {Array.from({ length: 5 }).map((_, i) => (
        <StarSVG key={i} filled={i < stars} size={14} />
      ))}
      <span className="sr-only">{stars} out of 5 stars</span>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-800 dark:to-slate-900/60 animate-pulse shadow-sm border border-slate-100 dark:border-slate-800">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700" />
      <div className="flex-1">
        <div className="h-4 w-36 bg-slate-200 dark:bg-slate-700 rounded mb-2" />
        <div className="h-3 w-20 bg-slate-200 dark:bg-slate-700 rounded mb-3" />
        <div className="h-12 bg-slate-200 dark:bg-slate-700 rounded" />
      </div>
    </div>
  </div>
);

const QuoteMark: React.FC<{ className?: string }> = ({ className = "" }) => (
  <svg
    viewBox="0 0 24 24"
    aria-hidden
    className={`w-14 h-14 opacity-6 text-slate-200 dark:text-slate-800 ${className}`}
  >
    <path
      d="M8.5 6.5C6.5 6.5 5 8 5 10v4a2 2 0 0 0 2 2h1v-4.5A2.5 2.5 0 0 1 10.5 9H12V6.5H8.5zM18.5 6.5C16.5 6.5 15 8 15 10v4a2 2 0 0 0 2 2h1v-4.5A2.5 2.5 0 0 1 20.5 9H22V6.5h-3.5z"
      fill="currentColor"
      opacity="0.06"
    />
  </svg>
);

/* animated card */
const TestimonialCard: React.FC<{ r: Review; index: number }> = React.memo(
  ({ r, index }) => {
    const reduce = useReducedMotion();

    const avatarNode = r.avatar ? (
      <img
        src={r.avatar}
        alt={`${r.author} avatar`}
        className="w-12 h-12 rounded-full object-cover ring-1 ring-white/90 dark:ring-black/40"
        loading="lazy"
        decoding="async"
        onError={(e) => {
          // hide broken remote avatar gracefully
          (e.currentTarget as HTMLImageElement).style.display = "none";
        }}
      />
    ) : (
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center font-semibold text-white"
        aria-hidden
        style={{ background: seedGradient(r.author) }}
      >
        {r.author?.charAt(0)?.toUpperCase() ?? "A"}
      </div>
    );

    return (
      <motion.figure
        initial={{ opacity: 0, y: 8, scale: 0.996 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: reduce ? 0 : 0.4, delay: index * 0.05 }}
        whileHover={reduce ? undefined : { y: -6, boxShadow: "0 24px 50px rgba(3,7,18,0.12)" }}
        className="relative p-5 rounded-xl bg-gradient-to-b from-white to-slate-50 dark:from-[#071122] dark:to-[#04101a] border border-white/6 dark:border-black/20 overflow-hidden"
      >
        {/* left accent bar */}
        <div
          aria-hidden
          className="absolute left-0 top-0 bottom-0 w-1 rounded-r"
          style={{
            background: "linear-gradient(180deg, #6366F1 0%, #06B6D4 100%)",
            opacity: 0.98,
          }}
        />

        <div className="absolute right-4 top-3 opacity-8 pointer-events-none">
          <QuoteMark />
        </div>

        <figcaption className="flex items-start gap-4 relative z-10">
          <div className="flex-none">{avatarNode}</div>

          <div className="flex-1">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {r.author}
                </div>
                {r.time && (
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {new Date(r.time).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <StarRating rating={r.rating} />
                <div className="text-xs text-slate-500 dark:text-slate-400">
                  {r.rating.toFixed(1)}
                </div>
              </div>
            </div>

            <blockquote className="mt-3 text-sm text-slate-700 dark:text-slate-200 leading-relaxed">
              {r.text}
            </blockquote>
          </div>
        </figcaption>
      </motion.figure>
    );
  }
);
TestimonialCard.displayName = "TestimonialCard";

/* ---------------------------
   Main component
   --------------------------- */

const CACHE_KEY = "kariba_testimonials_v2";
const MAX_SHOW = 3;

/**
 * NOTE: If you want to use Google Places safely, implement a server-side endpoint
 * that fetches from Places using your server-side key:
 *
 *    GET /api/google-reviews/?place_id=...  -> proxies Google Places response
 *
 * Then set VITE_GOOGLE_USE_CLIENT=false and let the frontend call /api/testimonials.
 *
 * If you really want to call Google from the browser (not recommended), set:
 *   VITE_GOOGLE_USE_CLIENT=true
 *   VITE_GOOGLE_PLACE_ID=<place_id>
 *   VITE_GOOGLE_API_KEY=<api_key>
 *
 * BE AWARE: exposing the key in the client is a security risk.
 */
const GOOGLE_USE_CLIENT = (import.meta.env.VITE_GOOGLE_USE_CLIENT as string) === "true";
const GOOGLE_PLACE_ID = (import.meta.env.VITE_GOOGLE_PLACE_ID as string) || "";
const GOOGLE_API_KEY = (import.meta.env.VITE_GOOGLE_API_KEY as string) || "";

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const mounted = useRef(true);

  const loadFromCache = useCallback((): Review[] | null => {
    try {
      const raw = sessionStorage.getItem(CACHE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw) as Review[];
      if (!Array.isArray(parsed) || parsed.length === 0) return null;
      return parsed;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    mounted.current = true;
    const cached = loadFromCache();
    if (cached) {
      setReviews(cached);
      setLoading(false);
    }

    const ctrl = new AbortController();
    const signal = ctrl.signal;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        // Prefer backend /api/testimonials (server-side proxy to Google is ideal).
        // If GOOGLE_USE_CLIENT is true and keys are present, we will attempt an in-browser
        // call to Google Places (note: exposing API key is a risk).
        let res;
        if (GOOGLE_USE_CLIENT && GOOGLE_PLACE_ID && GOOGLE_API_KEY) {
          // Google Places details endpoint — returns result.reviews
          const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(
            GOOGLE_PLACE_ID
          )}&fields=reviews&key=${encodeURIComponent(GOOGLE_API_KEY)}`;
          // In many setups the Google Maps Web Service will block cross-origin calls.
          // If you hit CORS issues, create a server endpoint that proxies this request.
          res = await axios.get(url, { signal });
          const list = normalizeReviews(res.data?.result ?? res.data);
          const final = list.length > 0 ? list : DEFAULT_REVIEWS;
          if (!mounted.current) return;
          setReviews(final);
          try {
            sessionStorage.setItem(CACHE_KEY, JSON.stringify(final));
          } catch {}
          return;
        }

        // Fallback: request your own backend endpoint that returns an array or object shape
        // (your existing /api/testimonials). This is preferred since server can call Google.
        res = await axios.get("/api/testimonials", { signal });
        const normalized = normalizeReviews(res.data);
        const list = normalized.length > 0 ? normalized : DEFAULT_REVIEWS;
        if (!mounted.current) return;
        setReviews(list);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {}
      } catch (err: any) {
        if (axios.isCancel?.(err) || err?.name === "CanceledError") {
          // aborted
          return;
        }
        if (mounted.current) {
          setError("Could not load testimonials — showing latest available.");
          setReviews(DEFAULT_REVIEWS);
        }
      } finally {
        if (mounted.current) setLoading(false);
      }
    })();

    return () => {
      mounted.current = false;
      ctrl.abort();
    };
  }, [loadFromCache]);

  const visible = useMemo(() => {
    if (!reviews) return [];
    return showAll ? reviews : reviews.slice(0, MAX_SHOW);
  }, [reviews, showAll]);

  const reduce = useReducedMotion();

  return (
    <section
      className="py-12 bg-gradient-to-br from-white via-slate-50 to-white dark:from-[#071225] dark:via-indigo-900 dark:to-rose-800"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2
              id="testimonials-heading"
              className="text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100"
            >
              Readers say
            </h2>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-xl">
              Real reactions from our readers — stories that moved them, visuals
              that stayed with them.
            </p>
          </div>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                try {
                  sessionStorage.removeItem(CACHE_KEY);
                } catch {}
                setLoading(true);
                setReviews(null);
                setError(null);
              }}
              className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-600 to-emerald-400 text-white text-sm shadow-lg hover:brightness-95 transition"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid gap-4">
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SkeletonCard />
              <SkeletonCard />
            </div>
          )}

          {!loading && error && (
            <div className="p-3 rounded-md bg-amber-50 dark:bg-amber-900/20 text-sm text-amber-800 dark:text-amber-200">
              {error}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="p-6 rounded-lg bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200">
              No testimonials available.
            </div>
          )}

          {!loading && visible.length > 0 && (
            <motion.div
              initial="hidden"
              animate="show"
              variants={
                reduce
                  ? undefined
                  : {
                      hidden: {},
                      show: { transition: { staggerChildren: 0.06 } },
                    }
              }
              className={`grid gap-4 ${
                reduce ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              }`}
            >
              {visible.map((r, i) => (
                <TestimonialCard key={r.id} r={r} index={i} />
              ))}
            </motion.div>
          )}

          {!loading && reviews && reviews.length > MAX_SHOW && (
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-600 to-emerald-400 text-white font-medium shadow-lg hover:brightness-95 transition"
                aria-expanded={showAll}
              >
                {showAll ? "Show less" : `Show all (${reviews.length})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};

export default React.memo(Testimonials);
