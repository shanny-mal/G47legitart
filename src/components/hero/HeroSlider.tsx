// src/components/hero/HeroSlider.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import Slide, { type SlideData } from "./Slide";
import Dots from "./Dots";
// removed useInterval — we use a controlled timeout instead
import usePrefersReducedMotion from "./usePrefersReducedMotion";
import useInView from "../../hooks/useInView";
import useTypewriter from "./useTypewriter";

const SLIDES: SlideData[] = [
  {
    id: 1,
    title: "Issue 29 - Photography in winter",
    subtitle: "A look at the beauty of winter photography",
    baseName: "hero1",
  },
  {
    id: 2,
    title: "The benefits of physical regular exercise",
    subtitle: "A look at the impact of exercise on health",
    baseName: "hero2",
  },
  {
    id: 3,
    title: "Breast cancer awareness",
    subtitle: "A look at the impact of breast cancer in Africa",
    baseName: "hero3",
  },
  {
    id: 4,
    title: "Beauty and wellness",
    subtitle: "A look at the beauty and wellness industry",
    baseName: "hero4",
  },
  {
    id: 5,
    title: "Valentine's Day",
    subtitle: "A look at the celebration of love",
    baseName: "hero5",
  },
  {
    id: 6,
    title: "Cultural Gems",
    subtitle: "Discover the hidden treasures of Africa",
    baseName: "hero6",
  },
  {
    id: 7,
    title: "Subscribe for premium issues",
    subtitle: "Download full issues as PDF",
    baseName: "hero7",
  },
  {
    id: 8,
    title: "Behind the lens",
    subtitle: "Meet the photographers telling our stories",
    baseName: "hero8",
  },
  {
    id: 9,
    title: "Season highlights",
    subtitle: "A selection of powerful visuals",
    baseName: "hero9",
  },
];

const AUTOPLAY_MS = 6000; // how long each slide is visible (ms)
const INTERACTION_PAUSE_MS = 8000; // pause autoplay for this long after user interaction
const PRELOAD_WIDTHS = [480, 768, 1200, 1800, 2400];

