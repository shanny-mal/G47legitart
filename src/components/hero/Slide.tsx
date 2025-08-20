import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";

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

function pickSmallest(map: Record<string, string> | undefined) {
  if (!map) return undefined;
  const entries = Object.entries(map)
    .map(([w, url]) => [Number(w), url] as const)
    .sort((a, b) => a[0] - b[0]);
  return entries.length ? entries[0][1] : undefined;
}

export default function Slide({ slide }: { slide?: SlideData }) {
  // stable locals
  const base = slide?.baseName ?? "__no_slide__";
  const title = slide?.title ?? "Untitled";
  const subtitle = slide?.subtitle ?? "";
  const alt = slide?.alt ?? slide?.title ?? "slide";

  // eager/lazy imports (memoized)
  const eagerWebp = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp", {
        eager: true,
        query: "?url",
        import: "default",
      }) as Record<string, string>) || {},
    []
  );
  const eagerJpg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpg", {
        eager: true,
        query: "?url",
        import: "default",
      }) as Record<string, string>) || {},
    []
  );
  const eagerJpeg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpeg", {
        eager: true,
        query: "?url",
        import: "default",
      }) as Record<string, string>) || {},
    []
  );

  const lazyWebp = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.webp", {
        query: "?url",
        import: "default",
      }) as Record<string, () => Promise<string>>) || {},
    []
  );
  const lazyJpg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpg", {
        query: "?url",
        import: "default",
      }) as Record<string, () => Promise<string>>) || {},
    []
  );
  const lazyJpeg = useMemo(
    () =>
      (import.meta.glob("../../assets/images/background/*.jpeg", {
        query: "?url",
        import: "default",
      }) as Record<string, () => Promise<string>>) || {},
    []
  );

  // active maps & placeholder (candidate)
  const [webpMap, setWebpMap] = useState<Record<string, string>>({});
  const [jpgMap, setJpgMap] = useState<Record<string, string>>({});
  const [candidatePlaceholder, setCandidatePlaceholder] = useState<
    string | null
  >(() => slide?.image ?? null);

  // currently displayed placeholder (keeps showing previous until new is ready)
  const [displayPlaceholder, setDisplayPlaceholder] = useState<string | null>(
    () => slide?.image ?? null
  );

  // previous snapshot (used for crossfade)
  const [prevWebpMap, setPrevWebpMap] = useState<Record<string, string> | null>(
    null
  );
  const [prevJpgMap, setPrevJpgMap] = useState<Record<string, string> | null>(
    null
  );
  const [prevPlaceholder, setPrevPlaceholder] = useState<string | null>(null);

  // render/loading states & refs
  const [bgLoaded, setBgLoaded] = useState(false);
  const [fgLoaded, setFgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const mounted = useRef(true);
  const fadeTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (fadeTimeoutRef.current) {
        clearTimeout(fadeTimeoutRef.current);
        fadeTimeoutRef.current = null;
      }
    };
  }, []);

  // Snapshot previous slide, then populate active maps for new slide.
  // Important: we intentionally do NOT clear displayPlaceholder immediately so the previous image remains visible
  useEffect(() => {
    // snapshot current into prev for crossfade
    setPrevWebpMap(Object.keys(webpMap).length ? webpMap : null);
    setPrevJpgMap(Object.keys(jpgMap).length ? jpgMap : null);
    setPrevPlaceholder(displayPlaceholder ?? null);

    // reset active maps & candidate placeholder; keep displayPlaceholder until we have a new candidate preloaded
    setWebpMap({});
    setJpgMap({});
    setCandidatePlaceholder(slide?.image ?? null);
    setBgLoaded(false);
    setFgLoaded(false);
    setImgError(false);

    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }

    const processEagerFiles = (files: Record<string, string>, ext: string) => {
      const wMap: Record<string, string> = {};
      Object.keys(files).forEach((k) => {
        const filename = k.split("/").pop() || k;
        const regex = new RegExp(`^${base}-(\\d+)\\.${ext}$`, "i");
        const m = filename.match(regex);
        if (m) wMap[m[1]] = files[k];
      });
      const single = Object.keys(files).find(
        (k) =>
          (k.split("/").pop() || "").toLowerCase() ===
          `${base}.${ext}`.toLowerCase()
      );
      return { wMap, singleUrl: single ? files[single] : undefined };
    };

    try {
      const wRes = processEagerFiles(eagerWebp, "webp");
      const jRes = processEagerFiles(eagerJpg, "jpg");
      const jxRes = processEagerFiles(eagerJpeg, "jpeg");
      const combinedJpgMap = { ...jRes.wMap, ...jxRes.wMap };

      if (Object.keys(wRes.wMap).length > 0) {
        setWebpMap(wRes.wMap);
        // pick SMALL placeholder (fast) to show quickly
        if (!slide?.image) {
          const smallest = pickSmallest(wRes.wMap);
          if (smallest) setCandidatePlaceholder(smallest);
        }
      } else if (Object.keys(combinedJpgMap).length > 0) {
        setJpgMap(combinedJpgMap);
        if (!slide?.image) {
          const smallest = pickSmallest(combinedJpgMap);
          if (smallest) setCandidatePlaceholder(smallest);
        }
      } else {
        const singleWebp = wRes.singleUrl;
        const singleJpg = jRes.singleUrl ?? jxRes.singleUrl;
        if (!slide?.image && singleWebp) setCandidatePlaceholder(singleWebp);
        else if (!slide?.image && singleJpg) setCandidatePlaceholder(singleJpg);
      }
    } catch (err) {
      // will try lazy imports below
      // eslint-disable-next-line no-console
      console.warn("[Slide] eager lookup failed; will try lazy imports", err);
    }

    const callImporter = async (imp?: (() => Promise<string>) | null) => {
      if (!imp) return null;
      try {
        return await imp();
      } catch (err) {
        // eslint-disable-next-line no-console
        console.warn("[Slide] lazy import failed for importer", err);
        return null;
      }
    };

    (async () => {
      try {
        const webpEntries: Array<{
          width: string;
          importer: () => Promise<string>;
        }> = [];
        const jpgEntries: Array<{
          width: string;
          importer: () => Promise<string>;
        }> = [];
        let singleWebpImp: (() => Promise<string>) | null = null;
        let singleJpgImp: (() => Promise<string>) | null = null;

        const inspectLazy = (
          map: Record<string, () => Promise<string>>,
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

        if (webpEntries.length > 0) {
          const res = await Promise.all(
            webpEntries.map(async (e) => ({
              width: e.width,
              url: await e.importer(),
            }))
          );
          if (!mounted.current) return;
          const map: Record<string, string> = {};
          res.forEach((r) => (map[r.width] = r.url));
          setWebpMap(map);
          if (!slide?.image) {
            const smallest = res
              .map((r) => [Number(r.width), r.url] as const)
              .sort((a, b) => a[0] - b[0])[0];
            if (smallest) setCandidatePlaceholder(smallest[1]);
          }
        } else if (jpgEntries.length > 0) {
          const res = await Promise.all(
            jpgEntries.map(async (e) => ({
              width: e.width,
              url: await e.importer(),
            }))
          );
          if (!mounted.current) return;
          const map: Record<string, string> = {};
          res.forEach((r) => (map[r.width] = r.url));
          setJpgMap(map);
          if (!slide?.image) {
            const smallest = res
              .map((r) => [Number(r.width), r.url] as const)
              .sort((a, b) => a[0] - b[0])[0];
            if (smallest) setCandidatePlaceholder(smallest[1]);
          }
        } else {
          if (singleWebpImp) {
            const url = await callImporter(singleWebpImp);
            if (!mounted.current) return;
            if (url && !slide?.image) setCandidatePlaceholder(url);
          } else if (singleJpgImp) {
            const url = await callImporter(singleJpgImp);
            if (!mounted.current) return;
            if (url && !slide?.image) setCandidatePlaceholder(url);
          } else {
            // eslint-disable-next-line no-console
            console.warn(`[Slide] no assets found for baseName="${base}".`);
          }
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("[Slide] lazy import error", err);
      }
    })();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    base,
    slide?.image,
    eagerWebp,
    eagerJpg,
    eagerJpeg,
    lazyWebp,
    lazyJpg,
    lazyJpeg,
  ]);

  // derived flags & fallback (use candidatePlaceholder OR smallest from maps)
  const hasWebp = Object.keys(webpMap).length > 0;
  const hasJpg = Object.keys(jpgMap).length > 0;

  const smallestFromWebp = pickSmallest(webpMap);
  const smallestFromJpg = pickSmallest(jpgMap);

  const fallbackCandidate =
    candidatePlaceholder ?? smallestFromWebp ?? smallestFromJpg ?? "";

  const sizes = "(max-width: 480px) 100vw, (max-width: 1024px) 100vw, 1200px";

  // preload fallbackCandidate so we can set displayPlaceholder once it's ready.
  useEffect(() => {
    if (!fallbackCandidate) {
      setImgError(true);
      setBgLoaded(false);
      setFgLoaded(false);
      return;
    }

    let cancelled = false;
    const pre = new Image();
    pre.src = fallbackCandidate;
    pre.onload = () => {
      if (cancelled) return;
      // set the currently-displayed placeholder to the preloaded candidate
      setCandidatePlaceholder(fallbackCandidate);
      setDisplayPlaceholder(fallbackCandidate); // swap displayed placeholder immediately once small image ready
      setImgError(false);
      setBgLoaded(true);
      // mark fgLoaded true early so foreground displays quickly (image download will be cached and <img> onLoad fires quickly)
      setFgLoaded(true);
    };
    pre.onerror = () => {
      if (cancelled) return;
      // eslint-disable-next-line no-console
      console.warn(`[Slide] image failed to preload: ${fallbackCandidate}`);
      setImgError(true);
      setBgLoaded(false);
      setFgLoaded(false);
    };
    return () => {
      cancelled = true;
    };
  }, [fallbackCandidate]);

  // Crossfade cleanup: when FG loads, remove prev after a short delay
  const prevExists = !!(
    prevPlaceholder ||
    (prevWebpMap && Object.keys(prevWebpMap).length) ||
    (prevJpgMap && Object.keys(prevJpgMap).length)
  );

  const clearPrevAfter = (ms = 420) => {
    if (fadeTimeoutRef.current) {
      clearTimeout(fadeTimeoutRef.current);
      fadeTimeoutRef.current = null;
    }
    fadeTimeoutRef.current = window.setTimeout(() => {
      setPrevPlaceholder(null);
      setPrevWebpMap(null);
      setPrevJpgMap(null);
      fadeTimeoutRef.current = null;
    }, ms);
  };

  useEffect(() => {
    if (fgLoaded && prevExists) {
      clearPrevAfter(420);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fgLoaded]);

  // keep easing typed for TS (Framer Motion)
  const bgScaleTransition = {
    duration: 0.9,
    ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
  };
  const fgFadeTransition = {
    duration: 0.36,
    ease: [0.0, 0.0, 0.2, 1] as [number, number, number, number],
  };

  // --- RENDER (no early returns; show fallback UI inside JSX) ---
  const fallbackSrc = displayPlaceholder ?? "";
  const showFallbackUI = !fallbackSrc || imgError;

  return (
    <div className="absolute inset-0 w-full h-full">
      {/* If no image or error: show readable gradient + title overlay */}
      {showFallbackUI ? (
        <>
          <div
            className="absolute inset-0 z-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(6,7,12,0.75) 0%, rgba(6,7,12,0.55) 40%, rgba(6,7,12,0.62) 100%)",
            }}
          />
          <div className="absolute inset-0 z-10 flex items-center">
            <div className="max-w-3xl px-6">
              <h3 className="text-2xl md:text-3xl lg:text-4xl font-serif text-white/95 tracking-tight drop-shadow-lg">
                {title}
              </h3>
              {subtitle && (
                <p className="mt-2 text-sm md:text-base text-white/85">
                  {subtitle}
                </p>
              )}
            </div>
          </div>
        </>
      ) : (
        <>
          {/* previous blurred background (if present) */}
          {prevExists && prevPlaceholder && (
            <motion.div
              className="absolute inset-0 z-5 will-change-transform"
              initial={{ opacity: 1, scale: 1.01 }}
              animate={
                fgLoaded
                  ? { opacity: 0, scale: 1.0 }
                  : { opacity: 1, scale: 1.01 }
              }
              transition={bgScaleTransition}
              aria-hidden
            >
              <div
                className="w-full h-full bg-center bg-cover"
                style={{
                  backgroundImage: `linear-gradient(rgba(6,7,12,0.45), rgba(6,7,12,0.45)), url("${prevPlaceholder}")`,
                  filter: "blur(18px) saturate(0.9) contrast(0.98)",
                  transform: "scale(1.01)",
                }}
              />
            </motion.div>
          )}

          {/* active blurred background */}
          <motion.div
            className="absolute inset-0 z-0 will-change-transform"
            initial={{ opacity: 0.9, scale: 1.03 }}
            animate={{
              opacity: bgLoaded ? 1 : 0.9,
              scale: bgLoaded ? 1.0 : 1.03,
            }}
            exit={{ opacity: 0 }}
            transition={bgScaleTransition}
            aria-hidden
          >
            <div
              className="w-full h-full bg-center bg-cover"
              style={{
                backgroundImage: `linear-gradient(rgba(6,7,12,0.45), rgba(6,7,12,0.45)), url("${fallbackSrc}")`,
                filter: "blur(20px) saturate(0.92) contrast(0.98)",
                transform: "scale(1.03)",
              }}
            />
          </motion.div>

          {/* previous crisp foreground */}
          {prevExists && prevPlaceholder && (
            <motion.div
              className="absolute inset-0 z-10 will-change-transform"
              initial={{ opacity: 1, scale: 1.0 }}
              animate={
                fgLoaded
                  ? { opacity: 0, scale: 1.01 }
                  : { opacity: 1, scale: 1.0 }
              }
              transition={fgFadeTransition}
              aria-hidden
            >
              <picture>
                {prevWebpMap && Object.keys(prevWebpMap).length > 0 && (
                  <source
                    type="image/webp"
                    srcSet={buildSrcSet(prevWebpMap)}
                    sizes={sizes}
                  />
                )}
                {prevJpgMap && Object.keys(prevJpgMap).length > 0 && (
                  <source
                    type="image/jpeg"
                    srcSet={buildSrcSet(prevJpgMap)}
                    sizes={sizes}
                  />
                )}
                <img
                  src={prevPlaceholder}
                  alt={alt}
                  className="w-full h-full object-cover bg-gray-100"
                  loading="lazy"
                  decoding="async"
                  sizes={sizes}
                  style={{
                    objectPosition: "center",
                    maxHeight: "80vh",
                  }}
                />
              </picture>
            </motion.div>
          )}

          {/* current crisp foreground */}
          <motion.div
            className="absolute inset-0 z-20 will-change-transform"
            initial={{ opacity: 0, scale: 1.02 }}
            animate={
              fgLoaded
                ? { opacity: 1, scale: 1.0 }
                : { opacity: 0, scale: 1.02 }
            }
            exit={{ opacity: 0, scale: 1.02 }}
            transition={fgFadeTransition}
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
                alt={alt}
                className="w-full h-full object-cover bg-gray-100"
                loading="eager"
                decoding="async"
                fetchPriority="high"
                sizes={sizes}
                style={{
                  objectPosition: "center",
                  transition:
                    "opacity 320ms cubic-bezier(.2,0,.2,1), transform 320ms cubic-bezier(.2,0,.2,1)",
                  maxHeight: "80vh", // prevents extremely tall images on mobile
                }}
                onLoad={() => {
                  // ensure we mark fgLoaded in case preload didn't already
                  setFgLoaded(true);
                }}
                onError={() => setImgError(true)}
              />
            </picture>
          </motion.div>

          {/* overlay for consistent contrast */}
          <div className="absolute inset-0 z-30 bg-gradient-to-b from-black/18 via-black/6 to-black/34 pointer-events-none" />
        </>
      )}
    </div>
  );
}
