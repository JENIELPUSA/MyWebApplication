import React from "react";
<<<<<<< HEAD
import Navbar from "./components/Navbar"; 
import { useLocation, Link } from "react-router-dom";
import MaintenanceDisplay from "./components/Maintenance/MaintenanceDisplay";
import Footer from "./components/Footer";
import { FaToolbox, FaHome, FaChevronRight, FaCogs } from "react-icons/fa";
import { motion } from "framer-motion";

function RequestMaintenance() {
  const location = useLocation();
  const laboratory = location.state?.selectedAssignEquipment;

  return (
    <div className="w-full bg-[#e2e8f0] flex flex-col min-h-screen font-mono text-slate-900">
      {/* 1. SOLID TOP BAR */}
      <header className="sticky top-0 w-full bg-white z-50 border-b-8 border-[#1e3a8a] shadow-md">
        <Navbar />
      </header>

      {/* 2. MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col">
        <DashboardView />
      </main>

      {/* 3. HARD FOOTER */}
      <footer className="mt-auto">
        <div className="bg-white border-t-2 border-slate-300">
          <Footer />
        </div>
        <div className="bg-[#1e3a8a] px-10 py-3 flex justify-between items-center">
          <span className="text-yellow-400 text-[9px] font-black uppercase tracking-[0.2em]">
            Maintenance_Module_Active
          </span>
          <div className="flex gap-2">
            <div className="w-3 h-3 bg-yellow-400" />
            <div className="w-3 h-3 bg-white/20" />
          </div>
        </div>
      </footer>
=======
import Navbar from "./components/Navbar"; // Ensure correct import path
import { useLocation } from "react-router-dom";
import MaintenanceDisplay from "./components/Maintenance/MaintenanceDisplay";
import Footer from "./components/Footer";
function RequestMaintenance() {
  const location = useLocation();
const laboratory = location.state?.selectedAssignEquipment;


  return (
    <div className="w-full bg-gray-300 flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="top-0 left-0 w-full shadow-md bg-white z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {laboratory ? (
              <DashboardView  />
        ) : (
          <DashboardView />
        )}
      </div>

        {/* Footer */}
  <div className="w-full shadow-md bg-white z-50 mt-auto">
    <Footer />
  </div>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
  );
}

<<<<<<< HEAD
function DashboardView() {
  return (
    <div className="flex-1 flex flex-col p-4 md:p-10">
      <div className="max-w-[1500px] mx-auto w-full space-y-6">
        
        {/* HEADER SECTION */}
        <div className="bg-[#1e3a8a] p-8 text-white shadow-lg border-b-8 border-yellow-400 relative overflow-hidden">
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-2">
              <div className="p-3 bg-yellow-400 text-[#1e3a8a] rounded-lg shadow-md">
                <FaToolbox size={24} />
              </div>
              <h1 className="text-4xl font-black tracking-tighter uppercase italic">
                Maintenance Logs
              </h1>
            </div>
            <p className="text-yellow-400 text-[10px] font-bold tracking-[0.4em] mb-6">
              SYSTEM_SERVICE_REGISTRY_V1
            </p>
            <HeaderBreadcrumbs title="Maintenance_Display" />
          </div>
          {/* Background Decorative Icon */}
          <FaCogs className="absolute -right-12 -bottom-12 text-white/5" size={280} />
        </div>

        {/* MAINTENANCE CONTENT BOX */}
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-slate-300 shadow-sm"
        >
          {/* Top Info Bar */}
          <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 flex justify-between items-center">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> 
              Active Terminal Records
            </span>
          </div>

          <div className="p-2 sm:p-6">
            <MaintenanceDisplay />
          </div>
        </motion.div>

=======







function DashboardView() {
  return (
    <div className="flex-1 flex flex-col bg-gray-300 overflow-y-auto">
      <div className="mx-2 px-20 my-6 bg-transparent flex-grow flex flex-col gap-2 xs:px-2 sm:px-6 md:px-10 lg:px-20 xl:px-40 ">
        {/* Dashboard Header */}
        <Header title="Laboratories" />

        {/* Maintenance Display Section */}
          <MaintenanceDisplay />
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      </div>
    </div>
  );
}

<<<<<<< HEAD
function HeaderBreadcrumbs({ title }) {
  return (
    <nav className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-tighter">
      <Link 
        to="/dashboardfinal" 
        className="text-blue-200 hover:text-yellow-400 flex items-center gap-1 transition-colors"
      >
        <FaHome className="text-yellow-400" /> HOME
      </Link>
      <FaChevronRight className="text-[9px] text-blue-300" />
      <span className="text-white font-black underline decoration-yellow-400 decoration-2">
        {title.toUpperCase()}
      </span>
    </nav>
  );
}

export default RequestMaintenance;
=======

function Header({ title }) {
  return (
    <div className=" font-poppins flex flex-col sm:flex-row justify-between items-start sm:items-center py-4 border-b border-gray-300 gap-2">
      <h1 className="text-3xl font-bold text-blue-600">{title}</h1>

      <nav className="bg-transparent text-black">
        <ol className="list-reset flex text-sm flex-wrap">
          <li className="mr-2">
            <a
              href="/dashboardfinal"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Home
            </a>
          </li>
          <li className="mr-2 text-gray-500">/</li>
          <li className="text-blue-600" aria-current="page">
            Laboratories
          </li>
        </ol>
      </nav>
    </div>
  );
}


export default RequestMaintenance;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
