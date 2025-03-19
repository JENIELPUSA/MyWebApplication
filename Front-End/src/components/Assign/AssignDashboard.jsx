import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";


function DashboardFinal() {
  return (
    <div className="w-full bg-gray-300 flex flex-col">
      {/* Floating Navbar */}
      <div className="fixed top-0 left-0 w-full shadow-md bg-white z-50">
        <Navbar />
      </div>

      {/* Conditional Rendering for Laboratory */}
      {laboratory ? (
      
        <div className="flex-1 flex flex-col relative z-10 bg-white pt-5 mx-10 px-5">
          {/* Dashboard Header */}
          <div className="mx-10 my-6 px-4 sm:px-10 bg-transparent flex-grow flex flex-col gap-4 sm:gap-10">
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
        <div className="flex-1 flex flex-col relative z-10 bg-white pt-5 mx-10 px-5">
          {/* Dashboard Header */}
          <div className="mx-10 my-6 px-4 sm:px-10 bg-transparent flex-grow flex flex-col gap-4 sm:gap-10">
            <div className="flex justify-between items-center py-4 border-b border-gray-300">
              <div className="text-3xl font-bold text-blue-600">Dashboard</div>
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
                        Dashboard
                      </a>
                    </li>
                  </ol>
                </nav>
              </div>
            </div>

            {/* Dashboard Cards and Charts */}
            <div className="gap-6">
              <DashboardCard />
            </div>
            <div className="flex flex-col lg:flex-row gap-6">
              <div className="p-6 rounded-lg flex-[1]">
                <DashboardPieChart />
              </div>
              <div className="p-6 mb-20 rounded-lg shadow-lg flex-[2] bg-white">
                <AssignLab />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardFinal;
