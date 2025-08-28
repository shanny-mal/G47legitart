import { useEffect, useState, useCallback, type JSX } from "react";
import { motion, useReducedMotion } from "framer-motion";
import client from "../api/client";
import { useAuth } from "./AuthProvider";
import { format } from "date-fns";

type Subscriber = {
  id: number;
  email: string;
  created_at: string | null;
  confirmed: boolean;
  confirmed_at?: string | null;
  token?: string | null;
};

export default function SubscriberList(): JSX.Element {
  // ensure admin context (call kept intentionally to trigger auth guard)
  useAuth();

  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [count, setCount] = useState<number | null>(null);

  const reduce = useReducedMotion();

  const fetchPage = useCallback(
    async (p = 1) => {
      setLoading(true);
      setError(null);
      try {
        const res = await client.get("/subscribers/", {
          params: { page: p, page_size: pageSize },
        });
        const d = res.data;
        if (d?.results) {
          setItems(Array.isArray(d.results) ? d.results : []);
          setCount(typeof d.count === "number" ? d.count : null);
        } else if (Array.isArray(d)) {
          setItems(d);
          setCount(d.length);
        } else {
          setItems([]);
          setCount(null);
        }
      } catch (err: any) {
        console.error(err);
        setError(
          err?.response?.data?.detail ||
            err?.message ||
            "Failed to load subscribers."
        );
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  const totalPages = count ? Math.max(1, Math.ceil(count / pageSize)) : null;

  const formatDate = (iso?: string | null) =>
    iso ? format(new Date(iso), "yyyy-MM-dd HH:mm") : "-";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Subscribers
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Manage newsletter subscribers — total shown is from API when supported.
          </p>
        </div>

        <div className="text-sm text-slate-600 dark:text-slate-300">
          Total:{" "}
          <span className="font-medium text-slate-900 dark:text-slate-100">
            {count ?? "—"}
          </span>
        </div>
      </div>

      <div className="bg-white dark:bg-[#041421] rounded-2xl shadow-sm border border-white/6 p-4">
        {loading ? (
          <div className="py-8 flex items-center justify-center">
            <svg
              className="w-6 h-6 animate-spin text-slate-700 dark:text-slate-200"
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
            <span className="ml-3 text-sm text-slate-700 dark:text-slate-200">
              Loading subscribers…
            </span>
          </div>
        ) : error ? (
          <div className="p-4 rounded-md bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-200">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[640px]">
                <thead>
                  <tr className="text-left text-slate-600 dark:text-slate-300">
                    <th className="p-3">Subscriber</th>
                    <th className="p-3">Confirmed</th>
                    <th className="p-3">Created</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="p-6 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        No subscribers found.
                      </td>
                    </tr>
                  ) : (
                    items.map((s, idx) => {
                      const initials =
                        s.email?.trim()?.charAt(0)?.toUpperCase() ?? "S";
                      return (
                        <motion.tr
                          key={s.id}
                          initial={reduce ? {} : { opacity: 0, y: 6 }}
                          animate={reduce ? {} : { opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, delay: idx * 0.02 }}
                          className="border-t last:border-b"
                        >
                          <td className="p-3 align-middle">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-500 to-emerald-400 text-white font-semibold">
                                {initials}
                              </div>
                              <div>
                                <div className="font-medium text-slate-900 dark:text-slate-100">
                                  {s.email}
                                </div>
                                <div className="text-xs text-slate-500 dark:text-slate-400">
                                  ID: {s.id}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="p-3 align-middle">
                            <span
                              className={`inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium ${
                                s.confirmed
                                  ? "bg-emerald-100 text-emerald-800"
                                  : "bg-amber-100 text-amber-800"
                              }`}
                            >
                              {s.confirmed ? "Confirmed" : "Unconfirmed"}
                            </span>
                            {s.confirmed_at && (
                              <div className="text-xs text-slate-500 mt-1">
                                {formatDate(s.confirmed_at || null)}
                              </div>
                            )}
                          </td>

                          <td className="p-3 align-middle">
                            <div className="text-sm text-slate-700 dark:text-slate-200">
                              {formatDate(s.created_at)}
                            </div>
                          </td>

                          <td className="p-3 align-middle text-right">
                            <div className="flex items-center justify-end gap-2">
                              <a
                                href={`mailto:${s.email}`}
                                className="text-xs px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800 hover:bg-white/6 transition"
                              >
                                Email
                              </a>
                              <button
                                type="button"
                                onClick={async () => {
                                  // quick copy token or email for admin convenience
                                  try {
                                    await navigator.clipboard.writeText(s.email);
                                    // tiny feedback — could be replaced by toast
                                    // eslint-disable-next-line no-alert
                                    alert("Email copied to clipboard");
                                  } catch {
                                    // ignore
                                  }
                                }}
                                className="text-xs px-3 py-1 rounded-md bg-white/6 hover:bg-white/10 transition"
                              >
                                Copy
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Page <span className="font-medium text-slate-900 dark:text-slate-100">{page}</span>
                {totalPages ? (
                  <>
                    {" "}
                    of <span className="font-medium">{totalPages}</span>
                  </>
                ) : null}
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    page === 1
                      ? "opacity-50 cursor-not-allowed border border-slate-100 dark:border-slate-800"
                      : "bg-white/6 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  Prev
                </button>

                <button
                  onClick={() =>
                    setPage((p) =>
                      totalPages ? Math.min(totalPages, p + 1) : p + 1
                    )
                  }
                  disabled={totalPages !== null && page >= (totalPages ?? 1)}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    totalPages !== null && page >= (totalPages ?? 1)
                      ? "opacity-50 cursor-not-allowed border border-slate-100 dark:border-slate-800"
                      : "bg-white/6 hover:bg-white/10 border border-transparent"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
