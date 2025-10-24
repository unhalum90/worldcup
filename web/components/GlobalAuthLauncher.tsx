"use client";

import { useEffect, useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function GlobalAuthLauncher() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handler = () => setOpen(true);
    window.addEventListener('fz:open-auth' as any, handler);
    return () => window.removeEventListener('fz:open-auth' as any, handler);
  }, []);

  if (!open) return null;
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} redirectTo="/account" />;
}
