// src/components/hero/useTypewriter.ts
import { useEffect, useRef, useState } from "react";

type Options = { speed?: number; pauseBetween?: number; instant?: boolean };

/**
 * Resilient typewriter hook.
 * - Remembers last-typed title/subtitle pair to avoid double-typing when component mounts twice quickly.
 * - Cleans up timers reliably.
 */
export default function useTypewriter(
  title: string,
  subtitle = "",
  opts: Options = {}
) {
  const { speed = 40, pauseBetween = 300, instant = false } = opts;
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  // cancel / mounted refs for cleanup
  const mounted = useRef(true);
  const cancel = useRef(false);
  // remember last fully-typed content to avoid re-typing the same thing immediately
  const lastTypedFor = useRef<{ title: string; subtitle: string } | null>(null);

  useEffect(() => {
    mounted.current = true;
    cancel.current = false;

    // If the same text was already fully typed recently, don't replay the animation.
    if (
      !instant &&
      lastTypedFor.current &&
      lastTypedFor.current.title === title &&
      lastTypedFor.current.subtitle === subtitle
    ) {
      // ensure UI shows full strings immediately
      setTypedTitle(title);
      setTypedSubtitle(subtitle);
      setIsTyping(false);
      return () => {
        mounted.current = false;
        cancel.current = true;
      };
    }

    // reset
    setTypedTitle("");
    setTypedSubtitle("");
    setIsTyping(true);

    if (instant) {
      setTypedTitle(title);
      setTypedSubtitle(subtitle);
      setIsTyping(false);
      lastTypedFor.current = { title, subtitle };
      return () => {
        mounted.current = false;
        cancel.current = true;
      };
    }

    let titleIdx = 0;
    let subIdx = 0;
    let titleTimer: number | undefined;
    let subTimer: number | undefined;

    const typeTitle = () =>
      new Promise<void>((resolve) => {
        const step = () => {
          if (cancel.current || !mounted.current) return resolve();
          titleIdx++;
          setTypedTitle(title.slice(0, titleIdx));
          if (titleIdx >= title.length) return resolve();
          titleTimer = window.setTimeout(step, speed);
        };
        if (title.length === 0) return resolve();
        step();
      });

    const typeSubtitle = () =>
      new Promise<void>((resolve) => {
        const step = () => {
          if (cancel.current || !mounted.current) return resolve();
          subIdx++;
          setTypedSubtitle(subtitle.slice(0, subIdx));
          if (subIdx >= subtitle.length) return resolve();
          subTimer = window.setTimeout(step, speed);
        };
        if (!subtitle) return resolve();
        step();
      });

    (async () => {
      try {
        await typeTitle();
        if (cancel.current || !mounted.current) {
          setIsTyping(false);
          return;
        }
        // pause before subtitle
        await new Promise((r) => {
          titleTimer = window.setTimeout(r, pauseBetween);
        });
        await typeSubtitle();
        if (!cancel.current && mounted.current) {
          setIsTyping(false);
          // mark this pair as typed so brief remounts won't replay
          lastTypedFor.current = { title, subtitle };
        }
      } catch {
        setIsTyping(false);
      }
    })();

    return () => {
      mounted.current = false;
      cancel.current = true;
      if (titleTimer) clearTimeout(titleTimer);
      if (subTimer) clearTimeout(subTimer);
    };
  }, [title, subtitle, speed, pauseBetween, instant]);

  return { typedTitle, typedSubtitle, isTyping };
}
