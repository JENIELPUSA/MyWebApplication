import React from "react";
import { useLocation, Link } from "react-router-dom";
import MaintenanceDisplay from "../Maintenance/MaintenanceDisplay";
import { motion } from "framer-motion";

function RequestMaintenance() {
    const location = useLocation();
    const laboratory = location.state?.selectedAssignEquipment;

    return (
        <div className="w-full flex flex-col min-h-screen font-['Poppins'] text-slate-900">
            {/* MAIN CONTENT AREA - No Navbar, No Footer */}
            <main className="flex-1 flex flex-col">
                <DashboardView />
            </main>
        </div>
    );
}

function DashboardView() {
    return (
        <div className="flex-1 flex flex-col p-4 md:p-10">
            <div className="max-w-[1500px] mx-auto w-full space-y-6">

                <MaintenanceDisplay />

            </div>
        </div>
    );
}

export default RequestMaintenance;