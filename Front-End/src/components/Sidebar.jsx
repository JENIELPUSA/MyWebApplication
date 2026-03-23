import React, { useState } from 'react';
<<<<<<< HEAD
import { FaUser, FaCog, FaTachometerAlt, FaAngleDown, FaLayerGroup } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';
=======
import { FaUser, FaCog, FaTachometerAlt, FaAngleDown } from 'react-icons/fa';
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

function Sidebar() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isAuthenticationOpen, setIsAuthenticationOpen] = useState(false);
<<<<<<< HEAD
  
  const location = useLocation();
  const currentPath = location.pathname;

  // Pinaganda nating logic para sa Active (Yellow) at Hover (Lighter Blue)
  const activeClass = (path) => 
    currentPath === path 
      ? "bg-yellow-400 text-blue-900 shadow-md transform scale-105" // Active: Yellow background, Dark Blue text
      : "text-white hover:bg-blue-700 hover:pl-5"; // Inactive: White text, Blue hover effect

  const toggleManagementDropdown = () => {
    setIsManagementOpen(!isManagementOpen);
    if (isAuthenticationOpen) setIsAuthenticationOpen(false);
  };

  const toggleAuthenticationDropdown = () => {
    setIsAuthenticationOpen(!isAuthenticationOpen);
=======
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
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    if (isManagementOpen) setIsManagementOpen(false);
  };

  return (
<<<<<<< HEAD
    <div className="w-64 bg-blue-900 fixed flex flex-col px-4 py-4 shadow-2xl pt-10 h-screen z-[100] transition-all duration-300">
      {/* Sidebar Header */}
      <div className="my-2 mb-8 px-2 border-b border-blue-800 pb-4">
        <h1 className="text-2xl text-white font-black tracking-tighter uppercase">
          Admin <span className="text-yellow-400">Dashboard</span>
        </h1>
      </div>

      {/* Sidebar Links */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <ul className="text-sm font-bold space-y-3">
          
          {/* Dashboard */}
          <li>
            <Link 
              to="/dashboardfinal" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${activeClass('/dashboardfinal')}`}
            >
              <FaTachometerAlt className={`w-5 h-5 mr-3 ${currentPath === '/dashboardfinal' ? 'text-blue-900' : 'text-yellow-400'}`} />
              Dashboard
            </Link>
          </li>

          {/* Management with Dropdown */}
          <li className="flex flex-col">
            <button
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none 
                ${isManagementOpen ? 'bg-blue-800 ring-1 ring-blue-700' : 'hover:bg-blue-800'}`}
              onClick={toggleManagementDropdown}
            >
              <span className="flex items-center text-white">
                <FaLayerGroup className="w-5 h-5 mr-3 text-yellow-400" />
                Management
              </span>
              <FaAngleDown className={`text-white transition-transform duration-300 ${isManagementOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown Menu */}
            <div className={`overflow-hidden transition-all duration-500 ${isManagementOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-6 space-y-1 border-l-2 border-blue-700 ml-4">
                {[
                  { name: 'User', path: '/User' },
                  { name: 'Equipment', path: '/Equipment' },
                  { name: 'Category', path: '/category' },
                  { name: 'Department', path: '/department' },
                  { name: 'Laboratory', path: '/laboratory' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`block px-4 py-2 rounded-lg transition-all duration-200 ${activeClass(item.path)}`}
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Authentication Dropdown */}
          <li className="flex flex-col">
            <button
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none 
                ${isAuthenticationOpen ? 'bg-blue-800 ring-1 ring-blue-700' : 'hover:bg-blue-800'}`}
              onClick={toggleAuthenticationDropdown}
            >
              <span className="flex items-center text-white">
                <FaUser className="w-5 h-5 mr-3 text-yellow-400" />
                Auth
              </span>
              <FaAngleDown className={`text-white transition-transform duration-300 ${isAuthenticationOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ${isAuthenticationOpen ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-6 border-l-2 border-blue-700 ml-4">
                <li>
                  <Link to="/authentication/forgot-password" className={`block px-4 py-2 rounded-lg ${activeClass('/authentication/forgot-password')}`}>
                    Forgot Password
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Settings */}
          <li>
            <Link 
              to="/settings" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${activeClass('/settings')}`}
            >
              <FaCog className={`w-5 h-5 mr-3 ${currentPath === '/settings' ? 'text-blue-900' : 'text-yellow-400'}`} />
              Settings
            </Link>
=======
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
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          </li>
        </ul>
      </div>
    </div>
  );
}

<<<<<<< HEAD
export default Sidebar;
=======
export default Sidebar;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
