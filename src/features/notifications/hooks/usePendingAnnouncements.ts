import { useQuery } from "@tanstack/react-query";
import { useAuth } from "../../../context/AuthContext";
import { AnnouncementsService } from "../api/announcements.service";

export function usePendingAnnouncements() {
    const { user, isAuthenticated } = useAuth();
    const tenantId = user?.tenantId;
    const enabled =
        isAuthenticated && user?.role === 'USER' && !!tenantId;

    const { data: announcements = [], isLoading: loading } = useQuery({
        queryKey: ['pending-announcements', tenantId],
        queryFn: AnnouncementsService.getPending,
        enabled,
        staleTime: 0,
        refetchOnMount: 'always',
    });

    return { announcements, loading };
}
