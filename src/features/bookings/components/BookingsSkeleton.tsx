export default function BookingsSkeleton() {
    return (
        <div className="space-y-4 animate-pulse">

            {/* Header */}
            <div className="h-6 w-40 bg-gray-300 rounded"></div>

            {/* Cards */}
            {[1, 2, 3].map((i) => (
                <div
                    key={i}
                    className="bg-white rounded-xl p-4 border shadow-sm space-y-3"
                >
                    <div className="flex justify-between">
                        <div className="h-3 w-24 bg-gray-300 rounded"></div>
                        <div className="h-3 w-16 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex justify-between">
                        <div className="h-3 w-20 bg-gray-300 rounded"></div>
                        <div className="h-3 w-14 bg-gray-300 rounded"></div>
                    </div>

                    <div className="flex justify-between">
                        <div className="h-3 w-28 bg-gray-300 rounded"></div>
                        <div className="h-3 w-10 bg-gray-300 rounded"></div>
                    </div>
                </div>
            ))}
        </div>
    );
}
