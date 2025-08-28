// src/admin/ContactList.tsx
import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  useRef,
  type JSX,
} from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import {
  FaEye,
  FaTrash,
  FaCheck,
  FaTimes,
  FaSearch,
  FaSyncAlt,
} from "react-icons/fa";
import client from "../api/client";
import { format } from "date-fns";
import { useAuth } from "./AuthProvider";

type Contact = {
  id: number;
  name: string;
  email: string;
  message: string;
  created_at?: string | null;
  processed?: boolean;
};

export default function ContactList(): JSX.Element {
  // enforce admin/auth guard (keeps existing behavior)
  useAuth();

  // data state
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [count, setCount] = useState<number | null>(null);

  // UI state
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "processed" | "unprocessed">(
    "all"
  );
  const [selected, setSelected] = useState<Contact | null>(null); // preview modal
  const [busyMap, setBusyMap] = useState<Record<number, boolean>>({});
  const mountedRef = useRef(true);

  const reduce = useReducedMotion();

  // timeout ref for debounce
  const debounceRef = useRef<number | null>(null);

  /**
   * fetchPage: loads data from /contacts/ with paging, optional q and processed filter.
   */
  const fetchPage = useCallback(
    async (p = 1, q = "", f: typeof filter = filter) => {
      setLoading(true);
      setError(null);
      try {
        const params: Record<string, any> = { page: p, page_size: pageSize };
        if (q && q.trim()) params.q = q.trim();
        if (f === "processed") params.processed = true;
        else if (f === "unprocessed") params.processed = false;

        const res = await client.get("/contacts/", { params });
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
          err?.response?.data?.detail || err?.message || "Failed to load contacts."
        );
      } finally {
        if (mountedRef.current) setLoading(false);
      }
    },
    [pageSize, filter]
  );

  // Debounced fetch when page / query / filter changes.
  useEffect(() => {
    mountedRef.current = true;
    // clear any previous debounce timer
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    // keep UI responsive: short debounce
    debounceRef.current = window.setTimeout(() => {
      void fetchPage(page, query, filter);
      debounceRef.current = null;
    }, 350);

    return () => {
      mountedRef.current = false;
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
        debounceRef.current = null;
      }
    };
    // intentionally only depend on page, query, filter, fetchPage (fetchPage stable via useCallback)
  }, [page, query, filter, fetchPage]);

  const totalPages = useMemo(
    () => (count ? Math.max(1, Math.ceil(count / pageSize)) : null),
    [count, pageSize]
  );

  const formatDate = (iso?: string | null) =>
    iso ? format(new Date(iso), "yyyy-MM-dd HH:mm") : "-";

  // mark processed/unprocessed (optimistic)
  async function markProcessed(id: number, to = true) {
    setBusyMap((s) => ({ ...s, [id]: true }));
    const prev = items;
    try {
      setItems((s) => s.map((r) => (r.id === id ? { ...r, processed: to } : r)));
      await client.patch(`/contacts/${id}/`, { processed: to });
    } catch (err) {
      console.error(err);
      // revert
      setItems(prev);
      setError("Failed to update message state.");
    } finally {
      setBusyMap((s) => {
        const nxt = { ...s };
        delete nxt[id];
        return nxt;
      });
    }
  }

  // remove message
  async function removeMessage(id: number) {
    if (!confirm("Delete this message? This action cannot be undone.")) return;
    setBusyMap((s) => ({ ...s, [id]: true }));
    const prev = items;
    try {
      await client.delete(`/contacts/${id}/`);
      setItems((s) => s.filter((x) => x.id !== id));
      setCount((c) => (c != null ? Math.max(0, c - 1) : c));
    } catch (err) {
      console.error(err);
      setItems(prev);
      setError("Delete failed.");
    } finally {
      setBusyMap((s) => {
        const nxt = { ...s };
        delete nxt[id];
        return nxt;
      });
    }
  }

  // keyboard escape closes modal
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-2xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Contact messages
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Messages received via the contact form — review, respond or archive.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
              <FaSearch />
            </span>
            <input
              value={query}
              onChange={(e) => {
                setPage(1);
                setQuery(e.target.value);
              }}
              placeholder="Search name, email, or message"
              className="pl-10 pr-3 py-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#04121a] text-sm w-64 focus:outline-none focus:ring-2 focus:ring-indigo-300/40"
              aria-label="Search messages"
            />
          </div>

          <div className="inline-flex gap-1 bg-white/6 rounded-md p-1 shadow-sm">
            <button
              onClick={() => {
                setFilter("all");
                setPage(1);
              }}
              className={`text-sm px-3 py-1 rounded-md transition ${
                filter === "all"
                  ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              All
            </button>
            <button
              onClick={() => {
                setFilter("unprocessed");
                setPage(1);
              }}
              className={`text-sm px-3 py-1 rounded-md transition ${
                filter === "unprocessed"
                  ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              Unprocessed
            </button>
            <button
              onClick={() => {
                setFilter("processed");
                setPage(1);
              }}
              className={`text-sm px-3 py-1 rounded-md transition ${
                filter === "processed"
                  ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white"
                  : "text-slate-700 dark:text-slate-200"
              }`}
            >
              Processed
            </button>
          </div>

          <button
            onClick={() => {
              setQuery("");
              setFilter("all");
              setPage(1);
              void fetchPage(1, "", "all");
            }}
            title="Reload"
            className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white/6 text-sm hover:brightness-95"
          >
            <FaSyncAlt />
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-[#041421] rounded-2xl shadow p-4 border border-white/6">
        {loading ? (
          <div className="py-6 flex items-center justify-center gap-3">
            <svg
              className="w-5 h-5 animate-spin text-slate-700 dark:text-slate-200"
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
            <div className="text-sm text-slate-700 dark:text-slate-200">
              Loading messages…
            </div>
          </div>
        ) : error ? (
          <div className="p-3 rounded-md bg-rose-50 dark:bg-rose-900/10 text-rose-700 dark:text-rose-200">
            {error}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm min-w-[720px]">
                <thead>
                  <tr className="text-left text-slate-600 dark:text-slate-300">
                    <th className="p-3">From</th>
                    <th className="p-3">Email</th>
                    <th className="p-3">Message (preview)</th>
                    <th className="p-3">Received</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td
                        colSpan={5}
                        className="p-6 text-center text-sm text-slate-500 dark:text-slate-400"
                      >
                        No messages found.
                      </td>
                    </tr>
                  ) : (
                    items.map((c, idx) => {
                      const preview =
                        c.message.length > 120
                          ? c.message.slice(0, 120) + "…"
                          : c.message;
                      return (
                        <motion.tr
                          key={c.id}
                          initial={reduce ? undefined : { opacity: 0, y: 6 }}
                          animate={reduce ? undefined : { opacity: 1, y: 0 }}
                          transition={{ duration: 0.28, delay: idx * 0.02 }}
                          className="border-t"
                        >
                          <td className="p-3 align-top">
                            <div className="font-medium text-slate-900 dark:text-slate-100">
                              {c.name || "—"}
                            </div>
                          </td>

                          <td className="p-3 align-top">
                            <a
                              href={`mailto:${c.email}`}
                              className="text-sm text-indigo-600 dark:text-indigo-300 hover:underline"
                            >
                              {c.email}
                            </a>
                          </td>

                          <td className="p-3 align-top max-w-[48ch] break-words text-slate-700 dark:text-slate-200">
                            {preview}
                          </td>

                          <td className="p-3 align-top">
                            <div className="text-sm text-slate-600 dark:text-slate-400">
                              {formatDate(c.created_at)}
                            </div>
                            <div className="mt-1 text-xs">
                              {c.processed ? (
                                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs">
                                  <FaCheck /> Processed
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-2 px-2 py-1 rounded-full bg-amber-100 text-amber-800 text-xs">
                                  <FaTimes /> New
                                </span>
                              )}
                            </div>
                          </td>

                          <td className="p-3 align-top text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => setSelected(c)}
                                className="px-3 py-1 rounded-md bg-white/6 text-sm hover:brightness-95"
                                title="View message"
                                aria-label={`View message from ${c.name}`}
                              >
                                <FaEye />
                              </button>

                              <button
                                onClick={() => void markProcessed(c.id, !c.processed)}
                                disabled={!!busyMap[c.id]}
                                className={`px-3 py-1 rounded-md text-sm transition ${
                                  c.processed
                                    ? "bg-white/6 text-slate-700 dark:text-slate-200"
                                    : "bg-gradient-to-r from-teal-400 to-rose-400 text-[#04101a]"
                                }`}
                                title={c.processed ? "Mark unprocessed" : "Mark processed"}
                                aria-pressed={!!c.processed}
                              >
                                {busyMap[c.id] ? "…" : c.processed ? "Unmark" : "Mark"}
                              </button>

                              <button
                                onClick={() => void removeMessage(c.id)}
                                disabled={!!busyMap[c.id]}
                                className="px-3 py-1 rounded-md bg-rose-600 text-white text-sm hover:brightness-95"
                                title="Delete message"
                                aria-label={`Delete message from ${c.name}`}
                              >
                                <FaTrash />
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
                Page <span className="font-medium">{page}</span>
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
                      : "bg-white/6 hover:bg-white/10"
                  }`}
                >
                  Prev
                </button>

                <button
                  onClick={() =>
                    setPage((p) => (totalPages ? Math.min(totalPages, p + 1) : p + 1))
                  }
                  disabled={totalPages !== null && page >= (totalPages ?? 1)}
                  className={`px-3 py-1 rounded-md text-sm transition ${
                    totalPages !== null && page >= (totalPages ?? 1)
                      ? "opacity-50 cursor-not-allowed border border-slate-100 dark:border-slate-800"
                      : "bg-white/6 hover:bg-white/10"
                  }`}
                >
                  Next
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Message preview modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            aria-modal="true"
            role="dialog"
            aria-label="Message preview"
          >
            <motion.div
              initial={reduce ? undefined : { scale: 0.98, y: 8, opacity: 0 }}
              animate={reduce ? undefined : { scale: 1, y: 0, opacity: 1 }}
              exit={reduce ? undefined : { scale: 0.98, y: 8, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="max-w-3xl w-full bg-white dark:bg-[#041421] rounded-2xl shadow-xl border border-white/6 overflow-hidden"
            >
              <div className="p-4 border-b border-white/6 flex items-start gap-4">
                <div>
                  <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                    {selected.name || "—"}
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-400">
                    {selected.email}
                  </div>
                </div>

                <div className="ml-auto text-sm text-slate-500">
                  {formatDate(selected.created_at)}
                </div>
              </div>

              <div className="p-6">
                <div className="whitespace-pre-wrap text-slate-700 dark:text-slate-200">
                  {selected.message}
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => {
                      void markProcessed(selected.id, true);
                      setSelected((s) => (s ? { ...s, processed: true } : s));
                    }}
                    className="px-4 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-semibold"
                  >
                    <FaCheck className="inline mr-2" />
                    Mark processed
                  </button>

                  <button
                    onClick={() => {
                      setSelected(null);
                    }}
                    className="px-4 py-2 rounded-md border text-sm"
                  >
                    Close
                  </button>
                </div>
              </div>
            </motion.div>

            {/* backdrop */}
            <div
              onClick={() => setSelected(null)}
              className="fixed inset-0 bg-black/40"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
