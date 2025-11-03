import { createServerClient } from '@/lib/supabaseServer';

const MAILERLITE_API_KEY = process.env.MAILERLITE_API_KEY;
const MAILERLITE_WEBSITE_GROUP_ID = process.env.MAILERLITE_WEBSITE_GROUP_ID;
const MAILERLITE_NEWSLETTER_GROUP_ID = process.env.MAILERLITE_NEWSLETTER_GROUP_ID;

const MAILERLITE_API_BASE = 'https://connect.mailerlite.com/api';

type JsonRecord = Record<string, unknown>;

export interface MailingListSyncOptions {
  email: string;
  userId?: string | null;
  source?: string | null;
  tags?: string[];
  metadata?: JsonRecord;
  fields?: JsonRecord;
  groups?: string[];
  confirmed?: boolean;
  pushToMailerLite?: boolean;
}

export interface MailingListSyncResult {
  ok: boolean;
  mailerliteId?: string | null;
  entry?: {
    id?: string;
    email?: string;
    user_id?: string | null;
    mailerlite_id?: string | null;
    tags?: unknown;
    metadata?: unknown;
  } | null;
  error?: string;
}

function normalizeEmail(raw: string | undefined | null): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase();
  if (!trimmed || !trimmed.includes('@')) return null;
  return trimmed;
}

function sanitizeFields(fields?: JsonRecord | null) {
  if (!fields) return undefined;
  const cleaned: JsonRecord = {};
  for (const [key, value] of Object.entries(fields)) {
    if (
      value === undefined ||
      value === null ||
      value === '' ||
      (typeof value === 'number' && Number.isNaN(value))
    ) {
      continue;
    }
    cleaned[key] = value;
  }
  return Object.keys(cleaned).length ? cleaned : undefined;
}

function mergeTags(existing: unknown, next: string[] = []) {
  const tagSet = new Set<string>();
  if (Array.isArray(existing)) {
    existing.forEach((tag) => {
      if (typeof tag === 'string' && tag.trim()) tagSet.add(tag.trim());
    });
  }
  next.forEach((tag) => {
    if (typeof tag === 'string' && tag.trim()) tagSet.add(tag.trim());
  });
  return Array.from(tagSet);
}

function mergeMetadata(existing: unknown, next?: JsonRecord) {
  const base: JsonRecord =
    existing && typeof existing === 'object' && !Array.isArray(existing) ? (existing as JsonRecord) : {};
  return next ? { ...base, ...next } : base;
}

function defaultGroups(groups?: string[]) {
  const merged = [
    ...(groups ?? []),
    MAILERLITE_WEBSITE_GROUP_ID,
    MAILERLITE_NEWSLETTER_GROUP_ID,
  ].filter((id): id is string => Boolean(id && id.trim()));
  return Array.from(new Set(merged));
}

export async function syncMailingList(options: MailingListSyncOptions): Promise<MailingListSyncResult> {
  const email = normalizeEmail(options.email);
  if (!email) {
    return { ok: false, error: 'invalid_email' };
  }

  let serviceClient;
  try {
    serviceClient = createServerClient();
  } catch (error) {
    console.warn('[MailerLite] Service client unavailable', error);
    return { ok: false, error: 'supabase_service_unavailable' };
  }

  let existing: any = null;
  try {
    const { data } = await serviceClient
      .from('mailing_list')
      .select('id,email,user_id,mailerlite_id,tags,metadata,source,confirmed')
      .eq('email', email)
      .maybeSingle();
    existing = data;
  } catch (error) {
    console.error('[MailerLite] Failed to load existing mailing_list row', error);
  }

  const tags = mergeTags(existing?.tags, options.tags);
  const metadata = mergeMetadata(existing?.metadata, options.metadata);
  const source = existing?.source ?? options.source ?? null;
  const confirmed = options.confirmed ?? existing?.confirmed ?? false;
  const userId = options.userId ?? existing?.user_id ?? null;

  let entry: any = existing;
  try {
    const { data, error } = await serviceClient
      .from('mailing_list')
      .upsert(
        {
          email,
          user_id: userId,
          source,
          tags,
          metadata,
          confirmed,
        },
        { onConflict: 'email' },
      )
      .select('id,email,user_id,mailerlite_id,tags,metadata')
      .single();

    if (error) throw error;
    entry = data;
  } catch (error) {
    console.error('[MailerLite] Failed to upsert mailing_list row', error);
    return { ok: false, error: 'mailing_list_upsert_failed' };
  }

  const pushToMailerLite = options.pushToMailerLite !== false;
  if (!pushToMailerLite || !MAILERLITE_API_KEY) {
    return { ok: true, entry, mailerliteId: entry?.mailerlite_id ?? null };
  }

  const headers = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${MAILERLITE_API_KEY}`,
    'X-MailerLite-ApiKey': MAILERLITE_API_KEY,
  };

  const groups = defaultGroups(options.groups);
  const fields = sanitizeFields(options.fields);

  let mailerliteId = entry?.mailerlite_id ?? null;
  try {
    const payload: JsonRecord = {
      email,
      status: 'active',
    };
    if (groups.length) payload.groups = groups;
    if (fields) payload.fields = fields;

    const createRes = await fetch(`${MAILERLITE_API_BASE}/subscribers`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload),
    });

    if (createRes.ok) {
      const json = await createRes.json().catch(() => null);
      mailerliteId = json?.data?.id || mailerliteId;
    } else if (createRes.status === 409) {
      mailerliteId = mailerliteId || (await lookupSubscriberId(email, headers));
      if (mailerliteId) {
        await updateSubscriber(mailerliteId, fields, groups, headers);
      }
    } else {
      const text = await createRes.text().catch(() => '');
      console.error('[MailerLite] subscriber create failed', createRes.status, text);
    }
  } catch (error) {
    console.error('[MailerLite] subscriber sync error', error);
  }

  if (mailerliteId && mailerliteId !== entry?.mailerlite_id) {
    try {
      await serviceClient
        .from('mailing_list')
        .update({ mailerlite_id: mailerliteId })
        .eq('email', email);
      entry = { ...entry, mailerlite_id: mailerliteId };
    } catch (error) {
      console.warn('[MailerLite] Failed to persist mailerlite_id', error);
    }
  }

  return { ok: true, entry, mailerliteId };
}

async function lookupSubscriberId(email: string, headers: Record<string, string>) {
  try {
    const res = await fetch(`${MAILERLITE_API_BASE}/subscribers?email=${encodeURIComponent(email)}`, {
      method: 'GET',
      headers,
    });
    if (!res.ok) return null;
    const json = await res.json().catch(() => null);
    if (!json) return null;
    if (Array.isArray(json.data)) {
      return json.data[0]?.id ?? null;
    }
    return json.data?.id ?? null;
  } catch (error) {
    console.warn('[MailerLite] lookup by email failed', error);
    return null;
  }
}

async function updateSubscriber(
  subscriberId: string,
  fields: JsonRecord | undefined,
  groups: string[],
  headers: Record<string, string>,
) {
  const payload: JsonRecord = { status: 'active' };
  if (fields) payload.fields = fields;
  if (groups.length) payload.groups = groups;

  try {
    const res = await fetch(`${MAILERLITE_API_BASE}/subscribers/${subscriberId}`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      console.error('[MailerLite] subscriber update failed', res.status, text);
    }
  } catch (error) {
    console.error('[MailerLite] subscriber update error', error);
  }
}
