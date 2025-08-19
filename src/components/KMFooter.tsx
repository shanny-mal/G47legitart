// src/components/KMFooter.tsx
import React, { useEffect, useRef, useState, type JSX } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import {
  FaTwitter,
  FaFacebookF,
  FaInstagram,
  FaWhatsapp,
} from "react-icons/fa";

type SubscribeState = "idle" | "loading" | "ok" | "error";

const SocialButton: React.FC<{
  href: string;
  label: string;
  children: React.ReactNode;
}> = ({ href, label, children }) => {
  const reduce = useReducedMotion();
  const hover = reduce ? {} : { y: -3 };
  return (
    <motion.a
      href={href}
      aria-label={label}
      title={label}
      whileHover={hover}
      className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white/6 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/40"
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

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  useEffect(() => {
    if (state === "ok" || state === "error") {
      setShowMsg(true);
      const t = setTimeout(() => {
        if (mounted.current) setShowMsg(false);
      }, 6000);
      return () => clearTimeout(t);
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

    setState("loading");

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });
      clearTimeout(timeout);

      if (!res.ok) {
        let bodyMsg = `Subscription failed (${res.status})`;
        try {
          const data = await res.json();
          if (data?.message) bodyMsg = String(data.message);
          else if (data?.error) bodyMsg = String(data.error);
        } catch {
          /* ignore json parse errors */
        }
        throw new Error(bodyMsg);
      }

      if (!mounted.current) return;
      setState("ok");
      setMessage("Thanks — check your inbox for confirmation.");
      setEmail("");
    } catch (err: any) {
      clearTimeout(timeout);
      if (!mounted.current) return;
      if (err?.name === "AbortError") {
        setState("error");
        setMessage("Request timed out. Try again.");
      } else {
        setState("error");
        setMessage(err?.message ?? "An error occurred. Try again later.");
      }
    } finally {
      if (mounted.current && state !== "loading") {
        // nothing
      }
      // ensure we leave loading state after result
      setTimeout(() => {
        if (mounted.current && state === "loading") {
          // fallback safety - should usually be cleared earlier
          setState("idle");
        }
      }, 11000);
    }
  }

  return (
    <footer className="bg-karibaNavy text-karibaSand py-12">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Brand */}
        <div className="space-y-3">
          <a
            href="/"
            className="inline-flex items-center gap-3 focus:outline-none"
          >
            {/* simple logo mark */}
            <div className="w-12 h-12 rounded-md bg-gradient-to-br from-karibaTeal to-karibaCoral flex items-center justify-center text-black font-serif text-lg shadow">
              KM
            </div>
            <div>
              <div className="font-serif text-2xl font-semibold text-karibaSand">
                TheKaribaMagazine
              </div>
              <div className="text-sm text-karibaSand/80">
                In-depth features & photojournalism from the Kariba basin.
              </div>
            </div>
          </a>

          <div className="mt-4 flex flex-wrap gap-3">
            <a
              href="/about"
              className="text-sm text-karibaSand/80 hover:underline focus:outline-none"
            >
              About
            </a>
            <a
              href="/issues"
              className="text-sm text-karibaSand/80 hover:underline focus:outline-none"
            >
              Issues
            </a>
            <a
              href="/contributors"
              className="text-sm text-karibaSand/80 hover:underline focus:outline-none"
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
                className="block text-sm font-medium"
              >
                Get our newsletter
              </label>
              <div className="mt-1 text-xs text-karibaSand/80">
                Monthly long-reads, photo essays and editor picks.
              </div>
            </div>

            <div className="flex items-center gap-0 mt-2">
              <input
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                type="email"
                name="email"
                placeholder="you@example.com"
                aria-label="Email address"
                className="flex-1 px-3 py-2 rounded-l-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/60"
              />

              <motion.button
                type="submit"
                disabled={state === "loading"}
                whileTap={prefersReducedMotion ? undefined : { scale: 0.98 }}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-black rounded-r-md font-semibold shadow-sm hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaCoral/50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                aria-disabled={state === "loading"}
              >
                {state === "loading" ? (
                  <svg
                    className="w-4 h-4 animate-spin"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <circle
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="white"
                      strokeOpacity="0.18"
                      strokeWidth="3"
                    />
                    <path
                      d="M22 12a10 10 0 00-10-10"
                      stroke="white"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M3 8l9 6 9-6"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M21 16v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
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

            <div className="min-h-[1.25rem]">
              {showMsg && state === "ok" && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={msgVariants}
                  className="text-xs text-green-300 flex items-center gap-2"
                  role="status"
                  aria-live="polite"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M5 13l4 4L19 7"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span>{message ?? "Thanks — check your inbox."}</span>
                </motion.div>
              )}

              {showMsg && state === "error" && (
                <motion.div
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  variants={msgVariants}
                  className="text-xs text-red-300"
                  role="alert"
                >
                  {message ?? "Something went wrong. Please try again."}
                </motion.div>
              )}
            </div>
          </form>
        </div>

        {/* Socials & legal */}
        <div>
          <h5 className="font-semibold">Follow</h5>

          <div className="mt-3 flex items-center gap-3">
            <SocialButton href="#" label="X (Twitter)">
              <FaTwitter size={16} className="text-karibaSand" aria-hidden />
            </SocialButton>

            <SocialButton href="#" label="Facebook">
              <FaFacebookF size={16} className="text-karibaSand" aria-hidden />
            </SocialButton>

            <SocialButton href="#" label="Instagram">
              <FaInstagram size={16} className="text-karibaSand" aria-hidden />
            </SocialButton>

            <SocialButton href="#" label="WhatsApp">
              <FaWhatsapp size={16} className="text-karibaSand" aria-hidden />
            </SocialButton>
          </div>

          <nav className="mt-4 text-sm grid gap-1">
            <a className="text-karibaSand/80 hover:underline" href="/privacy">
              Privacy
            </a>
            <a className="text-karibaSand/80 hover:underline" href="/terms">
              Terms
            </a>
            <a className="text-karibaSand/80 hover:underline" href="/contact">
              Contact
            </a>
          </nav>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-karibaSand/60">
        © {new Date().getFullYear()} TheKaribaMagazine. All rights reserved.
      </div>
    </footer>
  );
}
