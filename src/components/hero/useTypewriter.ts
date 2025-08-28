import { useEffect, useRef, useState } from "react";

type Options = { speed?: number; pauseBetween?: number; instant?: boolean };

export default function useTypewriter(
  title: string,
  subtitle = "",
  opts: Options = {}
) {
  // adapt speed for viewport: mobile -> slightly faster typing
  const isClient = typeof window !== "undefined";
  const viewportWidth = isClient ? window.innerWidth : 1200;
  const autoSpeed = viewportWidth < 640 ? 28 : 34;

  const { speed = autoSpeed, pauseBetween = 300, instant = false } = opts;
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
      // show everything immediately if reduced motion or instant asked
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

    const stepTitle = () => {
      if (cancel.current || !mounted.current) return;
      titleIdx++;
      setTypedTitle(title.slice(0, titleIdx));
      if (titleIdx < title.length) {
        titleTimer = window.setTimeout(stepTitle, speed);
      } else {
        titleTimer = undefined;
      }
    };

    const stepSubtitle = () => {
      if (cancel.current || !mounted.current) return;
      subIdx++;
      setTypedSubtitle(subtitle.slice(0, subIdx));
      if (subIdx < subtitle.length) {
        subTimer = window.setTimeout(stepSubtitle, speed);
      } else {
        subTimer = undefined;
      }
    };

    (async () => {
      // type title
      if (title.length === 0) {
        // move on
      } else {
        stepTitle();
        // wait until title finished
        while (!cancel.current && mounted.current && titleIdx < title.length) {
          // poll - but avoid busy loop: wait a bit
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => (titleTimer ? setTimeout(r, speed) : setTimeout(r, 20)));
        }
      }

      if (cancel.current || !mounted.current) {
        setIsTyping(false);
        return;
      }

      // pause between title and subtitle
      await new Promise((r) => setTimeout(r, pauseBetween));

      // type subtitle
      if (subtitle.length > 0) {
        stepSubtitle();
        while (!cancel.current && mounted.current && subIdx < subtitle.length) {
          // eslint-disable-next-line no-await-in-loop
          await new Promise((r) => (subTimer ? setTimeout(r, speed) : setTimeout(r, 20)));
        }
      }

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
