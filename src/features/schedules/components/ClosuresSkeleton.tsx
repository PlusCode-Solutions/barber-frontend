export default function ClosuresSkeleton() {
    return (
        <div className="animate-pulse space-y-4">
            <div className="h-6 w-48 bg-gray-200 rounded mb-4 ml-1"></div>
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                {[...Array(3)].map((_, i) => (
                    <div key={i} className="p-6 flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-50 last:border-0">
                        <div className="flex-1 space-y-3">
                            {/* Title and Badge skip */}
                            <div className="flex items-center gap-2">
                                <div className="h-6 w-40 bg-gray-200 rounded-lg"></div>
                                <div className="h-4 w-12 bg-gray-100 rounded"></div>
                            </div>
                            {/* Date */}
                            <div className="h-4 w-48 bg-gray-100 rounded"></div>
                            {/* Tags/Badges below */}
                            <div className="flex gap-2 pt-2">
                                <div className="h-7 w-24 bg-gray-50 rounded-xl"></div>
                                <div className="h-7 w-32 bg-gray-50 rounded-xl"></div>
                            </div>
                        </div>
                        {/* Status Label */}
                        <div className="h-7 w-24 bg-gray-100 rounded-full self-start sm:self-center"></div>
                    </div>
                ))}
            </div>
        </div>
    );
}
