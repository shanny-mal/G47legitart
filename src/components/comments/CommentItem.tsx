import React from "react";
import { motion, useReducedMotion } from "framer-motion";

export type Comment = {
  id: string;
  discussionId: string;
  author?: string;
  body: string;
  approved: boolean;
  createdAt: string;
  moderatedBy?: string | null;
  avatarUrl?: string | null;
};

const InitialAvatar: React.FC<{ name: string }> = ({ name }) => {
  const initial = name?.charAt(0)?.toUpperCase() ?? "A";
  const seed = (name?.charCodeAt(0) ?? 65) % 4;
  const palette =
    seed === 0
      ? "from-indigo-400 to-teal-400"
      : seed === 1
      ? "from-rose-400 to-amber-300"
      : seed === 2
      ? "from-emerald-300 to-indigo-400"
      : "from-sky-400 to-indigo-500";

  return (
    <div
      className={`w-12 h-12 rounded-full bg-gradient-to-br ${palette} flex items-center justify-center text-white font-semibold`}
      aria-hidden
    >
      {initial}
    </div>
  );
};

export default function CommentItem({ c }: { c: Comment }) {
  const reduce = useReducedMotion();

  return (
    <motion.article
      initial={reduce ? undefined : { opacity: 0, y: 6 }}
      animate={reduce ? undefined : { opacity: 1, y: 0 }}
      transition={{ duration: 0.28 }}
      className="p-4 rounded-lg bg-white shadow-sm dark:bg-[#04232b] border border-slate-100 dark:border-slate-700"
      aria-label={`Comment by ${c.author ?? "Anonymous"}`}
    >
      <div className="flex items-start gap-3">
        <div className="flex-none">
          {c.avatarUrl ? (
            <img
              src={c.avatarUrl}
              alt={`${c.author ?? "Anonymous"} avatar`}
              className="w-12 h-12 rounded-full object-cover ring-1 ring-white/60"
            />
          ) : (
            <InitialAvatar name={c.author ?? "Anonymous"} />
          )}
        </div>

        <div className="flex-1">
          <div className="flex items-start gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {c.author ?? "Anonymous"}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">
                {new Date(c.createdAt).toLocaleString()}
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {!c.approved && (
                <span className="text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300">
                  Pending
                </span>
              )}
            </div>
          </div>

          <div className="mt-3 text-sm text-slate-700 dark:text-slate-200 whitespace-pre-wrap">
            {c.body}
          </div>
        </div>
      </div>
    </motion.article>
  );
}
