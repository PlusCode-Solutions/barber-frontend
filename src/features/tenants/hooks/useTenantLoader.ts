import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import { TenantsService } from "../api/tenants.service";

export function useTenantLoader(slug: string) {
    const { tenant, setTenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!slug || slug === 'admin') {
            setLoading(false);
            return;
        }

        async function load() {
            try {
                setLoading(true);

                // Skip if already loaded
                if (tenant && tenant.slug === slug) {
                    setLoading(false);
                    return;
                }

                const data = await TenantsService.getBySlug(slug);
                setTenant(data);

            } catch (err) {
                const message = handleError(err, 'useTenantLoader');
                setError(message || "No se encontró la professionalía");
            }

            setLoading(false);
        }

        load();
    }, [slug, tenant, setTenant, handleError]);

    useEffect(() => {
        if (tenant) {
            // Actualizar Título de la pestaña
            document.title = tenant.name;

            // URL del logo (si no tiene, usa por defecto)
            const iconUrl = tenant.logoUrl || '/icon/icon-barber.png';
            
            // Actualizar Favicon
            let favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
            if (favicon) favicon.href = iconUrl;

            // Actualizar Nombre para PWA / Guardar en Pantalla de Inicio
            let appleTitle = document.querySelector('meta[name="apple-mobile-web-app-title"]') as HTMLMetaElement;
            if (appleTitle) appleTitle.content = tenant.name;

            // Actualizar Icono para PWA / Guardar en Pantalla de Inicio (iOS y Android moderno)
            let appleIcons = document.querySelectorAll('link[rel="apple-touch-icon"]');
            appleIcons.forEach(icon => {
                (icon as HTMLLinkElement).href = iconUrl;
            });
        }
    }, [tenant]);

    return { tenant, loading, error };
}
