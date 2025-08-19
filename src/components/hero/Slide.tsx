import  { useMemo } from "react";

export type SlideData = {
  id: number;
  title: string;
  subtitle?: string;
  /** Either provide a baseName (for generated variants) OR an explicit image URL (single image approach) */
  baseName?: string;
  /** full URL (bundler-friendly) - used if baseName isn't available */
  image?: string;
  alt?: string;
};


/**
 * Build a srcset string from a set of file urls keyed by width.
 * inputs: map like { '480': '.../hero1-480.webp', ... }
 */
function buildSrcSet(map: Record<string, string>) {
  return Object.entries(map)
    .map(([w, url]) => `${url} ${w}w`)
    .join(", ");
}

/**
 * For small projects: use import.meta.glob to find available files in the background folder.
 * We call this in useMemo so Vite's globbing is resolved at build/dev time.
 */
function useBackgroundImagesMap() {
  // glob all image files in the background folder and return a map { filename: url }
  // IMPORTANT: path is relative to this file; adjust if you move files.
  // as: "url" ensures we get strings, not modules.
  const modules = import.meta.glob(
    "../../assets/images/background/*.{webp,jpg,jpeg,png,avif}",
    { eager: true, as: "url" }
  ) as Record<string, string>;
  // convert keys to just file names: ../../assets/images/background/hero1-480.webp -> hero1-480.webp
  const map: Record<string, string> = {};
  Object.entries(modules).forEach(([k, v]) => {
    const file = k.split("/").pop() || k;
    map[file] = v;
  });
  return map;
}

export default function Slide({
  slide,
  priority = false,
}: {
  slide: SlideData;
  priority?: boolean;
}) {
  const files = useBackgroundImagesMap();

  const { webpMap, jpgMap, fallback } = useMemo(() => {
    // build maps keyed by width for webp & jpg variants if baseName present
    const wMapWebp: Record<string, string> = {};
    const wMapJpg: Record<string, string> = {};
    let fallbackUrl: string | undefined = undefined;

    if (slide.baseName) {
      const base = slide.baseName; // e.g. 'hero1'
      Object.keys(files).forEach((fname) => {
        // match hero1-1200.webp or hero1-1200.jpg
        const regex = new RegExp(
          `^${base}-(\\d+)\\.(webp|jpg|jpeg|png|avif)$`,
          "i"
        );
        const m = fname.match(regex);
        if (m) {
          const width = m[1];
          const ext = m[2].toLowerCase();
          if (ext === "webp" || ext === "avif") wMapWebp[width] = files[fname];
          else wMapJpg[width] = files[fname];
        }
      });

      // fallback to single-file named baseName.ext (hero1.webp) if present
      const fallbackNames = [
        `${base}.webp`,
        `${base}.avif`,
        `${base}.jpg`,
        `${base}.jpeg`,
        `${base}.png`,
      ];
      for (const n of fallbackNames) {
        if (files[n]) {
          fallbackUrl = files[n];
          break;
        }
      }
    }

    // if slide.image was provided (explicit URL), prefer that as fallback
    if (!fallbackUrl && slide.image) fallbackUrl = slide.image;

    return { webpMap: wMapWebp, jpgMap: wMapJpg, fallback: fallbackUrl };
  }, [files, slide.baseName, slide.image]);

  // decide rendering strategy
  const hasVariants =
    Object.keys(webpMap).length > 0 || Object.keys(jpgMap).length > 0;

  // choose largest fallback if present
  const fallbackSrc =
    fallback ?? Object.values(webpMap)[0] ?? Object.values(jpgMap)[0] ?? "";

  // sizes attribute describing how wide the image will be in layout
  const sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 100vw, 1200px";

  return (
    <div className="absolute inset-0 w-full h-full">
      {hasVariants ? (
        <picture>
          {Object.keys(webpMap).length > 0 && (
            <source
              type="image/webp"
              srcSet={buildSrcSet(webpMap)}
              sizes={sizes}
            />
          )}
          {/* fallback to jpg/png if available */}
          {Object.keys(jpgMap).length > 0 && (
            <source
              type="image/jpeg"
              srcSet={buildSrcSet(jpgMap)}
              sizes={sizes}
            />
          )}
          {/* final <img> uses fallbackSrc (biggest available) */}
          <img
            src={fallbackSrc}
            alt={slide.alt ?? slide.title}
            className="w-full h-full object-cover"
            loading={priority ? "eager" : "lazy"}
            decoding="async"
            fetchPriority={priority ? "high" : "low"}
            sizes={sizes}
            style={{ objectPosition: "center" }}
          />
        </picture>
      ) : (
        // fallback: single-image mode (slide.image must be present or fallbackSrc)
        <img
          src={fallbackSrc}
          alt={slide.alt ?? slide.title}
          className="w-full h-full object-cover"
          loading={priority ? "eager" : "lazy"}
          decoding="async"
          fetchPriority={priority ? "high" : "low"}
          style={{ objectPosition: "center" }}
        />
      )}

      {/* overlay for readability */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/40" />
    </div>
  );
}
