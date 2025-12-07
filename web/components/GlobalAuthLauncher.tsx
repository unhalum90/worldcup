"use client";

import { useEffect, useState } from 'react';
import AuthModal from '@/components/AuthModal';

export default function GlobalAuthLauncher() {
  const [open, setOpen] = useState(false);
  const [redirectTo, setRedirectTo] = useState('/account');

  useEffect(() => {
    const handler = () => {
      // Check if there's a custom redirect stored
      const customRedirect = sessionStorage.getItem('auth_redirect');
      if (customRedirect) {
        setRedirectTo(customRedirect);
        sessionStorage.removeItem('auth_redirect');
      } else {
        setRedirectTo('/account');
      }
      setOpen(true);
    };
    window.addEventListener('fz:open-auth' as any, handler);
    return () => window.removeEventListener('fz:open-auth' as any, handler);
  }, []);

  if (!open) return null;
  return <AuthModal isOpen={open} onClose={() => setOpen(false)} redirectTo={redirectTo} />;
}
