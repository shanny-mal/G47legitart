import React, { useEffect, useState } from "react";
import axios from "axios";

type Review = { id: string; author: string; rating: number; text: string };

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
];

/**
 * Try to extract a usable Review[] from a variety of possible response shapes.
 * Supports:
 *  - an array (Already Review[] or similar)
 *  - { reviews: [...] }
 *  - { result: { reviews: [...] } } (Google Places-ish)
 */
function normalizeReviews(data: any): Review[] {
  if (!data) return [];

  const guessArray = Array.isArray(data)
    ? data
    : Array.isArray(data.reviews)
    ? data.reviews
    : Array.isArray(data.result?.reviews)
    ? data.result.reviews
    : Array.isArray(data.results)
    ? data.results
    : [];

  return guessArray.map((item: any, idx: number) => {
    // Map a variety of fields to our Review shape
    const id =
      item.id ??
      item.review_id ??
      item.place_id ??
      item.author_name ??
      item.name ??
      `${Date.now()}-${idx}`;

    const author = (
      item.author ||
      item.author_name ||
      item.name ||
      "Anonymous"
    ).toString();

    const rating = Number(item.rating ?? item.stars ?? 0) || 0;

    const text = (
      item.text ??
      item.review ??
      item.content ??
      item.comment ??
      ""
    ).toString();

    return { id: String(id), author, rating, text };
  });
}

const Testimonials: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const res = await axios.get("/api/testimonials");
        // quick debug to inspect incoming shape in browser console
        // remove or lower verbosity in production
        // eslint-disable-next-line no-console
        console.debug("Testimonials response:", res.data);

        const normalized = normalizeReviews(res.data);

        if (normalized.length === 0) {
          // nothing useful returned — fallback to defaults
          setReviews(DEFAULT_REVIEWS);
        } else {
          setReviews(normalized);
        }
      } catch (err) {
        // on error use defaults
        // eslint-disable-next-line no-console
        console.warn("Failed to fetch testimonials, using defaults.", err);
        setReviews(DEFAULT_REVIEWS);
      }
    })();
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-4xl mx-auto px-4">
        <h2 className="text-2xl font-serif font-bold">Readers say</h2>
        <div className="mt-6 grid gap-4">
          {reviews.map((r) => (
            <figure
              key={r.id}
              className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow"
            >
              <figcaption className="flex items-center justify-between">
                <div>
                  <strong>{r.author}</strong>
                </div>
                <div aria-hidden className="text-yellow-400">
                  {"★".repeat(Math.max(0, Math.min(5, Math.round(r.rating))))}
                </div>
              </figcaption>
              <blockquote className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                {r.text}
              </blockquote>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
