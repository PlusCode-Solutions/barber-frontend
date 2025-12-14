import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import type { Barber } from "../types";
import { BarbersService } from "../api/barbers.service";

export function useManageBarbers() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const queryClient = useQueryClient();
    const slug = tenant?.slug;

    // LEER
    const {
        data: barbers = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['barbers', slug],
        queryFn: () => BarbersService.getAll(slug!),
        enabled: !!slug
    });

    // Clean payload helper
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

    // CREAR
    const createMutation = useMutation({
        mutationFn: (payload: Partial<Barber>) => {
            if (!slug) throw new Error("Tenant no disponible");
            const body = cleanPayload(payload);
            return BarbersService.create(slug, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers', slug] });
        },
        onError: (err) => {
            handleError(err, 'createBarber');
        }
    });

    // ACTUALIZAR
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Barber> }) => {
            if (!slug) throw new Error("Tenant no disponible");
            const body = cleanPayload(payload);
            return BarbersService.update(slug, id, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers', slug] });
        },
        onError: (err) => {
            handleError(err, 'updateBarber');
        }
    });

    // ELIMINAR
    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            if (!slug) throw new Error("Tenant no disponible");
            return BarbersService.delete(slug, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['barbers', slug] });
        },
        onError: (err) => {
            handleError(err, 'deleteBarber');
        }
    });

    return {
        barbers,
        loading,
        error: error ? (error as Error).message : null,
        submitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        
        createBarber: (payload: Partial<Barber>) => createMutation.mutateAsync(payload),
        updateBarber: (id: string, payload: Partial<Barber>) => updateMutation.mutateAsync({ id, payload }),
        deleteBarber: (id: string) => deleteMutation.mutateAsync(id),
    };
}
