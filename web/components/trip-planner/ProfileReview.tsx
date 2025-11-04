"use client";

import Link from 'next/link';
import { useTranslations } from 'next-intl';
import type { UserProfile } from '@/lib/profile/types';

type Translator = ReturnType<typeof useTranslations>;

interface ProfileReviewProps {
  profile: UserProfile;
  onConfirm: () => void;
  onEdit: () => void;
}

export default function ProfileReview({ profile, onConfirm, onEdit }: ProfileReviewProps) {
  const t = useTranslations('planner.tripBuilder.review');

  const home = formatHome(profile, t);
  const group = formatGroup(profile, t);
  const travelStyle = formatTravelStyle(profile, t);
  const focus = (profile.travel_focus || []).map((f) => translateWithFallback(t, 'focus', f) ?? f);
  const ticketSummary = formatTickets(profile, t);

  return (
    <section className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-6">
      <header>
        <p className="text-xs uppercase tracking-wide text-blue-600 font-semibold mb-1">
          {t('header.step', { step: 1 })}
        </p>
        <h2 className="text-2xl font-bold text-gray-900">{t('header.title')}</h2>
        <p className="text-sm text-gray-600 mt-1">{t('header.subtitle')}</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card title={t('cards.home.title')} value={home} />
        <Card title={t('cards.group.title')} value={group} />
        <Card title={t('cards.travelStyle.title')} value={travelStyle} />
        <Card title={t('cards.transport.title')} value={transportLabel(profile.preferred_transport, t)} />
        <Card
          title={t('cards.focus.title')}
          value={focus.length ? focus.join(t('common.separator')) : t('cards.focus.empty')}
        />
        <Card title={t('cards.tickets.title')} value={ticketSummary} />
      </div>

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onConfirm}
          className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
        >
          {t('actions.confirm')}
        </button>
        <button
          type="button"
          onClick={onEdit}
          className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-6 py-3 text-gray-800 font-semibold hover:bg-gray-50 transition-colors"
        >
          {t('actions.edit')}
        </button>
        <Link href="/onboarding" className="text-sm text-gray-500 underline underline-offset-2">
          {t('actions.restart')}
        </Link>
      </div>
    </section>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-xl border border-gray-200 p-4 bg-gray-50">
      <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{title}</p>
      <p className="text-sm text-gray-900">{value || '—'}</p>
    </div>
  );
}

function formatHome(profile: UserProfile, t: Translator) {
  if (profile.home_airport?.code) {
    const ap = profile.home_airport;
    return `${ap.city || ap.name || ap.code} (${ap.code}) • ${ap.name}`;
  }
  return profile.home_city || t('cards.home.empty');
}

function formatGroup(profile: UserProfile, t: Translator) {
  const adults = profile.group_size ?? 1;
  const kids = (profile.children_0_5 ?? 0) + (profile.children_6_18 ?? 0);
  const seniors = profile.seniors ?? 0;

  const parts = [t('cards.group.adults', { count: adults })];
  if (kids > 0) parts.push(t('cards.group.children', { count: kids }));
  if (seniors > 0) parts.push(t('cards.group.seniors', { count: seniors }));
  if (profile.mobility_issues) parts.push(t('cards.group.mobility'));

  return parts.length ? parts.join(t('common.separator')) : t('cards.group.empty');
}

function transportLabel(pref: string | null | undefined, t: Translator) {
  if (pref === 'public') return t('cards.transport.options.public');
  if (pref === 'car') return t('cards.transport.options.car');
  if (pref === 'mixed') return t('cards.transport.options.mixed');
  return t('cards.transport.options.default');
}

function formatTravelStyle(profile: UserProfile, t: Translator) {
  const items = [
    translateWithFallback(t, 'style.budget', profile.budget_level),
    translateWithFallback(t, 'style.food', profile.food_preference),
    translateWithFallback(t, 'style.nightlife', profile.nightlife_preference),
    translateWithFallback(t, 'style.climate', profile.climate_preference),
  ].filter(Boolean) as string[];

  return items.length ? items.join(t('common.separator')) : t('style.empty');
}

function formatTickets(profile: UserProfile, t: Translator) {
  if (!profile.has_tickets || !profile.ticket_match) {
    return t('cards.tickets.empty');
  }
  const m = profile.ticket_match;
  const date = m.date
    ? new Date(m.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    : '';
  return t('cards.tickets.summary', {
    match: m.match || '',
    city: m.city || '',
    date: date || '',
  });
}

function translateWithFallback(t: Translator, base: string, value?: string | null) {
  if (!value) return null;
  try {
    return t(`${base}.${value}`);
  } catch {
    return value;
  }
}
