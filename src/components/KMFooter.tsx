import React, { useEffect, useState, type JSX } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

function KMFooter(): JSX.Element {
  const [email, setEmail] = useState("");
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showMsg, setShowMsg] = useState(false);
  const prefersReducedMotion = useReducedMotion();

  // simple email validation
  const isValidEmail = (e: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e.trim());

  // hide success message automatically after 5s
  useEffect(() => {
    if (ok) {
      setShowMsg(true);
      const t = setTimeout(() => setShowMsg(false), 5000);
      return () => clearTimeout(t);
    }
  }, [ok]);

  // subscribe handler with AbortController + timeout
  const subscribe = async (ev: React.FormEvent) => {
    ev.preventDefault();
    setError(null);

    if (!email) {
      setError("Please enter your email address.");
      return;
    }
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10s

    try {
      const res = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
        signal: controller.signal,
      });

      clearTimeout(timeout);

      if (!res.ok) {
        let msg = `Subscription failed (${res.status})`;
        try {
          const body = await res.json();
          if (body?.error) msg = String(body.error);
          else if (body?.message) msg = String(body.message);
        } catch {
          /* ignore JSON parse errors */
        }
        throw new Error(msg);
      }

      setOk(true);
      setEmail("");
      setError(null);
    } catch (err: any) {
      if (err?.name === "AbortError") {
        setError("Request timed out. Please try again.");
      } else {
        setError(err?.message ?? "An unknown error occurred.");
      }
      setOk(false);
    } finally {
      setLoading(false);
    }
  };

  // framer-motion variants (use undefined when reduced motion is preferred)
  const msgVariants: Variants | undefined = prefersReducedMotion
    ? undefined
    : {
        initial: { opacity: 0, y: -6 },
        animate: { opacity: 1, y: 0, transition: { duration: 0.28 } },
        exit: { opacity: 0, y: -6, transition: { duration: 0.18 } },
      };

  const iconVariant: Variants | undefined = prefersReducedMotion
    ? undefined
    : {
        hover: { y: -3, transition: { duration: 0.18 } },
      };

  return (
    <footer className="bg-karibaNavy text-karibaSand py-12">
      <div className="max-w-6xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        <div>
          <div className="font-serif text-2xl font-bold">KaribaMagazine</div>
          <p className="text-sm mt-3 text-karibaSand/80">
            In-depth features, photo essays and journalism from the Kariba
            region.
          </p>
        </div>

        {/* Newsletter form */}
        <div>
          <form
            onSubmit={subscribe}
            className="flex flex-col gap-3"
            aria-labelledby="newsletter-label"
          >
            <label id="newsletter-label" className="text-sm font-medium">
              Subscribe to our newsletter
            </label>

            <div className="flex gap-2">
              <input
                type="email"
                name="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                aria-label="Email address"
                required
                className="flex-1 px-3 py-2 rounded-l-md text-black placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/60"
              />

              <button
                type="submit"
                disabled={loading}
                className="inline-flex items-center gap-2 px-4 py-2 bg-karibaCoral text-white rounded-r-md font-semibold shadow-sm
                           hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaCoral/50 disabled:opacity-60 disabled:cursor-not-allowed transition"
                aria-disabled={loading}
              >
                {loading ? (
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
                      strokeOpacity="0.2"
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

                <span className="text-sm">Subscribe</span>
              </button>
            </div>

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
              {error && (
                <div role="alert" className="text-xs text-red-300">
                  {error}
                </div>
              )}

              {ok && showMsg && (
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
                  <span>Thanks — check your inbox for a confirmation.</span>
                </motion.div>
              )}
            </div>
          </form>
        </div>

        {/* Socials & links */}
        <div>
          <h5 className="font-semibold">Follow</h5>
          <div className="flex gap-3 mt-2">
            {/* X (Twitter) */}
            <motion.a
              href="#"
              aria-label="X (Twitter)"
              whileHover="hover"
              variants={iconVariant}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/6 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/40"
            >
              <svg
                className="w-4 h-4 text-karibaSand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M20 6L11.5 14.5M11.5 6L20 14.5"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.a>

            {/* Facebook */}
            <motion.a
              href="#"
              aria-label="Facebook"
              whileHover="hover"
              variants={iconVariant}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/6 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/40"
            >
              <svg
                className="w-4 h-4 text-karibaSand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M15 8h2V5.5a1.5 1.5 0 00-1.5-1.5H13v3h1.5V10H13v7h-3v-7H8V8h2V6.5A2.5 2.5 0 0112.5 4H15v4z"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.a>

            {/* Instagram */}
            <motion.a
              href="#"
              aria-label="Instagram"
              whileHover="hover"
              variants={iconVariant}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/6 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/40"
            >
              <svg
                className="w-4 h-4 text-karibaSand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <rect
                  x="3"
                  y="3"
                  width="18"
                  height="18"
                  rx="5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                />
                <circle
                  cx="12"
                  cy="12"
                  r="3.2"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  fill="none"
                />
                <circle cx="17.5" cy="6.5" r="0.7" fill="currentColor" />
              </svg>
            </motion.a>

            {/* WhatsApp */}
            <motion.a
              href="#"
              aria-label="WhatsApp"
              whileHover="hover"
              variants={iconVariant}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full bg-white/6 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-karibaTeal/40"
            >
              <svg
                className="w-4 h-4 text-karibaSand"
                viewBox="0 0 24 24"
                fill="none"
                aria-hidden
              >
                <path
                  d="M20.5 11.5A8.5 8.5 0 114.3 19L3 21l2.3-.7A8.5 8.5 0 0020.5 11.5z"
                  stroke="currentColor"
                  strokeWidth="1.1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
                <path
                  d="M15.2 13.3c-.3-.1-1.7-.9-1.9-1-.2-.1-.3-.1-.5.1-.2.3-.6.9-.7 1.1-.1.2-.2.2-.5.1-1.1-.5-2-1.9-2.3-3.4-.1-.3 0-.5.1-.6.1-.1.3-.2.5-.2.2 0 .5 0 .8.1.3.1.8.1 1.1.1.3 0 .5-.1.7-.1.2 0 .4-.1.6.2.2.3.8 1 1 1.2.2.2.3.4.2.7-.1.3-.5 1.1-.7 1.4-.2.3-.4.3-.7.2z"
                  stroke="currentColor"
                  strokeWidth="0.9"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  fill="none"
                />
              </svg>
            </motion.a>
          </div>

          <nav className="mt-4 text-sm">
            <a
              className="block text-karibaSand/80 hover:underline"
              href="/privacy"
            >
              Privacy
            </a>
            <a
              className="block text-karibaSand/80 hover:underline"
              href="/terms"
            >
              Terms
            </a>
          </nav>
        </div>
      </div>

      <div className="mt-10 text-center text-xs text-karibaSand/60">
        © {new Date().getFullYear()} KaribaMagazine. All rights reserved.
      </div>
    </footer>
  );
}

export default KMFooter;
