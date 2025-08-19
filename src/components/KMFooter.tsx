// src/components/KMFooter.tsx
import React, { useEffect, useRef, useState, type JSX } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
  FaEnvelope,
  FaCheckCircle,
  FaExclamationCircle,
} from "react-icons/fa";

type SubscribeState = "idle" | "loading" | "ok" | "error";

const SocialButton: React.FC<{
  href: string;
  label: string;
  accent?: string; // tailwind color class for subtle background
  children: React.ReactNode;
}> = ({ href, label, children, accent = "bg-white/6" }) => {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={href}
      aria-label={label}
      title={label}
      whileHover={reduce ? undefined : { y: -4, scale: 1.05 }}
      transition={{ duration: 0.18 }}
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${accent} shadow-sm text-white hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-white/20`}
    >
      {children}
    </motion.a>
  );
};

export default function KMFooter(): JSX.Element {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<SubscribeState>("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [showMsg, setShowMsg] = useState(false);
  const mounted = useRef(true);
  const prefersReducedMotion = useReducedMotion();
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
        hideTimerRef.current = null;
      }
    };
  }, []);

  // When state becomes final (ok/error) show message temporarily:
  useEffect(() => {
    if (state === "ok" || state === "error") {
      setShowMsg(true);
      // clear any existing timer
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        if (mounted.current) setShowMsg(false);
        hideTimerRef.current = null;
      }, 6000);
    }
  }, [state]);

  const isValidEmail = (v: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

  const msgVariants: Variants | undefined = prefersReducedMotion
    ? undefined
    : {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.26 } },
        exit: { opacity: 0, y: -6, transition: { duration: 0.16 } },
      };

  async function subscribe(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    // basic validation
    if (!email) {
      setState("error");
      setMessage("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    // start request
    setState("loading");

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) {
        // attempt to extract friendly message
        let bodyMsg = `Subscription failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.message) bodyMsg = String(data.message);
          else if (data?.error) bodyMsg = String(data.error);
        } catch {
          /* ignore parse errors */
        }
        throw new Error(bodyMsg);
      }

      if (!mounted.current) return;
      setState("ok");
      setMessage("Thanks — check your inbox for confirmation.");
      setEmail("");
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (!mounted.current) return;
      if (err?.name === "AbortError") {
        setState("error");
        setMessage("Request timed out. Try again.");
      } else {
        setState("error");
        setMessage(err?.message ?? "An error occurred. Try again later.");
      }
    } finally {
      // ensure we don't stay stuck in loading if something odd happens:
      if (mounted.current && state === "loading") {
        // leave a tiny gap before resetting to idle so UI updates
        window.setTimeout(() => {
          if (mounted.current && state === "loading") setState("idle");
        }, 700);
      }
    }
  }

  return (
    <footer className="relative bg-gradient-to-tr from-slate-900 via-indigo-900 to-rose-900 text-slate-100 py-12">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-3 gap-10">
        {/* Brand */}
        <div className="space-y-4">
          <a
            href="/"
            className="inline-flex items-center gap-4 focus:outline-none group"
            aria-label="Kariba Magazine home"
          >
            <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-300 via-indigo-400 to-rose-300 flex items-center justify-center font-serif text-lg text-slate-900 shadow-lg transform transition-transform group-hover:scale-105">
              KM
            </div>

            <div className="leading-tight">
              <div className="font-serif text-2xl font-semibold text-white">
                TheKaribaMagazine
              </div>
              <div className="text-sm text-white/80 max-w-xs">
                In-depth features & photojournalism from the Kariba basin.
              </div>
            </div>
          </a>

          <div className="flex flex-wrap gap-3 mt-2">
            <a className="text-sm text-white/80 hover:underline" href="/about">
              About
            </a>
            <a className="text-sm text-white/80 hover:underline" href="/issues">
              Issues
            </a>
            <a
              className="text-sm text-white/80 hover:underline"
              href="/contributors"
            >
              Contributors
            </a>
          </div>
        </div>

        {/* Newsletter */}
        <div>
          <form
            onSubmit={subscribe}
            className="flex flex-col gap-3"
            aria-labelledby="newsletter-label"
          >
            <div>
              <label
                id="newsletter-label"
                className="block text-sm font-medium text-white"
              >
                Get our newsletter
              </label>
              <div className="mt-1 text-xs text-white/80">
                Monthly long-reads, photo essays and editor picks.
              </div>
            </div>

            <div className="flex items-center gap-0 mt-2">
              <label className="sr-only" htmlFor="km-footer-email">
                Email address
              </label>
              <div className="flex items-center gap-2 bg-white/6 rounded-l-md pl-3 pr-2">
                <FaEnvelope className="w-4 h-4 text-white/80" aria-hidden />
              </div>

              <input
                id="km-footer-email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                placeholder="you@example.com"
                aria-label="Email address"
                required
                className="flex-1 px-3 py-2 rounded-none rounded-r-md text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-400/50 bg-white/95"
              />

              <motion.button
                type="submit"
                disabled={state === "loading"}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                className="inline-flex items-center gap-2 px-4 py-2 ml-2 bg-gradient-to-r from-indigo-400 to-teal-300 text-slate-900 rounded-md font-semibold shadow-md hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-300 disabled:opacity-60 disabled:cursor-not-allowed transition"
                aria-disabled={state === "loading"}
              >
                {state === "loading" ? (
                  <svg
                    className="w-4 h-4 animate-spin text-slate-900"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeOpacity="0.15"
                      strokeWidth="3"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : state === "ok" ? (
                  <FaCheckCircle
                    className="w-4 h-4 text-slate-900"
                    aria-hidden
                  />
                ) : state === "error" ? (
                  <FaExclamationCircle
                    className="w-4 h-4 text-slate-900"
                    aria-hidden
                  />
                ) : (
                  <FaEnvelope className="w-4 h-4 text-slate-900" aria-hidden />
                )}

                <span className="text-sm">
                  {state === "ok"
                    ? "Subscribed"
                    : state === "loading"
                    ? "Sending…"
                    : "Subscribe"}
                </span>
              </motion.button>
            </div>

            {/* hidden honeypot */}
            <div aria-hidden className="hidden">
              <label>Leave this field empty</label>
              <input
                type="text"
                name="hp_field"
                tabIndex={-1}
                autoComplete="off"
              />
            </div>

            {/* feedback area */}
            <div className="min-h-[1.25rem]">
              {showMsg && state === "ok" && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={msgVariants}
                  className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 bg-white/10 text-sm text-green-200"
                  role="status"
                  aria-live="polite"
                >
                  <FaCheckCircle className="w-4 h-4" aria-hidden />
                  <span>{message ?? "Thanks — check your inbox."}</span>
                </motion.div>
              )}

              {showMsg && state === "error" && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={msgVariants}
                  className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 bg-white/10 text-sm text-rose-200"
                  role="alert"
                >
                  <FaExclamationCircle className="w-4 h-4" aria-hidden />
                  <span>
                    {message ?? "Something went wrong. Please try again."}
                  </span>
                </motion.div>
              )}
            </div>
          </form>
        </div>

        {/* Socials & legal */}
        <div>
          <h5 className="font-semibold text-white">Follow</h5>

          <div className="mt-3 flex items-center gap-3">
            <SocialButton href="#" label="X (Twitter)" accent="bg-[#1DA1F2]/90">
              <FaTwitter size={16} aria-hidden />
            </SocialButton>

            <SocialButton href="#" label="Facebook" accent="bg-[#1877F2]/90">
              <FaFacebookF size={16} aria-hidden />
            </SocialButton>

            <SocialButton
              href="#"
              label="Instagram"
              accent="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]"
            >
              <FaInstagram size={16} aria-hidden />
            </SocialButton>

            <SocialButton href="#" label="WhatsApp" accent="bg-[#25D366]/90">
              <FaWhatsapp size={16} aria-hidden />
            </SocialButton>
          </div>

          <nav className="mt-4 text-sm grid gap-1">
            <a className="text-white/80 hover:underline" href="/privacy">
              Privacy
            </a>
            <a className="text-white/80 hover:underline" href="/terms">
              Terms
            </a>
            <a className="text-white/80 hover:underline" href="/contact">
              Contact
            </a>
          </nav>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-white/60 space-y-2">
        <div>
          © {new Date().getFullYear()} TheKaribaMagazine. All rights reserved.
        </div>

        {/* Created by shannyTech credit */}
        <div>
          <motion.a
            href="https://shannytech.solutions"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Created by shannyTech — opens in a new tab"
            whileHover={
              prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }
            }
            transition={{ duration: 0.15 }}
            className="inline-flex items-center gap-2 text-white/70 hover:text-white hover:underline text-sm"
          >
            Created by{" "}
            <span className="font-medium text-white ml-1">shannyTech</span>
          </motion.a>
        </div>
      </div>
    </footer>
  );
}
