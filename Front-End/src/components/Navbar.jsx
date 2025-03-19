import React, { useState, useContext, useEffect } from "react";
import { FaCog, FaUserCircle, FaCaretDown } from "react-icons/fa";
import { useAuth } from "./Context/AuthContext";
import { AuthContext } from "../components/Context/AuthContext";
import PopupModal from "./Equipment/ModalTable";
import PopUpDepartment from "./Department/DepartmentTables";
import PopUpCategory from "./Category/CategoryTable";
import PopUpUser from "./USER/UserTable";
import PopUpLab from "./Laboratories/LaboratoryTable";
import TechForm from "./Technician/TechnicianForm";
import Notification from "./Context/Notification/Notification";

function Navbar() {
  const { role, email } = useContext(AuthContext);
  const { logout } = useAuth();
  
  // State para sa Modal Visibility
  const [modals, setModals] = useState({
    equipment: false,
    department: false,
    category: false,
    user: false,
    laboratory: false,
    technician: false,
  });

  // State para sa data na ipapasa sa TechForm
  const [senddata, setsenddata] = useState();

  const toggleModal = (modalName, data) => {
    console.log(`Toggling modal: ${modalName}`, data); // Debugging log
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));
  
    if (modalName === "technician" && data) {
      console.log("Received data in Navbar:", data); // Debugging log
      setsenddata(data); // I-store ang buong request object
    }
  
    setIsManagementOpen(false);
  };
  
  

  // State para sa Management Dropdown
  const [isManagementOpen, setIsManagementOpen] = useState(false);

  // Mag-close ang dropdown kapag nag-click sa labas
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".management-dropdown")) {
        setIsManagementOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <nav className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 px-40 py-3 flex justify-between items-center">
      <div className="flex items-center gap-x-2 text-white font-semibold text-xl">
        <FaUserCircle className="w-10 h-10" />
        <span>{email}</span>
      </div>

      <div className="flex items-center gap-x-5">
        <Notification toggleTechnicianModal={(data) => toggleModal("technician",data)} />

        {role === "admin" && (
          <div className="relative management-dropdown">
            <button
              className="text-white flex items-center"
              onClick={() => setIsManagementOpen(!isManagementOpen)}
            >
              <FaCog className="w-8 h-8 mt-1 transition-transform duration-200" />
              <span className="ml-2">Management</span>
              <FaCaretDown className="ml-2 w-4 h-4 mt-1" />
            </button>
            {isManagementOpen && (
              <div className="absolute bg-white shadow-lg rounded-md w-40 top-full right-0 mt-2 p-2 text-sm text-gray-700">
                <button
                  onClick={() => toggleModal("user")}
                  className="block px-4 py-2 w-full hover:bg-blue-200"
                >
                  User
                </button>
                <button
                  onClick={() => toggleModal("equipment")}
                  className="block px-4 py-2 w-full hover:bg-blue-200"
                >
                  Equipment
                </button>
                <button
                  onClick={() => toggleModal("department")}
                  className="block px-4 py-2 w-full hover:bg-blue-200"
                >
                  Department
                </button>
                <button
                  onClick={() => toggleModal("category")}
                  className="block px-4 py-2 w-full hover:bg-blue-200"
                >
                  Category
                </button>
                <button
                  onClick={() => toggleModal("laboratory")}
                  className="block px-4 py-2 w-full hover:bg-blue-200"
                >
                  Laboratory
                </button>
              </div>
            )}
          </div>
        )}

        <button className="text-white" onClick={logout}>
          Logout
        </button>
      </div>

      {/* Popups for Management Options */}
      {modals.equipment && <PopupModal isOpen={modals.equipment} onClose={() => toggleModal("equipment")} />}
      {modals.department && <PopUpDepartment isOpen={modals.department} onClose={() => toggleModal("department")} />}
      {modals.category && <PopUpCategory isOpen={modals.category} onClose={() => toggleModal("category")} />}
      {modals.user && <PopUpUser isOpen={modals.user} onClose={() => toggleModal("user")} />}
      {modals.laboratory && <PopUpLab isOpen={modals.laboratory} onClose={() => toggleModal("laboratory")} />}
      
      {/* Technician Modal with senddata */}
      {modals.technician && (
        <TechForm
          isOpen={modals.technician}
          data={senddata}
          onClose={() => toggleModal("technician")}
        />
      )}
    </nav>
  );
}

export default Navbar;
