"use client";

import React from 'react';
import Link from 'next/link';

type ThreadCardProps = {
  thread: any; // minimal typing for now
};

export default function ThreadCard({ thread }: ThreadCardProps) {
  return (
    <Link href={`/forums/${thread.city_slug}/${thread.id}`} className="block border rounded-lg p-4 hover:shadow-md transition">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="text-lg font-semibold">{thread.title}</h3>
          <div className="text-sm text-[color:var(--color-neutral-700)]">by {thread.author_handle} • {thread._ago}</div>
        </div>
        <div className="text-center">
          <div className="font-bold">{thread.score}</div>
          <div className="text-xs">votes</div>
        </div>
      </div>
    </Link>
  );
}
