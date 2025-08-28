// src/admin/AdminHome.tsx
import React, { useCallback, useEffect, useMemo, useRef, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import client from "../api/client";
import { motion, useReducedMotion } from "framer-motion";
import { FiUsers, FiMail, FiList, FiUserPlus, FiRefreshCw } from "react-icons/fi";

/* --- Types --- */
type Subscriber = {
  id?: number;
  email: string;
  created_at?: string;
  confirmed?: boolean;
  token?: string;
};

type Contact = {
  id?: number;
  name: string;
  email: string;
  message: string;
  created_at?: string;
  processed?: boolean;
};

/* --- Small util components --- */
function StatCard({ icon, label, value, loading = false }: { icon: React.ReactNode; label: string; value: React.ReactNode; loading?: boolean; }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.36 }}
      className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-white/6 dark:border-slate-800 shadow-sm"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-400 to-emerald-300 flex items-center justify-center text-white text-lg shadow">
            {icon}
          </div>
          <div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
            <div className="text-2xl font-extrabold text-slate-900 dark:text-slate-100">
              {loading ? <span className="animate-pulse inline-block w-24 h-6 bg-slate-200 dark:bg-slate-700 rounded" /> : value}
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function SmallEmpty({ text = "No items" }: { text?: string }) {
  return <div className="text-sm text-slate-500 dark:text-slate-400">{text}</div>;
}

