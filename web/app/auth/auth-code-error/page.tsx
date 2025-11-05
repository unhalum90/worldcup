export const metadata = {
  title: "Authentication Error",
};

import MagicLinkRecovery from "@/components/MagicLinkRecovery";
import EmailOtpVerify from "@/components/EmailOtpVerify";

export default function AuthCodeError({
  searchParams,
}: {
  searchParams: { error?: string; redirect?: string };
}) {
  const raw = searchParams.error || "Unknown authentication error";

  // Friendlier copy for common PKCE/browser-context errors
  const pretty = /both auth code and code verifier should be non-empty/i.test(raw)
    ? "We couldn't complete sign-in because the secure link opened in a different browser than where you requested it."
    : raw;

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white px-4">
      <div className="text-center space-y-6 max-w-md w-full">
        <div className="text-red-600 text-6xl">⚠️</div>

        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Authentication Error</h1>
          <p className="text-gray-600">We encountered a problem signing you in.</p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-mono break-words">{pretty}</p>
        </div>

        <div className="space-y-3 text-left">
          <p className="text-sm text-gray-700 font-medium">This often happens when:</p>
          <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
            <li>The sign-in link has already been used</li>
            <li>The link has expired (valid for ~1 hour)</li>
            <li>You clicked the link in a different browser/device</li>
          </ul>
        </div>

        <MagicLinkRecovery redirect={searchParams.redirect} />

        <div className="pt-2" />
        <EmailOtpVerify redirect={searchParams.redirect} />

        <div className="flex flex-col gap-3 pt-2">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            Return Home
          </a>
          <a
            href="/verify-email"
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
          >
            Go to Email Instructions
          </a>
        </div>
      </div>
    </main>
  );
}
