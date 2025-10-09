"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

type ThreadCardProps = {
  thread: any; // minimal typing for now
};

export default function ThreadCard({ thread }: ThreadCardProps) {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [voteValue, setVoteValue] = useState<number | null>(null);
  const [score, setScore] = useState<number>(thread.score || 0);

  // pick a deterministic accent color based on city slug or thread id
  function hashString(s: string) {
    let h = 0;
    for (let i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  }

  function accentFor(key: string) {
    // official WC26 palette
    const palette = ['#3CAC3B', '#2A398D', '#E61D25', '#D1D4D1', '#474A4A'];
    return palette[hashString(key) % palette.length];
  }

  function readableTextColor(hex: string) {
    // hex -> r,g,b
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    // perceived luminance
    const lum = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return lum > 180 ? '#0f172a' : '#ffffff';
  }

  const accent = accentFor(thread.city_slug || String(thread.id || ''));
  const accentText = readableTextColor(accent);
  function hexToRgba(hex: string, alpha = 0.12) {
    const h = hex.replace('#', '');
    const r = parseInt(h.substring(0, 2), 16);
    const g = parseInt(h.substring(2, 4), 16);
    const b = parseInt(h.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  const cardBg = hexToRgba(accent, 0.12);

  useEffect(() => {
    let mounted = true;
    async function init() {
      const { data } = await supabase.auth.getUser();
      if (!mounted) return;
      setUser(data.user ?? null);

      if (data.user) {
        const { data: v } = await supabase
          .from('votes')
          .select('id, value')
          .eq('user_id', data.user.id)
          .eq('target_type', 'thread')
          .eq('target_id', thread.id)
          .maybeSingle();
        if (v) setVoteValue(v.value);
      }
    }
    init();
    return () => { mounted = false; };
  }, [thread.id]);

  return (
    <div
      className="py-2 cursor-pointer my-1"
      style={{ backgroundColor: cardBg, borderLeft: `4px solid ${accent}` }}
      onClick={() => router.push(`/forums/${thread.city_slug}/threads/${thread.id}`)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') router.push(`/forums/${thread.city_slug}/threads/${thread.id}`); }}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 pr-3">
          <h3 className="text-sm font-semibold" style={{ color: '#0f172a' }}>{thread.title}</h3>
          <div className="text-xs mt-1" style={{ color: '#0f172a' }}>by {thread.author_handle} • {thread._ago}</div>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-2 rounded-md px-2 py-0.5"
            style={{ backgroundColor: accent, color: accentText, minWidth: 48 }}
          >
            <button
              onClick={async (e) => {
                e.stopPropagation();
                // toggle upvote (existing logic unchanged)
                const { data } = await supabase.auth.getUser();
                if (!data.user) {
                  alert('Please sign in to vote');
                  return;
                }

                const { data: existing } = await supabase
                  .from('votes')
                  .select('id, value')
                  .eq('user_id', data.user.id)
                  .eq('target_type', 'thread')
                  .eq('target_id', thread.id)
                  .maybeSingle();

                if (!existing) {
                  const { error } = await supabase.from('votes').insert({
                    user_id: data.user.id,
                    target_type: 'thread',
                    target_id: thread.id,
                    value: 1
                  });
                  if (!error) {
                    setVoteValue(1);
                    setScore((s) => s + 1);
                  }
                } else if (existing.value === 1) {
                  const { error } = await supabase.from('votes').delete().eq('id', existing.id);
                  if (!error) {
                    setVoteValue(null);
                    setScore((s) => s - 1);
                  }
                } else {
                  const { error } = await supabase.from('votes').update({ value: 1 }).eq('id', existing.id);
                  if (!error) {
                    setVoteValue(1);
                    setScore((s) => s + 2);
                  }
                }
              }}
              className={`p-0.5 rounded ${voteValue === 1 ? 'bg-white/20' : 'bg-white text-black/70'}`}
              aria-label="Upvote"
            >
              ▲
            </button>
            <div className="flex flex-col items-start">
              <div className="font-semibold text-sm" style={{ color: accentText }}>{score}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
