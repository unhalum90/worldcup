/* eslint-disable @typescript-eslint/no-explicit-any */
// Minimal MailerLite helper for server-side usage (webhooks, server routes)

type AddResult = { ok: boolean; status: number; error?: string; data?: any };

function getApiKey(): string | null {
  return process.env.MAILERLITE_API_KEY || null;
}

export async function addSubscriberToGroup(email: string, groupId: string, fields?: Record<string, any>): Promise<AddResult> {
  const apiKey = getApiKey();
  if (!apiKey) return { ok: false, status: 0, error: 'missing_api_key' };
  if (!email) return { ok: false, status: 0, error: 'missing_email' };
  if (!groupId) return { ok: false, status: 0, error: 'missing_group' };

  const headers = {
    Authorization: `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  } as const;

  // Prefer group-specific endpoint (idempotent add)
  try {
    const res = await fetch(`https://connect.mailerlite.com/api/groups/${groupId}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, fields: fields || undefined }),
      // Next.js fetch is already server-side here
    });
    if (res.ok) {
      let data: any = null;
      try { data = await res.json(); } catch {}
      return { ok: true, status: res.status, data };
    }
    // If subscriber exists or already in group, MailerLite may return 200/409/422 — treat as success
    if (res.status === 409 || res.status === 422) {
      return { ok: true, status: res.status };
    }
  } catch (e: any) {
    // fall through to generic create endpoint
  }

  // Fallback: create/update subscriber and attach groups
  try {
    const res = await fetch('https://connect.mailerlite.com/api/subscribers', {
      method: 'POST',
      headers,
      body: JSON.stringify({ email, groups: [groupId], fields: fields || undefined }),
    });
    if (res.ok) {
      let data: any = null;
      try { data = await res.json(); } catch {}
      return { ok: true, status: res.status, data };
    }
    return { ok: false, status: res.status, error: 'request_failed' };
  } catch (e: any) {
    return { ok: false, status: 0, error: e?.message || 'network_error' };
  }
}

