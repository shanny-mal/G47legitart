// src/pages/Login.tsx
import React, { useEffect, useRef, useState, type JSX } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import { FiEye, FiEyeOff, FiMail, FiLock } from "react-icons/fi";
import { FaGoogle, FaFacebookF } from "react-icons/fa";
import { useAuth } from "../admin/AuthProvider";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage(): JSX.Element {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const prefersReduced = useReducedMotion();

  const params = new URLSearchParams(location.search);
  const next = (params.get("next") as string) || "/admin";

  const [identifier, setIdentifier] = useState(""); // email or username
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emailRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    emailRef.current?.focus();
    document.title = "Admin sign in — The Kariba Magazine";
  }, []);

  const validate = () => {
    if (!identifier.trim()) {
      setError("Please enter your email or username.");
      return false;
    }
    // if it looks like an email, validate format
    if (identifier.includes("@") && !EMAIL_RE.test(identifier.trim())) {
      setError("Please enter a valid email address.");
      return false;
    }
    if (!password) {
      setError("Please enter your password.");
      return false;
    }
    setError(null);
    return true;
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (!validate()) return;

    setBusy(true);
    try {
      // login may set cookie/session; adjust to your auth provider signature
      await login(identifier.trim(), password);
      navigate(next, { replace: true });
    } catch (err: any) {
      // extract friendly message if available
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Login failed — check credentials and try again.";
      setError(String(msg));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-gradient-to-b from-gray-50 to-white dark:from-[#03141a] dark:to-[#041621] p-6">
      <motion.div
        initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
        animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
        className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-6"
      >
        {/* Decorative panel / illustration (desktop only) */}
        <section className="hidden md:flex flex-col justify-center rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-600 via-teal-500 to-rose-500 text-white p-8 shadow-lg">
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-semibold tracking-tight">
              Welcome back
            </h1>
            <p className="mt-3 text-sm opacity-90 max-w-md">
              Sign in to access the admin area — manage issues, contributors and
              editorial content. Your work helps keep our reporting strong.
            </p>

            <div className="mt-8 grid gap-3">
              <div className="rounded-lg bg-white/10 p-3">
                <div className="text-xs font-medium">Tip</div>
                <div className="mt-1 text-sm opacity-95">
                  Use your admin credentials. If you lose access, contact another
                  site admin or email support.
                </div>
              </div>

              <div className="rounded-lg bg-white/12 p-3">
                <div className="text-xs font-medium">Security</div>
                <div className="mt-1 text-sm opacity-95">
                  For safety, avoid sharing sessions and enable 2FA where
                  available.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 text-xs opacity-90">
            <strong>The Kariba Magazine</strong> — In-depth reporting & photojournalism.
          </div>
        </section>

        {/* Form card */}
        <section className="bg-white dark:bg-[#07161a] rounded-2xl p-6 md:p-8 shadow-lg">
          <header className="mb-4">
            <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
              Admin sign in
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
              Sign in with your account or continue with a social provider.
            </p>
          </header>

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {error && (
              <div
                role="alert"
                className="rounded-md bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-200 px-3 py-2 text-sm"
              >
                {error}
              </div>
            )}

            <label className="block text-sm">
              <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                <FiMail />
                <span className="font-medium">Email or username</span>
              </div>
              <input
                ref={emailRef}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                className="mt-2 w-full px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#04121a] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="you@example.com or username"
                autoComplete="username"
                required
                aria-invalid={identifier && identifier.includes("@") && !EMAIL_RE.test(identifier) ? "true" : undefined}
              />
            </label>

            <label className="block text-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                  <FiLock />
                  <span className="font-medium">Password</span>
                </div>
                <Link to="/forgot" className="text-sm text-indigo-600 hover:underline">
                  Forgot?
                </Link>
              </div>

              <div className="mt-2 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3 py-2 pr-10 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#04121a] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-sm text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </label>

            <div className="flex items-center justify-between">
              <label className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 focus:ring-indigo-300"
                />
                <span className="text-slate-700 dark:text-slate-300">Remember me</span>
              </label>

              <div className="text-xs text-slate-500 dark:text-slate-400">
                <span>Need help? </span>
                <Link to="/contact" className="underline">
                  Contact support
                </Link>
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <motion.button
                type="submit"
                whileTap={prefersReduced ? undefined : { scale: 0.995 }}
                disabled={busy}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-semibold shadow-md hover:brightness-95 disabled:opacity-60 disabled:cursor-not-allowed"
                aria-disabled={busy}
              >
                {busy ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.15" strokeWidth="3" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : null}
                <span>{busy ? "Signing in…" : "Sign in"}</span>
              </motion.button>

              <div className="flex items-center gap-3 text-sm text-slate-500">
                <span className="flex-1 text-center">or continue with</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a
                  href="/auth/google"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#04121a] hover:bg-gray-50"
                  aria-label="Continue with Google"
                >
                  <FaGoogle className="text-red-500" />
                  <span className="text-sm">Google</span>
                </a>

                <a
                  href="/auth/facebook"
                  className="inline-flex items-center justify-center gap-2 px-3 py-2 rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#04121a] hover:bg-gray-50"
                  aria-label="Continue with Facebook"
                >
                  <FaFacebookF className="text-blue-600" />
                  <span className="text-sm">Facebook</span>
                </a>
              </div>

              <div className="text-center text-xs text-slate-500 mt-2">
                By signing in you agree to our{" "}
                <Link to="/terms" className="underline">
                  Terms
                </Link>{" "}
                and{" "}
                <Link to="/privacy" className="underline">
                  Privacy Policy
                </Link>
                .
              </div>
            </div>
          </form>
        </section>
      </motion.div>
    </main>
  );
}
