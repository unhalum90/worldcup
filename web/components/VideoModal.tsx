'use client';

import { useEffect, useRef } from 'react';

type Props = {
  open: boolean;
  onClose: () => void;
  src: string; // e.g. '/videos/travelplanner_preview.mov'
  title?: string;
  poster?: string;
};

export default function VideoModal({ open, onClose, src, title = 'Preview', poster }: Props) {
  const ref = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    if (open) document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    if (open) {
      // Attempt autoplay muted
      video.currentTime = 0;
      video.play().catch(() => {/* ignore */});
    } else {
      video.pause();
      video.currentTime = 0;
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl mx-4 overflow-hidden">
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🎬</span>
            <h3 className="text-lg sm:text-xl font-bold">{title}</h3>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700" aria-label="Close">✕</button>
        </div>
        <div className="bg-black">
          <video
            ref={ref}
            src={src}
            poster={poster}
            className="w-full h-auto max-h-[75vh]"
            controls
            playsInline
            muted
            preload="metadata"
            onError={() => {
              // Show a friendly message overlay if the file can't be loaded
              console.error('Video failed to load:', src);
            }}
          >
            {/* If you add an MP4 later, <source> tags can improve compatibility */}
            Your browser does not support the video tag.
          </video>
        </div>
        <div className="p-4 flex justify-end">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  );
}
