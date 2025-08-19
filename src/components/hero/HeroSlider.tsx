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
import useInterval from "../../hooks/useInterval";
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

const AUTOPLAY_MS = 6000;
const PRELOAD_WIDTHS = [480, 768, 1200, 1800, 2400];

export default function HeroSlider(): React.ReactElement {
  const [index, setIndex] = useState(0);
  const containerRef = useRef<HTMLElement | null>(null);

  const prefersReducedMotion = usePrefersReducedMotion();
  const framerReduced = useReducedMotion();
  const reduce = prefersReducedMotion || framerReduced;

  const inView = useInView(containerRef, {
    rootMargin: "0px",
    threshold: 0.35,
  });
  const slides = useMemo(() => SLIDES, []);

  const [paused, setPaused] = useState(false);
  const pause = useCallback(() => setPaused(true), []);
  const resume = useCallback(() => setPaused(false), []);

  // use typewriter for title + subtitle
  const { typedTitle, typedSubtitle, isTyping } = useTypewriter(
    slides[index].title,
    slides[index].subtitle ?? "",
    { speed: 35, pauseBetween: 260, instant: prefersReducedMotion }
  );

  // autoplay (respects visibility, reduced motion and user pause)
  useInterval(
    () => setIndex((i) => (i + 1) % slides.length),
    inView && !prefersReducedMotion && !paused ? AUTOPLAY_MS : null
  );

  // preload candidate (safe checks)
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

  // keyboard navigation
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft")
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % slides.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [slides.length]);

  // touch swipe
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let touchStartX: number | null = null;
    const onTouchStart = (ev: TouchEvent) =>
      (touchStartX = ev.touches?.[0]?.clientX ?? null);
    const onTouchEnd = (ev: TouchEvent) => {
      if (touchStartX == null) return;
      const dx = (ev.changedTouches?.[0]?.clientX ?? 0) - touchStartX;
      const threshold = 50;
      if (dx > threshold)
        setIndex((i) => (i - 1 + slides.length) % slides.length);
      else if (dx < -threshold) setIndex((i) => (i + 1) % slides.length);
      touchStartX = null;
    };
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd);
    return () => {
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
    };
  }, [slides.length]);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + slides.length) % slides.length),
    [slides.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % slides.length),
    [slides.length]
  );

  const activeSlide = slides[index];

  return (
    <section
      ref={containerRef as React.RefObject<HTMLElement>}
      className="relative w-full h-[60vh] md:h-[75vh] lg:h-[85vh] overflow-hidden select-none"
      onMouseEnter={pause}
      onMouseLeave={resume}
      onFocus={pause}
      onBlur={resume}
      aria-roledescription="carousel"
    >
      <AnimatePresence initial={false} mode="wait">
        {activeSlide && (
          <motion.div
            key={activeSlide.id}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: reduce ? 0 : 0.6 }}
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
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-transparent via-black/10 to-black/20 mix-blend-multiply"
      />

      {/* content */}
      <div className="relative z-20 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
        <div className="max-w-3xl">
          <div className="sr-only" aria-live="polite">
            {activeSlide?.title}: {activeSlide?.subtitle}
          </div>

          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-serif text-white drop-shadow-lg leading-tight">
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
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: reduce ? 0 : 0.35,
              delay: isTyping ? 0.2 : 0,
            }}
            className="mt-3 text-sm sm:text-base md:text-lg text-white/90 min-h-[1.5rem]"
          >
            {typedSubtitle}
            <span className="sr-only">{activeSlide?.subtitle}</span>
          </motion.p>

          {/* CTAs */}
          <div className="mt-6 flex gap-3">
            <motion.a
              whileHover={reduce ? {} : { scale: 1.02 }}
              whileTap={reduce ? {} : { scale: 0.98 }}
              href="/issues"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 text-karibaNavy rounded-md font-semibold shadow transform transition"
              aria-label="Browse issues"
            >
              <motion.span layout>Browse issues</motion.span>
            </motion.a>

            <motion.a
              whileHover={
                reduce
                  ? {}
                  : { scale: 1.03, boxShadow: "0 10px 30px rgba(0,0,0,0.35)" }
              }
              whileTap={reduce ? {} : { scale: 0.98 }}
              href="/subscribe"
              className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-white rounded-md font-semibold shadow"
              aria-label="Subscribe"
            >
              <motion.span layout>Subscribe</motion.span>
            </motion.a>
          </div>
        </div>
      </div>

      {/* dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-30">
        <Dots
          count={slides.length}
          active={index}
          onSelect={(i) => setIndex(i)}
        />
      </div>

      {/* prev/next */}
      <motion.button
        aria-label="Previous slide"
        onClick={prev}
        whileHover={reduce ? {} : { scale: 1.1 }}
        whileTap={reduce ? {} : { scale: 0.95 }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        ‹
      </motion.button>

      <motion.button
        aria-label="Next slide"
        onClick={next}
        whileHover={reduce ? {} : { scale: 1.1 }}
        whileTap={reduce ? {} : { scale: 0.95 }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-30 p-2 rounded-full bg-white/10 text-white hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/30"
      >
        ›
      </motion.button>
    </section>
  );
}
