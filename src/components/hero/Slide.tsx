/// <reference types="vite/client" />

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
 * Slide component
 * - deep blurred background but still visible
 * - robust fallback when images are missing (never show white screen)
 * - smooth blur -> crisp transition when foreground image loads
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

  // Eager maps (immediate URLs) - Vite resolves this at build time
  const eagerWebp = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp", {
        eager: true,
        as: "url",
      }) as Record<string, string>) || {},
    []
  );

  const eagerJpg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpg", {
        eager: true,
        as: "url",
      }) as Record<string, string>) || {},
    []
  );

  const eagerJpeg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpeg", {
        eager: true,
        as: "url",
      }) as Record<string, string>) || {},
    []
  );

  // Lazy import maps (functions) - used only if eager didn't find matches
  const lazyWebp = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp") as Record<
        string,
        () => Promise<{ default: string }>
      >) || {},
    []
  );

  const lazyJpg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpg") as Record<
        string,
        () => Promise<{ default: string }>
      >) || {},
    []
  );

  const lazyJpeg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpeg") as Record<
        string,
        () => Promise<{ default: string }>
      >) || {},
    []
  );

  // state for variant maps and fallback placeholder
  const [webpMap, setWebpMap] = useState<Record<string, string>>({});
  const [jpgMap, setJpgMap] = useState<Record<string, string>>({});
  const [placeholder, setPlaceholder] = useState<string | null>(
    () => slide.image ?? null
  );

  // extra states for robust rendering
  const [bgLoaded, setBgLoaded] = useState(false); // background (blurred) image loaded
  const [fgLoaded, setFgLoaded] = useState(false); // foreground crisp image loaded
  const [imgError, setImgError] = useState(false); // any image failed to load
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;

    // reset for new slide
    setWebpMap({});
    setJpgMap({});
    setPlaceholder(slide.image ?? null);
    setBgLoaded(false);
    setFgLoaded(false);
    setImgError(false);

    // helper to process an object of filename->url (eager results) for a given ext
    const processEagerFiles = (files: Record<string, string>, ext: string) => {
      const wMap: Record<string, string> = {};
      Object.keys(files).forEach((k) => {
        const filename = k.split("/").pop() || k;
        const regex = new RegExp(`^${base}-(\\d+)\\.${ext}$`, "i");
        const m = filename.match(regex);
        if (m) {
          wMap[m[1]] = files[k];
        }
      });

      // single base.ext fallback
      const single = Object.keys(files).find(
        (k) =>
          (k.split("/").pop() || "").toLowerCase() ===
          `${base}.${ext}`.toLowerCase()
      );
      return { wMap, singleUrl: single ? files[single] : undefined };
    };

    // Try processing eager maps for webp and jpg/jpeg
    try {
      const wRes = processEagerFiles(eagerWebp, "webp");
      const jRes = processEagerFiles(eagerJpg, "jpg");
      const jxRes = processEagerFiles(eagerJpeg, "jpeg");

      // merge jpg + jpeg maps
      const combinedJpgMap = { ...jRes.wMap, ...jxRes.wMap };

      // If any webp variants exist, use them
      if (Object.keys(wRes.wMap).length > 0) {
        setWebpMap(wRes.wMap);
        if (!slide.image) {
          const largest = Object.entries(wRes.wMap)
            .map(([w, url]) => [Number(w), url] as const)
            .sort((a, b) => a[0] - b[0])
            .pop();
          if (largest) setPlaceholder(largest[1]);
        }
      } else if (Object.keys(combinedJpgMap).length > 0) {
        // if no webp variants, but jpg variants exist
        setJpgMap(combinedJpgMap);
        if (!slide.image) {
          const largest = Object.entries(combinedJpgMap)
            .map(([w, url]) => [Number(w), url] as const)
            .sort((a, b) => a[0] - b[0])
            .pop();
          if (largest) setPlaceholder(largest[1]);
        }
      } else {
        // check single file fallbacks
        const singleWebp = wRes.singleUrl;
        const singleJpg = jRes.singleUrl ?? jxRes.singleUrl;
        if (!slide.image && singleWebp) {
          setPlaceholder(singleWebp);
        } else if (!slide.image && singleJpg) {
          setPlaceholder(singleJpg);
        }
      }

      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.debug(
          `[Slide] eager webp keys for base=${base}`,
          Object.keys(eagerWebp).filter((f) =>
            (f.split("/").pop() || "")
              .toLowerCase()
              .startsWith(base.toLowerCase())
          )
        );
        // eslint-disable-next-line no-console
        console.debug(
          `[Slide] eager jpg/jpeg keys for base=${base}`,
          [...Object.keys(eagerJpg), ...Object.keys(eagerJpeg)].filter((f) =>
            (f.split("/").pop() || "")
              .toLowerCase()
              .startsWith(base.toLowerCase())
          )
        );
      }

      // If we found any variants via eager processing, we can skip lazy imports
      if (
        Object.keys(wRes.wMap).length > 0 ||
        Object.keys(combinedJpgMap).length > 0 ||
        wRes.singleUrl ||
        jRes.singleUrl ||
        jxRes.singleUrl
      ) {
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

    // helper to safely call an importer (avoids TS narrowing to never)
    const callImporter = async (
      imp?: (() => Promise<{ default: string }>) | null
    ) => {
      if (!imp) return null;
      return imp();
    };

    // Eager didn't find matches — use lazy imports (async)
    (async () => {
      try {
        // collect variant importers
        const webpEntries: Array<{
          width: string;
          importer: () => Promise<{ default: string }>;
        }> = [];
        const jpgEntries: Array<{
          width: string;
          importer: () => Promise<{ default: string }>;
        }> = [];
        let singleWebpImp: (() => Promise<{ default: string }>) | null = null;
        let singleJpgImp: (() => Promise<{ default: string }>) | null = null;

        // helper to inspect keys across lazy maps
        const inspectLazy = (
          map: Record<string, () => Promise<{ default: string }>>,
          ext: string
        ) => {
          for (const key of Object.keys(map)) {
            const filename = key.split("/").pop() || key;
            if (filename.toLowerCase() === `${base}.${ext}`.toLowerCase()) {
              if (ext === "webp") singleWebpImp = map[key];
              else singleJpgImp = map[key];
              continue;
            }
            const m = filename.match(
              new RegExp(`^${base}-(\\d+)\\.${ext}$`, "i")
            );
            if (m) {
              if (ext === "webp")
                webpEntries.push({ width: m[1], importer: map[key] });
              else jpgEntries.push({ width: m[1], importer: map[key] });
            }
          }
        };

        inspectLazy(lazyWebp, "webp");
        inspectLazy(lazyJpg, "jpg");
        inspectLazy(lazyJpeg, "jpeg");

        // prefer webp variants if present
        if (webpEntries.length > 0) {
          const res = await Promise.all(
            webpEntries.map(async (e) => ({
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
        } else if (jpgEntries.length > 0) {
          // use jpg/jpeg variants if webp not present
          const res = await Promise.all(
            jpgEntries.map(async (e) => ({
              width: e.width,
              url: (await e.importer()).default,
            }))
          );
          if (!mounted.current) return;
          const map: Record<string, string> = {};
          res.forEach((r) => (map[r.width] = r.url));
          setJpgMap(map);

          if (!slide.image) {
            const largest = res
              .map((r) => [Number(r.width), r.url] as const)
              .sort((a, b) => a[0] - b[0])
              .pop();
            if (largest) setPlaceholder(largest[1]);
          }
        } else {
          // no multi-variant entries — try single-file importers
          if (singleWebpImp) {
            const mod = await callImporter(singleWebpImp);
            if (!mounted.current) return;
            if (mod && !slide.image) setPlaceholder(mod.default);
          } else if (singleJpgImp) {
            const mod = await callImporter(singleJpgImp);
            if (!mounted.current) return;
            if (mod && !slide.image) setPlaceholder(mod.default);
          } else {
            // eslint-disable-next-line no-console
            console.warn(
              `[Slide] no assets found for baseName="${base}". Confirm filenames in src/assets/images/background/`
            );
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Slide] lazy import error", err);
      }
    })();

    return () => {
      mounted.current = false;
    };
    // eager/lazy maps are stable because useMemo deps are [], so no need to include them here
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [base, slide.image]);

  const hasWebp = Object.keys(webpMap).length > 0;
  const hasJpg = Object.keys(jpgMap).length > 0;
  const fallbackSrc =
    placeholder ??
    (hasWebp
      ? Object.values(webpMap)[0]
      : hasJpg
      ? Object.values(jpgMap)[0]
      : "");

  const sizes = "(max-width: 768px) 100vw, (max-width:1200px) 100vw, 1200px";

  // If there's a candidate fallbackSrc, test-load it so we know if it's valid.
  // This avoids rendering a broken image (white) on screen.
  useEffect(() => {
    if (!fallbackSrc) {
      setImgError(true);
      setBgLoaded(false);
      setFgLoaded(false);
      return;
    }

    let cancelled = false;
    const pre = new Image();
    pre.src = fallbackSrc;
    pre.onload = () => {
      if (cancelled) return;
      setImgError(false);
      setBgLoaded(true); // background can use the image
      // we don't set fgLoaded here; fgLoaded is set when the foreground <img> actually loads (onLoad)
    };
    pre.onerror = () => {
      if (cancelled) return;
      // If the fallbackSrc fails to load, mark error — we'll show gradient instead
      console.warn(`[Slide] image failed to load: ${fallbackSrc}`);
      setImgError(true);
      setBgLoaded(false);
      setFgLoaded(false);
    };
    return () => {
      cancelled = true;
    };
  }, [fallbackSrc]);

  // if still no image available, show readable gradient + text (keeps UI visible)
  if (!fallbackSrc || imgError) {
    return (
      <div className="absolute inset-0 w-full h-full">
        {/* deep-ish, subtle background so text is readable */}
        <div
          className="absolute inset-0 z-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(6,7,12,0.7) 0%, rgba(6,7,12,0.5) 40%, rgba(6,7,12,0.6) 100%)",
          }}
        />
        <div className="absolute inset-0 z-10 flex items-center">
          <div className="max-w-3xl px-6">
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
      </div>
    );
  }

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* blurred background: heavy blur but still visible */}
      <motion.div
        className="absolute inset-0 z-0 will-change-transform"
        initial={{ scale: 1.06 }}
        animate={{ scale: 1.0 }}
        exit={{ scale: 1.06 }}
        transition={{ duration: 12, ease: "easeInOut" }}
        aria-hidden
      >
        <picture>
          {hasWebp && (
            <source
              type="image/webp"
              srcSet={buildSrcSet(webpMap)}
              sizes={sizes}
            />
          )}
          {hasJpg && (
            <source
              type="image/jpeg"
              srcSet={buildSrcSet(jpgMap)}
              sizes={sizes}
            />
          )}

          {/* Deep blur: use inline style for stronger blur than Tailwind's default */}
          <img
            src={fallbackSrc}
            alt=""
            className="w-full h-full object-cover"
            style={{
              filter: "blur(24px) saturate(0.9) contrast(0.95)",
              transform: "scale(1.05)",
              transition:
                "opacity 500ms ease, filter 600ms ease, transform 600ms ease",
              opacity: bgLoaded ? 1 : 0,
            }}
            loading="lazy"
            decoding="async"
            aria-hidden
            onError={() => {
              setImgError(true);
            }}
          />
        </picture>
      </motion.div>

      {/* crisp foreground: fades in when loaded */}
      <motion.div
        className="absolute inset-0 z-20 will-change-transform"
        initial={{ opacity: 0, scale: 1.02 }}
        animate={
          fgLoaded ? { opacity: 1, scale: 1 } : { opacity: 0.0001, scale: 1.02 }
        }
        exit={{ opacity: 0, scale: 1.02 }}
        transition={{ duration: 0.9 }}
        aria-hidden={false}
      >
        <picture>
          {hasWebp && (
            <source
              type="image/webp"
              srcSet={buildSrcSet(webpMap)}
              sizes={sizes}
            />
          )}
          {hasJpg && (
            <source
              type="image/jpeg"
              srcSet={buildSrcSet(jpgMap)}
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
            style={{
              objectPosition: "center",
              transition: "opacity 500ms ease, transform 500ms ease",
            }}
            onLoad={() => {
              setFgLoaded(true);
            }}
            onError={() => {
              // If foreground fails, mark error so outer fallback renders
              setImgError(true);
            }}
          />
        </picture>
      </motion.div>

      {/* overlay gradient for consistent contrast */}
      <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/20 via-black/10 to-black/40 pointer-events-none" />
    </div>
  );
}
