import GalleryManager from "../../tenants/components/GalleryManager";
import { useTenant } from "../../../context/TenantContext";

export default function GalleryPage() {
    const { tenant } = useTenant();

    if (!tenant) return null;

    return (
        <div className="max-w-6xl mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900">Galería de Trabajos</h1>
                <p className="text-gray-500 text-sm mt-1">
                    Administra las fotos que se muestran en tu Landing Page pública
                </p>
            </div>

            <GalleryManager
                tenantId={tenant.id}
                primaryColor={tenant.primaryColor || '#2563eb'}
            />
        </div>
    );
}
