import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
<<<<<<< HEAD
import { motion, useInView, AnimatePresence } from "framer-motion";
import { FaTerminal, FaChartLine, FaFlask, FaTools, FaHome, FaChevronRight } from "react-icons/fa";

// Components
=======
import axios from "axios";
import { io } from "socket.io-client";
import MonthlyTableGraph from "./MonthlyGraph";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import Navbar from "./components/Navbar";
import DashboardCard from "./components/DashboardCard";
import AssignLab from "./components/Assign/AssignLab";
import DashboardPieChart from "./components/DashboarPieChart";
import Laboratory from "./components/Assign/Laboratory";
import TechnicianTable from "./components/Technician/TechnicianTable";
import Footer from "./components/Footer";
<<<<<<< HEAD
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
=======
import { AuthContext } from "./components/Context/AuthContext";
import { LaboratoryDisplayContext } from "./components/Context/Laboratory/Display";
import { FilterSpecificAssignContext } from "./components/Context/AssignContext/FilterSpecificAssign";
import { IncomingDisplayContext } from "./components/Context/ProcessIncomingRequest/IncomingRequestContext";
import { motion, useInView } from "framer-motion";
import MobileMenu from "./components/MobileMenu";
function DashboardFinal({ specificData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { authToken, role } = useContext(AuthContext);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const { fetchIncomingData } = useContext(IncomingDisplayContext);
  const location = useLocation();
  const navigate = useNavigate();

  const laboratory = location.state?.laboratory;
<<<<<<< HEAD
=======
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const handleSelectDisplay = (selectedAssignEquipment) => {
    navigate("/RequestMaintenances", { state: { selectedAssignEquipment } });
  };

<<<<<<< HEAD
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
=======
  // Fetch department data if laboratory is present
  useEffect(() => {
    if (!laboratory?._id || !authToken) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${
            import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
          }/api/v1/departments`,
          {
            headers: { Authorization: `Bearer ${authToken}` },
          }
        );

        if (Array.isArray(response.data?.data)) {
          setData(response.data.data);
        } else {
          setError("Unexpected data format from API.");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        setError("Failed to fetch department data.");
      }
    };
    if (role == "admin") {
      fetchIncomingData();
    }
    fetchData();
  }, [laboratory?._id, authToken]);

  return (
<div className="w-full bg-gray-300 flex flex-col min-h-screen">
  {/* Navbar */}
  <div className="w-full shadow-md bg-white z-50">
    <Navbar />
  </div>

  {/* Main Content with Motion Effect */}
  <motion.main
    ref={ref}
    initial={{ opacity: 0, y: 50 }}
    animate={isInView ? { opacity: 1, y: 0 } : {}}
    transition={{ duration: 0.6, ease: "easeOut" }}
    className="w-full flex-1 px-2 2xs:px-4 xs:px-4 xm:px-6 sm:px-10 md:px-16 lg:px-20 xl:px-40 mx-auto py-4"
  >
    {laboratory ? (
      <LaboratoryView laboratory={laboratory} />
    ) : (
      <DashboardView
        role={role}
        laboratoryData={laboratoryData}
        onSelect={handleSelectDisplay}
      />
    )}
  </motion.main>
  {/* Footer */}
  <div className="w-full shadow-md bg-white mt-auto">
    <Footer />
  </div>
</div>

  );
}

export default DashboardFinal;

/* === Separated components below === */

const LaboratoryView = ({ laboratory }) => (
  <div className="mx-10 my-6 px-4 sm:px-10 flex-grow flex flex-col gap-4 sm:gap-10">
    <DashboardHeader title="Laboratories" />
    <div className="flex flex-col lg:flex-row gap-6">
      <div className="p-6 mb-20 rounded-lg shadow-lg flex-[2] bg-white">
        <Laboratory laboratoryId={laboratory._id} />
      </div>
    </div>
  </div>
);

const DashboardView = ({ role, laboratoryData, onSelect }) => (
  <div className="flex-1 flex flex-col relative z-10 sm:px-8 lg:px-16">
    <div className=" sm:px-10 flex-grow flex flex-col gap-2 sm:gap-10">
      <DashboardHeader title={getDashboardTitle(role)} />
      <DashboardContent
        role={role}
        laboratoryData={laboratoryData}
        onSelect={onSelect}
      />
    </div>
  </div>
);

const DashboardHeader = ({ title }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-200">
    <div className=" lg:text-3xl sm:text-2xl xs:text-lg text-3xl font-bold text-blue-600">
      {title}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
    <Breadcrumbs current={title} />
  </div>
);

const Breadcrumbs = ({ current }) => (
<<<<<<< HEAD
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
=======
  <nav className="bg-transparent text-black py-2 px-4 2xs:px-3 xs:px-4 xs-max:px-6 xm:px-8 sm:px-10 md:px-20 lg:px-40">
    <ol className="list-reset flex">
      <li className="mr-4">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          Home
        </a>
      </li>
      <li className="mr-4">/</li>
      <li className="mr-4">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 transition-colors text-sm"
        >
          {current}
        </a>
      </li>
    </ol>
  </nav>
);

const DashboardContent = ({ role, laboratoryData, onSelect }) => (
  <div>
    <DashboardCard Laboratory={laboratoryData} />
    {role === "Admin" && <AdminDashboard />}
    {role === "User" && (
      <UserDashboard onSelect={onSelect} laboratoryData={laboratoryData} />
    )}
    {role === "Technician" && <TechnicianDashboard />}
  </div>
);

const AdminDashboard = () => (
  <div className="flex flex-col lg:flex-row xs:gap-0 sm:gap-2 lg:gap-2">
    {/* Left side: Two items stacked vertically */}
    <div className="flex flex-col lg:w-[calc(25%-1.5rem)] gap-3">
      <div className="rounded-lg flex-[1] hidden md:block">
        <MonthlyTableGraph />
      </div>
      <div className="rounded-lg flex-[2] hidden md:block">
        <DashboardPieChart />
      </div>
    </div>
    {/* Right side: One item (AssignLab), grows to match the height of two left-side items */}
    <div className="flex flex-col gap-6 xs:mx-0 xs:p-4 mb-auto rounded-lg shadow-lg flex-[1] bg-white lg:w-[calc(75%-1.5rem)] lg:h-full">
      <div className="flex-grow">
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        <AssignLab />
      </div>
    </div>
  </div>
);

const UserDashboard = ({ onSelect, laboratoryData }) => (
<<<<<<< HEAD
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
=======
  <div className="xs:mx-2 sm:mx-10 lg:mx-10">
    <button
      onClick={() => onSelect(laboratoryData)}
      className="xs:w-full sm:text-sm sm:w-1/2 lg:w-1/2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
    >
      Go to List Equipments
    </button>
  </div>
);

const TechnicianDashboard = () => (
  <div className="xs:px-2 flex flex-col lg:flex-row gap-6 px-10">
    <div className="rounded-lg bg-transparent lg:w-1/4 w-full min-w-[300px] hidden md:block">
      <DashboardPieChart />
    </div>
    <div className="w-full overflow-x-auto">
      <TechnicianTable />
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
  </div>
);

const getDashboardTitle = (role) => {
<<<<<<< HEAD
  const titles = {
    Admin: "System Overview",
    User: "Department Portal",
    Technician: "Technician Console"
  };
  return titles[role] || "Dashboard";
};

export default DashboardFinal;
=======
  if (role === "Admin") return "Dashboard";
  if (role === "User") return "In-Charge";
  if (role === "Technician") return "Technician";
  return "Dashboard";
};
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
