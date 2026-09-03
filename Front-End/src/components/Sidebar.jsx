// src/components/layout/Sidebar.jsx
import React, { useState } from 'react';
import { FaUser, FaCog, FaTachometerAlt, FaAngleDown, FaLayerGroup, FaFlask, FaTools, FaUsers, FaBuilding, FaFolderOpen, FaClipboardList, FaWrench } from 'react-icons/fa';
import { useLocation, Link } from 'react-router-dom';
import { BsBoxes, BsFileText } from 'react-icons/bs';
import { MdDashboard, MdScience, MdApartment } from 'react-icons/md';

function Sidebar() {
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  
  const location = useLocation();
  const currentPath = location.pathname;

  const activeClass = (path) => 
    currentPath === path 
      ? "bg-yellow-400 text-blue-900 shadow-lg transform scale-105 font-bold" 
      : "text-white hover:bg-blue-800 hover:pl-5";

  const toggleManagement = () => {
    setIsManagementOpen(!isManagementOpen);
    if (isAuthOpen) setIsAuthOpen(false);
    if (isAssignOpen) setIsAssignOpen(false);
  };

  const toggleAuth = () => {
    setIsAuthOpen(!isAuthOpen);
    if (isManagementOpen) setIsManagementOpen(false);
    if (isAssignOpen) setIsAssignOpen(false);
  };

  const toggleAssign = () => {
    setIsAssignOpen(!isAssignOpen);
    if (isManagementOpen) setIsManagementOpen(false);
    if (isAuthOpen) setIsAuthOpen(false);
  };

  return (
    <div className="w-64 fixed flex flex-col px-4 py-4 shadow-2xl pt-6 h-screen z-[100] transition-all duration-300 bg-gradient-to-b from-[#0a1628] to-[#1a365d] border-r-2 border-yellow-400">
      
      {/* BIPSU Header */}
      <div className="my-2 mb-6 px-2 border-b border-yellow-400 pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center shadow-lg shadow-yellow-400/30">
            <span className="text-blue-900 font-black text-xl">B</span>
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter text-white">
              BIPSU
            </h1>
            <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-yellow-400">
              Asset Management
            </p>
          </div>
        </div>
      </div>

      {/* Sidebar Links */}
      <div className="flex-grow overflow-y-auto custom-scrollbar">
        <ul className="text-sm font-bold space-y-2">
          
          {/* Dashboard */}
          <li>
            <Link 
              to="/dashboardfinal" 
              className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 ${activeClass('/dashboardfinal')}`}
            >
              <MdDashboard className={`w-5 h-5 mr-3 ${currentPath === '/dashboardfinal' ? 'text-blue-900' : 'text-yellow-400'}`} />
              Dashboard
            </Link>
          </li>

          {/* Assignments Dropdown */}
          <li className="flex flex-col">
            <button
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none 
                ${isAssignOpen ? 'bg-blue-800 ring-1 ring-yellow-400/50' : 'hover:bg-blue-800'}`}
              onClick={toggleAssign}
            >
              <span className="flex items-center text-white">
                <FaClipboardList className="w-5 h-5 mr-3 text-yellow-400" />
                Assignments
              </span>
              <FaAngleDown className={`text-white transition-transform duration-300 ${isAssignOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ${isAssignOpen ? 'max-h-40 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-6 space-y-1 border-l-2 border-yellow-400 ml-4">
                <li>
                  <Link to="/LaboratoryAssign" className={`block px-4 py-2 rounded-lg transition-all duration-200 ${activeClass('/LaboratoryAssign')}`}>
                    <span className="flex items-center gap-2">
                      <FaFlask className="text-yellow-400" size={14} />
                      Lab Assign
                    </span>
                  </Link>
                </li>
                <li>
                  <Link to="/RequestMaintenances" className={`block px-4 py-2 rounded-lg transition-all duration-200 ${activeClass('/RequestMaintenances')}`}>
                    <span className="flex items-center gap-2">
                      <FaWrench className="text-yellow-400" size={14} />
                      Maintenance
                    </span>
                  </Link>
                </li>
              </ul>
            </div>
          </li>

          {/* Management Dropdown */}
          <li className="flex flex-col">
            <button
              className={`flex items-center justify-between w-full px-4 py-3 rounded-xl transition-all duration-300 focus:outline-none 
                ${isManagementOpen ? 'bg-blue-800 ring-1 ring-yellow-400/50' : 'hover:bg-blue-800'}`}
              onClick={toggleManagement}
            >
              <span className="flex items-center text-white">
                <FaLayerGroup className="w-5 h-5 mr-3 text-yellow-400" />
                Management
              </span>
              <FaAngleDown className={`text-white transition-transform duration-300 ${isManagementOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ${isManagementOpen ? 'max-h-80 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-6 space-y-1 border-l-2 border-yellow-400 ml-4">
                {[
                  { name: 'Users', icon: FaUsers, path: '/User' },
                  { name: 'Equipment', icon: FaTools, path: '/Equipment' },
                  { name: 'Categories', icon: FaFolderOpen, path: '/category' },
                  { name: 'Departments', icon: FaBuilding, path: '/department' },
                  { name: 'Laboratories', icon: MdScience, path: '/laboratory' },
                ].map((item) => (
                  <li key={item.path}>
                    <Link 
                      to={item.path} 
                      className={`block px-4 py-2 rounded-lg transition-all duration-200 ${activeClass(item.path)}`}
                    >
                      <span className="flex items-center gap-2">
                        <item.icon className="text-yellow-400" size={14} />
                        {item.name}
                      </span>
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
                ${isAuthOpen ? 'bg-blue-800 ring-1 ring-yellow-400/50' : 'hover:bg-blue-800'}`}
              onClick={toggleAuth}
            >
              <span className="flex items-center text-white">
                <FaUser className="w-5 h-5 mr-3 text-yellow-400" />
                Authentication
              </span>
              <FaAngleDown className={`text-white transition-transform duration-300 ${isAuthOpen ? 'rotate-180' : ''}`} />
            </button>

            <div className={`overflow-hidden transition-all duration-500 ${isAuthOpen ? 'max-h-20 opacity-100 mt-2' : 'max-h-0 opacity-0'}`}>
              <ul className="pl-6 border-l-2 border-yellow-400 ml-4">
                <li>
                  <Link to="/forgot-password" className={`block px-4 py-2 rounded-lg transition-all duration-200 ${activeClass('/forgot-password')}`}>
                    <span className="flex items-center gap-2">
                      <BsFileText className="text-yellow-400" size={14} />
                      Forgot Password
                    </span>
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
          </li>
        </ul>
      </div>

      {/* Footer */}
      <div className="mt-auto pt-4 border-t border-yellow-400">
        <div className="flex items-center justify-between px-2">
          <p className="text-[8px] font-bold uppercase tracking-[0.15em] text-slate-400">
            BIPSU © 2024
          </p>
          <div className="flex gap-1">
            <div className="w-2 h-2 rounded-full bg-yellow-400" />
            <div className="w-2 h-2 rounded-full bg-slate-400" />
            <div className="w-2 h-2 rounded-full bg-slate-400" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;