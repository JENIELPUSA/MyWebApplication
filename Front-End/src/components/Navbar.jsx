import React, { useState, useContext, useEffect } from "react";
import { FaCog, FaUserCircle, FaCaretDown, FaBars } from "react-icons/fa";
import { useAuth } from "./Context/AuthContext";
import { AuthContext } from "../components/Context/AuthContext";
import PopupModal from "./Equipment/ModalTable";
import PopUpDepartment from "./Department/DepartmentTables";
import PopUpCategory from "./Category/CategoryTable";
import PopUpUser from "./USER/UserTable";
import PopUpLab from "./Laboratories/LaboratoryTable";
import TechForm from "./Technician/TechnicianForm";
import Notification from "./Context/Notification/Notification";
import ForgotPassword from "./ForgotPassword/ForgotPassword";
import { motion, AnimatePresence } from "framer-motion";
import InventoryLab from "./Report/InventoryLab";
import InventoryMaintenanceForm from "./Report/InventoryMaintenanceForm";
import InventoryEquipmentForm from "./Report/InventoryEquipmentForm";
import ModalReport from "./Report/ModalReport";
import socket from "../socket";
function Navbar() {
  const { role, email } = useContext(AuthContext);
  const { logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isReportsOpen, setIsReportsOpen] = useState(false);
  const [refreshNotifications, setRefreshNotifications] = useState(false);
  // State para sa Modal Visibility
  const [modals, setModals] = useState({
    equipment: false,
    department: false,
    forgot: false,
    category: false,
    user: false,
    laboratory: false,
    technician: false,
    report: false,
    reportmobile: false,
    labreport: false,
    maintenancereport: false,
  });

  useEffect(() => {
    const handleAdminNotification = (data) => {
      console.log("Admin notification received:", data);
      // Example: fetchRequestData(); or setHasUnread(true);
    };
  
    const handleSMSNotification = (data) => {
      console.log("SMS notification received:", data);
    };
  
    socket.on("adminNotification", handleAdminNotification);
    socket.on("SMSNotification", handleSMSNotification);
  
    return () => {
      socket.off("adminNotification", handleAdminNotification);
      socket.off("SMSNotification", handleSMSNotification);
    };
  }, []);
  
  

  const toggleModal = (modalName, data) => {
    setModals((prev) => ({ ...prev, [modalName]: !prev[modalName] }));

    if (modalName === "technician" && data) {
      setsenddata(data);
    }

    // Close the mobile dropdown when opening a modal
    setIsMobileMenuOpen(false);
    setIsManagementOpen(false);
  };

  // State para sa data na ipapasa sa TechForm
  const [senddata, setsenddata] = useState();

  // State para sa Management Dropdown
  const [isManagementOpen, setIsManagementOpen] = useState(false);
  const [isManagementUserOpen, setIsManagementUserOpen] = useState(false);

  // Mag-close ang dropdown kapag nag-click sa labas
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest(".management-dropdown")) {
        setIsManagementOpen(false);
        setIsReportsOpen(false); // Close reports submenu when clicked outside
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.15 } },
  };
  return (
    <nav className="font-poppins w-full bg-gradient-to-r from-blue-900 to-indigo-900 xs:px-4 sm-px-4 px-8 py-3 flex justify-between items-center sm:px-8 md:px-16 lg:px-40">
      <div className="flex items-center gap-x-2 text-white font-semibold text-xl">
        <FaUserCircle className="w-10 h-10" />
        <span className="hidden md:block">{email}</span>
      </div>
      <div></div>

      <div className="flex items-center gap-x-5 ">
          <Notification
            toggleTechnicianModal={(data) => toggleModal("technician", data)}
          />

        {role === "admin" && (
          <div className="relative management-dropdown">
            <button
              className="md:hidden text-2xl text-white flex items-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars className="w-8 h-8 mt-1 transition-transform duration-200" />
            </button>
            <button
              className="text-white items-center hidden md:flex"
              onClick={() => setIsManagementOpen(!isManagementOpen)}
            >
              <FaCog className="w-8 h-8 mt-1 transition-transform duration-200" />
              <span className="ml-2">Management</span>
              <FaCaretDown className="ml-2 w-4 h-4 mt-1" />
            </button>
            {isMobileMenuOpen && (
              <div className="m-6 mt-20 fixed inset-0 z-50 md:hidden bg-transparent bg-opacity-40 flex items-start ">
                <motion.div
                  className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-t-2xl rounded-b-2xl relative"
                  initial={{ opacity: 0, y: -50 }} // Initial state (hidden and above)
                  animate={{ opacity: 1, y: 0 }} // Final state (visible and in place)
                  exit={{ opacity: 0, y: 50 }} // Exit state (hidden and below)
                  transition={{ duration: 0.5 }} // Duration of animation
                >
                  {/* Menu Items */}
                  <div className=" mt-2 space-y-2">
                    <button
                      onClick={() => toggleModal("user")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      User
                    </button>
                    <button
                      onClick={() => toggleModal("equipment")}
                      className="text-center block w-full text-white font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Equipment
                    </button>
                    <button
                      onClick={() => toggleModal("laboratory")}
                      className="block w-full text-center text-white font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Laboratory
                    </button>
                    <button
                      onClick={() => toggleModal("department")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Department
                    </button>
                    <button
                      onClick={() => toggleModal("category")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Category
                    </button>
                    <button
                      onClick={() => toggleModal("reportmobile")}
                      className="block w-full text-center text-white font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Reports
                    </button>
                    <button
                      onClick={() => toggleModal("forgot")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      ForgotPassword
                    </button>
                    <button
                      onClick={logout}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {isManagementOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute bg-white shadow-lg rounded-md w-40 top-full right-0 mt-2 p-2 text-sm text-gray-700"
                >
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

                  {/* Reports Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => toggleModal("reportmobile")}
                      className="block px-11 py-1 w-full text-left hover:bg-blue-200"
                    >
                      Reports
                    </button>
                  </div>

                  <button
                    onClick={() => toggleModal("forgot")}
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                  >
                    Forgot Password
                  </button>
                  <button
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {role === "user" && (
          <div className="relative management-dropdown">
            <button
              className="text-white items-center hidden md:flex"
              onClick={() => setIsManagementUserOpen(!isManagementUserOpen)}
            >
              <FaCog className="w-8 h-8 mt-1 transition-transform duration-200" />
              <span className="ml-2">Management</span>
              <FaCaretDown className="ml-2 w-4 h-4 mt-1" />
            </button>
            <button
              className="md:hidden text-2xl text-white flex items-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars className="w-8 h-8 mt-1 transition-transform duration-200" />
            </button>
            {isMobileMenuOpen && (
              <div className="m-6 mt-20 fixed inset-0 z-50 md:hidden bg-transparent bg-opacity-40 flex items-start ">
                <motion.div
                  className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-t-2xl rounded-b-2xl relative"
                  initial={{ opacity: 0, y: -50 }} // Initial state (hidden and above)
                  animate={{ opacity: 1, y: 0 }} // Final state (visible and in place)
                  exit={{ opacity: 0, y: 50 }} // Exit state (hidden and below)
                  transition={{ duration: 0.5 }} // Duration of animation
                >
                  {/* Menu Items */}
                  <div className=" mt-2 space-y-2">
                    <button
                      onClick={() => toggleModal("forgot")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      ForgotPassword
                    </button>
                    <button
                      onClick={logout}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {isManagementUserOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute bg-white shadow-lg rounded-md w-40 top-full right-0 mt-2 p-2 text-sm text-gray-700"
                >
                  <button
                    onClick={() => toggleModal("forgot")}
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                  >
                    Forgot Password
                  </button>
                  <button
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {role === "Technician" && (
          <div className="relative management-dropdown">
            <button
              className="md:hidden text-2xl text-white flex items-center"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <FaBars className="w-8 h-8 mt-1 transition-transform duration-200" />
            </button>
            <button
              className="text-white items-center hidden md:flex"
              onClick={() => setIsManagementUserOpen(!isManagementUserOpen)}
            >
              <FaCog className="w-8 h-8 mt-1 transition-transform duration-200" />
              <span className="ml-2">Management</span>
              <FaCaretDown className="ml-2 w-4 h-4 mt-1" />
            </button>

            {isMobileMenuOpen && (
              <div className="m-6 mt-20 fixed inset-0 z-50 md:hidden bg-transparent bg-opacity-40 flex items-start ">
                <motion.div
                  className="w-full bg-gradient-to-r from-blue-900 to-indigo-900 p-6 rounded-t-2xl rounded-b-2xl relative"
                  initial={{ opacity: 0, y: -50 }} // Initial state (hidden and above)
                  animate={{ opacity: 1, y: 0 }} // Final state (visible and in place)
                  exit={{ opacity: 0, y: 50 }} // Exit state (hidden and below)
                  transition={{ duration: 0.5 }} // Duration of animation
                >
                  {/* Menu Items */}
                  <div className=" mt-2 space-y-2">
                    <button
                      onClick={() => toggleModal("forgot")}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      ForgotPassword
                    </button>
                    <button
                      onClick={logout}
                      className="block w-full text-center text-white  font-medium py-2 px-4 rounded hover:bg-blue-500"
                    >
                      Logout
                    </button>
                  </div>
                </motion.div>
              </div>
            )}

            <AnimatePresence>
              {isManagementUserOpen && (
                <motion.div
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={dropdownVariants}
                  className="absolute bg-white shadow-lg rounded-md w-40 top-full right-0 mt-2 p-2 text-sm text-gray-700"
                >
                  <button
                    onClick={() => toggleModal("forgot")}
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                  >
                    Forgot Password
                  </button>
                  <button
                    className="block px-4 py-2 w-full hover:bg-blue-200"
                    onClick={logout}
                  >
                    Logout
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Popups for Management Options */}
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

      {modals.reportmobile && (
        <ModalReport
          isOpen={modals.reportmobile}
          onClose={() => toggleModal("reportmobile")}
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
      {modals.technician && (
        <TechForm
          isOpen={modals.technician}
          data={senddata}
          onClose={() => toggleModal("technician")}
        />
      )}
      {modals.report && (
        <InventoryEquipmentForm
          isOpen={modals.report}
          data={senddata}
          onClose={() => toggleModal("report")}
        />
      )}

      {modals.labreport && (
        <InventoryLab
          isOpen={modals.report}
          data={senddata}
          onClose={() => toggleModal("labreport")}
        />
      )}
      {modals.maintenancereport && (
        <InventoryMaintenanceForm
          isOpen={modals.report}
          data={senddata}
          onClose={() => toggleModal("maintenancereport")}
        />
      )}
    </nav>
  );
}

export default Navbar;
