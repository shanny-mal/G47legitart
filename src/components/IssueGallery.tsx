import React, { useEffect, useState } from "react";

type Issue = {
  id: string;
  title: string;
  cover: { low: string; high: string };
  pdf: { low: string; high: string };
  published_at: string;
};

const IssueGallery: React.FC = () => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [quality, setQuality] = useState<"low" | "high">("high");

  useEffect(() => {
    // fetch from backend /api/issues
    fetch("/api/issues")
      .then((res) => res.json())
      .then(setIssues)
      .catch(() =>
        setIssues([
          {
            id: "1",
            title: "Issue 01 – Kariba Stories",
            cover: {
              low: "/assets/issues/cover1-low.jpg",
              high: "/assets/issues/cover1-high.jpg",
            },
            pdf: {
              low: "/assets/issues/issue1-low.pdf",
              high: "/assets/issues/issue1-high.pdf",
            },
            published_at: "2025-01-01",
          },
        ])
      );
  }, []);

  return (
    <section className="py-12">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-2xl font-serif">Issues & Archive</h3>
          <div className="flex items-center gap-3">
            <label className="text-sm">Preview quality</label>
            <select
              value={quality}
              onChange={(e) => setQuality(e.target.value as any)}
              className="border rounded px-2 py-1"
            >
              <option value="low">Low (preview)</option>
              <option value="high">High (full)</option>
            </select>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
          {issues.map((it) => (
            <article
              key={it.id}
              className="bg-white dark:bg-gray-800 rounded shadow p-3"
            >
              <img
                src={quality === "high" ? it.cover.high : it.cover.low}
                className="w-full h-56 object-cover rounded"
                alt={it.title}
              />
              <h4 className="mt-3 font-semibold">{it.title}</h4>
              <div className="mt-2 flex gap-2">
                <a
                  href={quality === "high" ? it.pdf.high : it.pdf.low}
                  download
                  className="px-3 py-2 bg-karibaTeal text-white rounded"
                >
                  Download
                </a>
                <a
                  href={`/issues/${it.id}`}
                  className="px-3 py-2 border rounded"
                >
                  Read Online
                </a>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default IssueGallery;
