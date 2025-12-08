import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import type { Service } from "../types";
import { getServices } from "../api/getServices";
import { createService, type CreateServicePayload } from "../api/createService";
import { updateService, type UpdateServicePayload } from "../api/updateService";
import { deleteService } from "../api/deleteService";

export function useManageServices() {
    const { tenant } = useTenant();
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
            try {
                const data = await getServices(tenant.slug);
                setServices(data);
            } catch (err) {
                console.error("Error cargando servicios", err);
                setError("No se pudieron cargar los servicios. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug]);

    const handleCreate = async (payload: CreateServicePayload) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const created = await createService(tenant.slug, payload);
            setServices((prev) => [created, ...prev]);
            return created;
        } finally {
            setSubmitting(false);
        }
    };

    const handleUpdate = async (serviceId: string, payload: UpdateServicePayload) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const updated = await updateService(tenant.slug, serviceId, payload);
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
            await deleteService(tenant.slug, serviceId);
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
