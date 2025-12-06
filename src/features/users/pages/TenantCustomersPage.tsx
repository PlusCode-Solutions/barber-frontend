import { UserCircle, Mail, Calendar, Search } from "lucide-react";
import { useTenantUsers } from "../hooks/useTenantUsers";
import { formatRelativeDate } from "../../../utils/dateUtils";

export default function TenantCustomersPage() {
    const { users, loading } = useTenantUsers();

    if (loading) {
        return (
            <div className="p-8 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-8">
            {/* Header */}
            <div className="bg-white px-6 py-6 shadow-sm mb-6 border-b border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-1">
                            Cartera de Clientes
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Gestiona la información de tus clientes registrados.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="bg-indigo-50 px-4 py-2 rounded-lg border border-indigo-100">
                            <span className="text-indigo-700 font-bold text-lg">
                                {users.length}
                            </span>
                            <span className="text-indigo-600 text-xs ml-2 font-medium">TOTALES</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="px-6">
                {/* Search Bar Placeholder */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 flex items-center gap-3">
                    <Search className="text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Buscar cliente por nombre o correo..."
                        className="flex-1 outline-none text-gray-700 placeholder:text-gray-400"
                    />
                </div>

                {/* Desktop Table View */}
                <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-xs text-gray-500 uppercase tracking-wider">
                                    <th className="px-6 py-4 font-semibold">Cliente</th>
                                    <th className="px-6 py-4 font-semibold">Contacto</th>
                                    <th className="px-6 py-4 font-semibold">Rol</th>
                                    <th className="px-6 py-4 font-semibold">Registrado</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-sm">
                                                    {user.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle />}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">{user.name || "Sin Nombre"}</p>
                                                    <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-600">
                                                <Mail size={16} className="text-gray-400" />
                                                <span>{user.email}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${user.role === 'TENANT_ADMIN'
                                                    ? 'bg-purple-50 text-purple-700 border-purple-100'
                                                    : 'bg-blue-50 text-blue-700 border-blue-100'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2 text-gray-500 text-sm">
                                                <Calendar size={14} />
                                                {formatRelativeDate(user.createdAt)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {users.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="px-6 py-12 text-center text-gray-500">
                                            No se encontraron clientes registrados.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="md:hidden space-y-4">
                    {users.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 text-center text-gray-500 border border-gray-200">
                            No se encontraron clientes registrados.
                        </div>
                    ) : (
                        users.map((user) => (
                            <div key={user.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-5 hover:shadow-md transition-shadow">
                                {/* Header con Avatar y Nombre */}
                                <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-100">
                                    <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold">
                                        {user.name ? user.name.substring(0, 2).toUpperCase() : <UserCircle size={24} />}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-bold text-gray-900 text-lg">{user.name || "Sin Nombre"}</p>
                                        <p className="text-xs text-gray-400">ID: {user.id.slice(0, 8)}...</p>
                                    </div>
                                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.role === 'TENANT_ADMIN'
                                            ? 'bg-purple-50 text-purple-700 border-purple-100'
                                            : 'bg-blue-50 text-blue-700 border-blue-100'
                                        }`}>
                                        {user.role}
                                    </span>
                                </div>

                                {/* Detalles */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-600">
                                        <Mail size={16} className="text-gray-400" />
                                        <span className="text-sm">{user.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <Calendar size={14} className="text-gray-400" />
                                        <span>Registrado {formatRelativeDate(user.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
