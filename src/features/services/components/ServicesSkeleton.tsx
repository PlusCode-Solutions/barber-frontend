export default function ServicesSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            {/* Header Skeleton */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-6 shadow-lg">
                <div className="h-8 w-48 bg-white/20 rounded-lg mb-3 animate-pulse"></div>
                <div className="h-6 w-32 bg-white/15 rounded-full animate-pulse"></div>
            </div>

            {/* Cards Skeleton */}
            <div className="px-6 pt-6 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="bg-white rounded-2xl shadow-md p-5 border border-gray-200">
                        <div className="h-1.5 bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 rounded-full mb-4 animate-pulse"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-2/3 animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
