import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence } from "framer-motion";
import Slide from "./Slide";
import Dots from "./Dots";
import useInterval from "../../hooks/useInterval";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";
import useInView from "../../hooks/useInView";

/* Helper to build bundler-friendly asset URLs (if you still use baseName approach, adapt accordingly) */

export type SlideData = {
  id: number;
  title: string;
  subtitle?: string;
  /** for the updated responsive approach Slide expects baseName */
  baseName: string;
  alt?: string;
};

const SLIDES: SlideData[] = [
  {
    id: 1,
    title: "Issue 29 - Photography in winter",
    subtitle: "A look at the beauty of winter photography",
    baseName: "hero1",
    alt: "Fisherman on the Kariba lake",
  },
  {
    id: 2,
    title: "The benefits of physical regular exercise",
    subtitle: "A look at the impact of exercise on health",
    baseName: "hero2",
    alt: "Flooded riverside community",
  },
  {
    id: 3,
    title: "Breast cancer awareness",
    subtitle: "A look at the impact of breast cancer in Africa",
    baseName: "hero3",
    alt: "Photojournalist with camera",
  },
  {
    id: 4,
    title: "Beauty and wellness",
    subtitle: "A look at the beauty and wellness industry",
    baseName: "hero4",
    alt: "Magazine spread",
  },
  {
    id: 5,
    title: "Valentine's Day",
    subtitle: "A look at the celebration of love",
    baseName: "hero5",
    alt: "Magazine spread",
  },
  {
    id: 6,
    title: "Cultural Gems",
    subtitle: "Discover the hidden treasures of Africa",
    baseName: "hero6",
    alt: "Magazine spread",
  },
  {
    id: 7,
    title: "Subscribe for premium issues",
    subtitle: "Download full issues as PDF",
    baseName: "hero7",
    alt: "Magazine spread",
  },
  {
    id: 8,
    title: "Subscribe for premium issues",
    subtitle: "Download full issues as PDF",
    baseName: "hero8",
    alt: "Magazine spread",
  },
  {
    id: 9,
    title: "Subscribe for premium issues",
    subtitle: "Download full issues as PDF",
    baseName: "hero9",
    alt: "Magazine spread",
  },
];

const AUTOPLAY_MS = 6000;
const WIDTHS = [480, 768, 1200, 1800, 2400];

function pickBestCandidate(baseName: string) {
  if (typeof window === "undefined") {
    // SSR fallback
    return {
      href: new URL(
        `../../assets/images/background/${baseName}-1200.webp`,
        import.meta.url
      ).href,
      as: "image" as const,
    };
  }
  const dpr = window.devicePixelRatio || 1;
  const vw = Math.max(320, Math.min(window.innerWidth, 3840));
  const needed = Math.ceil(vw * dpr);
  const candidate =
    WIDTHS.find((w) => w >= needed) ?? WIDTHS[WIDTHS.length - 1];
  const href = new URL(
    `../../assets/images/background/${baseName}-${candidate}.webp`,
    import.meta.url
  ).href;
  return { href, as: "image" as const };
}

export default function HeroSlider(): React.ReactElement {
  const [index, setIndex] = useState(0);

  // use a concrete HTMLElement ref so JSX ref and DOM usage match
  const containerRef = useRef<HTMLElement | null>(null);

  // prefers reduced motion
  const prefersReducedMotion = usePrefersReducedMotion();

  // safe call to useInView accepts nullable ref
  const inView = useInView(containerRef, {
    rootMargin: "0px",
    threshold: 0.35,
  });

  const slides = useMemo(() => SLIDES, []);

  // autoplay only when visible and motion allowed
  useInterval(
    () => setIndex((i) => (i + 1) % slides.length),
    inView && !prefersReducedMotion ? AUTOPLAY_MS : null
  );

  // preload best candidate for current slide (useEffect must return void cleanup)
  useEffect(() => {
    try {
      const { href, as } = pickBestCandidate(slides[index].baseName);
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = as;
      link.href = href;
      document.head.appendChild(link);

      // cleanup
      return () => {
        if (link.parentNode) link.parentNode.removeChild(link);
      };
    } catch {
      // noop on any error
      return;
    }
  }, [index, slides]);

  // preload next slide image (non-blocking)
  useEffect(() => {
    const next = slides[(index + 1) % slides.length];
    const img = new Image();
    img.src = new URL(
      `../../assets/images/background/${next.baseName}-1200.webp`,
      import.meta.url
    ).href;
    return () => {
      // nothing to clean up for Image
    };
  }, [index, slides]);

  // keyboard nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  // Pause on hover/focus
  const [, setIsPaused] = useState(false);
  const pause = useCallback(() => setIsPaused(true), []);
  const resume = useCallback(() => setIsPaused(false), []);

  // Touch / swipe support (simple)
  const touchStartX = useRef<number | null>(null);
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (ev: TouchEvent) => {
      touchStartX.current = ev.touches[0]?.clientX ?? null;
    };
    const onTouchEnd = (ev: TouchEvent) => {
      if (touchStartX.current == null) return;
      const dx = ev.changedTouches[0]?.clientX - touchStartX.current;
      const threshold = 50;
      if (dx > threshold)
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      else if (dx < -threshold) setIndex((i) => (i + 1) % slides.length);
      touchStartX.current = null;
    };

    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [slides.length]);

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden select-none"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
    >
      <AnimatePresence initial={false} mode="wait">
        {slides.map((s, i) =>
          i === index ? (
            <motion.div
              key={s.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: prefersReducedMotion ? 0 : 0.6 }}
              className="absolute inset-0 z-10"
              aria-hidden={i !== index}
            >
              <Slide slide={s} priority />
            </motion.div>
          ) : null
        )}
      </AnimatePresence>

      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/20 mix-blend-multiply"
      />

      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-3xl">
          <div className="sr-only" aria-live="polite">
            {slides[index].title}: {slides[index].subtitle}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white drop-shadow-lg leading-tight">
            {slides[index].title}
          </h2>
          <p className="mt-3 text-sm sm:text-base md:text-lg text-white/90">
            {slides[index].subtitle}
          </p>

          <div className="mt-6 flex gap-3">
            <a
              href="/issues"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-karibaNavy rounded-md font-semibold shadow hover:scale-[1.02] transition"
            >
              Browse issues
            </a>
            <a
              href="/subscribe"
              className="inline-flex items-center gap-2 px-4 py-2 bg-karibaCoral text-white rounded-md font-semibold shadow hover:brightness-95 transition"
            >
              Subscribe
            </a>
          </div>
        </div>
      </div>

      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Dots
          count={slides.length}
          active={index}
          onSelect={(i) => setIndex(i)}
          className="md:bottom-8"
        />
      </div>

      <button
        aria-label="Previous slide"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        ‹
      </button>
      <button
        aria-label="Next slide"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        ›
      </button>
    </section>
  );
}
