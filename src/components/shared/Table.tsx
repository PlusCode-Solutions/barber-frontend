interface Column<T> {
    header: string;
    accessor: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
}

function getNestedValue(obj: any, path: string) {
    return path.split(".").reduce((acc, key) => acc?.[key], obj);
}

export function Table<T>({ data, columns }: TableProps<T>) {
    if (!data.length) {
        return (
            <div className="flex flex-col items-center justify-center py-16 text-center bg-white rounded-3xl border border-gray-200 shadow-sm">
                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-4 shadow-inner">
                    <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-bold text-gray-800 mb-1">No hay citas</h3>
                <p className="text-gray-500 text-sm">Tus próximas citas aparecerán aquí</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {data.map((row, i) => (
                <div
                    key={i}
                    className="bg-white rounded-3xl shadow-lg p-5 border border-gray-100 hover:shadow-xl transition-all duration-300"
                >
                    {columns.map((col, index) => (
                        <div
                            key={col.header}
                            className={`flex justify-between items-center py-3 gap-4 ${index !== columns.length - 1 ? "border-b border-gray-100" : ""
                                }`}
                        >
                            <span className="text-gray-500 text-xs font-semibold uppercase tracking-wider">
                                {col.header}
                            </span>

                            <span className="text-gray-900 font-semibold text-right text-sm max-w-[55%] truncate">
                                {String(getNestedValue(row, col.accessor) ?? "—")}
                            </span>
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
}
