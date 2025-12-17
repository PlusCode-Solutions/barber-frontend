import { useState, useMemo } from "react";
import { UserCircle, Mail, Calendar, Filter, X } from "lucide-react";
import { useTenantUsers } from "../hooks/useTenantUsers";
import { formatRelativeDate } from "../../../utils/dateUtils";
import type { User } from "../types";
import EditUserModal from "../components/EditUserModal";
import DeleteUserModal from "../components/DeleteUserModal";
import UserActionsMenu from "../components/UserActionsMenu";
import Toast from "../../../components/ui/Toast";
import SearchBar from "../../../components/ui/SearchBar";
import Pagination from "../../../components/ui/Pagination";

export default function TenantCustomersPage() {
    const { users, loading, refetch } = useTenantUsers();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);

    // Filter State
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState<'ALL' | 'CLIENT' | 'TENANT_ADMIN'>('ALL');

    // Pagination State
    const [currentPage, setCurrentPage] = useState(1);
    const ITEMS_PER_PAGE = 7; // Increased slightly for better view

    // Filter Logic
    const filteredUsers = useMemo(() => {
        return users.filter(user => {
            const matchesSearch = !searchTerm ||
                (user.name?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
                (user.email?.toLowerCase() || "").includes(searchTerm.toLowerCase());

            const matchesRole = roleFilter === 'ALL' || user.role === roleFilter;

            return matchesSearch && matchesRole;
        });
    }, [users, searchTerm, roleFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredUsers.length / ITEMS_PER_PAGE);
    const paginatedUsers = useMemo(() => {
        const start = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredUsers.slice(start, start + ITEMS_PER_PAGE);
    }, [filteredUsers, currentPage]);

    // Handlers
    const handleEdit = (user: User) => {
        setSelectedUser(user);
        setIsEditModalOpen(true);
    };

    const handleDelete = (user: User) => {
        setSelectedUser(user);
        setIsDeleteModalOpen(true);
    };

    const handleEditSuccess = () => {
        setToastMessage("✅ Usuario actualizado correctamente");
        setShowToast(true);
        refetch(); // Soft refresh
    };

    const handleDeleteSuccess = () => {
        setToastMessage("🗑️ Usuario eliminado correctamente");
        setShowToast(true);
        refetch(); // Soft refresh
    };

    const clearFilters = () => {
        setSearchTerm("");
        setRoleFilter('ALL');
        setCurrentPage(1);
    };

    if (loading) {
        return (
            <div className="p-12 flex justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50/50 pb-8">
            {/* Header */}
            <div className="bg-white/80 backdrop-blur-sm px-8 py-6 sticky top-0 z-10 border-b border-gray-200/60">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 max-w-7xl mx-auto">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
                            Gestión de Usuarios
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Administra clientes y permisos del sistema.
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="bg-white px-4 py-2 rounded-full border border-gray-200 shadow-sm flex items-center gap-2">
                            <UsersIcon size={16} className="text-indigo-600" />
                            <span className="font-bold text-gray-900">{users.length}</span>
                            <span className="text-xs text-gray-400 font-medium uppercase tracking-wide">Registrados</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content Container */}
            <div className="px-4 md:px-8 max-w-7xl mx-auto mt-8">

                {/* Filters Bar */}
                <div className="flex flex-col md:flex-row gap-4 mb-6">
                    <div className="flex-1 relative">
                        <SearchBar
                            placeholder="Buscar por nombre, correo..."
                            value={searchTerm}
                            onChange={(val) => {
                                setSearchTerm(val);
                                setCurrentPage(1);
                            }}
                            className="w-full shadow-sm border-gray-200 focus:border-indigo-500 focus:ring-indigo-500"
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm("")}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 bg-white"
                            >
                                <X size={16} />
                            </button>
                        )}
                    </div>

                    <div className="flex items-center gap-2">
                        <div className="relative">
                            <select
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value as any)}
                                className="appearance-none bg-white border border-gray-200 text-gray-700 py-2.5 pl-4 pr-10 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-sm font-medium cursor-pointer"
                            >
                                <option value="ALL">Todos los Roles</option>
                                <option value="CLIENT">Clientes</option>
                                <option value="TENANT_ADMIN">Administradores</option>
                            </select>
                            <Filter className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} />
                        </div>

                        {(searchTerm || roleFilter !== 'ALL') && (
                            <button
                                onClick={clearFilters}
                                className="p-2.5 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
                                title="Limpiar filtros"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200/60 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4">Usuario</th>
                                    <th className="px-6 py-4">Contacto</th>
                                    <th className="px-6 py-4">Rol</th>
                                    <th className="px-6 py-4">Registro</th>
                                    <th className="px-6 py-4 text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {paginatedUsers.map((user) => (
                                    <tr key={user.id} className="group hover:bg-indigo-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm shadow-sm ring-2 ring-white group-hover:scale-105 transition-transform">
                                                    {user.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle size={20} />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900 group-hover:text-indigo-700 transition-colors">
                                                        {user.name || "Sin Nombre"}
                                                    </p>
                                                    <p className="text-xs text-gray-400 font-mono">ID: {user.id.slice(0, 8)}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <div className="p-1.5 bg-gray-100 rounded-md text-gray-500">
                                                    <Mail size={14} />
                                                </div>
                                                <span className="text-sm font-medium">{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border shadow-sm ${user.role === 'TENANT_ADMIN'
                                                ? 'bg-purple-50 text-purple-700 border-purple-200'
                                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                }`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'TENANT_ADMIN' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                                                {user.role === 'TENANT_ADMIN' ? 'Admin' : 'Cliente'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Calendar size={14} className="text-gray-400" />
                                                {formatRelativeDate(user.createdAt)}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="opacity-0 group-hover:opacity-100 transition-opacity flex justify-end">
                                                <UserActionsMenu
                                                    user={user}
                                                    onEdit={handleEdit}
                                                    onDelete={handleDelete}
                                                />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {paginatedUsers.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-16 text-center">
                                            <div className="flex flex-col items-center justify-center text-gray-400">
                                                <UserCircle size={48} className="mb-4 text-gray-200" />
                                                <p className="text-lg font-medium text-gray-900">No se encontraron usuarios</p>
                                                <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                                                <button
                                                    onClick={clearFilters}
                                                    className="mt-4 text-indigo-600 font-semibold hover:text-indigo-700"
                                                >
                                                    Limpiar filtros
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {paginatedUsers.length === 0 ? (
                        <div className="bg-white rounded-xl p-12 text-center text-gray-500 border border-gray-200">
                            <UserCircle size={40} className="mx-auto mb-3 text-gray-300" />
                            <p>No se encontraron usuarios.</p>
                            <button onClick={clearFilters} className="text-indigo-600 font-medium mt-2">Limpiar búsqueda</button>
                        </div>
                    ) : (
                        paginatedUsers.map((user) => (
                            <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 hover:border-indigo-200 transition-colors">
                                {/* Header con Avatar y Nombre */}
                                <div className="flex items-center gap-4 mb-4 pb-4 border-b border-gray-50">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg shadow-md">
                                        {user.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-lg leading-tight">{user.name || "Sin Nombre"}</p>
                                        <p className="text-xs text-gray-400 font-mono mt-0.5">ID: {user.id.slice(0, 8)}</p>
                                    </div>
                                    <div className="self-start">
                                        <UserActionsMenu
                                            user={user}
                                            onEdit={handleEdit}
                                            onDelete={handleDelete}
                                        />
                                    </div>
                                </div>

                                {/* Detalles */}
                                <div className="space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-gray-600">
                                            <Mail size={16} className="text-gray-400" />
                                            <span className="text-sm font-medium">{user.email}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'TENANT_ADMIN'
                                            ? 'bg-purple-50 text-purple-700 border-purple-200'
                                            : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${user.role === 'TENANT_ADMIN' ? 'bg-purple-500' : 'bg-emerald-500'}`}></span>
                                            {user.role === 'TENANT_ADMIN' ? 'Admin' : 'Cliente'}
                                        </span>

                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs">
                                            <Calendar size={12} />
                                            <span>{formatRelativeDate(user.createdAt)}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Pagination Controls */}
                {filteredUsers.length > 0 && (
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        totalItems={filteredUsers.length}
                        onPageChange={setCurrentPage}
                        itemsName="usuarios"
                        className="mt-6 border-none shadow-none bg-transparent"
                    />
                )}
            </div>

            {/* Modals */}
            {selectedUser && (
                <>
                    <EditUserModal
                        user={selectedUser}
                        isOpen={isEditModalOpen}
                        onClose={() => setIsEditModalOpen(false)}
                        onSuccess={handleEditSuccess}
                    />
                    <DeleteUserModal
                        user={selectedUser}
                        isOpen={isDeleteModalOpen}
                        onClose={() => setIsDeleteModalOpen(false)}
                        onSuccess={handleDeleteSuccess}
                    />
                </>
            )}

            {/* Toast Notification */}
            <Toast
                message={toastMessage}
                isVisible={showToast}
                onClose={() => setShowToast(false)}
            />
        </div>
    );
}

function UsersIcon({ size, className }: { size?: number, className?: string }) {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width={size}
            height={size}
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
