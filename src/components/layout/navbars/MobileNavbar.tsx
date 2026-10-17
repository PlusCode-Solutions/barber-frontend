import { Link, useLocation } from "react-router-dom";
import type { LucideIcon } from "lucide-react";

export interface MobileNavbarItem {
    icon: LucideIcon;
    label: string;
    path: string;
    exact?: boolean;
}

interface Props {
    items: MobileNavbarItem[];
    primaryColor?: string;
    basePath: string;
}

export default function MobileNavbar({ items, primaryColor = "#2563eb", basePath }: Props) {
    const { pathname } = useLocation();

    return (
        <nav
            aria-label="Navegación principal"
            className="fixed inset-x-0 bottom-0 z-50 lg:hidden px-3 pt-2 pb-[max(env(safe-area-inset-bottom),10px)]"
        >
            {/* Barra flotante de vidrio */}
            <div className="flex items-stretch rounded-2xl bg-white/85 backdrop-blur-xl border border-gray-200/60 shadow-[0_8px_30px_rgba(15,23,42,0.14)] p-1.5">
                {items.map((item) => {
                    const fullPath = `${basePath}/${item.path}`;
                    const isActive = item.exact
                        ? pathname === fullPath
                        : pathname.startsWith(fullPath);

                    return (
                        <Link
                            key={item.path}
                            to={fullPath}
                            aria-current={isActive ? "page" : undefined}
                            className="flex-1 min-w-0 flex flex-col items-center gap-1.5 py-2 rounded-xl transition-transform duration-200 active:scale-90"
                        >
                            {/* Pastilla del activo */}
                            <span
                                className="flex h-7 w-12 items-center justify-center rounded-full transition-colors duration-300"
                                style={
                                    isActive
                                        ? { backgroundColor: primaryColor, color: "#fff", boxShadow: `0 4px 14px ${primaryColor}66` }
                                        : { color: "#9ca3af" }
                                }
                            >
                                <item.icon size={19} strokeWidth={isActive ? 2.4 : 2} />
                            </span>
                            <span
                                className={`truncate px-0.5 text-[10px] leading-none ${isActive ? "font-bold" : "font-medium"}`}
                                style={{ color: isActive ? primaryColor : "#9ca3af" }}
                            >
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}