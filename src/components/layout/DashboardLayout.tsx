import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />

            <main className="pt-20 px-4 pb-10">
                <Outlet />
            </main>
        </div>
    );
}
