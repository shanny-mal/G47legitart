// src/components/IssueGallery.tsx
import { useEffect, useState, type JSX } from "react";
import client from "../api/client";

type Issue = {
  id: number;
  title: string;
  slug?: string;
  summary?: string;
  cover_low_url?: string | null;
  cover_high_url?: string | null;
  pdf_high_url?: string | null;
  pdf_low_url?: string | null;
  published: boolean;
  published_at?: string | null;
};

export default function IssueGallery(): JSX.Element {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<"low" | "high">("high");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    client
      .get("/issues/")
      .then((res) => {
        const data = res.data.results ?? res.data;
        if (mounted) setIssues(Array.isArray(data) ? data : []);
      })
      .catch((e) => {
        console.warn("Failed to load issues", e);
        if (mounted) setError("Failed to load issues.");
      })
      .finally(() => mounted && setLoading(false));
    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="animate-pulse p-4 bg-white/5 rounded-lg">
              <div className="w-full h-48 bg-gray-200/40 rounded" />
              <div className="mt-3 h-4 bg-gray-200/40 w-3/4 rounded" />
              <div className="mt-2 h-3 bg-gray-200/30 w-1/2 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4">
        <div className="text-red-400 py-6">{error}</div>
      </div>
    );
  }

  if (!issues.length) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-12 text-center text-gray-500">
        No issues found.
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-serif">Issues & Archive</h3>
        <div className="flex items-center gap-3">
          <label className="text-sm text-gray-500">Preview</label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setQuality("low")}
              className={`px-3 py-1 rounded-md text-sm ${quality === "low" ? "bg-karibaTeal text-white" : "bg-white/6 text-karibaNavy"}`}
              aria-pressed={quality === "low"}
            >
              Low
            </button>
            <button
              onClick={() => setQuality("high")}
              className={`px-3 py-1 rounded-md text-sm ${quality === "high" ? "bg-karibaTeal text-white" : "bg-white/6 text-karibaNavy"}`}
              aria-pressed={quality === "high"}
            >
              High
            </button>
          </div>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {issues.map((it) => {
          const img = (quality === "high" ? it.cover_high_url : it.cover_low_url) ?? (it.cover_high_url ?? it.cover_low_url ?? undefined);
          const pdfHref = (quality === "high" ? it.pdf_high_url : it.pdf_low_url) ?? undefined;
          return (
            <article key={it.id} className="bg-white/3 dark:bg-white/4 rounded-xl overflow-hidden shadow-sm">
              {img ? (
                <img src={img} alt={it.title} loading="lazy" className="w-full h-56 object-cover" style={{ aspectRatio: "3/2" }} />
              ) : (
                <div className="w-full h-56 bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-white">
                  <div className="text-center px-4">
                    <div className="text-sm uppercase text-gray-300">No cover</div>
                    <div className="mt-2 font-semibold">{it.title}</div>
                  </div>
                </div>
              )}

              <div className="p-4">
                <h4 className="font-semibold">{it.title}</h4>
                {it.summary && <p className="text-sm text-gray-500 mt-1">{it.summary}</p>}

                <div className="mt-4 flex gap-2">
                  {pdfHref ? (
                    <a href={pdfHref} download className="inline-flex items-center gap-2 px-3 py-2 bg-karibaTeal text-white rounded-md text-sm shadow-sm hover:brightness-95 transition">
                      Download
                    </a>
                  ) : null}

                  {it.slug ? (
                    <a href={`/issues/${it.slug}`} className="inline-flex items-center gap-2 px-3 py-2 border rounded-md text-sm text-karibaNavy hover:bg-white/6 transition">
                      Read online
                    </a>
                  ) : null}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
