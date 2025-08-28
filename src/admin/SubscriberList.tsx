import  { useEffect, useState, useCallback, type JSX } from "react";
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
  useAuth();
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [count, setCount] = useState<number | null>(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/subscribers/", { params: { page: p, page_size: pageSize } });
      const d = res.data;
      // support paginated (count + results) or flat list
      if (d?.results) {
        setItems(d.results);
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
      setError(err?.response?.data?.detail || err?.message || "Failed to load subscribers.");
    } finally {
      setLoading(false);
    }
  }, [pageSize]);

  useEffect(() => {
    void fetchPage(page);
  }, [fetchPage, page]);

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold">Subscribers</h3>
        <div className="text-sm text-slate-500">Total: {count ?? "—"}</div>
      </div>

      <div className="bg-white dark:bg-[#02121a] rounded-lg shadow p-4">
        {loading && <div className="p-6 text-center">Loading…</div>}
        {!loading && error && <div className="p-4 text-sm text-rose-600">{error}</div>}

        {!loading && !error && (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left">
                    <th className="p-2">Email</th>
                    <th className="p-2">Confirmed</th>
                    <th className="p-2">Created</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => (
                    <tr key={s.id} className="border-t">
                      <td className="p-2">{s.email}</td>
                      <td className="p-2">{s.confirmed ? "Yes" : "No"}</td>
                      <td className="p-2">{s.created_at ? format(new Date(s.created_at), "yyyy-MM-dd HH:mm") : "-"}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={3} className="p-4 text-center text-sm text-slate-500">No subscribers</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-slate-600">Page {page}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-3 py-1 rounded border"
                >
                  Prev
                </button>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  className="px-3 py-1 rounded border"
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
