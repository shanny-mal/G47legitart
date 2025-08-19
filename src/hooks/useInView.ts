// src/hooks/useInView.ts
import { useEffect, useState } from "react";

/**
 * useInView - returns true when the supplied ref is visible.
 * Accepts a nullable ref: RefObject<T | null>
 */
export default function useInView<T extends Element = Element>(
  ref: React.RefObject<T | null>,
  options?: IntersectionObserverInit
) {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") {
      // fallback - assume visible in non-DOM environments or if element not yet mounted
      setInView(true);
      return;
    }

    const obs = new IntersectionObserver((entries) => {
      setInView(entries.some((e) => e.isIntersecting));
    }, options);

    obs.observe(el);

    return () => obs.disconnect();
  }, [ref, options]);

  return inView;
}
