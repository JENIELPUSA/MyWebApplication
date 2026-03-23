import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FaTerminal, FaChartLine, FaFlask, FaTools, FaHome, FaChevronRight } from "react-icons/fa";

// Components
import Navbar from "./components/Navbar";
import DashboardCard from "./components/DashboardCard";
import AssignLab from "./components/Assign/AssignLab";
import DashboardPieChart from "./components/DashboarPieChart";
import Laboratory from "./components/Assign/Laboratory";
import TechnicianTable from "./components/Technician/TechnicianTable";
import Footer from "./components/Footer";
import Sidebar from "./components/layout/Sidebar"; 
import MonthlyTableGraph from "./MonthlyGraph";

// Contexts
import { AuthContext } from "./components/Context/AuthContext";
import { FilterSpecificAssignContext } from "./components/Context/AssignContext/FilterSpecificAssign";
import { IncomingDisplayContext } from "./components/Context/ProcessIncomingRequest/IncomingRequestContext";

function DashboardFinal() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { role } = useContext(AuthContext);
  const { fetchIncomingData } = useContext(IncomingDisplayContext);
  const location = useLocation();
  const navigate = useNavigate();

  const laboratory = location.state?.laboratory;

  const handleSelectDisplay = (selectedAssignEquipment) => {
    navigate("/RequestMaintenances", { state: { selectedAssignEquipment } });
  };

  useEffect(() => {
    if (role === "Admin") {
      fetchIncomingData();
    }
  }, [role]);

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-poppins">
      <Sidebar />

      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <header className="flex-none w-full bg-white border-b border-slate-200 z-40">
          <Navbar />
        </header>

        <main className="flex-1 overflow-y-auto custom-scrollbar bg-[#f1f5f9]">
          <motion.div
            ref={ref}
            initial={{ opacity: 0, y: 15 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ duration: 0.5 }}
            className="p-4 sm:p-6 lg:p-8"
          >
            {/* Header Section */}
            <DashboardHeader 
              title={laboratory ? "Laboratory Focus" : getDashboardTitle(role)} 
              icon={laboratory ? <FaFlask /> : <FaTerminal />}
            />

            <div className="mt-2">
              <AnimatePresence mode="wait">
                {laboratory ? (
                  <motion.div
                    key="lab-view"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                  >
                    <LaboratoryView laboratory={laboratory} />
                  </motion.div>
                ) : (
                  <motion.div
                    key="dash-view"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-1"
                  >
                    {/* Metrics Row */}
                    <div className="grid grid-cols-1">
                       <DashboardCard Laboratory={laboratoryData} />
                    </div>

                    {/* Role-Based Dynamic Views */}
                    {role === "Admin" && <AdminDashboard />}
                    {role === "User" && (
                      <UserDashboard onSelect={handleSelectDisplay} laboratoryData={laboratoryData} />
                    )}
                    {role === "Technician" && <TechnicianDashboard />}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>

          <footer className="mt-4">
            <Footer />
          </footer>
        </main>
      </div>
    </div>
  );
}

/* === Sub-Components with Industrial Styling === */

const DashboardHeader = ({ title, icon, subtitle = "Industrial Asset Management System" }) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-l-4 border-yellow-400 pl-4">
    <div>
      <div className="flex items-center gap-2 text-blue-900 mb-1">
        <span className="text-xl">{icon}</span>
        <h1 className="text-2xl md:text-3xl font-black uppercase tracking-tighter">
          {title}
        </h1>
      </div>
      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        {subtitle}
      </p>
    </div>
    <Breadcrumbs current={title} />
  </div>
);

const Breadcrumbs = ({ current }) => (
  <nav className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-400 bg-white px-4 py-2 rounded-full shadow-sm border border-slate-100">
    <span className="flex items-center gap-1 hover:text-blue-600 cursor-pointer">
      <FaHome size={12} /> HOME
    </span>
    <FaChevronRight size={8} />
    <span className="text-blue-900">{current}</span>
  </nav>
);

