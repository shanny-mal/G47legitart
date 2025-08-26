// src/pages/Login.tsx
import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
  type JSX,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa";

/**
 * LoginPage
 *
 * Expected backend:
 * - POST /api/login  { email, password, remember }  => 200 + { ok:true } or 4xx + { error }
 * - OAuth endpoints: /auth/google, /auth/facebook (optional)
 *
 * Security note: store JWT / session cookies server-side (httpOnly cookie) and return secure session.
 */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Login(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const mounted = useRef(true);
  const controllerRef = useRef<AbortController | null>(null);

  const reduceMotion = useReducedMotion();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      controllerRef.current?.abort();
    };
  }, []);

  const validate = useCallback(() => {
    if (!email.trim() || !EMAIL_RE.test(email.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password || password.length < 6) {
      setError("Password must be at least 6 characters.");
      return false;
    }
    setError(null);
    return true;
  }, [email, password]);

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      setError(null);
      setSuccess(null);

      if (!validate()) return;

      setLoading(true);
      const ctrl = new AbortController();
      controllerRef.current = ctrl;
      const timeout = setTimeout(() => ctrl.abort(), 10000);

      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: email.trim().toLowerCase(),
            password,
            remember,
          }),
          signal: ctrl.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          let msg = `Login failed (${res.status})`;
          try {
            const body = await res.json();
            if (body?.error) msg = String(body.error);
            else if (body?.message) msg = String(body.message);
          } catch {
            // ignore JSON parse errors
          }
          throw new Error(msg);
        }

        // success
        if (!mounted.current) return;
        setSuccess("Logged in — redirecting...");
        setPassword("");
        // Optionally redirect here, or rely on parent for navigation
      } catch (err: any) {
        if (!mounted.current) return;
        if (err?.name === "AbortError") {
          setError("Request timed out. Please try again.");
        } else {
          setError(err?.message ?? "Login failed — try again.");
        }
      } finally {
        clearTimeout(timeout);
        if (mounted.current) setLoading(false);
      }
    },
    [email, password, remember, validate]
  );

  const canSubmit = email.trim().length > 0 && password.length > 0 && !loading;

  // subtle motion variants
  const containerVariant = reduceMotion
    ? {}
    : { initial: { opacity: 0, y: 8 }, animate: { opacity: 1, y: 0 } };

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-[#03161a] dark:to-[#041b22] p-6">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Visual / copy - shown on mobile as top box */}
        <motion.section
          {...(!reduceMotion ? { initial: "initial", animate: "animate" } : {})}
          transition={{ duration: 0.45 }}
          className="flex flex-col gap-4 p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-white/60 dark:from-[#063033] dark:to-[#04232c] shadow-lg"
        >
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 dark:text-white">
              Welcome back
            </h1>
            <p className="mt-1 text-sm text-slate-600 dark:text-slate-300 max-w-md">
              Sign in to access your subscription, saved stories and contributor
              tools.
            </p>
          </div>

          {/* Decorative illustration / brand mark: responsive */}
          <div className="w-full flex items-center justify-center">
            <div className="w-full sm:w-72 h-40 rounded-lg bg-gradient-to-br from-teal-400 via-indigo-500 to-rose-400 shadow-inner flex items-center justify-center text-white font-bold text-2xl">
              Kariba
            </div>
          </div>
        </motion.section>

        {/* Right: Form */}
        <motion.section
          {...containerVariant}
          transition={{ duration: 0.45, delay: 0.06 }}
          className="bg-white dark:bg-[#062a2a] rounded-2xl p-6 shadow-lg"
        >
          <header className="mb-4">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white">
              Admin Sign in
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-300 mt-1">
              Use your email and password or a social account
            </p>
          </header>

          <form
            onSubmit={onSubmit}
            className="space-y-4"
            aria-describedby="form-note"
          >
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Email
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiMail />
                </span>
                <input
                  type="email"
                  inputMode="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full pl-10 pr-3 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#042a29] text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="you@example.com"
                  aria-invalid={
                    email && !EMAIL_RE.test(email) ? "true" : undefined
                  }
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Password
              </label>
              <div className="mt-1 relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <FiLock />
                </span>

                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full pl-10 pr-10 py-3 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#042a29] text-sm text-slate-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-400/40"
                  placeholder="Enter your password"
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 focus:ring-indigo-300"
                />
                <span className="text-slate-600 dark:text-slate-300">
                  Remember me
                </span>
              </label>

              <a
                href="/forgot"
                className="text-indigo-600 dark:text-teal-300 hover:underline"
              >
                Forgot password?
              </a>
            </div>

            {/* server error / success */}
            <div id="form-note" className="min-h-[1.4rem]">
              {error && (
                <div
                  className="text-xs text-rose-500"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}
              {success && (
                <div
                  className="text-xs text-emerald-400"
                  role="status"
                  aria-live="polite"
                >
                  {success}
                </div>
              )}
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                whileTap={reduceMotion ? undefined : { scale: 0.995 }}
                type="submit"
                disabled={!canSubmit || loading}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 rounded-lg bg-gradient-to-r from-indigo-500 via-teal-400 to-rose-400 text-white font-semibold shadow-lg hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed transition"
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
                ) : null}
                <span>{loading ? "Signing in…" : "Sign in"}</span>
              </motion.button>

              <div className="flex items-center gap-3 justify-center text-sm text-slate-400">
                <span>or continue with</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <motion.a
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  href="/auth/google"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#042a29] hover:shadow-md transition"
                  aria-label="Continue with Google"
                >
                  <FaGoogle className="text-red-500" />
                  <span className="text-sm">Google</span>
                </motion.a>

                <motion.a
                  whileHover={reduceMotion ? undefined : { y: -3 }}
                  href="/auth/facebook"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#042a29] hover:shadow-md transition"
                  aria-label="Continue with Facebook"
                >
                  <FaFacebookF className="text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </motion.a>
              </div>

              <div className="text-center text-xs text-slate-500 mt-2">
                By signing in you agree to our{" "}
                <a href="/terms" className="underline">
                  Terms
                </a>{" "}
                and{" "}
                <a href="/privacy" className="underline">
                  Privacy Policy
                </a>
                .
              </div>
            </div>
          </form>
        </motion.section>
      </div>
    </main>
  );
}
