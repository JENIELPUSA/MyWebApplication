import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

// UI Components
import Laboratory from "../Assign/Laboratory";
import Footer from "../Footer";

// Technical Icons
import {
    FaHome,
    FaDatabase,
    FaDesktop,
    FaChevronRight
} from "react-icons/fa";

function LaboratoryHome() {
    const location = useLocation();
    const laboratory = location.state?.laboratory;
    const [data, setData] = useState([]);
    const [error, setError] = useState(null);
    const token = localStorage.getItem("token");

    useEffect(() => {
        if (laboratory && laboratory._id) {
            const fetchData = async () => {
                try {
                    const response = await axios.get(
                        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
                        { headers: { Authorization: `Bearer ${token}` } }
                    );
                    if (response.data && Array.isArray(response.data.data)) {
                        setData(response.data.data);
                    } else {
                        setError("Unexpected data format.");
                    }
                } catch (err) {
                    setError("Sync Error.");
                }
            };
            fetchData();
        }
    }, [laboratory, token]);

    // Command-line Style Breadcrumbs
    const Breadcrumbs = ({ isSpecific }) => (
        <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tighter text-slate-500">
            <Link to="/dashboardfinal" className="hover:text-[#1e3a8a] flex items-center gap-1 transition-colors">
                <FaHome className="text-yellow-600" /> DASHBOARD
            </Link>
            <FaChevronRight className="text-[9px] text-slate-400" />
            <span className={isSpecific ? "text-slate-400" : "text-[#1e3a8a] font-black"}>LABORATORY_REGISTRY</span>
            {isSpecific && (
                <>
                    <FaChevronRight className="text-[9px] text-slate-400" />
                    <span className="text-[#1e3a8a] font-black underline decoration-yellow-400 decoration-2">CORE_VIEW</span>
                </>
            )}
        </nav>
    );

    return (
        <div className="w-full flex flex-col min-h-screen font-mono">
            <main className="flex-grow">
                {laboratory ? (
                    /* SECTION: LABORATORY TELEMETRY (SPECIFIC) */
                    <div className="p-4 md:p-10">
                        <div className="max-w-[1600px] mx-auto space-y-4">
                            {/* Header Box */}
                            <div className="bg-white p-6 border-l-[12px] border-[#1e3a8a] shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div className="space-y-1">
                                    <div className="flex items-center gap-3">
                                        <FaDatabase className="text-yellow-500" size={20} />
                                        <h1 className="text-2xl font-black text-slate-900 uppercase">System Telemetry</h1>
                                    </div>
                                    <Breadcrumbs isSpecific={true} />
                                </div>
                                <div className="px-4 py-2 bg-blue-50 border border-blue-200 text-[#1e3a8a] text-[10px] font-black uppercase tracking-widest">
                                    Status: Secure_Connection
                                </div>
                            </div>

                            {/* Main Laboratory Content */}
                            <div className="bg-white border-2 border-slate-300">
                                <div className="bg-yellow-400 px-6 py-2 text-[10px] font-black text-[#1e3a8a] uppercase tracking-[0.3em]">
                                    Data_Extraction_Field
                                </div>
                                <div className="p-4">
                                    <Laboratory laboratoryId={laboratory} />
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* SECTION: ASSET OVERVIEW (MAIN) */
                    <div className="p-4 md:p-10">
                        <div className="max-w-[1500px] mx-auto">
                            <div className="grid grid-cols-1 gap-6">
                                {/* Main Component Card */}
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="bg-white border-2 border-slate-300"
                                >
                                    <div className="p-1 sm:p-4">
                                        <Laboratory />
                                    </div>
                                </motion.div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}

export default LaboratoryHome;