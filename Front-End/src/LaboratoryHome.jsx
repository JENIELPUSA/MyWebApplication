import React, { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import axios from "axios";
import { motion } from "framer-motion";

// UI Components
import Navbar from "./components/Navbar";
import Laboratory from "./components/Assign/Laboratory"; 
import Footer from "./components/Footer";

// Technical Icons
import { 
  FaHome, 
  FaFlask, 
  FaNetworkWired, 
  FaChevronRight, 
  FaDatabase,
  FaDesktop
} from "react-icons/fa";

function DashboardFinal() {
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
    <div className="w-full bg-[#e2e8f0] flex flex-col min-h-screen font-mono">
      {/* 1. SOLID TOP BAR */}
      <header className="sticky top-0 w-full bg-white z-50 border-b-8 border-[#1e3a8a] shadow-md">
        <Navbar />
      </header>

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
                {/* Dashboard Title Card */}
                <div className="bg-[#1e3a8a] p-8 text-white relative overflow-hidden shadow-lg border-b-8 border-yellow-400">
                  <div className="relative z-10">
                    <h1 className="text-4xl font-black tracking-tighter uppercase italic">Laboratories</h1>
                    <p className="text-yellow-400 text-xs font-bold tracking-[0.5em] mt-2">BIPSU_ASSET_MANAGEMENT_v1.0</p>
                    <div className="mt-6">
                      <Breadcrumbs isSpecific={false} />
                    </div>
                  </div>
                  <FaDesktop className="absolute -right-10 -bottom-10 text-white/10" size={250} />
                </div>

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

      {/* 3. HARD FOOTER */}
      <footer className="mt-auto">
        <div className="bg-white border-t-2 border-slate-300">
          <Footer />
        </div>
        <div className="bg-[#1e3a8a] px-10 py-3 flex justify-between items-center">
          <span className="text-yellow-400 text-[9px] font-black uppercase tracking-[0.2em]">Terminal_Active_2024</span>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-yellow-400" />
            <div className="w-3 h-3 bg-white/20" />
            <div className="w-3 h-3 bg-white/20" />
          </div>
        </div>
      </footer>
    </div>
  );
}

export default DashboardFinal;