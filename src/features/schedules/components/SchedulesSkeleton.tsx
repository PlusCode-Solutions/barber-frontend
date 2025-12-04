export default function SchedulesSkeleton() {
    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 pb-8">
            {/* HEADER SKELETON */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 pt-8 pb-6 shadow-lg sticky top-16 z-10">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="h-9 w-48 bg-white/20 rounded-lg mb-3 animate-pulse"></div>
                        <div className="h-7 w-32 bg-white/15 rounded-full animate-pulse"></div>
                    </div>
                    <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl animate-pulse"></div>
                </div>
            </div>

            {/* SCHEDULES LIST SKELETON */}
            <div className="px-4 pt-6 space-y-3 max-w-3xl mx-auto">
                {[1, 2, 3, 4, 5, 6, 7].map((i) => (
                    <div
                        key={i}
                        className="bg-white rounded-2xl border border-gray-100 p-5 pl-7 flex items-center justify-between shadow-sm"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-100 rounded-xl animate-pulse"></div>
                            <div>
                                <div className="h-5 w-24 bg-gray-100 rounded mb-2 animate-pulse"></div>
                                <div className="h-4 w-16 bg-gray-100 rounded animate-pulse"></div>
                            </div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                            <div className="h-5 w-32 bg-gray-100 rounded animate-pulse"></div>
                            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
