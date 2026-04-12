import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import type { Professional } from "../types";
import { ProfessionalsService } from "../api/professionals.service";

export function useManageProfessionals() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const queryClient = useQueryClient();
    const slug = tenant?.slug;

    // LEER
    const {
        data: professionals = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['professionals', slug],
        queryFn: () => ProfessionalsService.getAll(slug!),
        enabled: !!slug
    });

    // Clean payload helper
    const cleanPayload = (payload: Partial<Professional>) => {
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
        mutationFn: (payload: Partial<Professional> | FormData) => {
            if (!slug) throw new Error("Tenant no disponible");
            const body = payload instanceof FormData ? payload : cleanPayload(payload);
            return ProfessionalsService.create(slug, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals', slug] });
        },
        onError: (err) => {
            handleError(err, 'createProfessional');
        }
    });

    // ACTUALIZAR
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Professional> | FormData }) => {
            if (!slug) throw new Error("Tenant no disponible");
            const body = payload instanceof FormData ? payload : cleanPayload(payload);
            return ProfessionalsService.update(slug, id, body);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals', slug] });
        },
        onError: (err) => {
            handleError(err, 'updateProfessional');
        }
    });

    // ELIMINAR
    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            if (!slug) throw new Error("Tenant no disponible");
            return ProfessionalsService.delete(slug, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['professionals', slug] });
        },
        onError: (err) => {
            handleError(err, 'deleteProfessional');
        }
    });

    return {
        professionals,
        loading,
        error: error ? (error as Error).message : null,
        submitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,

        createProfessional: (payload: Partial<Professional> | FormData) => createMutation.mutateAsync(payload),
        updateProfessional: (id: string, payload: Partial<Professional> | FormData) => updateMutation.mutateAsync({ id, payload }),
        deleteProfessional: (id: string) => deleteMutation.mutateAsync(id),
    };
}
