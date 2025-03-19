import React, { useState } from 'react';
import { FaUser, FaCog, FaTachometerAlt, FaAngleDown } from 'react-icons/fa';

function Sidebar() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isAuthenticationOpen, setIsAuthenticationOpen] = useState(false);
  const [isDepartmentOpen, setIsDepartmentOpen] = useState(false);

  // Function to toggle the management dropdown
  const toggleManagementDropdown = () => {
    setIsManagementOpen(!isManagementOpen);
    // Close the authentication dropdown if it is open
    if (isAuthenticationOpen) setIsAuthenticationOpen(false);
  };

    // Function to toggle the management dropdown
    const toggleDepartmentDropdown = () => {
      setIsDepartmentOpen(!isManagementOpen);
      // Close the authentication dropdown if it is open
      if (isDepartmentOpen) setIsDepartmentOpen(false);
    };

  // Function to toggle the authentication dropdown
  const toggleAuthenticationDropdown = () => {
    setIsAuthenticationOpen(!isAuthenticationOpen);
    // Close the management dropdown if it is open
    if (isManagementOpen) setIsManagementOpen(false);
  };

  return (
    <div className="w-64 bg-gradient-to-r from-blue-900 to-indigo-900 fixed flex flex-col px-4 py-4 shadow-lg pt-20 h-screen">
      {/* Sidebar Header */}
      <div className="my-2 mb-4">
        <h1 className="text-3xl text-white font-bold">Admin Dashboard</h1>
      </div>

      {/* Solid White Line */}
      <hr className="border-white border-b-2 my-10" />

      {/* Sidebar Links */}
      <div className="flex-grow overflow-y-auto">
        <ul className="mt-6 text-white font-semibold space-y-4">
          {/* Dashboard */}
          <li className="rounded hover:bg-blue-600 transition-all duration-300">
            <a href="/dashboardfinal" className="flex items-center px-4 py-3">
              <FaTachometerAlt className="w-6 h-6 mr-3" />
              Dashboard
            </a>
          </li>

          {/* Management with Dropdown */}
          <li className="rounded group transition-all duration-300">
            <button
              className="flex items-center justify-between w-full px-4 py-3 focus:outline-none group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
              onClick={toggleManagementDropdown}
            >
              <span className="flex items-center group-hover:scale-105 group-hover:transform transition-transform duration-300">
                <FaTachometerAlt className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Management
              </span>
              <FaAngleDown
                className={`transform transition-transform duration-300 ${
                  isManagementOpen ? 'rotate-180' : ''
                } group-hover:scale-110`}
              />
            </button>

            {/* Dropdown Menu */}
            {isManagementOpen && (
              <ul className="pl-12 mt-2 space-y-2">
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/User" className="block px-4 py-2">
                    User
                  </a>
                </li>
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/Equipment" className="block px-4 py-2">
                    Equipment
                  </a>
                </li>
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/category" className="block px-4 py-2">
                    Category
                  </a>
                </li>
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/department" className="block px-4 py-2">
                    Department
                  </a>
                </li>
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/laboratory" className="block px-4 py-2">
                    Laboratory
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Authentication */}
          <li className="rounded group transition-all duration-300">
            <button
              className="flex items-center justify-between w-full px-4 py-3 focus:outline-none group-hover:bg-blue-600 group-hover:text-white transition-all duration-300"
              onClick={toggleAuthenticationDropdown}
            >
              <span className="flex items-center group-hover:scale-105 group-hover:transform transition-transform duration-300">
                <FaUser className="w-6 h-6 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Authentication
              </span>
              <FaAngleDown
                className={`transform transition-transform duration-300 ${
                  isAuthenticationOpen ? 'rotate-180' : ''
                } group-hover:scale-110`}
              />
            </button>

            {/* Dropdown Menu */}
            {isAuthenticationOpen && (
              <ul className="pl-12 mt-2 space-y-2">
                <li className="hover:bg-blue-600 transition-all duration-300 rounded">
                  <a href="/authentication/forgot-password" className="block px-4 py-2">
                    Forgot Password
                  </a>
                </li>
              </ul>
            )}
          </li>

          {/* Settings */}
          <li className="rounded hover:bg-blue-600 transition-all duration-300">
            <a href="/settings" className="flex items-center px-4 py-3">
              <FaCog className="w-6 h-6 mr-3" />
              Settings
            </a>
          </li>
        </ul>
      </div>
    </div>
  );
}

export default Sidebar;
