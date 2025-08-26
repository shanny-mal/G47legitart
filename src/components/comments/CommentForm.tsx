import React, { useCallback, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";

export type NewCommentPayload = {
  discussionId: string;
  author?: string;
  body: string;
};

export default function CommentForm({
  discussionId,
  onPosted,
}: {
  discussionId: string;
  onPosted?: (c: any) => void;
}) {
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [okMsg, setOkMsg] = useState<string | null>(null);
  const reduce = useReducedMotion();

  const MAX_LENGTH = 2000;
  const charCount = useMemo(() => body.length, [body]);
  const remaining = MAX_LENGTH - charCount;
  const canSubmit =
    body.trim().length > 0 && !submitting && body.length <= MAX_LENGTH;

  const clear = () => {
    setAuthor("");
    setBody("");
    setError(null);
    setOkMsg(null);
  };

  const submit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setError(null);
      setOkMsg(null);

      if (!body.trim()) {
        setError("Please write a comment.");
        return;
      }
      if (body.length > MAX_LENGTH) {
        setError(`Comment is too long (max ${MAX_LENGTH} characters).`);
        return;
      }

      setSubmitting(true);
      try {
        const res = await fetch("/api/discussion/comments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            discussionId,
            author: author?.trim() || "Anonymous",
            body: body.trim(),
          }),
        });

        if (!res.ok) {
          const text = await res.text().catch(() => "");
          throw new Error(text || "Failed to post comment.");
        }

        const json = await res.json().catch(() => null);

        // optimistic UX: show a small success message and clear inputs
        setOkMsg("Your comment was posted. Thank you!");
        setBody("");
        setAuthor("");

        // return server result to parent (if provided)
        onPosted?.(json);

        // clear message after a short time
        setTimeout(() => setOkMsg(null), 4500);
      } catch (err: any) {
        setError(err?.message || "Failed to post comment.");
      } finally {
        setSubmitting(false);
      }
    },
    [discussionId, author, body, onPosted]
  );

  return (
    <motion.form
      onSubmit={submit}
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="bg-gradient-to-br from-white/60 to-white/40 dark:from-[#06222a]/80 dark:to-[#042022]/60 p-4 rounded-xl shadow-md"
      aria-label="Comment form"
    >
      <div className="flex flex-col md:flex-row gap-3">
        <div className="flex-1">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Comment
          </label>
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write your comment..."
            className="mt-2 w-full min-h-[96px] resize-vertical rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#02202a] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            required
            maxLength={MAX_LENGTH}
            aria-label="Comment body"
          />
          <div className="mt-1 flex items-center justify-between text-xs">
            <div className="text-slate-500 dark:text-slate-400">
              Be respectful — comments may be moderated.
            </div>
            <div
              className={`ml-2 ${
                remaining < 0
                  ? "text-rose-400"
                  : "text-slate-500 dark:text-slate-400"
              }`}
            >
              {charCount}/{MAX_LENGTH}
            </div>
          </div>
        </div>

        <div className="w-full md:w-48 flex flex-col gap-3">
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-200">
            Name (optional)
          </label>
          <input
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Your name"
            className="mt-2 rounded-lg px-3 py-2 border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#02202a] text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
            aria-label="Author name"
          />

          <div className="mt-auto flex flex-col gap-2">
            <button
              type="submit"
              disabled={!canSubmit}
              className={`w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold shadow-md transition ${
                canSubmit
                  ? "bg-gradient-to-r from-indigo-500 to-emerald-400 text-white hover:scale-[1.01]"
                  : "bg-slate-200 text-slate-500 cursor-not-allowed"
              }`}
              aria-disabled={!canSubmit}
            >
              {submitting ? "Posting…" : "Post comment"}
            </button>

            <button
              type="button"
              onClick={clear}
              className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-sm border border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-transparent text-slate-700 dark:text-slate-200 hover:bg-white/70"
            >
              Clear
            </button>
          </div>
        </div>
      </div>

      {/* messages */}
      <div className="mt-3 min-h-[1.25rem]">
        {error && (
          <div role="alert" className="text-sm text-rose-400">
            {error}
          </div>
        )}

        {okMsg && (
          <div role="status" className="text-sm text-green-400">
            {okMsg}
          </div>
        )}
      </div>
    </motion.form>
  );
}
