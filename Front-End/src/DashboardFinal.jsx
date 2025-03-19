import React, { useState, useEffect, useContext} from "react";
import { useLocation } from "react-router-dom";
import DashboardCard from "./components/DashboardCard";
import Navbar from "./components/Navbar";
import AssignLab from "./components/Assign/AssignLab";
import DashboardPieChart from "./components/DashboarPieChart";
import { useNavigate } from "react-router-dom";
import Laboratory from "./components/Assign/Laboratory";
import axios from "axios";
import TechnicianTable from "./components/Technician/TechnicianTable"
import { io } from "socket.io-client";
import { AuthContext } from "./components/Context/AuthContext";
import {LaboratoryDisplayContext} from './components/Context/Laboratory/Display'
import { FilterSpecificAssignContext } from "./components/Context/AssignContext/FilterSpecificAssign";
function DashboardFinal({specificData}) {
  const {laboratoryData}=useContext(FilterSpecificAssignContext)
  const {laboratories} = useContext(LaboratoryDisplayContext)
  const location = useLocation();
    const navigate = useNavigate();

  const laboratory = location.state?.laboratory;
  const [data, setData] = useState([]);

  const [error, setError] = useState(null);
  const [isNewRequest, setIsNewRequest] = useState(false);

  const { authToken, role} = useContext(AuthContext);
  const socket = io("http://localhost:3000");

  const handleSelectDisplay = (selectedAssignEquipment) => {
    console.log("Selected Lab:", selectedAssignEquipment);
    navigate("/RequestMaintenances", { state: { selectedAssignEquipment } }); // Send data to another route
  };
  /* Laboratory View (Now Accepts `laboratory` as a Prop) */
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

/* Dashboard View (Now Accepts `role` as a Prop) */
const DashboardView = ({ role }) => (
  <div className="flex-1 flex flex-col relative z-10 bg-gray-300">
    <div className="mx-10 my-6 px-4 sm:px-10 flex-grow flex flex-col gap-4 sm:gap-10">
      {role==="admin"?(

<DashboardHeader title="Dashboard" />
      ):role=="user"?(
        <DashboardHeader title="In-Charge" />

      ):role==="Technician"?(
        <DashboardHeader title="Technician" />
      ):null}
      <DashboardContent role={role} />
    </div>
  </div>
);

/* Dashboard Header with Breadcrumbs */
const DashboardHeader = ({ title }) => (
  <div className="flex justify-between items-center py-4 border-b border-gray-200">
    <div className="text-3xl font-bold text-blue-600">{title}</div>
    <Breadcrumbs current={title} />
  </div>
);

/* Breadcrumbs Component */
const Breadcrumbs = ({ current }) => (
  <nav className="bg-transparent text-black py-2 px-4">
    <ol className="list-reset flex">
      <li className="mr-4">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          Home
        </a>
      </li>
      <li className="mr-4">/</li>
      <li className="mr-4">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 transition-colors"
        >
          {current}
        </a>
      </li>
    </ol>
  </nav>
);

/* Dashboard Content (Now Accepts `role` as a Prop) */
/*make a Condition like if else 
  {role === "admin" ? <AdminDashboard /> : <UserDashboard />}
*/
const DashboardContent = ({ role, laboratoryData }) => (
  <div className="gap-6">
    <DashboardCard Laboratory={laboratoryData} />
    {role === "admin" ? <AdminDashboard /> :role==="user"?<UserDashboard /> : role === "Technician"?<TechnicianDashboard/>:null}
  </div>
);

/* Admin Dashboard (Pie Chart + Assign Lab) */
const AdminDashboard = () => (
  <div className="flex flex-col lg:flex-row gap-6">
    <div className="p-6 rounded-lg flex-[1]">
      <DashboardPieChart />
    </div>
    <div className="p-6 mb-auto rounded-lg shadow-lg flex-[2] bg-white">
      <AssignLab />
    </div>
  </div>
);

/* User Dashboard (Go to Equipment Button) */
const UserDashboard = () => (

    <div className=" mx-10">
      <button 
      onClick={() => handleSelectDisplay(laboratoryData)}

      className="w-1/2 bg-gradient-to-r from-indigo-500 to-indigo-700 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105">
        Go to List Equipments
      </button>
  
  </div>
);

const TechnicianDashboard = () => (

<div className="flex flex-col lg:flex-row gap-6 px-10">
  {/* Pie Chart Section (1/4 width on large screens) */}
  <div className="rounded-lg bg-transparent lg:w-1/4 w-full min-w-[300px]">
    <DashboardPieChart />
  </div>

  {/* Technician Table Section (3/4 width on large screens) */}
  <div className="mb-auto rounded-lg shadow-lg bg-white lg:w-3/4 w-full">
    <div className="w-full overflow-x-auto">
        <TechnicianTable />
    </div>
  </div>
</div>







);

/* New Request Notification */
const NewRequestNotification = () => (
  <div className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-md">
    <p>New Maintenance Request Received!</p>
  </div>
);




  useEffect(() => {
    socket.on("maintenanceRequestAdded", (data) => {
      console.log("📢 Maintenance Request Received:", data);
      setIsNewRequest(true);
      alert(data.message);
    });

    return () => {
      socket.off("maintenanceRequestAdded");
    };
  }, []);

  

  useEffect(() => {
    if (laboratory && laboratory._id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/v1/departments`,
            {
              headers: { Authorization: `Bearer ${authToken}` },
            }
          );
          if (response.data && Array.isArray(response.data.data)) {
            setData(response.data.data);
            console.log(response.data.data);
          } else {
            setError("Unexpected data format from the API.");
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data. Please try again later.");
        }
      };

      fetchData();
    }
  }, [laboratory, authToken]);



  return (
    
    <div className="w-full bg-dark-300 flex flex-col min-h-screen">
      {/* Navbar */}
      <div className="top-0 left-0 w-full shadow-md bg-white z-50">
        <Navbar />
      </div>

      {/* Main Content */}
      {laboratory ? (
        <LaboratoryView laboratory={laboratory} />
      ) : (
        <DashboardView role={role} />
      )}

      {/* New Request Notification */}
      {isNewRequest && <NewRequestNotification />}
    </div>
  );
}



export default DashboardFinal;
