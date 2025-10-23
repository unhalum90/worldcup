export default function Loading() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Skeleton */}
      <section className="container py-16 sm:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="h-16 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-3/4 mx-auto mb-6 animate-pulse" />
          <div className="h-6 bg-gray-200 rounded-lg w-2/3 mx-auto mb-8 animate-pulse" />
          
          <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-6 rounded-2xl bg-gray-100 shadow-xl animate-pulse">
            <div className="h-20 w-64 bg-gray-200 rounded" />
          </div>
        </div>
      </section>

      {/* Filter Skeleton */}
      <section className="container pb-8">
        <div className="flex justify-center gap-3 mb-8">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-32 bg-gray-200 rounded-lg animate-pulse" />
          ))}
        </div>
      </section>

      {/* City Grid Skeleton */}
      <section className="container pb-16 sm:pb-24">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div key={i} className="rounded-2xl bg-white border-2 border-gray-200 overflow-hidden animate-pulse">
              <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="p-4">
                <div className="h-4 bg-gray-200 rounded mb-3" />
                <div className="h-4 bg-gray-200 rounded w-2/3" />
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
