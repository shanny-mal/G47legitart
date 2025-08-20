import { useCallback, useEffect, useMemo, useState } from "react";
import CommentItem, { type Comment } from "./CommentItem";
import CommentForm from "./CommentForm";

export default function CommentsList({
  discussionId,
  initialPageSize = 10,
}: {
  discussionId: string;
  initialPageSize?: number;
}) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(initialPageSize);
  const [total, setTotal] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  const load = useCallback(
    async (p = 1) => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/discussion/comments?discussionId=${encodeURIComponent(
            discussionId
          )}&page=${p}&pageSize=${pageSize}`
        );
        if (!res.ok) throw new Error("Failed to load comments");
        const json = await res.json();
        setComments(json.comments || []);
        setTotal(typeof json.total === "number" ? json.total : null);
      } catch (err) {
        console.warn("Failed to load comments", err);
        setComments([]);
        setTotal(null);
      } finally {
        setLoading(false);
      }
    },
    [discussionId, pageSize]
  );

  useEffect(() => {
    load(page);
    // also re-load when refreshKey changes
  }, [load, page, refreshKey]);

  // page count
  const pageCount = useMemo(
    () => (total ? Math.max(1, Math.ceil(total / pageSize)) : null),
    [total, pageSize]
  );

  // called when a new comment was posted — optimistic add or refresh
  const handlePosted = useCallback((serverResult: any) => {
    // if server returned created comment, push it to top
    if (serverResult?.id) {
      setComments((prev) => [serverResult as Comment, ...prev]);
      setTotal((t) => (typeof t === "number" ? t + 1 : t));
    } else {
      // fallback: refresh from server
      setRefreshKey((k) => k + 1);
    }
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100">
          Discussion
        </h3>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {total ? `Comments — ${total}` : "Comments"}
        </div>
      </div>

      {/* Comment form */}
      <CommentForm discussionId={discussionId} onPosted={handlePosted} />

      {/* Comments list */}
      <div>
        {loading ? (
          <div className="text-sm text-slate-500">Loading comments…</div>
        ) : comments.length === 0 ? (
          <div className="text-sm text-slate-500">
            No comments yet. Be the first to start the conversation.
          </div>
        ) : (
          <ul className="flex flex-col gap-3">
            {comments.map((c) => (
              <li key={c.id}>
                <CommentItem c={c} />
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mt-3">
        <div />
        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page <= 1}
            className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
            aria-disabled={page <= 1}
          >
            Prev
          </button>

          <div className="text-sm text-slate-600 dark:text-slate-400">
            Page {page}
            {pageCount ? ` / ${pageCount}` : ""}
          </div>

          <button
            onClick={() =>
              setPage((p) => (pageCount ? Math.min(pageCount, p + 1) : p + 1))
            }
            disabled={pageCount ? page >= pageCount : false}
            className="px-3 py-1 rounded-md border border-slate-200 dark:border-slate-700 text-sm disabled:opacity-50"
            aria-disabled={pageCount ? page >= pageCount : false}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