/* --- Dashboard main component --- */
export default function AdminHome(): JSX.Element {
  const [subscribers, setSubscribers] = useState<Subscriber[] | null>(null);
  const [contacts, setContacts] = useState<Contact[] | null>(null);
  const [counts, setCounts] = useState<{ subscribers?: number; contacts?: number; issues?: number; contributors?: number }>({});
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const reduce = useReducedMotion();

  const fetchOverview = useCallback(async () => {
    setLoading(true);
    try {
      // request a small page to get `count` (DRF-style) + recent list
      const endpoints = [
        client.get("/subscribers/?page_size=5"),
        client.get("/contacts/?page_size=5"),
        client.get("/issues/?page_size=1"),
        client.get("/contributors/?page_size=1"),
      ];

      const settled = await Promise.allSettled(endpoints);

      // subscribers
      const subsResult = settled[0];
      if (subsResult.status === "fulfilled") {
        const d: any = subsResult.value.data;
        // DRF lists often return {count, results}
        const arrSubs = Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : (d?.results ?? []);
        setSubscribers(arrSubs.slice(0, 5) as Subscriber[]);
        if (d?.count != null) setCounts((c) => ({ ...c, subscribers: Number(d.count) }));
        else setCounts((c) => ({ ...c, subscribers: arrSubs.length }));
      } else {
        setSubscribers(null);
        // console.warn(subsResult.reason);
      }

      // contacts
      const contResult = settled[1];
      if (contResult.status === "fulfilled") {
        const d: any = contResult.value.data;
        const arrCont = Array.isArray(d.results) ? d.results : Array.isArray(d) ? d : (d?.results ?? []);
        setContacts(arrCont.slice(0, 5) as Contact[]);
        if (d?.count != null) setCounts((c) => ({ ...c, contacts: Number(d.count) }));
        else setCounts((c) => ({ ...c, contacts: arrCont.length }));
      } else {
        setContacts(null);
      }

      // issues count (we only use count)
      const issuesResult = settled[2];
      if (issuesResult.status === "fulfilled") {
        const d: any = issuesResult.value.data;
        const cnt = d?.count ?? (Array.isArray(d) ? d.length : undefined);
        if (cnt != null) setCounts((c) => ({ ...c, issues: Number(cnt) }));
      }

      // contributors count
      const contribResult = settled[3];
      if (contribResult.status === "fulfilled") {
        const d: any = contribResult.value.data;
        const cnt = d?.count ?? (Array.isArray(d) ? d.length : undefined);
        if (cnt != null) setCounts((c) => ({ ...c, contributors: Number(cnt) }));
      }
    } catch (err) {
      // network error fallback
      // eslint-disable-next-line no-console
      console.warn("[AdminHome] overview fetch error", err);
    } finally {
      if (mountedRef.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void fetchOverview();
    return () => {
      mountedRef.current = false;
    };
  }, [fetchOverview]);

  const subscribersDisplay = useMemo(() => subscribers ?? [], [subscribers]);
  const contactsDisplay = useMemo(() => contacts ?? [], [contacts]);

  const fmtDate = (s?: string) => {
    try {
      if (!s) return "";
      return new Date(s).toLocaleString();
    } catch {
      return s ?? "";
    }
  };

  return (
    <div className="space-y-6">
      {/* header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-serif font-extrabold text-slate-900 dark:text-slate-100">
            Dashboard
          </h1>
          <div className="mt-1 text-sm text-slate-600 dark:text-slate-400">
            Overview & recent activity
          </div>
        </div>

        <div className="flex gap-3 items-center">
          <button
            onClick={() => void fetchOverview()}
            title="Refresh dashboard"
            className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-white/95 dark:bg-[#05232b] text-slate-700 dark:text-slate-100 border border-white/8 hover:brightness-95 focus:outline-none"
            type="button"
          >
            <FiRefreshCw />
            <span className="text-sm">Refresh</span>
          </button>

          <Link to="/admin/issues" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white text-sm shadow">
            Manage issues
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<FiUsers size={18} />} label="Subscribers" value={counts.subscribers ?? "—"} loading={loading && counts.subscribers == null} />
        <StatCard icon={<FiMail size={18} />} label="Contact messages" value={counts.contacts ?? "—"} loading={loading && counts.contacts == null} />
        <StatCard icon={<FiList size={18} />} label="Issues" value={counts.issues ?? "—"} loading={loading && counts.issues == null} />
        <StatCard icon={<FiUserPlus size={18} />} label="Contributors" value={counts.contributors ?? "—"} loading={loading && counts.contributors == null} />
      </div>

      {/* Recent lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <motion.section
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.36, delay: 0.02 }}
          className="lg:col-span-2 p-4 rounded-2xl bg-white dark:bg-slate-900 border border-white/6 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent contact messages</h3>
            <Link to="/admin/contacts" className="text-sm text-slate-500 hover:underline">View all</Link>
          </div>

          <div className="mt-3 space-y-3">
            {loading && contacts === null ? (
              <>
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 animate-pulse" />
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 animate-pulse" />
              </>
            ) : contactsDisplay.length === 0 ? (
              <SmallEmpty text="No contact messages yet." />
            ) : (
              contactsDisplay.map((c) => (
                <article key={c.id ?? `${c.email}-${c.created_at}`} className="p-3 rounded-md border border-white/6 dark:border-slate-800 bg-white/50 dark:bg-slate-900/70">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {c.name}
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">{c.email}</div>
                    </div>
                    <div className="text-xs text-slate-400">{fmtDate(c.created_at)}</div>
                  </div>
                  <p className="mt-2 text-sm text-slate-700 dark:text-slate-200 line-clamp-3">{c.message}</p>
                </article>
              ))
            )}
          </div>
        </motion.section>

        <motion.aside
          layout
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: reduce ? 0 : 0.36, delay: 0.04 }}
          className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-white/6 dark:border-slate-800 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Recent subscribers</h3>
            <Link to="/admin/subscribers" className="text-sm text-slate-500 hover:underline">View all</Link>
          </div>

          <div className="mt-3 space-y-3">
            {loading && subscribers === null ? (
              <>
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 animate-pulse" />
                <div className="p-3 rounded-md bg-slate-50 dark:bg-slate-800 animate-pulse" />
              </>
            ) : subscribersDisplay.length === 0 ? (
              <SmallEmpty text="No subscribers yet." />
            ) : (
              subscribersDisplay.map((s) => (
                <div key={s.id ?? s.email} className="p-3 rounded-md border border-white/6 dark:border-slate-800 bg-white/50 dark:bg-slate-900/70 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-sm font-medium text-slate-900 dark:text-slate-100">{s.email}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{fmtDate(s.created_at)}</div>
                  </div>
                  <div className={`text-xs px-2 py-1 rounded-md font-medium ${s.confirmed ? "bg-emerald-100 text-emerald-700" : "bg-yellow-50 text-yellow-700"}`}>
                    {s.confirmed ? "Confirmed" : "Pending"}
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="mt-4">
            <Link to="/admin/subscribers" className="inline-flex items-center gap-2 px-3 py-2 rounded-md bg-gradient-to-r from-indigo-500 to-emerald-400 text-white text-sm shadow">
              Manage subscribers
            </Link>
          </div>
        </motion.aside>
      </div>

      {/* footer quick actions */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-between">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Link to="/admin/issues/new" className="p-4 rounded-2xl bg-gradient-to-r from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border border-white/6 shadow-sm flex items-center gap-3">
            <FiList />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">New issue</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Create a new issue</div>
            </div>
          </Link>

          <Link to="/admin/contributors" className="p-4 rounded-2xl bg-gradient-to-r from-pink-50 to-rose-50 dark:from-slate-800 dark:to-slate-900 border border-white/6 shadow-sm flex items-center gap-3">
            <FiUserPlus />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Contributors</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Manage authors</div>
            </div>
          </Link>

          <Link to="/admin/contacts" className="p-4 rounded-2xl bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-slate-800 dark:to-slate-900 border border-white/6 shadow-sm flex items-center gap-3">
            <FiMail />
            <div>
              <div className="text-sm font-semibold text-slate-900 dark:text-slate-100">Contacts</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Respond to messages</div>
            </div>
          </Link>
        </div>

        <div className="mt-3 sm:mt-0">
          <small className="text-xs text-slate-500 dark:text-slate-400">Last refreshed: {new Date().toLocaleString()}</small>
        </div>
      </div>
    </div>
  );
}
