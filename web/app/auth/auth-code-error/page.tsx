export const metadata = {
  title: "Authentication Error",
};

export default function AuthCodeError({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  const error = searchParams.error || "Unknown authentication error";

  return (
    <main className="flex h-screen items-center justify-center bg-gradient-to-br from-red-50 to-white">
      <div className="text-center space-y-6 max-w-md px-6">
        <div className="text-red-600 text-6xl">⚠️</div>
        
        <div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Authentication Error
          </h1>
          <p className="text-gray-600">
            We encountered a problem signing you in.
          </p>
        </div>

        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-800 font-mono break-words">
            {error}
          </p>
        </div>

        <div className="space-y-3">
          <p className="text-sm text-gray-600">
            This usually happens when:
          </p>
          <ul className="text-sm text-gray-600 text-left space-y-1">
            <li>• The sign-in link has already been used</li>
            <li>• The link has expired (valid for 1 hour)</li>
            <li>• You clicked the link from a different browser/device</li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <a
            href="/"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold transition-all"
          >
            Return Home
          </a>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-semibold transition-all"
          >
            Try Again
          </button>
        </div>
      </div>
    </main>
  );
}
