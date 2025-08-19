import React, {
  useCallback,
  useEffect,
  
  useRef,
  useState,
  type JSX,
} from "react";
import { motion, useReducedMotion } from "framer-motion";
import { FaMapMarkerAlt, FaEnvelope, FaPhoneAlt } from "react-icons/fa";

type FormState = {
  name: string;
  email: string;
  message: string;
  hp?: string; // honeypot
};

const isValidEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v.trim());

const Input: React.FC<
  React.InputHTMLAttributes<HTMLInputElement> & { label: string }
> = ({ label, ...p }) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
    </span>
    <input
      {...p}
      className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071f28] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-karibaTeal/40"
    />
  </label>
);

const Textarea: React.FC<
  React.TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }
> = ({ label, ...p }) => (
  <label className="block">
    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
      {label}
    </span>
    <textarea
      {...p}
      className="mt-1 block w-full rounded-md border border-gray-200 dark:border-gray-700 bg-white dark:bg-[#071f28] px-3 py-2 text-sm h-36 resize-vertical focus:outline-none focus:ring-2 focus:ring-karibaTeal/40"
    />
  </label>
);

const ContactInfo: React.FC = () => (
  <div className="space-y-4">
    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-white/6 dark:bg-white/4 text-karibaNavy dark:text-karibaSand">
        <FaMapMarkerAlt />
      </div>
      <div>
        <div className="text-sm font-semibold text-karibaNavy dark:text-karibaSand">
          Editorial HQ — Kariba
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
          P.O. Box 1234, Kariba, Zimbabwe
        </div>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-white/6 dark:bg-white/4 text-karibaNavy dark:text-karibaSand">
        <FaEnvelope />
      </div>
      <div>
        <div className="text-sm font-semibold">Email</div>
        <a
          href="mailto:hello@karibamagazine.org"
          className="text-sm text-gray-500 dark:text-gray-400 hover:underline"
        >
          hello@karibamagazine.org
        </a>
      </div>
    </div>

    <div className="flex items-start gap-3">
      <div className="p-3 rounded-md bg-white/6 dark:bg-white/4 text-karibaNavy dark:text-karibaSand">
        <FaPhoneAlt />
      </div>
      <div>
        <div className="text-sm font-semibold">Phone</div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          +263 77 000 0000
        </div>
      </div>
    </div>

    <div className="mt-2 text-sm text-gray-600 dark:text-gray-400">
      Press & editorial enquiries: please include a clear subject and a short
      summary. We'll aim to respond within 48 hours.
    </div>
  </div>
);

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
      // clear previous error when user types
      setErrorMsg(null);
    };


  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setErrorMsg(null);

      // basic validation
      if (form.hp && form.hp.trim().length > 0) {
        // honeypot triggered -> silently fail
        setStatus("idle");
        return;
      }
      if (
        !form.name.trim() ||
        !isValidEmail(form.email) ||
        !form.message.trim()
      ) {
        setErrorMsg(
          "Please complete all required fields with valid information."
        );
        setStatus("error");
        return;
      }

      setStatus("sending");
      setErrorMsg(null);

      const controller = new AbortController();
      abortRef.current = controller;
      const timeout = setTimeout(() => controller.abort(), 10000);

      try {
        const res = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: form.name.trim(),
            email: form.email.trim(),
            message: form.message.trim(),
          }),
          signal: controller.signal,
        });

        clearTimeout(timeout);

        if (!res.ok) {
          let msg = `Server responded ${res.status}`;
          try {
            const body = await res.json();
            if (body?.error) msg = String(body.error);
            else if (body?.message) msg = String(body.message);
          } catch {
            /* ignore parse errors */
          }
          throw new Error(msg);
        }

        if (!mounted.current) return;
        setStatus("success");
        setForm({ name: "", email: "", message: "", hp: "" });
      } catch (err: any) {
        if (!mounted.current) return;
        if (err?.name === "AbortError") {
          setErrorMsg("Request timed out. Please try again.");
        } else {
          setErrorMsg(err?.message ?? "Failed to send message. Try later.");
        }
        setStatus("error");
      } finally {
        clearTimeout(timeout);
        abortRef.current = null;
      }
    },
    [form]
  );

  return (
    <section id="contact" className="py-12 bg-gray-50 dark:bg-[#041c22]">
      <div className="max-w-7xl mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Form card */}
          <motion.div
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="bg-white rounded-2xl p-6 shadow-sm dark:bg-[#05232b] border border-white/6"
          >
            <h3 className="text-2xl font-serif text-karibaNavy dark:text-karibaSand">
              Contact & Press
            </h3>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
              Have a tip, story idea, or press enquiry? Send us a message and
              we’ll get back to you.
            </p>

            <form onSubmit={submit} className="mt-6 space-y-4" noValidate>
              <Input
                label="Full name"
                type="text"
                value={form.name}
                onChange={onChange("name")}
                required
                placeholder="Your full name"
                aria-required
                id="contact-name"
              />

              <Input
                label="Email address"
                type="email"
                value={form.email}
                onChange={onChange("email")}
                required
                placeholder="you@example.com"
                aria-required
                id="contact-email"
              />

              <Textarea
                label="Message"
                value={form.message}
                onChange={onChange("message")}
                placeholder="Write a short message describing your enquiry (min 10 characters)"
                required
                id="contact-message"
              />

              {/* honeypot (invisible to users) */}
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
                  whileTap={prefersReduced ? undefined : { scale: 0.98 }}
                  disabled={status === "sending"}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-karibaTeal to-karibaCoral text-black rounded-md font-semibold shadow hover:brightness-95 focus:outline-none focus:ring-2 focus:ring-karibaTeal/30 disabled:opacity-60 disabled:cursor-not-allowed transition"
                  aria-disabled={status === "sending"}
                >
                  {status === "sending" ? (
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
                  ) : null}
                  <span>
                    {status === "success"
                      ? "Message sent"
                      : status === "sending"
                      ? "Sending…"
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
                  className="px-3 py-2 rounded-md border border-white/8 text-sm hover:bg-white/6 transition"
                >
                  Reset
                </button>

                <div className="ml-auto text-sm text-gray-500 dark:text-gray-400">
                  {status === "success" ? (
                    <span className="text-green-300">
                      Thanks — we’ll reply soon.
                    </span>
                  ) : status === "error" && errorMsg ? (
                    <span className="text-red-300">{errorMsg}</span>
                  ) : (
                    <span className="text-gray-500">
                      Required fields marked *
                    </span>
                  )}
                </div>
              </div>
            </form>
          </motion.div>

          {/* Info + Map */}
          <motion.aside
            initial={prefersReduced ? undefined : { opacity: 0, y: 8 }}
            animate={prefersReduced ? undefined : { opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.06 }}
            className="space-y-6"
            aria-labelledby="contact-info"
          >
            <h4
              id="contact-info"
              className="text-lg font-semibold text-karibaNavy dark:text-karibaSand"
            >
              Our location & contact
            </h4>

            <div className="bg-white rounded-2xl p-4 shadow-sm dark:bg-[#05232b] border border-white/6">
              <ContactInfo />
            </div>

            {/* Map preview - lazy load on demand */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-sm dark:bg-[#05232b] border border-white/6">
              <div className="p-4">
                <div className="flex items-center justify-between">
                  <h5 className="text-sm font-medium text-karibaNavy dark:text-karibaSand">
                    Location map
                  </h5>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Lazy loaded
                  </div>
                </div>

                {!mapOpen ? (
                  <div className="mt-3">
                    <div className="h-40 bg-gray-100 dark:bg-[#03161a] rounded-md flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
                      Map preview (click to load)
                    </div>

                    <div className="mt-3 flex gap-2">
                      <button
                        onClick={() => setMapOpen(true)}
                        className="px-3 py-2 rounded-md bg-white/95 text-karibaNavy font-medium shadow hover:brightness-95"
                      >
                        Show map
                      </button>
                      <a
                        href="https://maps.google.com?q=Kariba"
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-2 rounded-md border border-white/8 text-sm hover:bg-white/6"
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
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d... (replace-with-real-embed)"
                        className="w-full h-full border-0 rounded-b-md"
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>

                    <div className="mt-3 text-sm text-gray-500 dark:text-gray-400">
                      Map loaded; close to conserve resources.
                      <button
                        onClick={() => setMapOpen(false)}
                        className="ml-3 px-2 py-1 text-xs rounded-md border border-white/8"
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
