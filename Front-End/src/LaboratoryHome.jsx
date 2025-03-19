import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import DashboardCard from "./components/DashboardCard";
import Navbar from "./components/Navbar";
import AssignLab from "./components/Assign/AssignLab";
import DashboardPieChart from "./components/DashboarPieChart";
import Laboratory from "./components/Assign/Laboratory";  // Import Laboratory
import axios from "axios";

function DashboardFinal() {
  const location = useLocation();
  const laboratory = location.state?.laboratory;
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");

  // Fetch data only if laboratory is available
  useEffect(() => {
    if (laboratory && laboratory._id) {
      const fetchData = async () => {
        try {
          const response = await axios.get(
            `http://127.0.0.1:3000/api/v1/departments`, // Modify the endpoint as needed
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          );
          if (response.data && Array.isArray(response.data.data)) {
            setData(response.data.data);
            console.log(response.data.data); // Logs data to console for debugging
          } else {
            setError("Unexpected data format from the API.");
          }
        } catch (err) {
          console.error("Error fetching data:", err);
          setError("Failed to fetch data. Please try again later.");
        }
      };

      fetchData(); // Call the fetch function only when laboratory exists
    }
  }, [laboratory, token]); // Depend on laboratory and token

  return (
    <div className="w-full bg-gray-300 flex flex-col min-h-screen">
      {/* Floating Navbar */}
      <div className="top-0 left-0 w-full shadow-md bg-white z-50">
        <Navbar />
      </div>
  
      {/* Conditional Rendering for Laboratory */}
      {laboratory ? (
        <div >
          {/* Dashboard Header */}
          <div className="mx-2 my-6 px-4 sm:px-10 bg-transparent flex-grow flex flex-col gap-4 sm:gap-10">
            <div className="flex justify-between items-center py-4 border-b border-gray-300">
              <div className="text-3xl font-bold text-blue-600">Laboratories</div>
              <div className="bg-transparent text-black py-2 px-4">
                <nav>
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
                    <li className="mr-4">
                      <a
                        href="#"
                        className="text-blue-600 hover:text-blue-800 transition-colors"
                      >
                        Laboratories
                      </a>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
  
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="p-6 mb-20 rounded-lg shadow-lg flex-[2] bg-white">
                {/* Pass the laboratoryId to the Laboratory component */}
                <Laboratory laboratoryId={laboratory} />
              </div>
            </div>
          </div>
        </div>
      ) : (
        // Main Dashboard Content
        <div className="flex-1 flex flex-col bg-gray-300 px-4 overflow-y-auto">
          {/* Dashboard Header */}
          <div className="mx-4 my-6 px-4 sm:px-10 bg-transparent flex-grow flex flex-col gap-2 sm:gap-10">
            <div className="flex justify-between items-center py-4 border-b border-gray-300">
              <div className="text-3xl font-bold text-blue-600">Laboratories</div>
              <div className="bg-transparent text-black py-2 px-4">
                <nav>
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
                        Laboratories
                      </a>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>
  
            <div className="p-6 mb-auto rounded-lg shadow-lg flex-[2] bg-white">
              <Laboratory />
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}

export default DashboardFinal;
