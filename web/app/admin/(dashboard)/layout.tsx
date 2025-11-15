"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    let cancelled = false;

    const checkAuth = async () => {
      try {
        console.log("[AdminLayout] Checking auth...");

        // Add a timeout so UI never hangs indefinitely
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("auth-timeout")), 10000)
        );

        const getUserPromise = supabase.auth.getUser();
        const {
          data: { user },
        } = await Promise.race([getUserPromise, timeout]);

        if (!user) {
          console.log("[AdminLayout] No user, redirecting to /admin/login");
          if (!cancelled) setLoading(false);
          router.push("/admin/login");
          return;
        }

        // First: allow via public allowlist (mirrors server middleware behavior)
        const allowlist = (process.env.NEXT_PUBLIC_ADMIN_EMAILS || "")
          .split(",")
          .map((e) => e.trim().toLowerCase())
          .filter(Boolean);
        const email = (user.email || "").toLowerCase();
        if (allowlist.length > 0 && allowlist.includes(email)) {
          console.log("[AdminLayout] Allowed via NEXT_PUBLIC_ADMIN_EMAILS");
          if (!cancelled) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        // Fallback: check a role in either profiles schema variant (id or user_id)
        // Some environments have public.profiles(id) and others profiles(user_id)
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("role, id, user_id")
          .or(`user_id.eq.${user.id},id.eq.${user.id}`)
          .maybeSingle();

        console.log("[AdminLayout] Profile role check:", profile?.role, error?.message);

        const role = (profile as any)?.role;
        const isPrivileged = role === "admin" || role === "superadmin" || role === "moderator";
        if (isPrivileged || allowlist.length === 0) {
          // If no allowlist is configured, treat any signed-in user as ok (server middleware still gates /admin)
          if (!cancelled) {
            setIsAdmin(true);
            setLoading(false);
          }
          return;
        }

        console.warn("[AdminLayout] Not authorized for admin. Redirecting to home.");
        if (!cancelled) setLoading(false);
        router.push("/");
      } catch (e: any) {
        console.warn("[AdminLayout] Auth check failed:", e?.message || e);
        // Fail open to avoid trapping the user on a spinner. Server middleware still protects routes.
        if (!cancelled) {
          setIsAdmin(true);
          setLoading(false);
        }
      }
    };

    checkAuth();

    // Listen for auth changes and re-check
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      checkAuth();
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[color:var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-[color:var(--color-neutral-700)]">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-lg border-r border-gray-200 z-10">
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-xl font-bold text-[color:var(--color-primary)]">
            Admin Console
          </h1>
          <p className="text-sm text-gray-600 mt-1">Content Machine</p>
        </div>

        <nav className="p-4 space-y-2">
          <Link
            href="/admin/users"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2a4 4 0 00-3-3.87M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2a4 4 0 013-3.87M7 10a4 4 0 110-8 4 4 0 010 8zm10-4a4 4 0 110 8 4 4 0 010-8z" />
            </svg>
            Users
          </Link>

          <Link
            href="/admin"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Blog
          </Link>

          <Link
            href="/admin/keywords"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
            </svg>
            Keyword Research
          </Link>

          <Link
            href="/admin/generate"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            Generate Article
          </Link>

          <Link
            href="/admin/drafts"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Drafts & Editor
          </Link>

          <Link
            href="/admin/published"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Published Posts
          </Link>

          <Link
            href="/admin/analytics"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 3v18m-4-6v6m8-10v10m4-4v4" />
            </svg>
            Analytics
          </Link>
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200">
          <button
            onClick={async () => {
              await supabase.auth.signOut();
              router.push("/admin/login");
            }}
            className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="ml-64 p-8">
        {children}
      </main>
    </div>
  );
}
