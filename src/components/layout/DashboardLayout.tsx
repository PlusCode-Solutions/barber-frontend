import { Outlet } from "react-router-dom";
import UserNavbar from "./navbars/UserNavbar";
import UserAnnouncementModal from "../../features/notifications/components/UserAnnouncementModal";

export default function DashboardLayout() {
    return (
        <>
            <UserNavbar />
            <UserAnnouncementModal />
                <main className="pt-[72px] pb-28 lg:pb-6 px-4 bg-gray-50 min-h-screen">
                <Outlet />
            </main>
        </>
    );
}