export default function HeroSlider(): React.ReactElement {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const pausedUntilRef = useRef<number>(0); // timestamp until which autoplay is paused due to interaction
  const lastInteractionRef = useRef<number>(0);

  const prefersReducedMotion = usePrefersReducedMotion();
  const framerReduced = useReducedMotion();
  const reduce = prefersReducedMotion || framerReduced;

  const inView = useInView(containerRef, {
    rootMargin: "0px",
    threshold: 0.35,
  });
  const slides = useMemo(() => SLIDES, []);

  // pause state for hover/focus (these are user-driven)
  const [hoverPause, setHoverPause] = useState(false);

  // typewriter - instant when reduced motion requested
  const { typedTitle, typedSubtitle, isTyping } = useTypewriter(
    slides[index].title,
    slides[index].subtitle ?? "",
    { speed: 34, pauseBetween: 240, instant: prefersReducedMotion }
  );

  // helper: mark a user interaction so autoplay pauses for INTERACTION_PAUSE_MS
  const noteUserInteraction = useCallback(() => {
    const until = Date.now() + INTERACTION_PAUSE_MS;
    pausedUntilRef.current = until;
    lastInteractionRef.current = Date.now();
    // reset any existing timer so the new pause takes effect immediately
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  // navigation helpers (stable)
  const prev = useCallback(() => {
    noteUserInteraction();
    setIndex((i) => (i - 1 + slides.length) % slides.length);
  }, [noteUserInteraction, slides.length]);

  const next = useCallback(() => {
    noteUserInteraction();
    setIndex((i) => (i + 1) % slides.length);
  }, [noteUserInteraction, slides.length]);

  const goTo = useCallback(
    (i: number) => {
      noteUserInteraction();
      setIndex(() => Math.max(0, Math.min(i, slides.length - 1)));
    },
    [noteUserInteraction, slides.length]
  );

  // controlled autoplay via setTimeout that resets whenever dependencies change
  useEffect(() => {
    // clear any previous timer
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }

    // conditions to enable autoplay:
    const now = Date.now();
    const userPaused = pausedUntilRef.current > now;
    const shouldAutoplay = inView && !reduce && !hoverPause && !userPaused;

    // also wait for typewriter to finish before scheduling the next slide
    const typingActive = isTyping && !prefersReducedMotion;

    if (shouldAutoplay && !typingActive) {
      timerRef.current = window.setTimeout(() => {
        setIndex((i) => (i + 1) % slides.length);
        timerRef.current = null;
      }, AUTOPLAY_MS);
    }

    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [
    index,
    inView,
    reduce,
    hoverPause,
    slides.length,
    isTyping,
    prefersReducedMotion,
  ]);

  // keyboard nav (left/right) with interaction note
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      else if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  // swipe handling (touch) — keeps minimal and notes interaction
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let touchStartX: number | null = null;
    const onTouchStart = (ev: TouchEvent) => {
      touchStartX = ev.touches?.[0]?.clientX ?? null;
    };
    const onTouchEnd = (ev: TouchEvent) => {
      if (touchStartX == null) return;
      const dx = (ev.changedTouches?.[0]?.clientX ?? 0) - touchStartX;
      const threshold = 50;
      if (dx > threshold) prev();
      else if (dx < -threshold) next();
      touchStartX = null;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [prev, next]);

  // preload sensible candidate for the active slide (keeps current logic)
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const dpr = window.devicePixelRatio || 1;
      const vw = Math.max(320, Math.min(window.innerWidth, 3840));
      const needed = Math.ceil(vw * dpr);
      const candidate =
        PRELOAD_WIDTHS.find((w) => w >= needed) ??
        PRELOAD_WIDTHS[PRELOAD_WIDTHS.length - 1];
      const href = new URL(
        `../../assets/images/background/${slides[index].baseName}-${candidate}.webp`,
        import.meta.url
      ).href;
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = href;
      document.head.appendChild(link);
      return () => {
        if (link.parentNode) link.parentNode.removeChild(link);
      };
    } catch {
      // ignore
    }
  }, [index, slides]);

  // active slide reference
  const activeSlide = slides[index];

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden select-none"
      onMouseEnter={() => {
        setHoverPause(true);
        noteUserInteraction();
      }}
      onMouseLeave={() => {
        setHoverPause(false);
      }}
      onFocus={() => {
        setHoverPause(true);
        noteUserInteraction();
      }}
      onBlur={() => {
        setHoverPause(false);
      }}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false} mode="wait">
        {activeSlide && (
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: reduce ? 0 : 0.6, ease: "easeInOut" }}
            className="absolute inset-0 z-10"
            aria-hidden={false}
          >
            <Slide slide={activeSlide} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* overlay */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/25 mix-blend-multiply"
      />

      {/* content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-3xl">
          <div className="sr-only" aria-live="polite">
            {activeSlide?.title}: {activeSlide?.subtitle}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white drop-shadow-[0_10px_18px_rgba(0,0,0,0.55)] leading-tight">
            <span aria-hidden>{typedTitle}</span>
            <span className="sr-only">{activeSlide?.title}</span>
            {!reduce && (
              <span className="inline-block ml-1 animate-pulse text-white">
                ▌
              </span>
            )}
          </h2>

          <motion.p
            key={index + "-subtitle"}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : 0.36,
              delay: isTyping ? 0.18 : 0,
            }}
            className="mt-3 text-sm sm:text-base md:text-lg text-white/90 min-h-[1.5rem]"
          >
            {typedSubtitle}
            <span className="sr-only">{activeSlide?.subtitle}</span>
          </motion.p>

          {/* CTAs */}
          <div className="mt-6 flex gap-3">
            <motion.a
              whileHover={reduce ? {} : { y: -3 }}
              whileTap={reduce ? {} : { scale: 0.98 }}
              href="/issues"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-karibaNavy rounded-md font-semibold shadow-lg transform transition"
              aria-label="Browse issues"
            >
              <span className="text-sm">Browse issues</span>
            </motion.a>

            <motion.a
              whileHover={reduce ? {} : { scale: 1.03 }}
              whileTap={reduce ? {} : { scale: 0.98 }}
              href="/subscribe"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-white rounded-md font-semibold shadow-lg"
              aria-label="Subscribe"
            >
              <span className="text-sm">Subscribe</span>
            </motion.a>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Dots
          count={slides.length}
          active={index}
          onSelect={(i) => {
            goTo(i);
          }}
        />
      </div>

      {/* prev/next */}
      <motion.button
        aria-label="Previous slide"
        onClick={prev}
        whileHover={reduce ? {} : { scale: 1.06 }}
        whileTap={reduce ? {} : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/8 text-white hover:bg-white/16 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span className="text-xl font-semibold select-none">‹</span>
      </motion.button>

      <motion.button
        aria-label="Next slide"
        onClick={next}
        whileHover={reduce ? {} : { scale: 1.06 }}
        whileTap={reduce ? {} : { scale: 0.95 }}
        transition={{ type: "spring", stiffness: 320, damping: 28 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/8 text-white hover:bg-white/16 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        <span className="text-xl font-semibold select-none">›</span>
      </motion.button>
    </section>
  );
}
