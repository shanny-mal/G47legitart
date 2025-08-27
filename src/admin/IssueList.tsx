// src/pages/IssueList.tsx
import { useEffect, useState, type JSX } from "react";
import { motion } from "framer-motion";
import client from "../api/client";
import { Link } from "react-router-dom";

type Issue = {
  id: number;
  title: string;
  slug?: string;
  summary?: string;
  cover_low_url?: string | null;
  cover_high_url?: string | null;
  published: boolean;
  published_at?: string | null;
};

function formatDate(iso?: string | null) {
  if (!iso) return "";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
  } catch {
    return iso;
  }
}

function SkeletonCard() {
  return (
    <div className="animate-pulse bg-white/5 dark:bg-slate-800 rounded-2xl p-4 shadow-sm">
      <div className="w-full h-40 rounded-md bg-white/10 dark:bg-white/6 mb-4" />
      <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
      <div className="h-3 bg-white/10 rounded w-1/2 mb-4" />
      <div className="flex gap-2">
        <div className="h-8 w-20 bg-white/10 rounded" />
        <div className="h-8 w-20 bg-white/10 rounded" />
      </div>
    </div>
  );
}

export default function IssueList(): JSX.Element {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState<Record<number, boolean>>({});

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      try {
        const res = await client.get("/issues/");
        // support paginated (results) or raw array
        const data: Issue[] = res.data?.results ?? res.data ?? [];
        if (mounted) setIssues(Array.isArray(data) ? data : []);
      } catch (err) {
        // graceful fallback / logging
        // eslint-disable-next-line no-console
        console.warn("Failed to load issues", err);
        if (mounted) setIssues([]);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function remove(id: number) {
    const ok = window.confirm("Delete this issue? This action cannot be undone.");
    if (!ok) return;

    setDeleting((s) => ({ ...s, [id]: true }));
    try {
      await client.delete(`/issues/${id}/`);
      setIssues((s) => s.filter((x) => x.id !== id));
    } catch (err) {
      // notify user
      // eslint-disable-next-line no-console
      console.error("Delete failed", err);
      alert("Delete failed — please try again.");
    } finally {
      setDeleting((s) => {
        const copy = { ...s };
        delete copy[id];
        return copy;
      });
    }
  }

  return (
    <div className="py-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100">
            Issues
          </h1>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-xl">
            Manage your issues — preview covers, edit metadata, or download assets.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/admin/issues/new"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400 text-white font-medium shadow-md hover:brightness-95 transition"
          >
            New Issue
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : (
        <>
          {issues.length === 0 ? (
            <div className="rounded-2xl bg-white/6 dark:bg-slate-800 p-6 text-center text-slate-700 dark:text-slate-300">
              No issues found.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {issues.map((it) => {
                const img = it.cover_low_url ?? it.cover_high_url ?? "";
                return (
                  <motion.article
                    key={it.id}
                    layout
                    whileHover={{ y: -6, boxShadow: "0 20px 40px rgba(2,6,23,0.12)" }}
                    transition={{ duration: 0.28 }}
                    className="relative overflow-hidden rounded-2xl bg-white dark:bg-slate-900 shadow-sm border border-slate-100 dark:border-slate-800"
                    aria-label={`${it.title} issue card`}
                  >
                    <div className="relative">
                      {img ? (
                        <img
                          src={img}
                          alt={it.title}
                          className="w-full h-44 sm:h-52 object-cover"
                          loading="lazy"
                          decoding="async"
                          style={{ minHeight: 160 }}
                        />
                      ) : (
                        <div className="w-full h-44 sm:h-52 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center">
                          <div className="text-sm text-slate-500 dark:text-slate-300">No cover</div>
                        </div>
                      )}

                      {/* status badge */}
                      <div className="absolute left-3 top-3 px-2 py-1 rounded-md text-xs font-medium text-white bg-gradient-to-r from-indigo-600 to-teal-400 shadow">
                        {it.published ? "Published" : "Draft"}
                      </div>

                      {/* date */}
                      {it.published_at && (
                        <div className="absolute right-3 top-3 px-2 py-1 rounded-md text-xs font-medium text-white/90 bg-black/40 backdrop-blur">
                          {formatDate(it.published_at)}
                        </div>
                      )}
                    </div>

                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 leading-tight">
                        {it.title}
                      </h3>

                      {it.summary && (
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
                          {it.summary}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-2">
                        <Link
                          to={`/admin/issues/${it.id}`}
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-800 text-sm hover:brightness-95 transition"
                        >
                          Edit
                        </Link>

                        <button
                          onClick={() => remove(it.id)}
                          disabled={Boolean(deleting[it.id])}
                          className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition ${
                            deleting[it.id]
                              ? "bg-red-700 text-white opacity-80 cursor-not-allowed"
                              : "bg-red-600 text-white hover:bg-red-700"
                          }`}
                          aria-disabled={Boolean(deleting[it.id])}
                        >
                          {deleting[it.id] ? "Deleting…" : "Delete"}
                        </button>

                        <Link
                          to={`/issues/${it.slug ?? it.id}`}
                          className="ml-auto inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm text-indigo-600 hover:underline"
                        >
                          View
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
