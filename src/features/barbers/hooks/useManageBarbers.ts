import { useEffect, useState } from "react";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import type { Barber } from "../types";
import { BarbersService } from "../api/barbers.service";

export function useManageBarbers() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
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
            if (!tenant?.slug) return;

            try {
                const data = await BarbersService.getAll(tenant.slug);
                setBarbers(data);
            } catch (err) {
                const message = handleError(err, 'useManageBarbers');
                setError(message);
            } finally {
                setLoading(false);
            }
        }

        load();
    }, [tenant?.slug, handleError]);

    // Clean payload before sending
    const cleanPayload = (payload: Partial<Barber>) => {
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

    const createBarber = async (payload: Partial<Barber>) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const body = cleanPayload(payload);
            const created = await BarbersService.create(tenant.slug, body);
            setBarbers((prev) => [created, ...prev]);
            return created;
        } finally {
            setSubmitting(false);
        }
    };

    const updateBarber = async (id: string, payload: Partial<Barber>) => {
        if (!tenant?.slug) throw new Error("Tenant no disponible");
        setSubmitting(true);
        try {
            const body = cleanPayload(payload);
            const updated = await BarbersService.update(tenant.slug, id, body);
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
            await BarbersService.delete(tenant.slug, id);
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
