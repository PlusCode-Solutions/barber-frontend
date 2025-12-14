import { Search } from "lucide-react";

interface SearchBarProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

export default function SearchBar({
    value,
    onChange,
    placeholder = "Buscar...",
    className = ""
}: SearchBarProps) {
    return (
        <div className={`bg-white rounded-xl shadow-sm border border-gray-200 p-4 flex items-center gap-3 ${className}`}>
            <Search className="text-gray-400" size={20} />
            <input
                type="text"
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
            />
        </div>
    );
}
