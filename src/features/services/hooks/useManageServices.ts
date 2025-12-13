import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import type { Service } from "../types";
import { ServicesService } from "../api/services.service";

export function useManageServices() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        if (!tenant?.slug) {
            setLoading(false);
            return;
        }

        async function load() {
            if (!tenant?.slug) return;

            try {
                const data = await ServicesService.getAll(tenant.slug);
                setServices(data);
            } catch (err) {
                const message = handleError(err, 'useManageServices');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug, handleError]);

    const handleCreate = async (payload: Partial<Service>) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const created = await ServicesService.create(tenant.slug, payload);
            setServices((prev) => [created, ...prev]);
            return created;
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (serviceId: string, payload: Partial<Service>) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const updated = await ServicesService.update(tenant.slug, serviceId, payload);
            setServices((prev) => prev.map((s) => (s.id === serviceId ? updated : s)));
            return updated;
        } finally {
            setSubmitting(false);
        }
    };

    const handleDelete = async (serviceId: string) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            await ServicesService.delete(tenant.slug, serviceId);
            setServices((prev) => prev.filter((s) => s.id !== serviceId));
        } finally {
            setSubmitting(false);
        }
    };

    return {
        services,
        loading,
        error,
        submitting,
        createService: handleCreate,
        updateService: handleUpdate,
        deleteService: handleDelete,
    };
}