const AdminDashboard = () => (
  <div className="space-y-8">
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
      {/* Main Monthly Trend */}
      <div className="xl:col-span-2 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
          <FaChartLine className="text-blue-600" />
          <h3 className="font-black text-slate-700 uppercase text-sm tracking-widest">Performance Analytics</h3>
        </div>
        <MonthlyTableGraph />
      </div>

      {/* Pie Distribution */}
      <div className="xl:col-span-1 bg-white rounded-[2rem] shadow-sm border border-slate-200 p-6 flex flex-col justify-center">
        <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest mb-4 text-center">Status Distribution</h3>
        <DashboardPieChart />
      </div>
    </div>

    {/* Lab Management Table */}
    <div className="bg-white rounded-[2rem] shadow-xl shadow-blue-900/5 border-2 border-slate-100 overflow-hidden">
      <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
        <div>
          <h3 className="font-black uppercase tracking-tighter text-lg">Facility Registry</h3>
          <p className="text-[10px] text-blue-300 font-bold uppercase">Central Laboratory Assignment Console</p>
        </div>
        <div className="p-2 bg-yellow-400 rounded-lg text-[#1e3a8a]">
          <FaFlask />
        </div>
      </div>
      <div className="p-6">
        <AssignLab />
      </div>
    </div>
  </div>
);

const UserDashboard = ({ onSelect, laboratoryData }) => (
  <motion.div 
    whileHover={{ y: -5 }}
    className="relative overflow-hidden group py-16 px-8 bg-white rounded-[3rem] border-2 border-dashed border-blue-200 flex flex-col items-center text-center shadow-2xl shadow-blue-900/5"
  >
    <div className="absolute top-0 right-0 p-8 opacity-5">
       <FaTools size={120} className="text-blue-900" />
    </div>
    <div className="w-16 h-16 bg-yellow-400 rounded-2xl flex items-center justify-center text-blue-900 mb-6 shadow-lg shadow-yellow-400/30">
      <FaTools size={24} />
    </div>
    <h3 className="text-2xl font-black text-blue-900 uppercase tracking-tighter mb-2">Equipment Management</h3>
    <p className="text-sm text-slate-400 max-w-md mb-8 font-medium italic">
      "Access and update your department's asset list for maintenance and tracking."
    </p>
    <button
      onClick={() => onSelect(laboratoryData)}
      className="px-12 py-4 bg-[#1e3a8a] text-yellow-400 font-black rounded-2xl shadow-xl shadow-blue-900/20 hover:bg-blue-800 transition-all uppercase tracking-[0.2em] text-xs flex items-center gap-3"
    >
      Initialize Equipment List <FaChevronRight />
    </button>
  </motion.div>
);

const TechnicianDashboard = () => (
  <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

    {/* -------------------- Load Balancing Pie Chart -------------------- */}
    <div className="xl:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
      <h3 className="font-black text-slate-700 uppercase text-xs tracking-widest mb-6 border-b pb-2">
        Load Balancing
      </h3>
      <DashboardPieChart />
    </div>

    {/* -------------------- Active Maintenance Tickets -------------------- */}
    <div className="xl:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="bg-[#1e3a8a] px-6 py-4 flex items-center gap-3">
        <FaTools className="text-yellow-400" />
        <h3 className="font-black text-white uppercase text-sm tracking-widest">
          Active Maintenance Tickets
        </h3>
      </div>
      <div className="p-6">
        <TechnicianTable />
      </div>
    </div>

    {/* -------------------- Facility / Lab Management -------------------- */}
    <div className="xl:col-span-4 bg-white rounded-2xl border-2 border-slate-100 shadow-xl shadow-blue-900/5 overflow-hidden">
      <div className="bg-[#1e3a8a] p-6 flex justify-between items-center text-white">
        <div>
          <h3 className="font-black uppercase tracking-tighter text-lg">
            Facility Registry
          </h3>
          <p className="text-[10px] text-blue-300 font-bold uppercase">
            Central Laboratory Assignment Console
          </p>
        </div>
        <div className="p-2 bg-yellow-400 rounded-lg text-[#1e3a8a]">
          <FaFlask />
        </div>
      </div>
      <div className="p-6">
        <AssignLab />
      </div>
    </div>

  </div>
);
const LaboratoryView = ({ laboratory }) => (
  <div className="space-y-6">
    <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-200 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-yellow-400" />
      <Laboratory laboratoryId={laboratory._id} />
    </div>
  </div>
);

const getDashboardTitle = (role) => {
  const titles = {
    Admin: "System Overview",
    User: "Department Portal",
    Technician: "Technician Console"
  };
  return titles[role] || "Dashboard";
};

export default DashboardFinal;
