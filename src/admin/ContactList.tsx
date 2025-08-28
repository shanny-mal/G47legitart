import { useEffect, useState, useCallback, type JSX } from "react";
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
  useAuth();
  const [items, setItems] = useState<Contact[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [count, setCount] = useState<number | null>(null);

  const fetchPage = useCallback(async (p = 1) => {
    setLoading(true);
    setError(null);
    try {
      const res = await client.get("/contacts/", { params: { page: p, page_size: pageSize } });
      const d = res.data;
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
      setError(err?.response?.data?.detail || err?.message || "Failed to load contacts.");
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
        <h3 className="text-lg font-semibold">Contact messages</h3>
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
                    <th className="p-2">From</th>
                    <th className="p-2">Email</th>
                    <th className="p-2">Message</th>
                    <th className="p-2">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((c) => (
                    <tr key={c.id} className="border-t align-top">
                      <td className="p-2">{c.name}</td>
                      <td className="p-2">{c.email}</td>
                      <td className="p-2 max-w-prose break-words">{c.message}</td>
                      <td className="p-2">{c.created_at ? format(new Date(c.created_at), "yyyy-MM-dd HH:mm") : "-"}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-sm text-slate-500">No messages</td>
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
