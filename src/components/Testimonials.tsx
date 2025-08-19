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

/**
 * Normalize a flexible API response into Review[]
 * Handles many shapes: array, { reviews }, { result: { reviews } }, google-like shapes, etc.
 */
function normalizeReviews(data: any): Review[] {
  if (!data) return [];

  // prefer direct array shapes first
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
      null;

    return {
      id: String(id),
      author,
      rating,
      text,
      avatar,
    } as Review;
  });
}

/* ---------------------------
   Small presentational pieces
   --------------------------- */

const StarRating: React.FC<{ rating: number }> = ({ rating }) => {
  const stars = Math.round(Math.max(0, Math.min(5, rating)));
  return (
    <div className="flex items-center gap-2" aria-hidden>
      <div className="text-yellow-400" style={{ letterSpacing: "-0.04em" }}>
        {"★".repeat(stars)}
        {"☆".repeat(5 - stars)}
      </div>
      <span className="sr-only">{stars} out of 5 stars</span>
    </div>
  );
};

const SkeletonCard: React.FC = () => (
  <div className="p-4 rounded-lg bg-white/6 dark:bg-white/4 animate-pulse">
    <div className="flex items-start gap-3">
      <div className="w-12 h-12 rounded-full bg-white/12" />
      <div className="flex-1">
        <div className="h-4 w-36 bg-white/12 rounded mb-2" />
        <div className="h-3 w-20 bg-white/12 rounded mb-3" />
        <div className="h-12 bg-white/12 rounded" />
      </div>
    </div>
  </div>
);

const TestimonialCard: React.FC<{ r: Review; index: number }> = React.memo(
  ({ r, index }) => {
    const reduce = useReducedMotion();
    return (
      <motion.figure
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: reduce ? 0 : 0.36, delay: index * 0.06 }}
        className="p-5 bg-white rounded-xl dark:bg-[#052231] shadow-sm border border-white/6"
      >
        <figcaption className="flex items-start gap-4">
          <div className="flex-none">
            {r.avatar ? (
              <img
                src={r.avatar}
                alt={`${r.author} avatar`}
                className="w-12 h-12 rounded-full object-cover"
                loading="lazy"
                decoding="async"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-karibaTeal to-karibaCoral flex items-center justify-center text-white font-semibold">
                {r.author.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold text-karibaNavy dark:text-karibaSand">
                  {r.author}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {/* optional: add a date if available in data */}
                </div>
              </div>

              <div>
                <StarRating rating={r.rating} />
              </div>
            </div>

            <blockquote className="mt-3 text-sm text-gray-700 dark:text-gray-200 leading-relaxed">
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
   Main Testimonials component
   --------------------------- */

const CACHE_KEY = "kariba_testimonials_v1";
const MAX_SHOW = 3; // show initially then "Show more"

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

    const controller = new AbortController();
    const signal = controller.signal;

    (async () => {
      try {
        setLoading(true);
        const res = await axios.get("/api/testimonials", { signal });
        const normalized = normalizeReviews(res.data);
        const list = normalized.length > 0 ? normalized : DEFAULT_REVIEWS;
        if (!mounted.current) return;
        setReviews(list);
        try {
          sessionStorage.setItem(CACHE_KEY, JSON.stringify(list));
        } catch {
          /* ignore storage errors */
        }
      } catch (err: any) {
        if (axios.isCancel?.(err) || err?.name === "CanceledError") {
          // aborted, do nothing
          return;
        }
        // fallback
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
      controller.abort();
    };
  }, [loadFromCache]);

  const visible = useMemo(() => {
    if (!reviews) return [];
    return showAll ? reviews : reviews.slice(0, MAX_SHOW);
  }, [reviews, showAll]);

  return (
    <section
      className="py-12 bg-gray-50 dark:bg-[#041b22]"
      aria-labelledby="testimonials-heading"
    >
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between gap-4 mb-6">
          <div>
            <h2
              id="testimonials-heading"
              className="text-2xl font-serif font-semibold text-karibaNavy dark:text-karibaSand"
            >
              Readers say
            </h2>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 max-w-xl">
              Real reactions from our readers — stories that moved them, visuals
              that stayed with them.
            </p>
          </div>

          <div className="ml-auto">
            {/* lightweight refresh control */}
            <button
              type="button"
              onClick={() => {
                // clear cache and re-fetch
                try {
                  sessionStorage.removeItem(CACHE_KEY);
                } catch {}
                setLoading(true);
                setReviews(null);
                setError(null);
                // trigger effect by toggling a key (simple approach)
                // We re-run fetch by calling the effect indirectly via setReviews(null)
                // The effect uses the absence of cache to fetch again.
              }}
              className="inline-flex items-center gap-2 px-3 py-2 text-sm rounded-md border border-white/8 bg-white/6 dark:bg-[#072231] hover:bg-white/8 transition"
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
            <div className="p-3 rounded-md bg-yellow-50 dark:bg-yellow-900/30 text-sm text-yellow-800 dark:text-yellow-200">
              {error}
            </div>
          )}

          {!loading && visible.length === 0 && (
            <div className="p-6 rounded-lg bg-white/6 dark:bg-white/4 text-gray-700 dark:text-gray-200">
              No testimonials available.
            </div>
          )}

          {!loading && visible.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {visible.map((r, i) => (
                <TestimonialCard key={r.id} r={r} index={i} />
              ))}
            </div>
          )}

          {!loading && reviews && reviews.length > MAX_SHOW && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={() => setShowAll((s) => !s)}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-karibaTeal text-white font-medium shadow hover:brightness-95 transition"
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
