import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import type { Barber, CreateBarberDto, UpdateBarberDto } from "../types";
import { getBarbers } from "../api/getBarbers";
import { createBarber as apiCreate } from "../api/createBarber";
import { updateBarber as apiUpdate } from "../api/updateBarber";
import { deleteBarber as apiDelete } from "../api/deleteBarber";

export function useManageBarbers() {
    const { tenant } = useTenant();
    const [barbers, setBarbers] = useState<Barber[]>([]);
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
                const data = await getBarbers(tenant.slug);
                setBarbers(data);
            } catch (err) {
                console.error("Error cargando barberos", err);
                setError("No se pudieron cargar los barberos. Inténtalo más tarde.");
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug]);

    const cleanPayload = (payload: CreateBarberDto | UpdateBarberDto) => {
        const body: Record<string, unknown> = {};

        if (payload.name !== undefined) {
            const name = payload.name.trim();
            if (name) body.name = name;
        }

        if (payload.specialty !== undefined) {
            const specialty = payload.specialty?.trim();
            if (specialty) body.specialty = specialty;
        }

        if (payload.avatar !== undefined) {
            const avatar = payload.avatar?.trim();
            if (avatar) body.avatar = avatar;
        }

        return body;
    };

    const createBarber = async (payload: CreateBarberDto) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const body = cleanPayload(payload);
            const created = await apiCreate(tenant.slug, body as CreateBarberDto);
            setBarbers((prev) => [created, ...prev]);
            return created;
        } finally {
            setSubmitting(false);
        }
    };

    const updateBarber = async (id: string, payload: UpdateBarberDto) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const body = cleanPayload(payload);
            const updated = await apiUpdate(tenant.slug, id, body as UpdateBarberDto);
            setBarbers((prev) => prev.map((b) => (b.id === id ? updated : b)));
            return updated;
        } finally {
            setSubmitting(false);
        }
    };

    const deleteBarber = async (id: string) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            await apiDelete(tenant.slug, id);
            setBarbers((prev) => prev.filter((b) => b.id !== id));
        } finally {
            setSubmitting(false);
        }
    };

    return {
        barbers,
        loading,
        error,
        submitting,
        createBarber,
        updateBarber,
        deleteBarber,
    };
}
