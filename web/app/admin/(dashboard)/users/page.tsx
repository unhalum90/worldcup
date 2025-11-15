"use client";

import { useEffect, useMemo, useState } from "react";

type Profile = {
  user_id: string;
  email: string | null;
  name: string | null;
  handle: string | null;
  role: string | null;
  account_level: string | null;
  subscription_tier: string | null;
  subscription_status: string | null;
  is_member: boolean | null;
  updated_at: string | null;
};

type AuthUser = {
  id: string;
  email: string | null;
  created_at: string | null;
  last_sign_in_at: string | null;
  email_confirmed_at?: string | null;
};

type PurchaseSummary = { user_id: string; count: number };

type UserRow = {
  auth: AuthUser;
  profile: Profile | null;
  purchases: number;
};

type ListResponse = {
  users: UserRow[];
  page: number;
  perPage: number;
  total: number;
};

export default function UsersAdminPage() {
  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [resp, setResp] = useState<ListResponse | null>(null);
  const perPage = 25;

  const totalPages = useMemo(() => {
    if (!resp) return 1;
    return Math.max(1, Math.ceil(resp.total / resp.perPage));
  }, [resp]);

  async function load() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set("page", String(page));
      params.set("limit", String(perPage));
      if (q.trim()) params.set("q", q.trim());
      const res = await fetch(`/api/admin/users/list?${params.toString()}`);
      const data: ListResponse = await res.json();
      setResp(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function updateProfile(user_id: string, patch: Partial<Profile>) {
    const res = await fetch('/api/admin/users/update', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id, profile: patch }),
    });
    const ok = res.ok;
    if (!ok) {
      const data = await res.json().catch(() => ({}));
      alert(`Update failed: ${data?.error || res.status}`);
    } else {
      await load();
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Users</h1>
      <div className="flex items-center gap-2 mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search by exact email"
          className="w-full max-w-md rounded-lg border border-gray-300 px-3 py-2"
        />
        <button
          onClick={() => { setPage(1); load(); }}
          className="rounded-lg bg-blue-600 text-white px-4 py-2"
          disabled={loading}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {!resp ? (
        <div className="text-gray-500">Loading...</div>
      ) : resp.users.length === 0 ? (
        <div className="text-gray-600">No users found.</div>
      ) : (
        <div className="overflow-x-auto bg-white border border-gray-200 rounded-xl">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Auth</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Profile</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Membership</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Purchases</th>
                <th className="text-left text-xs font-semibold text-gray-500 uppercase px-4 py-2">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {resp.users.map((u) => (
                <tr key={u.auth.id} className="align-top">
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="font-mono">{u.auth.id}</div>
                    <div className="text-gray-700">{u.auth.email || '—'}</div>
                    <div className="text-gray-500">Created: {u.auth.created_at ? new Date(u.auth.created_at).toLocaleString() : '—'}</div>
                    <div className="text-gray-500">Last Sign-In: {u.auth.last_sign_in_at ? new Date(u.auth.last_sign_in_at).toLocaleString() : '—'}</div>
                    <div className="text-gray-500">Email Confirmed: {u.auth.email_confirmed_at ? new Date(u.auth.email_confirmed_at).toLocaleString() : '—'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    {u.profile ? (
                      <div className="space-y-1">
                        <div>Name: {u.profile.name || '—'}</div>
                        <div>Handle: {u.profile.handle || '—'}</div>
                        <div>Email: {u.profile.email || '—'}</div>
                        <div>Role: {u.profile.role || 'user'}</div>
                        <div>Updated: {u.profile.updated_at ? new Date(u.profile.updated_at).toLocaleString() : '—'}</div>
                      </div>
                    ) : (
                      <div className="text-gray-500">No profile row</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div>Account Level: {u.profile?.account_level || 'free'}</div>
                    <div>Tier: {u.profile?.subscription_tier || 'free'}</div>
                    <div>Status: {u.profile?.subscription_status || 'active'}</div>
                    <div>is_member: {u.profile?.is_member ? 'true' : 'false'}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div>Total Purchases: {u.purchases}</div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-800">
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => updateProfile(u.auth.id, { role: 'admin' })}
                        className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                      >Make Admin</button>
                      <button
                        onClick={() => updateProfile(u.auth.id, { role: 'user' })}
                        className="px-3 py-1 rounded-full border border-gray-300 hover:bg-gray-50"
                      >Revoke Admin</button>
                      <button
                        onClick={() => updateProfile(u.auth.id, { is_member: true, account_level: 'member', subscription_tier: 'premium', subscription_status: 'active' })}
                        className="px-3 py-1 rounded-full bg-green-600 text-white hover:bg-green-700"
                      >Grant Membership</button>
                      <button
                        onClick={() => updateProfile(u.auth.id, { is_member: false, account_level: 'free', subscription_status: 'cancelled' })}
                        className="px-3 py-1 rounded-full bg-red-600 text-white hover:bg-red-700"
                      >Revoke Membership</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">Page {resp?.page || 1} of {totalPages}</div>
        <div className="flex gap-2">
          <button
            className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50"
            disabled={page <= 1}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >Prev</button>
          <button
            className="px-3 py-1 rounded-lg border border-gray-300 disabled:opacity-50"
            disabled={page >= totalPages}
            onClick={() => setPage((p) => p + 1)}
          >Next</button>
        </div>
      </div>
    </div>
  );
}

