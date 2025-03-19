import React from "react";
import Navbar from "./components/Navbar"; // Ensure correct import path
import { useLocation } from "react-router-dom";
import MaintenanceDisplay from "./components/Maintenance/MaintenanceDisplay";
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
    </div>
  );
}




function LaboratoryView() {
  return (
    <div className="mx-20 my-6 px-4 sm:px-10 bg-transparent flex-grow flex flex-col gap-4 sm:gap-10">
      {/* Dashboard Header */}
      <Header title="Laboratories" />
    </div>
  );
}




function DashboardView() {
  return (
    <div className="flex-1 flex flex-col bg-gray-300 px-4 overflow-y-auto">
      <div className="mx-4 my-6 px-20 sm:px-10 bg-transparent flex-grow flex flex-col gap-2 sm:gap-10">
        {/* Dashboard Header */}
        <Header title="Laboratories" />
        {/* Maintenance Display Section */}
        <div className="p-2 mb-auto flex-[2]">
          <MaintenanceDisplay/>
        </div>
      </div>
    </div>
  );
}

function Header({ title }) {
  return (
    <div className="flex justify-between items-center py-4 border-b border-gray-300">
      <h1 className="text-3xl font-bold text-blue-600">{title}</h1>
      <nav className="bg-transparent text-black py-2 px-4">
        <ol className="list-reset flex">
          <li className="mr-4">
            <a
              href="/dashboardfinal"
              className="text-blue-600 hover:text-blue-800 transition-colors"
            >
              Home
            </a>
          </li>
          <li className="mr-4">/</li>
          <li className="text-blue-600">Laboratories</li>
        </ol>
      </nav>
    </div>
  );
}

export default RequestMaintenance;
