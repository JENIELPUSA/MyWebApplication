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








function DashboardView() {
  return (
    <div className="flex-1 flex flex-col bg-gray-300 px-4 overflow-y-auto">
      <div className="mx-4 px-20 my-6 bg-transparent flex-grow flex flex-col gap-2 xs:px-2 sm:px-6 md:px-10 lg:px-20 xl:px-40 ">
        {/* Dashboard Header */}
        <Header title="Laboratories" />

        {/* Maintenance Display Section */}
          <MaintenanceDisplay />
      </div>
    </div>
  );
}


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
