import { Outlet } from "react-router-dom";
import UserNavbar from "./navbars/UserNavbar";

export default function DashboardLayout() {
    return (
        <>
            <UserNavbar />
            <main className="pt-[72px] pb-6 px-4 bg-gray-50 min-h-screen">
                <Outlet />
            </main>
        </>
    );
}
