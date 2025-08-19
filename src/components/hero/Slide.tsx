import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import process from "process";

export type SlideData = {
  id: number;
  title: string;
  subtitle?: string;
  baseName: string;
  alt?: string;
  image?: string; // optional explicit public fallback
};

function buildSrcSet(map: Record<string, string>) {
  return Object.entries(map)
    .map(([w, url]) => [Number(w), url] as const)
    .sort((a, b) => a[0] - b[0])
    .map(([w, url]) => `${url} ${w}w`)
    .join(", ");
}

/**
 * Robust Slide:
 *  - eager-first: uses import.meta.glob(..., {eager:true, as:'url'}) to get immediate URLs at build time
 *  - if eager gives nothing, fallback to lazy imports (import functions) as before
 *  - always sets a usable placeholder quickly (largest available variant) to avoid white gap
 */
export default function Slide({ slide }: { slide?: SlideData }) {
  if (!slide) {
    console.error("[Slide] missing slide prop");
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-800/80 to-black/80 z-0">
        <div className="text-center max-w-2xl px-6">
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif text-white tracking-tight">
            Missing slide
          </h3>
        </div>
      </div>
    );
  }

  const base = slide.baseName;

  // Eager map (immediate URLs) - Vite resolves this at build time
  const eagerFiles = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp", {
        eager: true,
        as: "url",
      }) as Record<string, string>) || {},
    []
  );

  // Lazy import map (functions) - used only if eager didn't find matches
  const lazyModules = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp") as Record<
        string,
        () => Promise<{ default: string }>
      >) || {},
    []
  );

  // state for variant map and fallback placeholder
  const [webpMap, setWebpMap] = useState<Record<string, string>>({});
  const [placeholder, setPlaceholder] = useState<string | null>(
    () => slide.image ?? null
  );
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // reset for new slide
    setWebpMap({});
    setPlaceholder(slide.image ?? null);

    // helper to process an object of filename->url (eager results)
    const processEager = (files: Record<string, string>) => {
      const wMap: Record<string, string> = {};
      Object.keys(files).forEach((k) => {
        const filename = k.split("/").pop() || k;
        const m = filename.match(new RegExp(`^${base}-(\\d+)\\.webp$`, "i"));
        if (m) {
          wMap[m[1]] = files[k];
        }
      });

      // single base.webp fallback
      const single = Object.keys(files).find(
        (k) =>
          (k.split("/").pop() || "").toLowerCase() ===
          `${base}.webp`.toLowerCase()
      );
      if (single) {
        // use that URL if placeholder not set
        if (!slide.image) setPlaceholder(files[single]);
      }

      if (Object.keys(wMap).length > 0) {
        // set map and ensure placeholder quick (largest)
        setWebpMap(wMap);
        if (!slide.image) {
          const largest = Object.entries(wMap)
            .map(([w, url]) => [Number(w), url] as const)
            .sort((a, b) => a[0] - b[0])
            .pop();
          if (largest) setPlaceholder(largest[1]);
        }
        return true;
      }
      return false;
    };

    // first try eager map for instant URLs
    try {
      const found = processEager(eagerFiles);
      if (found) {
        // we already populated webpMap and placeholder synchronously
        // no need to lazy import variants
        if (process.env.NODE_ENV === "development") {
          // show discovered filenames (dev-only)
          // eslint-disable-next-line no-console
          console.debug(
            `[Slide] eager files used for base=${base}`,
            Object.keys(eagerFiles).filter((f) =>
              (f.split("/").pop() || "")
                .toLowerCase()
                .startsWith(base.toLowerCase())
            )
          );
        }
        return () => {
          mounted.current = false;
        };
      }
    } catch (err) {
      // continue to lazy import if eager lookup fails unexpectedly
      // eslint-disable-next-line no-console
      console.warn(
        "[Slide] eager lookup failed; falling back to lazy imports",
        err
      );
    }

    // Eager didn't find matches — use lazy import approach (async)
    (async () => {
      try {
        // find matching import functions
        const variantEntries: Array<{
          width: string;
          importer: () => Promise<{ default: string }>;
        }> = [];
        let singleImp: (() => Promise<{ default: string }>) | null = null;

        for (const key of Object.keys(lazyModules)) {
          const filename = key.split("/").pop() || key;
          if (filename.toLowerCase() === `${base}.webp`.toLowerCase()) {
            singleImp = lazyModules[key];
            continue;
          }
          const m = filename.match(new RegExp(`^${base}-(\\d+)\\.webp$`, "i"));
          if (m)
            variantEntries.push({ width: m[1], importer: lazyModules[key] });
        }

        if (variantEntries.length > 0) {
          const res = await Promise.all(
            variantEntries.map(async (e) => ({
              width: e.width,
              url: (await e.importer()).default,
            }))
          );
          if (!mounted.current) return;
          const map: Record<string, string> = {};
          res.forEach((r) => (map[r.width] = r.url));
          setWebpMap(map);

          if (!slide.image) {
            const largest = res
              .map((r) => [Number(r.width), r.url] as const)
              .sort((a, b) => a[0] - b[0])
              .pop();
            if (largest) setPlaceholder(largest[1]);
          }
        } else if (singleImp) {
          const mod = await singleImp();
          if (!mounted.current) return;
          if (!slide.image) setPlaceholder(mod.default);
        } else {
          // nothing found
          // eslint-disable-next-line no-console
          console.warn(
            `[Slide] no webp assets found for baseName="${base}". Confirm filenames in src/assets/images/background/`
          );
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Slide] lazy import error", err);
      }
    })();

    return () => {
      mounted.current = false;
    };
  }, [base, eagerFiles, lazyModules, slide.image]);

  const hasVariants = Object.keys(webpMap).length > 0;
  const fallbackSrc =
    placeholder ?? (hasVariants ? Object.values(webpMap)[0] : "");

  const sizes = "(max-width: 768px) 100vw, (max-width:1200px) 100vw, 1200px";

  // if still no image available, show readable gradient + text (keeps UI visible)
  if (!fallbackSrc) {
    return (
      <div className="absolute inset-0 w-full h-full flex items-center justify-center bg-gradient-to-b from-gray-300/30 to-gray-100/20 z-0">
        <div className="text-left max-w-3xl px-6">
          <h3 className="text-2xl md:text-4xl lg:text-5xl font-serif text-white/95 tracking-tight drop-shadow-lg">
            {slide.title}
          </h3>
          {slide.subtitle && (
            <p className="mt-3 text-sm md:text-lg text-white/85">
              {slide.subtitle}
            </p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* blurred background (fast placeholder or srcset) */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        exit={{ scale: 1.06 }}
        transition={{ duration: 12, ease: "easeInOut" }}
        aria-hidden
      >
        <picture>
          {hasVariants && Object.keys(webpMap).length > 0 && (
            <source
              type="image/webp"
              srcSet={buildSrcSet(webpMap)}
              sizes={sizes}
            />
          )}
          <img
            src={fallbackSrc}
            alt=""
            className="w-full h-full object-cover filter blur-[10px] scale-105"
            loading="lazy"
            decoding="async"
            aria-hidden
          />
        </picture>
      </motion.div>

      {/* crisp foreground */}
      <motion.div
        className="absolute inset-0 z-20 will-change-transform"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.9 }}
        aria-hidden={false}
      >
        <picture>
          {hasVariants && Object.keys(webpMap).length > 0 && (
            <source
              type="image/webp"
              srcSet={buildSrcSet(webpMap)}
              sizes={sizes}
            />
          )}
          <img
            src={fallbackSrc}
            alt={slide.alt ?? slide.title}
            className="w-full h-full object-cover bg-gray-100"
            loading="eager"
            decoding="async"
            fetchPriority="high"
            sizes={sizes}
            style={{ objectPosition: "center" }}
          />
        </picture>
      </motion.div>

      <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/20 via-black/10 to-black/40" />
    </div>
  );
}
