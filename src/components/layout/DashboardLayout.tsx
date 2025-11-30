import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";

export default function DashboardLayout() {
    return (
        <div className="min-h-screen bg-gray-100">
            {/* NAVBAR */}
            <Navbar />

            {/* Contenido del Dashboard */}
            <div className="pt-20 px-4">
                <Outlet />
            </div>
        </div>
    );
}
