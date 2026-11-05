import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "../../../context/TenantContext";
import { AnnouncementsService } from "../api/announcements.service";
import type {
    CreateAnnouncementPayload,
    UpdateAnnouncementPayload,
} from "../types";

export function useManageAnnouncements() {
    const { tenant } = useTenant();
    const queryClient = useQueryClient();
    const slug = tenant?.slug;

    const {
        data: announcements = [],
        isLoading: loading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['announcements', slug],
        queryFn: AnnouncementsService.getTenantAnnouncements,
        enabled: !!slug,
    });

    const invalidate = () =>
        queryClient.invalidateQueries({ queryKey: ['announcements'] });

    const createMutation = useMutation({
        mutationFn: (payload: CreateAnnouncementPayload) =>
            AnnouncementsService.create(payload),
        onSuccess: invalidate,
    });

    const updateMutation = useMutation({
        mutationFn: ({
            id,
            payload,
        }: {
            id: string;
            payload: UpdateAnnouncementPayload;
        }) => AnnouncementsService.update(id, payload),
        onSuccess: invalidate,
    });

    const deleteMutation = useMutation({
        mutationFn: (id: string) => AnnouncementsService.delete(id),
        onSuccess: invalidate,
    });

    return {
        announcements,
        loading,
        error: error ? (error as Error).message : null,
        refetch,
        submitting:
            createMutation.isPending ||
            updateMutation.isPending ||
            deleteMutation.isPending,
        createAnnouncement: (payload: CreateAnnouncementPayload) =>
            createMutation.mutateAsync(payload),
        updateAnnouncement: (id: string, payload: UpdateAnnouncementPayload) =>
            updateMutation.mutateAsync({ id, payload }),
        deleteAnnouncement: (id: string) => deleteMutation.mutateAsync(id),
    };
}
