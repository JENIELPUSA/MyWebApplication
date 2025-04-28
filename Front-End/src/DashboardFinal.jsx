import React, { useState, useEffect, useContext, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { io } from "socket.io-client";

import Navbar from "./components/Navbar";
import DashboardCard from "./components/DashboardCard";
import AssignLab from "./components/Assign/AssignLab";
import DashboardPieChart from "./components/DashboarPieChart";
import Laboratory from "./components/Assign/Laboratory";
import TechnicianTable from "./components/Technician/TechnicianTable";

import { AuthContext } from "./components/Context/AuthContext";
import { LaboratoryDisplayContext } from "./components/Context/Laboratory/Display";
import { FilterSpecificAssignContext } from "./components/Context/AssignContext/FilterSpecificAssign";
import { IncomingDisplayContext } from "./components/Context/ProcessIncomingRequest/IncomingRequestContext";
import { motion, useInView } from "framer-motion";
function DashboardFinal({ specificData }) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const { laboratoryData } = useContext(FilterSpecificAssignContext);
  const { authToken, role } = useContext(AuthContext);
  const { fetchIncomingData } = useContext(IncomingDisplayContext);
  const location = useLocation();
  const navigate = useNavigate();


  const laboratory = location.state?.laboratory;
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  

  const handleSelectDisplay = (selectedAssignEquipment) => {
    navigate("/RequestMaintenances", { state: { selectedAssignEquipment } });
  };

  // Fetch department data if laboratory is present
  useEffect(() => {
    if (!laboratory?._id || !authToken) return;

    const fetchData = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
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
      <div className="top-0 left-0 w-full shadow-md bg-white z-50">
        <Navbar />
      </div>

      <motion.main
        ref={ref}
        initial={{ opacity: 0, y: 50 }}
        animate={isInView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="
    w-full
    flex-1
    px-2
    2xs:px-3
    xs:px-4
    xm:px-6
    sm:px-10
    md:px-16
    lg:px-20
    xl:px-40
    mx-auto
    py-4
  "
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
  <div className="flex-1 flex flex-col relative z-10">
    <div className=" sm:px-10 flex-grow flex flex-col gap-4 sm:gap-10">
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
    <div className=" lg:text-3xl sm:text-2xl xs:text-lg text-3xl font-bold text-blue-600">{title}</div>
    <Breadcrumbs current={title} />
  </div>
);

const Breadcrumbs = ({ current }) => (
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
    {role === "admin" && <AdminDashboard />}
    {role === "user" && (
      <UserDashboard onSelect={onSelect} laboratoryData={laboratoryData} />
    )}
    {role === "Technician" && <TechnicianDashboard />}
  </div>
);

const AdminDashboard = () => (
  <div className="flex flex-col lg:flex-row gap-6">
    {/*purpose nito hidden md:block tinatago ang DashboardPieChart if tapos na sa tablet pababa*/}
    <div className="p-6 rounded-lg flex-[1] hidden md:block">
      <DashboardPieChart />
    </div>
    <div className="xs:mx-2 xs:p-4 mb-auto rounded-lg shadow-lg flex-[2] bg-white">
      <AssignLab />
    </div>
  </div>
);

const UserDashboard = ({ onSelect, laboratoryData }) => (
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
      </div>
  </div>
);

const getDashboardTitle = (role) => {
  if (role === "admin") return "Dashboard";
  if (role === "user") return "In-Charge";
  if (role === "Technician") return "Technician";
  return "Dashboard";
};
