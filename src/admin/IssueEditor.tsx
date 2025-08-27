// src/pages/IssueEditor.tsx
import React, { useEffect, useMemo, useRef, useState, type JSX } from "react";
import { useNavigate, useParams } from "react-router-dom";
import client from "../api/client";
import { motion, useReducedMotion } from "framer-motion";
import { FaUpload, FaFilePdf, FaImage, FaCheck, FaTimes } from "react-icons/fa";

type IssuePayload = {
  title: string;
  summary?: string;
  content?: string;
  published?: boolean;
};

export default function IssueEditor(): JSX.Element {
  const { id } = useParams<{ id?: string }>();
  const editing = Boolean(id);
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [data, setData] = useState<IssuePayload>({
    title: "",
    summary: "",
    content: "",
    published: false,
  });

  // files
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);

  // previews
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  // UI state
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedMsg, setSavedMsg] = useState<string | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      // revoke preview URL when unmounting
      if (coverPreview) URL.revokeObjectURL(coverPreview);
    };
  }, [coverPreview]);

  // fetch existing issue when editing
  useEffect(() => {
    if (!editing) return;
    let cancelled = false;
    (async () => {
      setBusy(true);
      try {
        const res = await client.get(`/issues/${id}/`);
        if (cancelled) return;
        const d = res.data ?? {};
        setData({
          title: d.title ?? "",
          summary: d.summary ?? "",
          content: d.content ?? "",
          published: !!d.published,
        });
        // if server provides cover preview url, show it
        if (d.cover_high_url) {
          setCoverPreview(d.cover_high_url);
        }
      } catch (err: any) {
        // eslint-disable-next-line no-console
        console.warn("Failed to load issue", err);
        setError("Failed to load issue data.");
      } finally {
        if (!cancelled) setBusy(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  // create / revoke cover preview when chosen locally
  useEffect(() => {
    if (!coverFile) return;
    const url = URL.createObjectURL(coverFile);
    // revoke old preview if present
    if (coverPreview && coverPreview.startsWith("blob:")) {
      URL.revokeObjectURL(coverPreview);
    }
    setCoverPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
    // only watch coverFile, not coverPreview
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [coverFile]);

  const canSubmit = useMemo(() => {
    return data.title.trim().length > 2 && !busy;
  }, [data.title, busy]);

  function onFileChange(
    e: React.ChangeEvent<HTMLInputElement>,
    setter: (f: File | null) => void,
    acceptType: "image" | "pdf"
  ) {
    setError(null);
    const f = e.target.files?.[0] ?? null;
    if (!f) {
      setter(null);
      return;
    }

    // basic client-side validation
    if (acceptType === "image") {
      if (!f.type.startsWith("image/")) {
        setError("Please select a valid image file for the cover.");
        return;
      }
      if (f.size > 6_000_000) {
        setError("Cover image is large — please use an image under ~6MB.");
        return;
      }
    } else {
      // pdf
      if (f.type !== "application/pdf") {
        setError("Please select a PDF file.");
        return;
      }
      if (f.size > 50_000_000) {
        setError("PDF is too large — please use a file under ~50MB.");
        return;
      }
    }

    setter(f);
  }

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);

    if (!canSubmit) {
      setError("Please add a title (at least 3 characters).");
      return;
    }

    setBusy(true);
    try {
      const fd = new FormData();
      fd.append("title", data.title ?? "");
      fd.append("summary", data.summary ?? "");
      fd.append("content", data.content ?? "");
      fd.append("published", data.published ? "true" : "false");

      if (coverFile) fd.append("cover_high", coverFile);
      if (pdfFile) fd.append("pdf_high", pdfFile);

      if (editing) {
        await client.patch(`/issues/${id}/`, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        await client.post("/issues/", fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      // show success and navigate back to list after brief delay
      if (!mountedRef.current) return;
      setSavedMsg("Saved successfully.");
      setTimeout(() => {
        if (mountedRef.current) navigate("/admin/issues");
      }, 900);
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.error("Save failed", err);
      setError(typeof err?.message === "string" ? err.message : "Save failed — try again.");
    } finally {
      if (mountedRef.current) setBusy(false);
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <header className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-serif font-semibold text-slate-900 dark:text-slate-100">
          {editing ? "Edit Issue" : "Create new issue"}
        </h1>
        <p className="mt-1 text-sm text-slate-600 dark:text-slate-400 max-w-2xl">
          Add issue metadata, upload a cover and the full PDF. Changes are saved to the backend.
        </p>
      </header>

      <form onSubmit={submit} className="space-y-6" aria-labelledby="issue-form">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-4">
            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Title</span>
              <input
                value={data.title}
                onChange={(e) => setData((s) => ({ ...s, title: e.target.value }))}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#041b22] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Issue title"
                required
                aria-required
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Summary (brief)</span>
              <textarea
                value={data.summary}
                onChange={(e) => setData((s) => ({ ...s, summary: e.target.value }))}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#041b22] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30"
                placeholder="Short summary for previews"
                rows={3}
              />
            </label>

            <label className="block">
              <span className="text-sm font-medium text-slate-700 dark:text-slate-200">Content (full)</span>
              <textarea
                value={data.content}
                onChange={(e) => setData((s) => ({ ...s, content: e.target.value }))}
                className="mt-2 w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-[#041b22] text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-400/30 h-44"
                placeholder="Long-form content, editorial notes or import data"
              />
            </label>
          </div>

          {/* Right column: file uploads + publish */}
          <aside className="md:col-span-1 space-y-4">
            <div className="rounded-xl p-4 bg-white shadow-sm border border-slate-100 dark:bg-[#05232b] dark:border-slate-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium text-slate-700 dark:text-slate-200">Publish</div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Toggle when ready</div>
                </div>

                <label className="inline-flex items-center gap-3">
                  <input
                    type="checkbox"
                    checked={Boolean(data.published)}
                    onChange={(e) => setData((s) => ({ ...s, published: e.target.checked }))}
                    className="w-5 h-5 rounded border-gray-300 focus:ring-indigo-300"
                    aria-label="Published"
                  />
                </label>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">Cover image</div>

                <label
                  htmlFor="cover-file"
                  className="group relative block rounded-md overflow-hidden border border-dashed border-slate-200 dark:border-slate-700 p-3 cursor-pointer hover:bg-white/50 transition"
                >
                  <input
                    id="cover-file"
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => onFileChange(e, setCoverFile, "image")}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FaImage className="text-slate-500 dark:text-slate-300" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {coverFile ? coverFile.name : coverPreview ? "Current cover" : "Upload cover image"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">
                        Recommended: 1200×800 or wider. Max ~6MB.
                      </div>
                    </div>
                    <div className="opacity-80">
                      <FaUpload />
                    </div>
                  </div>

                  {/* preview */}
                  {coverPreview && (
                    <div className="mt-3">
                      <img
                        src={coverPreview}
                        alt="cover preview"
                        className="w-full h-28 object-cover rounded-md border border-slate-200 dark:border-slate-700"
                      />
                    </div>
                  )}
                </label>
              </div>

              <div className="mt-4">
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-2">PDF (full issue)</div>

                <label
                  htmlFor="pdf-file"
                  className="group relative block rounded-md overflow-hidden border border-dashed border-slate-200 dark:border-slate-700 p-3 cursor-pointer hover:bg-white/50 transition"
                >
                  <input
                    id="pdf-file"
                    type="file"
                    accept="application/pdf"
                    className="sr-only"
                    onChange={(e) => onFileChange(e, setPdfFile, "pdf")}
                  />
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                      <FaFilePdf className="text-red-500" />
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-800 dark:text-slate-100">
                        {pdfFile ? pdfFile.name : "Upload PDF (optional)"}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Max ~50MB</div>
                    </div>
                    <div className="opacity-80">
                      <FaUpload />
                    </div>
                  </div>
                </label>
              </div>
            </div>

            {/* actions */}
            <div className="space-y-3">
              <motion.button
                type="button"
                onClick={() => submit()}
                whileTap={reduce ? undefined : { scale: 0.995 }}
                disabled={!canSubmit || busy}
                className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-md transition ${
                  busy
                    ? "bg-indigo-500/70 text-white cursor-not-allowed"
                    : "bg-gradient-to-r from-indigo-600 to-emerald-400 text-white hover:brightness-95"
                }`}
                aria-disabled={!canSubmit || busy}
              >
                {busy ? (
                  <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden>
                    <circle cx="12" cy="12" r="10" stroke="white" strokeOpacity="0.2" strokeWidth="3" />
                    <path d="M22 12a10 10 0 00-10-10" stroke="white" strokeWidth="3" strokeLinecap="round" />
                  </svg>
                ) : (
                  <FaCheck />
                )}
                <span>{busy ? (editing ? "Saving…" : "Creating…") : editing ? "Save changes" : "Create issue"}</span>
              </motion.button>

              <button
                type="button"
                onClick={() => {
                  if (busy) return;
                  if (window.confirm("Discard changes and return to issues list?")) navigate("/admin/issues");
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-[#0b1b21] text-slate-700 dark:text-slate-200 hover:bg-white/60 transition"
              >
                <FaTimes />
                <span>Cancel</span>
              </button>

              {savedMsg && (
                <div className="text-sm text-green-400 flex items-center gap-2">
                  <FaCheck />
                  <span>{savedMsg}</span>
                </div>
              )}

              {error && (
                <div className="text-sm text-rose-400">
                  {error}
                </div>
              )}
            </div>
          </aside>
        </div>
      </form>
    </div>
  );
}
