
export default function TenantsSkeleton() {
    return (
        <div className="px-4 sm:px-6 lg:px-8 py-8 animate-pulse">
            <div className="sm:flex sm:items-center">
                <div className="sm:flex-auto">
                    <div className="h-7 w-32 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 w-64 bg-gray-200 rounded"></div>
                </div>
                <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
                    <div className="h-10 w-36 bg-gray-200 rounded-lg"></div>
                </div>
            </div>

            <div className="mt-8 flex flex-col">
                <div className="-my-2 -mx-4 overflow-x-auto sm:-mx-6 lg:-mx-8">
                    <div className="inline-block min-w-full py-2 align-middle md:px-6 lg:px-8">
                        <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 md:rounded-lg bg-white">
                            <div className="border-b border-gray-100 bg-gray-50 px-6 py-4">
                                <div className="grid grid-cols-4 gap-4">
                                    <div className="h-4 bg-gray-200 rounded w-24"></div>
                                    <div className="h-4 bg-gray-200 rounded w-20"></div>
                                    <div className="h-4 bg-gray-200 rounded w-32"></div>
                                    <div className="h-4 bg-gray-200 rounded w-16 ml-auto"></div>
                                </div>
                            </div>
                            <div className="divide-y divide-gray-200">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <div key={i} className="px-6 py-4">
                                        <div className="grid grid-cols-4 gap-4 items-center">
                                            <div className="h-4 bg-gray-200 rounded w-32"></div>
                                            <div className="h-4 bg-gray-200 rounded w-24"></div>
                                            <div className="h-4 bg-gray-200 rounded w-40"></div>
                                            <div className="flex justify-end gap-4">
                                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                                                <div className="h-4 bg-gray-200 rounded w-12"></div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
