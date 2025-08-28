// src/admin/AdminProfile.tsx
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion } from "framer-motion";
import client from "../api/client";
import { useAuth } from "./AuthProvider";
import { FaCamera, FaSave, FaKey } from "react-icons/fa";

/** Types */
type ProfileShape = {
  id?: number | string;
  username?: string;
  email?: string;
  display_name?: string;
  first_name?: string;
  last_name?: string;
  bio?: string;
  avatar?: string | null;
  [k: string]: any;
};

type ActivityItem = {
  id: string | number;
  verb?: string;
  text?: string;
  created_at?: string;
};

/** Helpers */
const bytesToSize = (bytes: number) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

/** Small local relative-time helper to avoid date-fns dependency */
function timeAgo(iso?: string | null) {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "-";
  const s = Math.floor((Date.now() - d.getTime()) / 1000);
  if (s < 5) return "just now";
  if (s < 60) return `${s}s ago`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  const days = Math.floor(h / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}mo ago`;
  const years = Math.floor(months / 12);
  return `${years}y ago`;
}

/** Component */
export default function AdminProfile(): React.ReactElement {
  const { user: authUser, logout } = useAuth();
  const navigate = useNavigate();
  const reduce = useReducedMotion();

  const [profile, setProfile] = useState<ProfileShape | null>(null);
  const [endpoint, setEndpoint] = useState<string | null>(null); // which API path returned the profile
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Avatar upload
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // small stats
  const [subCount, setSubCount] = useState<number | null>(null);
  const [contactCount, setContactCount] = useState<number | null>(null);

  // recent activity
  const [activity, setActivity] = useState<ActivityItem[] | null>(null);

  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      if (avatarPreview) {
        URL.revokeObjectURL(avatarPreview);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Try multiple endpoints for profile GET, in-order */
  const PROFILE_CANDIDATES = useMemo(
    () => [
      "/admin/profile/",
      "/profile/",
      "/users/me/",
      "/me/",
      "/auth/user/",
    ],
    []
  );

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    setEndpoint(null);
    setProfile(null);

    // try each candidate until success
    for (const p of PROFILE_CANDIDATES) {
      try {
        const res = await client.get(p);
        if (res?.data) {
          const d = res.data;
          // Basic normalization: map common fields to display_name / avatar
          const normalized: ProfileShape = {
            id: d.id ?? d.pk ?? d.user_id,
            username: d.username ?? d.user ?? d.email?.split?.("@")?.[0] ?? authUser?.username,
            email: d.email ?? authUser?.email,
            display_name:
              d.display_name ?? d.name ?? `${d.first_name ?? ""} ${d.last_name ?? ""}`.trim() ?? authUser?.username,
            bio: d.bio ?? d.profile?.bio ?? d.about ?? "",
            avatar:
              d.avatar ??
              d.profile?.avatar ??
              d.profile_image ??
              d.picture ??
              d.photo ??
              d.profile_picture ??
              null,
            ...d,
          };
          if (!mountedRef.current) return;
          setProfile(normalized);
          setEndpoint(p);
          setLoading(false);
          return;
        }
      } catch (err) {
        // continue to next candidate (404/401 etc)
        const e: any = err;
        if (e?.response?.status === 401) {
          try {
            await Promise.resolve(logout?.());
          } catch {}
          try {
            navigate("/login", { replace: true });
          } catch {
            window.location.href = "/login";
          }
          return;
        }
      }
    }

    // fallback to auth user map
    if (authUser) {
      const fallback: ProfileShape = {
        email: authUser.email,
        username: authUser.username,
        display_name: (authUser.username || authUser.email || "Admin") as string,
        avatar: (authUser as any).avatar ?? (authUser as any).picture ?? null,
      };
      if (mountedRef.current) setProfile(fallback);
    }
    setLoading(false);
  }, [PROFILE_CANDIDATES, authUser, logout, navigate]);

  /** small helper to fetch counts & activity */
  const fetchStatsAndActivity = useCallback(async () => {
    try {
      const [subs, conts, act] = await Promise.allSettled([
        client.get("/subscribers/", { params: { page_size: 1 } }),
        client.get("/contacts/", { params: { page_size: 1 } }),
        client.get("/admin/activity/", { params: { limit: 6 } }),
      ]);
      // subscribers
      if (subs.status === "fulfilled") {
        const d: any = subs.value?.data;
        if (typeof d?.count === "number") setSubCount(Number(d.count));
        else if (Array.isArray(d)) setSubCount(d.length);
      }
      if (conts.status === "fulfilled") {
        const d: any = conts.value?.data;
        if (typeof d?.count === "number") setContactCount(Number(d.count));
        else if (Array.isArray(d)) setContactCount(d.length);
      }
      if (act.status === "fulfilled") {
        const d: any = act.value?.data;
        if (Array.isArray(d)) setActivity(d);
        else if (Array.isArray(d?.results)) setActivity(d.results);
      }
    } catch (err) {
      // ignore
      // eslint-disable-next-line no-console
      console.warn("[AdminProfile] stats/activity fetch failed", err);
    }
  }, []);

  useEffect(() => {
    void fetchProfile();
    void fetchStatsAndActivity();
  }, [fetchProfile, fetchStatsAndActivity]);

  /** Avatar handling */
  useEffect(() => {
    if (!avatarFile) {
      setAvatarPreview(null);
      return;
    }
    const url = URL.createObjectURL(avatarFile);
    setAvatarPreview(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [avatarFile]);

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    if (f) {
      // small client-side validation
      if (f.size > 5 * 1024 * 1024) {
        setMsg({ type: "error", text: `Image too large: ${bytesToSize(f.size)} (max 5MB)` });
        return;
      }
      setAvatarFile(f);
      setMsg(null);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    setProfile((p) => (p ? { ...p, avatar: null } : p));
  };

  /** Save profile */
  const saveProfile = async () => {
    if (!profile) return;
    setSaving(true);
    setMsg(null);

    // pick endpoint (fallback to sensible put/pk path)
    let target = endpoint ?? "/profile/";
    if (!endpoint && profile.id) {
      target = `/users/${profile.id}/`;
    }

    try {
      let res;
      if (avatarFile) {
        const fd = new FormData();
        if (profile.display_name != null) fd.append("display_name", profile.display_name);
        if (profile.username != null) fd.append("username", profile.username);
        if (profile.email != null) fd.append("email", profile.email);
        if (profile.bio != null) fd.append("bio", profile.bio);
        fd.append("avatar", avatarFile);

        res = await client.patch(target, fd, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      } else {
        const payload: Record<string, any> = {
          display_name: profile.display_name,
          username: profile.username,
          email: profile.email,
          bio: profile.bio,
        };
        res = await client.patch(target, payload);
      }
      const d: any = res?.data;
      if (!mountedRef.current) return;
      setProfile((p) => ({ ...(p ?? {}), ...(d ?? {}) }));
      setMsg({ type: "success", text: "Profile updated." });
    } catch (err: any) {
      // eslint-disable-next-line no-console
      console.warn("[AdminProfile] save error", err);
      let text = "Save failed. Try again.";
      if (err?.response?.data) {
        const body = err.response.data;
        if (typeof body === "string") text = body;
        else if (body?.detail) text = String(body.detail);
        else if (body?.message) text = String(body.message);
        else if (body?.errors) text = JSON.stringify(body.errors);
        else if (typeof body === "object") text = JSON.stringify(body);
      } else if (err?.message) text = err.message;
      if (mountedRef.current) setMsg({ type: "error", text });
    } finally {
      if (mountedRef.current) setSaving(false);
    }
  };

  /** Change password flow (simple) */
  const [changing, setChanging] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");

  const changePassword = async () => {
    if (!newPassword || newPassword.length < 8) {
      setMsg({ type: "error", text: "New password must be at least 8 characters." });
      return;
    }
    if (newPassword !== newPasswordConfirm) {
      setMsg({ type: "error", text: "Password confirmation does not match." });
      return;
    }
    setChanging(true);
    setMsg(null);

    const candidates = [
      "/profile/change-password/",
      "/auth/password/change/",
      "/auth/change-password/",
    ];
    let ok = false;
    let lastErr: any = null;
    for (const c of candidates) {
      try {
        const resp = await client.post(c, {
          old_password: oldPassword,
          new_password: newPassword,
          new_password_confirm: newPasswordConfirm,
        });
        if (resp?.status && resp.status >= 200 && resp.status < 300) {
          ok = true;
          break;
        }
      } catch (err) {
        lastErr = err;
      }
    }
    if (ok) {
      setMsg({ type: "success", text: "Password changed. Keep it safe." });
      setOldPassword("");
      setNewPassword("");
      setNewPasswordConfirm("");
    } else {
      let text = "Could not change password. Check your old password and try again.";
      if (lastErr?.response?.data) {
        const b = lastErr.response.data;
        if (b?.detail) text = String(b.detail);
        else if (b?.message) text = String(b.message);
        else text = JSON.stringify(b);
      } else if (lastErr?.message) text = lastErr.message;
      setMsg({ type: "error", text });
    }
    if (mountedRef.current) setChanging(false);
  };

  // basic client-side form validation (simple)
  const canSave = !!profile && !!profile.email && !!profile.display_name && !saving;

  // Show a loading card while profile is fetched (this uses `loading` so TS no longer warns)
  if (loading && !profile) {
    return (
      <div className="max-w-7xl mx-auto p-6">
        <div className="rounded-2xl bg-white dark:bg-slate-900 p-6 shadow-sm border border-white/6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 animate-pulse" />
            <div className="flex-1">
              <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-2/3 animate-pulse mb-3" />
              <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/2 animate-pulse" />
            </div>
          </div>
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
            <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <motion.div
        initial={reduce ? undefined : { opacity: 0, y: 8 }}
        animate={reduce ? undefined : { opacity: 1, y: 0 }}
        transition={{ duration: 0.42 }}
        className="grid grid-cols-1 lg:grid-cols-3 gap-8"
      >
        {/* left column: profile form */}
        <section className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-white/6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-500 to-emerald-400 overflow-hidden flex items-center justify-center text-lg text-white font-semibold">
                {avatarPreview ? (
                  <img src={avatarPreview} alt="avatar preview" className="w-full h-full object-cover" />
                ) : profile?.avatar ? (
                  <img src={profile.avatar} alt="avatar" className="w-full h-full object-cover" />
                ) : (
                  <span>{(profile?.display_name ?? profile?.username ?? "A").charAt(0).toUpperCase()}</span>
                )}
              </div>

              <div className="absolute -right-2 -bottom-2">
                <label
                  title="Upload avatar"
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-slate-800 text-sm shadow cursor-pointer hover:brightness-95"
                >
                  <FaCamera />
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={onFileChange}
                  />
                </label>
              </div>
            </div>

            <div className="flex-1">
              <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">
                {profile?.display_name ?? "Profile"}
              </h2>
              <div className="text-sm text-slate-600 dark:text-slate-400">
                Manage your account details and preferences.
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setAvatarFile(null);
                  setAvatarPreview(null);
                  void fetchProfile();
                }}
                className="px-3 py-1 rounded-md border text-sm"
              >
                Reset
              </button>

              <button
                type="button"
                onClick={saveProfile}
                disabled={!canSave}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-emerald-400 text-white rounded-md shadow"
                title="Save profile"
              >
                <FaSave />
                <span>{saving ? "Saving…" : "Save changes"}</span>
              </button>
            </div>
          </div>

          {/* messages */}
          <div className="mt-4">
            {msg && (
              <div
                role={msg.type === "error" ? "alert" : "status"}
                aria-live="polite"
                className={`rounded-md px-3 py-2 text-sm ${
                  msg.type === "error" ? "bg-rose-50 text-rose-700" : "bg-emerald-50 text-emerald-700"
                }`}
              >
                {msg.text}
              </div>
            )}
          </div>

          {/* form */}
          <form
            className="mt-6 grid grid-cols-1 gap-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (canSave) void saveProfile();
            }}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <label className="block">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Display name</div>
                <input
                  value={profile?.display_name ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...(p ?? {}), display_name: e.target.value }))}
                  className="mt-2 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
                />
              </label>

              <label className="block">
                <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Username</div>
                <input
                  value={profile?.username ?? ""}
                  onChange={(e) => setProfile((p) => ({ ...(p ?? {}), username: e.target.value }))}
                  className="mt-2 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
                />
              </label>
            </div>

            <label className="block">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Email</div>
              <input
                type="email"
                value={profile?.email ?? ""}
                onChange={(e) => setProfile((p) => ({ ...(p ?? {}), email: e.target.value }))}
                className="mt-2 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
              />
            </label>

            <label className="block">
              <div className="text-xs font-medium text-slate-600 dark:text-slate-300">Bio</div>
              <textarea
                rows={4}
                value={profile?.bio ?? ""}
                onChange={(e) => setProfile((p) => ({ ...(p ?? {}), bio: e.target.value }))}
                className="mt-2 block w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2 text-sm"
              />
            </label>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  removeAvatar();
                }}
                className="px-3 py-2 rounded-md border text-sm"
              >
                Remove avatar
              </button>

              <div className="text-sm text-slate-500 dark:text-slate-400">
                Tip: add a friendly photo (jpeg/png/webp). Max 5MB.
              </div>
            </div>

            <div className="pt-2">
              <div className="text-xs text-slate-500 dark:text-slate-400">Security</div>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-2 items-center">
                <input
                  placeholder="Current password"
                  type="password"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm col-span-1 sm:col-span-1"
                />
                <input
                  placeholder="New password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm col-span-1 sm:col-span-1"
                />
                <div className="flex gap-2">
                  <input
                    placeholder="Confirm new"
                    type="password"
                    value={newPasswordConfirm}
                    onChange={(e) => setNewPasswordConfirm(e.target.value)}
                    className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm flex-1"
                  />
                  <button
                    type="button"
                    onClick={changePassword}
                    disabled={changing}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-gradient-to-r from-indigo-500 to-emerald-400 text-white rounded-md"
                  >
                    <FaKey />
                    <span>{changing ? "Changing…" : "Change"}</span>
                  </button>
                </div>
              </div>
            </div>
          </form>
        </section>

        {/* right column: stats & activity */}
        <aside className="space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-white/6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-slate-700 dark:text-slate-200">Account</h3>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Member since</div>
                <div className="text-sm mt-1 font-semibold">{profile?.id ? `#${profile.id}` : "—"}</div>
              </div>

              <div className="text-right">
                <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                <div className="text-sm font-medium">{profile?.email ?? "—"}</div>
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg bg-gradient-to-br from-indigo-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Subscribers</div>
                <div className="text-xl font-semibold">{subCount ?? "—"}</div>
              </div>
              <div className="p-3 rounded-lg bg-gradient-to-br from-rose-50 to-yellow-50 dark:from-slate-800 dark:to-slate-900 text-center">
                <div className="text-xs text-slate-500 dark:text-slate-400">Contacts</div>
                <div className="text-xl font-semibold">{contactCount ?? "—"}</div>
              </div>
            </div>
          </div>

          {activity && activity.length > 0 && (
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-white/6">
              <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Recent activity</h4>
              <ul className="mt-3 space-y-3 text-sm text-slate-600 dark:text-slate-300">
                {activity.map((a) => (
                  <li key={a.id} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-xs font-semibold">
                      {String(a.verb ?? a.text ?? "·").charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="text-sm text-slate-700 dark:text-slate-100">{a.verb ?? a.text}</div>
                      <div className="text-xs text-slate-400">{a.created_at ? timeAgo(a.created_at) : "-"}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-white/6">
            <h4 className="text-sm font-medium text-slate-700 dark:text-slate-200">Danger zone</h4>
            <div className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              <p>
                Logout of the admin session or remove your account avatar. These are irreversible in this UI without server changes.
              </p>
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      await Promise.resolve(logout?.());
                    } catch {}
                    try {
                      navigate("/login", { replace: true });
                    } catch {
                      window.location.href = "/login";
                    }
                  }}
                  className="px-3 py-2 rounded-md bg-rose-600 text-white"
                >
                  Logout
                </button>

                <button
                  type="button"
                  onClick={() => {
                    removeAvatar();
                    setMsg({ type: "success", text: "Avatar removed locally. Click Save to persist." });
                  }}
                  className="px-3 py-2 rounded-md border"
                >
                  Remove avatar
                </button>
              </div>
            </div>
          </div>
        </aside>
      </motion.div>
    </div>
  );
}
