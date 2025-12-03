"use client";

import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NO AUTH CHECKS - Just render the dashboard
  // Middleware handles initial login gate

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
            href="/admin/blog"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
            </svg>
            Blog
          </Link>

          <Link
            href="/admin/draw"
            className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-gray-100 transition-colors text-gray-700 hover:text-[color:var(--color-primary)]"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 1.79-3 4s1.343 4 3 4 3-1.79 3-4-1.343-4-3-4zm0-4a1 1 0 011 1v1.07a7.002 7.002 0 015.938 5.938H20a1 1 0 110 2h-1.062A7.002 7.002 0 0113 17.93V19a1 1 0 11-2 0v-1.07A7.002 7.002 0 015.062 12H4a1 1 0 110-2h1.062A7.002 7.002 0 0111 6.07V5a1 1 0 011-1z" />
            </svg>
            Draw
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
