import { ChevronLeft, ChevronRight } from "lucide-react";

interface PaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    onPageChange: (page: number) => void;
    itemsName?: string;
    className?: string;
}

export default function Pagination({
    currentPage,
    totalPages,
    totalItems,
    onPageChange,
    itemsName = "resultados",
    className = ""
}: PaginationProps) {
    if (totalItems === 0) return null;

    const handlePrevious = () => {
        if (currentPage > 1) onPageChange(currentPage - 1);
    };

    const handleNext = () => {
        if (currentPage < totalPages) onPageChange(currentPage + 1);
    };

    return (
        <div className={`flex items-center justify-between bg-white px-4 py-3 border border-gray-200 rounded-xl shadow-sm ${className}`}>
            <div className="flex-1 flex items-center justify-between sm:hidden">
                <button
                    onClick={handlePrevious}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Página anterior"
                >
                    <ChevronLeft size={20} />
                </button>

                <div className="text-sm font-medium text-gray-700">
                    <span className="text-indigo-600 font-bold">{currentPage}</span>
                    <span className="mx-1 text-gray-400">/</span>
                    <span>{totalPages}</span>
                </div>

                <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    aria-label="Siguiente página"
                >
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-gray-700">
                        Mostrando página <span className="font-bold text-indigo-600">{currentPage}</span> de <span className="font-bold text-gray-900">{totalPages}</span>
                        <span className="text-gray-400 mx-2">|</span>
                        Total de {itemsName}: <span className="font-bold text-gray-900">{totalItems}</span>
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button
                            onClick={handlePrevious}
                            disabled={currentPage === 1}
                            className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Anterior</span>
                            <ChevronLeft size={20} />
                        </button>

                        {/* Page Number Buttons */}
                        {[...Array(totalPages)].map((_, i) => {
                            const page = i + 1;
                            const isActive = currentPage === page;
                            return (
                                <button
                                    key={page}
                                    onClick={() => onPageChange(page)}
                                    // Active: bg-blue-600 text-white (Tailwind blue default)
                                    // Inactive: bg-white text-gray-500 hover:bg-gray-50
                                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${isActive
                                        ? "z-10 bg-blue-600 border-blue-600 text-white"
                                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                                        }`}
                                >
                                    {page}
                                </button>
                            );
                        })}

                        <button
                            onClick={handleNext}
                            disabled={currentPage === totalPages}
                            className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                            <span className="sr-only">Siguiente</span>
                            <ChevronRight size={20} />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
}
