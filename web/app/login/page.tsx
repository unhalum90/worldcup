"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/lib/AuthContext";

export default function LoginPage() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(true);

  useEffect(() => {
    if (!loading && user) {
      // If already signed in, go straight to account
      window.location.replace("/account");
    }
  }, [loading, user]);

  return (
    <div className="mx-auto max-w-md px-4 py-16">
      <h1 className="text-2xl font-semibold mb-2">Sign in</h1>
      <p className="text-gray-600 mb-6">Sign in to view your profile and purchases.</p>

      {!loading && !user && (
        <div className="space-x-3">
          <button
            onClick={() => setOpen(true)}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            Open sign in
          </button>
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Go home
          </Link>
        </div>
      )}

      {open && <AuthModal isOpen={open} onClose={() => setOpen(false)} redirectTo="/account" />}
    </div>
  );
}
