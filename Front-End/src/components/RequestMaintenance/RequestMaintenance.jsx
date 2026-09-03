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

                {/* MAINTENANCE CONTENT BOX */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border-2 border-slate-300 shadow-sm"
                >
                    {/* Top Info Bar */}
                    <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2 font-['Poppins']">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            Active Terminal Records
                        </span>
                    </div>

                    <div className="p-2 sm:p-6">
                        <MaintenanceDisplay />
                    </div>
                </motion.div>

            </div>
        </div>
    );
}

export default RequestMaintenance;