import { useEffect, useState } from "react";

type Slide = {
  id: number;
  title: string;
  subtitle: string;
  image: string;
};

/**
 * Helper to get a bundler-friendly URL for an asset inside src/assets.
 * Adjust the relative path if this file is placed somewhere other than src/components.
 */
const asset = (name: string) =>
  new URL(`../assets/images/background/${name}`, import.meta.url).href;

const slides: Slide[] = [
  {
    id: 1,
    title: "A World of Discovery",
    subtitle: "Investigative features • Photo essays • Opinion",
    image: asset("hero1.webp"),
  },
  {
    id: 2,
    title: "Issue 18 — The Flood Special",
    subtitle: "A deep dive into the Kariba basin communities",
    image: asset("hero2.webp"),
  },
  {
    id: 3,
    title: "Visual stories",
    subtitle: "Photojournalism & long-form features",
    image: asset("hero3.webp"),
  },
  {
    id: 4,
    title: "Subscribe for premium issues",
    subtitle: "Download full issues as PDF",
    image: asset("hero4.webp"),
  },
  {
    id: 5,
    title: "Portraits of the basin",
    subtitle: "Profiles of people shaping Kariba",
    image: asset("hero5.webp"),
  },
  {
    id: 6,
    title: "River life",
    subtitle: "Ecosystems, fishing and livelihoods",
    image: asset("hero6.webp"),
  },
  {
    id: 7,
    title: "Conservation & change",
    subtitle: "Reporting on environment and policy",
    image: asset("hero7.webp"),
  },
  {
    id: 8,
    title: "Behind the lens",
    subtitle: "Meet the photographers telling our stories",
    image: asset("hero8.webp"),
  },
  {
    id: 9,
    title: "Season highlights",
    subtitle: "A selection of powerful visuals",
    image: asset("hero9.webp"),
  },
];

export default function HeroSlider() {
  const [idx, setIdx] = useState(0);

  // cycle slides
  useEffect(() => {
    const t = setInterval(() => setIdx((i) => (i + 1) % slides.length), 6000);
    return () => clearInterval(t);
  }, []);

  // Preload images for smooth transitions (high-quality rendering)
  useEffect(() => {
    slides.forEach((s) => {
      const img = new Image();
      img.src = s.image;
    });
  }, []);

  return (
    <section className="relative w-full h-[70vh] md:h-[80vh] overflow-hidden">
      {slides.map((s, i) => (
        <div
          key={s.id}
          className={`absolute inset-0 transition-opacity duration-1000 ${
            i === idx ? "opacity-100 z-10" : "opacity-0 z-0 pointer-events-none"
          }`}
          aria-hidden={i !== idx}
        >
          {/* full-bleed image (use <img> so browser renders at native resolution & can lazy/eager load) */}
          <img
            src={s.image}
            alt={s.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: "center" }}
            decoding="async"
            loading={i === idx ? "eager" : "lazy"}
            // fetchpriority helps prioritize the currently visible image in browsers that support it
            {...(i === idx ? { fetchPriority: "high" as const } : {})}
          />

          {/* overlay gradient to keep text readable */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/25" />

          {/* content - placed above image & overlay */}
          <div className="relative z-20 max-w-3xl ml-6 md:ml-12 p-6 bg-black/30 rounded-md text-white">
            <h1 className="text-3xl md:text-5xl font-serif tracking-tight">
              {s.title}
            </h1>
            <p className="mt-3 text-lg md:text-2xl" style={{ width: "auto" }}>
              {s.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* pagination dots */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            className={`w-3 h-3 rounded-full ${
              i === idx ? "bg-white" : "bg-white/50"
            }`}
            aria-label={`Go to slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
