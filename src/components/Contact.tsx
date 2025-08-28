// src/components/Contact.tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
  type JSX,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FaMapMarkerAlt,
  FaEnvelope,
  FaPhoneAlt,
  FaPaperPlane,
} from "react-icons/fa";
import client from "../api/client";

type FormState = {
  name: string;
  email: string;
  message: string;
  hp?: string; // honeypot
};

const isValidEmail = (v: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

/* -------------------------
   Small presentational inputs
   ------------------------- */

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & {
    label: string;
    icon?: React.ReactNode;
  }
> = ({ label, icon, className = "", ...p }) => (
  <label className="block">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </div>
    <div
      className={`mt-2 relative ${className}`}
      // prevent layout-shift for icon
    >
      {icon && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-400 pointer-events-none">
          {icon}
        </div>
      )}
      <input
        {...p}
        className={`block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 transition-shadow ${
          icon ? "pl-12" : ""
        }`}
      />
    </div>
  </label>
);

const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }
> = ({ label, className = "", ...p }) => (
  <label className="block">
    <div className="flex items-center justify-between">
      <span className="text-sm font-medium text-slate-700 dark:text-slate-200">
        {label}
      </span>
    </div>
    <textarea
      {...p}
      className={`mt-2 block w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 text-sm h-36 resize-vertical placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-300/40 transition-shadow ${className}`}
    />
  </label>
);

/* -------------------------
   Contact Info panel
   ------------------------- */

const ContactInfo: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-gradient-to-tr from-emerald-200 to-rose-200 text-emerald-800 dark:text-emerald-200 shadow-sm">
        <FaMapMarkerAlt />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Editorial HQ — Kariba
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400 mt-0.5">
          2240 Batonga — Kariba
        </div>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-gradient-to-tr from-indigo-200 to-emerald-200 text-indigo-700 dark:text-indigo-200 shadow-sm">
        <FaEnvelope />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Email
        </div>
        <a
          href="mailto:thekaribamagazine@gmail.com"
          className="text-sm text-slate-600 dark:text-slate-400 hover:underline"
        >
          thekaribamagazine@gmail.com
        </a>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-gradient-to-tr from-yellow-200 to-rose-200 text-yellow-700 dark:text-yellow-200 shadow-sm">
        <FaPhoneAlt />
      </div>
      <div>
        <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
          Phone
        </div>
        <div className="text-sm text-slate-600 dark:text-slate-400">
          +263 776 810 028
        </div>
      </div>
    </div>

    <div className="mt-2 text-sm text-slate-600 dark:text-slate-400">
      Press & editorial enquiries: include a clear subject and short summary.
      We'll aim to reply within ~48 hours.
    </div>
  </div>
);

/* -------------------------
   Main Contact component
   ------------------------- */

