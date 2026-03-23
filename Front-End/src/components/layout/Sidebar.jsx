import React, { useState } from "react";
import MyLogo from "../../../src/assets/logo.png";

import {
  LayoutDashboard,
  Users,
  ClipboardList,
  LogOut,
  Wrench,
  Database,
  FileText,
  KeyRound,
  FileDown, // Dagdag na icon para sa PMS
} from "lucide-react";
import { useAuth } from "../Context/AuthContext";

// Import ng iyong Modals
import PopupModal from "../Equipment/ModalTable";
import PopUpDepartment from "../Department/DepartmentTables";
import PopUpCategory from "../Category/CategoryTable";
import PopUpUser from "../USER/UserTable";
import PopUpLab from "../Laboratories/LaboratoryTable";
import ModalReport from "../Report/ModalReport";
import ForgotPassword from "../ForgotPassword/ForgotPassword";
import PmsDisplay from "../PMSExport/PmsDisplay";

const Sidebar = () => {
  const { logout, role } = useAuth();
  const [activeTab, setActiveTab] = useState("Dashboard");

  // 1. Idinagdag ang 'pms: false' dito
  const [modals, setModals] = useState({
    equipment: false,
    department: false,
    category: false,
    user: false,
    laboratory: false,
    report: false,
    forgot: false,
    pms: false,
  });

  const toggleModal = (modalName) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  };

  const menuItems = [
    { icon: <LayoutDashboard size={20} />, label: "Dashboard" },
    { icon: <Users size={20} />, label: "User List", modal: "user" },
    {
      icon: <ClipboardList size={20} />,
      label: "Equipment",
      modal: "equipment",
    },
    { icon: <Database size={20} />, label: "Departments", modal: "department" },
    { icon: <Wrench size={20} />, label: "Laboratories", modal: "laboratory" },
    { icon: <FileDown size={20} />, label: "PMS Export", modal: "pms" },
    { icon: <FileText size={20} />, label: "System Reports", modal: "report" },
    { icon: <KeyRound size={20} />, label: "Reset Password", modal: "forgot" },
  ];

  const filteredMenuItems = menuItems.filter((item) => {
    if (role === "Technician") {
      // I-hide ang PMS Export sa Technician kung kinakailangan
      return !["User List", "Departments", "System Reports"].includes(
        item.label,
      );
    }
    if (role === "Admin" && item.label === "PMS Export") {
      return false;
    }
    return true;
  });

  const handleItemClick = (item) => {
    setActiveTab(item.label);
    if (item.modal) {
      toggleModal(item.modal);
    }
  };

  return (
    <>
      <div className="flex flex-col h-screen w-64 bg-blue-900 text-white shadow-2xl flex-none overflow-hidden">
        {/* --- LOGO SECTION --- */}
        <div className="p-6 mb-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0 w-14 h-14 rounded-full overflow-hidden border-2 border-blue-800 flex items-center justify-center bg-white">
              <img
                src={MyLogo}
                alt="Logo"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-tight">
              <span className="text-2xl font-black tracking-tighter text-white">
                EP<span className="text-yellow-400">DO</span>
              </span>
              <span className="text-[10px] font-bold text-blue-300 tracking-[0.2em] uppercase">
                Maintenance System
              </span>
            </div>
          </div>
        </div>

        <div className="px-6 mb-6">
          <hr className="border-blue-800 opacity-50" />
        </div>

        {/* --- NAVIGATION LINKS --- */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto custom-scrollbar">
          {filteredMenuItems.map((item, index) => {
            const isActive = activeTab === item.label;
            return (
              <div
                key={index}
                onClick={() => handleItemClick(item)}
                className={`flex items-center p-3.5 rounded-xl cursor-pointer transition-all duration-300 group
                  ${
                    isActive
                      ? "bg-yellow-400 text-blue-900 shadow-lg font-bold scale-[1.02]"
                      : "hover:bg-blue-800 text-blue-100 hover:text-white"
                  }`}
              >
                <div className="flex items-center justify-center">
                  {item.icon}
                </div>
                <span className="ml-3 font-semibold text-sm">{item.label}</span>
              </div>
            );
          })}
        </nav>

        {/* --- LOGOUT SECTION --- */}
        <div className="p-4 border-t border-blue-800 bg-blue-950/30">
          <div
            onClick={logout}
            className="flex items-center p-3 rounded-xl cursor-pointer hover:bg-red-500 hover:text-white text-blue-200 transition-all font-bold text-sm group"
          >
            <LogOut
              size={20}
              className="group-hover:translate-x-1 transition-transform"
            />
            <span className="ml-3">Sign Out System</span>
          </div>
        </div>
      </div>

      <ModalsProvider modals={modals} toggleModal={toggleModal} />
    </>
  );
};

// --- MODALS PROVIDER ---
const ModalsProvider = ({ modals, toggleModal }) => {
  return (
    <div className="text-gray-900">
      {modals.equipment && (
        <PopupModal
          isOpen={modals.equipment}
          onClose={() => toggleModal("equipment")}
        />
      )}
      {modals.department && (
        <PopUpDepartment
          isOpen={modals.department}
          onClose={() => toggleModal("department")}
        />
      )}
      {modals.report && (
        <ModalReport
          isOpen={modals.report}
          onClose={() => toggleModal("report")}
        />
      )}
      {modals.category && (
        <PopUpCategory
          isOpen={modals.category}
          onClose={() => toggleModal("category")}
        />
      )}
      {modals.user && (
        <PopUpUser isOpen={modals.user} onClose={() => toggleModal("user")} />
      )}
      {modals.laboratory && (
        <PopUpLab
          isOpen={modals.laboratory}
          onClose={() => toggleModal("laboratory")}
        />
      )}
      {modals.forgot && (
        <ForgotPassword
          isOpen={modals.forgot}
          onClose={() => toggleModal("forgot")}
        />
      )}

      {/* 3. Dito i-render ang PmsDisplay bilang Modal */}
      {modals.pms && (
        <PmsDisplay isOpen={modals.pms} onClose={() => toggleModal("pms")} />
      )}
    </div>
  );
};

export default Sidebar;
