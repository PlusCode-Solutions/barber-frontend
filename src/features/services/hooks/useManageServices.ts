import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../../../context/TenantContext";
import { useErrorHandler } from "../../../hooks/useErrorHandler";
import type { Service } from "../types";
import { ServicesService } from "../api/services.service";

export function useManageServices() {
    const { tenant } = useTenant();
    const { handleError } = useErrorHandler();
    const queryClient = useQueryClient();
    const slug = tenant?.slug;

    // LEER
    const {
        data: services = [],
        isLoading: loading,
        error
    } = useQuery({
        queryKey: ['services', slug],
        queryFn: () => ServicesService.getAll(slug!),
        enabled: !!slug
    });

    // CREAR
    const createMutation = useMutation({
        mutationFn: (payload: Partial<Service>) => {
            if (!slug) throw new Error("Tenant no disponible");
            return ServicesService.create(slug, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', slug] });
        },
        onError: (err) => {
            handleError(err, 'createService');
        }
    });

    // ACTUALIZAR
    const updateMutation = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: Partial<Service> }) => {
            if (!slug) throw new Error("Tenant no disponible");
            return ServicesService.update(slug, id, payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', slug] });
        },
        onError: (err) => {
            handleError(err, 'updateService');
        }
    });

    // ELIMINAR
    const deleteMutation = useMutation({
        mutationFn: (id: string) => {
            if (!slug) throw new Error("Tenant no disponible");
            return ServicesService.delete(slug, id);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['services', slug] });
        },
        onError: (err) => {
            handleError(err, 'deleteService');
        }
    });

    return {
        services,
        loading,
        error: error ? (error as Error).message : null,
        submitting: createMutation.isPending || updateMutation.isPending || deleteMutation.isPending,
        
        createService: (payload: Partial<Service>) => createMutation.mutateAsync(payload),
        updateService: (id: string, payload: Partial<Service>) => updateMutation.mutateAsync({ id, payload }),
        deleteService: (id: string) => deleteMutation.mutateAsync(id),
    };
}
