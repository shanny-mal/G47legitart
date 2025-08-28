import React, { useRef, useState } from "react";
import anonClient from "../api/anonClient";
import { motion, useReducedMotion } from "framer-motion";

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Subscribe: React.FC = () => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "ok" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const mounted = useRef(true);
  const reduce = useReducedMotion();

  React.useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function handle(e: React.FormEvent) {
    e.preventDefault();
    setMessage(null);

    const candidate = (email ?? "").toLowerCase().trim();

    if (!isValidEmail(candidate)) {
      setStatus("error");
      setMessage("Please enter a valid email address.");
      return;
    }

    setStatus("loading");
    try {
      // Use plain axios to avoid auth headers or interceptors on client
      const res = await anonClient.post("/subscribe/", { email: candidate });
      if (res.status >= 200 && res.status < 300) {
        if (!mounted.current) return;
        setStatus("ok");
        setMessage(res.data?.message ?? "Thanks — check your email for confirmation.");
        setEmail("");
      } else {
        throw new Error("Subscription failed");
      }
    } catch (err: any) {
      const errMsg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Subscription failed — try again later.";
      if (!mounted.current) return;
      setStatus("error");
      setMessage(errMsg);
    } finally {
      if (mounted.current && status === "loading") {
        setTimeout(() => {
          if (!mounted.current) return;
          if (status === "loading") setStatus("idle");
        }, 600);
      }
    }
  }

  return (
    <section className="py-16 bg-gradient-to-b from-white via-slate-50 to-white dark:from-[#04101a] dark:via-[#041521] dark:to-[#041924]">
      <div className="max-w-3xl mx-auto px-6">
        <div className="bg-white dark:bg-[#041925] rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-800">
          <div className="text-center">
            <h1 className="text-3xl font-serif font-extrabold text-slate-900 dark:text-slate-100">
              Subscribe to The Kariba Magazine
            </h1>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
              Get new issues, exclusive features and invitations — delivered monthly.
            </p>
          </div>

          <form onSubmit={handle} className="mt-6 flex flex-col sm:flex-row gap-3 items-center">
            <input
              aria-label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              className="flex-1 min-w-0 px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#07131a] text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40"
            />

            <motion.button
              type="submit"
              whileTap={reduce ? undefined : { scale: 0.985 }}
              disabled={status === "loading" || status === "ok"}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-lg font-semibold shadow-md text-slate-900 disabled:opacity-70"
              style={{ background: "linear-gradient(90deg,#06b6d4 0%, #ff7a7a 60%)" }}
            >
              {status === "loading" ? "Subscribing…" : status === "ok" ? "Subscribed" : "Subscribe"}
            </motion.button>
          </form>

          <div className="mt-4 text-center min-h-[1.1rem]" aria-live="polite">
            {status === "ok" && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-emerald-50 text-emerald-700">
                ✓ {message}
              </div>
            )}
            {status === "error" && (
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-rose-50 text-rose-600">
                ⚠ {message}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Subscribe;
