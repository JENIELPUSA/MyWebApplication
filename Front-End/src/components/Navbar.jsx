import React, { useState, useContext } from "react";
import { FaUserCircle, FaCircle } from "react-icons/fa";
import { AuthContext } from "../components/Context/AuthContext";
import TechForm from "./Technician/TechnicianForm";
import Notification from "./Context/Notification/Notification";

function Navbar() {
  const { username, fullName } = useContext(AuthContext);
  
  const [modals, setModals] = useState({
    technician: false,
  });

  const [senddata, setsenddata] = useState();

  const toggleModal = (modalName, data) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
    if (modalName === "technician" && data) setsenddata(data);
  };

  return (
    <nav className="w-full bg-[#f8fafc] border-b-4 border-[#1e3a8a] shadow-2xl sticky top-0 z-[100] px-4 py-3 sm:px-8 md:px-16 lg:px-40 flex justify-between items-center  font-mono">
      
      {/* LEFT SIDE: Brand Branding */}
      <div className="flex items-center gap-2">
       
      </div>

      {/* RIGHT SIDE: Navigation Actions */}
      <div className="flex items-center gap-x-4 md:gap-x-8">
        
        {/* Notification Area */}
        <div className="relative group">
          <div className="p-2 hover:bg-slate-100 rounded-xl transition-all text-[#1e3a8a]">
            <Notification
              toggleTechnicianModal={(data) => toggleModal("technician", data)}
            />
          </div>
        </div>

        {/* Separator Line */}
        <div className="h-10 w-[2px] bg-slate-200 hidden md:block"></div>

        {/* USER PROFILE - Industrial Box Style */}
        <div className="flex items-center gap-x-4 bg-slate-50 border-2 border-slate-200 px-4 py-1.5 rounded-xl shadow-sm">
          <div className="flex flex-col text-right hidden lg:flex">
            <span className="text-[12px] font-black text-[#1e3a8a] uppercase leading-none mb-1">
              {fullName || "OPERATOR_GUEST"}
            </span>
            <div className="flex items-center justify-end gap-1.5">
               <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">
                {username || "UNIDENTIFIED_ACCESS"}
               </span>
               <FaCircle className="text-green-500 text-[6px] animate-pulse" />
            </div>
          </div>
          
          <div className="relative group cursor-pointer">
            <div className="absolute inset-0 bg-yellow-400 rounded-full scale-110 opacity-0 group-hover:opacity-20 transition-all" />
            <FaUserCircle className="w-10 h-10 text-[#1e3a8a] relative z-10" />
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full shadow-sm"></div>
          </div>
        </div>
      </div>

      <ModalsProvider modals={modals} toggleModal={toggleModal} senddata={senddata} />
    </nav>
  );
}

const ModalsProvider = ({ modals, toggleModal, senddata }) => {
  return (
    <>
      {modals.technician && (
        <TechForm 
          isOpen={modals.technician} 
          data={senddata} 
          onClose={() => toggleModal("technician")} 
        />
      )}
    </>
  );
};

export default Navbar;