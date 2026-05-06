export default function Loading() {
  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header Skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="h-9 bg-gray-800 rounded w-48 mb-2 animate-pulse" />
            <div className="h-5 bg-gray-800 rounded w-32 animate-pulse" />
          </div>
          <div className="flex gap-3">
            <div className="h-12 w-28 bg-gray-800 rounded-lg animate-pulse" />
            <div className="h-12 w-32 bg-gray-800 rounded-lg animate-pulse" />
          </div>
        </div>

        {/* Filters Skeleton */}
        <div className="glass-card rounded-lg p-6 mb-6">
          <div className="h-6 bg-gray-800 rounded w-24 mb-4 animate-pulse" />
          <div className="h-10 bg-gray-800 rounded w-full animate-pulse" />
        </div>

        {/* Job Cards Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="glass-card rounded-lg p-6 animate-pulse">
              <div className="h-6 bg-gray-800 rounded w-1/3 mb-4" />
              <div className="h-8 bg-gray-800 rounded w-1/2 mb-4" />
              <div className="space-y-2 mb-4">
                <div className="h-4 bg-gray-800 rounded" />
                <div className="h-4 bg-gray-800 rounded" />
              </div>
              <div className="flex gap-2 mb-4">
                <div className="h-6 bg-gray-800 rounded w-16" />
                <div className="h-6 bg-gray-800 rounded w-20" />
              </div>
              <div className="h-10 bg-gray-800 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
