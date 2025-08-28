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
import anonClient from "../api/anonClient";

type SubscribeState = "idle" | "loading" | "ok" | "error";

const SocialButton: React.FC<{
  href: string;
  label: string;
  accent?: string;
  children: React.ReactNode;
}> = ({ href, label, children, accent = "bg-white/6" }) => {
  const reduce = useReducedMotion();
  return (
    <motion.a
      href={href}
      aria-label={label}
      title={label}
      whileHover={reduce ? undefined : { y: -4, scale: 1.05 }}
      transition={{ duration: 0.16 }}
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

  useEffect(() => {
    if (state === "ok" || state === "error") {
      setShowMsg(true);
      if (hideTimerRef.current) {
        clearTimeout(hideTimerRef.current);
      }
      hideTimerRef.current = window.setTimeout(() => {
        if (mounted.current) setShowMsg(false);
        hideTimerRef.current = null;
      }, 6000);
    }
  }, [state]);

  const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

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

    // normalize
    const candidate = (email ?? "").toLowerCase().trim();

    if (!candidate) {
      setState("error");
      setMessage("Please enter your email address.");
      return;
    }
    if (!isValidEmail(candidate)) {
      setState("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setState("loading");
    try {
      // Use plain axios (no client interceptors) to ensure no auth header is attached.
      const res = await anonClient.post("/subscribe/", { email: candidate });
      if (res.status >= 200 && res.status < 300) {
        setState("ok");
        setMessage(res.data?.message ?? "Thanks — check your inbox for confirmation.");
        setEmail("");
      } else {
        throw new Error("Subscription failed");
      }
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "An error occurred. Try again later.";
      setState("error");
      setMessage(msg);
    } finally {
      // Reset loading indicator after short delay but keep ok/error visible
      setTimeout(() => {
        if (!mounted.current) return;
        if (state === "loading") setState("idle");
      }, 700);
    }
  }

  return (
    <footer className="relative bg-gradient-to-tr from-slate-900 via-indigo-900 to-rose-900 text-slate-100 py-10 sm:py-12">
      <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-400 via-teal-300 to-rose-300 opacity-80" />

      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 md:items-start">
          <div className="space-y-4">
            <a href="/" className="inline-flex items-center gap-4 focus:outline-none group" aria-label="Kariba Magazine home">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-teal-300 via-indigo-400 to-rose-300 flex items-center justify-center font-serif text-lg text-slate-900 shadow-lg transform transition-transform group-hover:scale-105">
                KM
              </div>

              <div className="leading-tight">
                <div className="font-serif text-2xl font-semibold text-white">TheKaribaMagazine</div>
                <div className="text-sm text-white/80 max-w-xs">In-depth features & photojournalism from the Kariba basin.</div>
              </div>
            </a>

            <div className="flex flex-wrap gap-3 mt-2">
              <a className="text-sm text-white/80 hover:underline" href="/about">About</a>
              <a className="text-sm text-white/80 hover:underline" href="/issues">Issues</a>
              <a className="text-sm text-white/80 hover:underline" href="/contributors">Contributors</a>
            </div>
          </div>

          <div>
            <form onSubmit={subscribe} className="flex flex-col items-stretch gap-3" aria-labelledby="newsletter-label">
              <div>
                <label id="newsletter-label" className="block text-sm font-medium text-white">Get our newsletter</label>
                <div className="mt-1 text-xs text-white/80">Monthly long-reads, photo essays and editor picks.</div>
              </div>

              <div className="flex flex-col sm:flex-row items-stretch gap-2 mt-2">
                <label className="sr-only" htmlFor="km-footer-email">Email address</label>

                <div className="flex items-center gap-2 bg-white/6 rounded-md px-3 py-2 sm:flex-initial sm:min-w-0">
                  <FaEnvelope className="w-4 h-4 text-white/80" aria-hidden />
                  <input
                    id="km-footer-email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    name="email"
                    placeholder="you@example.com"
                    aria-label="Email address"
                    required
                    className="flex-1 bg-transparent border-0 px-2 py-0 text-sm text-white placeholder-white/60 focus:outline-none"
                  />
                </div>

                <motion.button
                  type="submit"
                  disabled={state === "loading" || state === "ok"}
                  whileTap={prefersReducedMotion ? undefined : { scale: 0.985 }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md font-semibold shadow-md text-slate-900 disabled:opacity-70"
                  style={{ background: "linear-gradient(90deg,#06b6d4 0%, #ff7a7a 60%)" }}
                >
                  {state === "loading" ? (
                    <svg className="w-4 h-4 animate-spin text-slate-900" viewBox="0 0 24 24" fill="none" aria-hidden>
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeOpacity="0.15" strokeWidth="3" />
                      <path d="M22 12a10 10 0 00-10-10" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    </svg>
                  ) : state === "ok" ? (
                    <FaCheckCircle className="w-4 h-4 text-slate-900" aria-hidden />
                  ) : state === "error" ? (
                    <FaExclamationCircle className="w-4 h-4 text-slate-900" aria-hidden />
                  ) : (
                    <FaEnvelope className="w-4 h-4 text-slate-900" aria-hidden />
                  )}

                  <span className="text-sm">
                    {state === "ok" ? "Subscribed" : state === "loading" ? "Sending…" : "Subscribe"}
                  </span>
                </motion.button>
              </div>

              <div className="min-h-[1.25rem]">
                <div aria-live="polite" aria-atomic="true">
                  {showMsg && state === "ok" && (
                    <motion.div initial="initial" animate="animate" exit="exit" variants={msgVariants} className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 bg-white/10 text-sm text-green-200" role="status">
                      <FaCheckCircle className="w-4 h-4" aria-hidden />
                      <span>{message ?? "Thanks — check your inbox."}</span>
                    </motion.div>
                  )}

                  {showMsg && state === "error" && (
                    <motion.div initial="initial" animate="animate" exit="exit" variants={msgVariants} className="mt-2 inline-flex items-center gap-2 rounded-md px-2 py-1 bg-white/10 text-sm text-rose-200" role="alert">
                      <FaExclamationCircle className="w-4 h-4" aria-hidden />
                      <span>{message ?? "Something went wrong. Please try again."}</span>
                    </motion.div>
                  )}
                </div>
              </div>
            </form>
          </div>

          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between md:justify-end gap-4">
              <h5 className="font-semibold text-white mb-0">Follow</h5>

              <div className="flex items-center gap-3 flex-wrap">
                <SocialButton href="#" label="X (Twitter)" accent="bg-[#1DA1F2]/90"><FaTwitter size={16} aria-hidden /></SocialButton>
                <SocialButton href="#" label="Facebook" accent="bg-[#1877F2]/90"><FaFacebookF size={16} aria-hidden /></SocialButton>
                <SocialButton href="#" label="Instagram" accent="bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF]"><FaInstagram size={16} aria-hidden /></SocialButton>
                <SocialButton href="#" label="WhatsApp" accent="bg-[#25D366]/90"><FaWhatsapp size={16} aria-hidden /></SocialButton>
              </div>
            </div>

            <nav className="mt-1 text-sm grid gap-1 md:justify-end">
              <a className="text-white/80 hover:underline" href="/privacy">Privacy</a>
              <a className="text-white/80 hover:underline" href="/terms">Terms</a>
              <a className="text-white/80 hover:underline" href="/contact">Contact</a>
            </nav>
          </div>
        </div>

        <div className="mt-8 border-t border-white/8 pt-6 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-center sm:text-left text-xs text-white/60">© {new Date().getFullYear()} TheKaribaMagazine. All rights reserved.</div>

          <div className="text-center sm:text-right">
            <motion.a href="https://shannytech.solutions" target="_blank" rel="noopener noreferrer" aria-label="Created by shannyTech — opens in a new tab" whileHover={prefersReducedMotion ? undefined : { y: -3, scale: 1.02 }} transition={{ duration: 0.15 }} className="inline-flex items-center gap-2 text-white/70 hover:text-white hover:underline text-sm">
              Created by <span className="font-medium text-white ml-1">shannyTech</span>
            </motion.a>
          </div>
        </div>
      </div>
    </footer>
  );
}
