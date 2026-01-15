export default function SlotsSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            <div>
                {/* Header Skeleton (Mañana) */}
                <div className="h-4 w-20 bg-gray-200 rounded mx-auto mb-4"></div>

                {/* Grid Skeleton - 12 items (divisible by 3 and 4 for even rows on all screens) */}
                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...Array(12)].map((_, i) => (
                        <div key={i} className="h-9 w-full bg-gray-200 rounded-full opacity-70"></div>
                    ))}
                </div>
            </div>

            <div className="pt-4">
                {/* Header Skeleton (Tarde) */}
                <div className="h-4 w-16 bg-gray-200 rounded mx-auto mb-4"></div>

                <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {[...Array(8)].map((_, i) => (
                        <div key={i} className="h-9 w-full bg-gray-200 rounded-full opacity-70"></div>
                    ))}
                </div>
            </div>
        </div>
    );
}