export default function Contact(): JSX.Element {
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    message: "",
    hp: "",
  });
  const [status, setStatus] = useState<
    "idle" | "sending" | "success" | "error"
  >("idle");
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [mapOpen, setMapOpen] = useState(false);
  const mounted = useRef(true);
  const abortRef = useRef<AbortController | null>(null);
  const prefersReduced = useReducedMotion();

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      abortRef.current?.abort();
    };
  }, []);

  const onChange =
    (key: keyof FormState) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((s) => ({ ...s, [key]: e.target.value }));
      setErrorMsg(null);
    };

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      // honeypot (basic bot filter)
      if (form.hp && form.hp.trim().length > 0) {
        setStatus("idle");
        return;
      }

      if (
        !form.name.trim() ||
        !isValidEmail(form.email) ||
        form.message.trim().length < 10
      ) {
        setErrorMsg("Please complete all required fields (message min 10 characters).");
        setStatus("error");
        return;
      }

      setStatus("sending");
      setErrorMsg(null);

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = window.setTimeout(() => controller.abort(), 12000);

      try {
        const payload = {
          name: form.name.trim(),
          email: form.email.trim(),
          message: form.message.trim(),
          hp: form.hp ? form.hp.trim() : "",
        };

        // POST to your API (uses central axios client)
        const res = await client.post("/contact/", payload, {
          signal: controller.signal as any,
        });

        if (res.status >= 200 && res.status < 300) {
          if (!mounted.current) return;
          setStatus("success");
          setForm({ name: "", email: "", message: "", hp: "" });
          // auto-clear success after a few seconds
          window.setTimeout(() => {
            if (mounted.current) setStatus("idle");
          }, 4500);
        } else {
          throw new Error("Server rejected request");
        }
      } catch (err: any) {
        if (!mounted.current) return;
        if (err?.name === "CanceledError" || err?.name === "AbortError") {
          setErrorMsg("Request timed out. Please try again.");
        } else if (err?.response?.data) {
          const d = err.response.data;
          setErrorMsg(
            d.detail || d.error || (typeof d === "string" ? d : JSON.stringify(d))
          );
        } else {
          setErrorMsg(err?.message || "Failed to send message. Try later.");
        }
        setStatus("error");
      } finally {
        clearTimeout(timeout);
        abortRef.current = null;
      }
    },
    [form]
  );

  // Map embed
  const mapsKey = (import.meta.env.VITE_GOOGLE_MAPS_API_KEY as string) || "";
  const q = encodeURIComponent("Kariba, Zimbabwe");
  const embedSrc = mapsKey
    ? `https://www.google.com/maps/embed/v1/place?key=${mapsKey}&q=${q}`
    : `https://www.google.com/maps?q=${q}&output=embed`;

  return (
    <section
      id="contact"
      className="py-16 bg-gradient-to-b from-white to-slate-50 dark:from-slate-900 dark:to-slate-950"
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Form card */}
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white dark:bg-slate-900 rounded-2xl p-8 shadow-xl border border-slate-100 dark:border-slate-800"
            aria-labelledby="contact-heading"
          >
            <h3
              id="contact-heading"
              className="text-3xl font-serif text-slate-900 dark:text-slate-100"
            >
              Contact & Press
            </h3>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Have a tip, story idea, or press enquiry? Send us a message and we’ll get back to you.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-5" noValidate>
              <Input
                label="Full name"
                type="text"
                value={form.name}
                onChange={onChange("name")}
                required
                placeholder="Your full name"
                id="contact-name"
                icon={
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    aria-hidden
                  >
                    <path
                      d="M12 12a4 4 0 100-8 4 4 0 000 8z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M4 20v-1a4 4 0 014-4h8a4 4 0 014 4v1"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                }
              />

              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={onChange("email")}
                required
                placeholder="you@example.com"
                id="contact-email"
                icon={<FaEnvelope className="w-4 h-4" aria-hidden />}
              />

              <Textarea
                label="Message"
                value={form.message}
                onChange={onChange("message")}
                placeholder="Write a short message describing your enquiry (min 10 characters)"
                required
                id="contact-message"
              />

              {/* honeypot */}
              <label className="sr-only" htmlFor="hp">
                Leave this field empty
              </label>
              <input
                id="hp"
                name="hp"
                value={form.hp}
                onChange={onChange("hp")}
                tabIndex={-1}
                autoComplete="off"
                className="sr-only"
                aria-hidden
              />

              <div className="flex items-center gap-3">
                <motion.button
                  type="submit"
                  whileTap={prefersReduced ? undefined : { scale: 0.985 }}
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-indigo-600 to-emerald-400 text-white rounded-lg font-semibold shadow-md hover:brightness-105 focus:outline-none focus:ring-2 focus:ring-indigo-300/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  aria-disabled={status === "sending"}
                >
                  <FaPaperPlane className="w-4 h-4" aria-hidden />
                  <span>
                    {status === "sending"
                      ? "Sending…"
                      : status === "success"
                      ? "Sent"
                      : "Send message"}
                  </span>
                </motion.button>

                <button
                  type="button"
                  onClick={() => {
                    setForm({ name: "", email: "", message: "", hp: "" });
                    setStatus("idle");
                    setErrorMsg(null);
                  }}
                  className="px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition"
                >
                  Reset
                </button>

                <div className="ml-auto text-sm">
                  <AnimatePresence initial={false}>
                    {status === "success" && (
                      <motion.div
                        key="success"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28 }}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1 bg-emerald-50 text-emerald-700"
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
                        <span>Thanks — we’ll reply soon.</span>
                      </motion.div>
                    )}

                    {status === "error" && errorMsg && (
                      <motion.div
                        key="error"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.28 }}
                        className="inline-flex items-center gap-2 rounded-md px-3 py-1 bg-rose-50 text-rose-600"
                        role="alert"
                      >
                        <svg
                          className="w-4 h-4"
                          viewBox="0 0 24 24"
                          fill="none"
                          aria-hidden
                        >
                          <path
                            d="M12 9v4"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          <path
                            d="M12 17h.01"
                            stroke="currentColor"
                            strokeWidth="1.6"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <span>{errorMsg}</span>
                      </motion.div>
                    )}

                    {status === "idle" && !errorMsg && (
                      <motion.div
                        key="note"
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.28 }}
                        className="text-slate-500 dark:text-slate-400"
                      >
                        Required fields marked *
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </form>
          </motion.div>

          {/* Info + Map */}
          <motion.aside
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.06 }}
            className="space-y-6"
            aria-labelledby="contact-info"
          >
            <h4
              id="contact-info"
              className="text-lg font-semibold text-slate-900 dark:text-slate-100"
            >
              Our location & contact
            </h4>

            <div className="bg-white rounded-2xl p-5 shadow-lg dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <ContactInfo />
            </div>

            {/* Map preview - lazy load on demand */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg dark:bg-slate-900 border border-slate-100 dark:border-slate-800">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-slate-900 dark:text-slate-100">
                    Location map
                  </h5>
                  <div className="text-xs text-slate-500 dark:text-slate-400">
                    Lazy loaded
                  </div>
                </div>

                {!mapOpen ? (
                  <div className="mt-3">
                    <div className="h-44 bg-gradient-to-br from-slate-50 to-indigo-50 dark:from-slate-800 dark:to-indigo-900 rounded-md flex items-center justify-center text-sm text-slate-500 dark:text-slate-300">
                      Map preview (click to load)
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setMapOpen(true)}
                        className="px-3 py-2 rounded-md bg-indigo-600 text-white font-medium shadow hover:brightness-105"
                      >
                        Show map
                      </button>
                      <a
                        href="https://maps.google.com?q=Kariba"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-md border border-slate-200 text-sm hover:bg-slate-50 dark:hover:bg-slate-800"
                      >
                        Open in Google Maps
                      </a>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3">
                    <div className="w-full h-64 sm:h-80">
                      <iframe
                        title="Kariba location map"
                        src={embedSrc}
                        className="w-full h-full border-0 rounded-b-md"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <div className="mt-3 text-sm text-slate-600 dark:text-slate-400">
                      Map loaded; close to conserve resources.
                      <button
                        onClick={() => setMapOpen(false)}
                        className="ml-3 px-2 py-1 text-xs rounded-md border border-slate-200 dark:border-slate-700"
                      >
                        Close map
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </motion.aside>
        </div>
      </div>
    </section>
  );
}
