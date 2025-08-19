// src/components/hero/useTypewriter.ts
import { useEffect, useRef, useState } from "react";

type Options = { speed?: number; pauseBetween?: number; instant?: boolean };

export default function useTypewriter(
  title: string,
  subtitle = "",
  opts: Options = {}
) {
  const { speed = 40, pauseBetween = 300, instant = false } = opts;
  const [typedTitle, setTypedTitle] = useState("");
  const [typedSubtitle, setTypedSubtitle] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const mounted = useRef(true);
  const cancel = useRef(false);

  useEffect(() => {
    mounted.current = true;
    cancel.current = false;
    setTypedTitle("");
    setTypedSubtitle("");
    setIsTyping(true);

    if (instant) {
      setTypedTitle(title);
      setTypedSubtitle(subtitle);
      setIsTyping(false);
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
      await typeTitle();
      if (cancel.current || !mounted.current) {
        setIsTyping(false);
        return;
      }
      await new Promise(
        (r) => (titleTimer = window.setTimeout(r, pauseBetween))
      );
      await typeSubtitle();
      if (!cancel.current && mounted.current) setIsTyping(false);
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
