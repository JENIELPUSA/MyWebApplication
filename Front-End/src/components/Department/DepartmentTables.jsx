import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../Context/AuthContext";

import ReactDOM from "react-dom";

import { FaPlus } from "react-icons/fa";

import DepartmentFormModal from "./DepartmentForm";
import { motion } from "framer-motion";

import { DepartmentDisplayContext } from "../Context/Department/Display";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

const DepartmentTables = ({ isOpen, onClose }) => {
  const {
    loading,
    department,
    setDepartment,
    departmentPerPage,
    currentPage,
    setCurrentPage,
    DeleteDepartment,
  } = useContext(DepartmentDisplayContext);
  const [animateExit, setAnimateExit] = useState(false);
  const { authToken } = useContext(AuthContext);
  const [error, setError] = useState(null); // Error state
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const [totalDepartment, setTotalDepartments] = useState(0); // Total count of departments
  const token = localStorage.getItem("token"); // Token for API authentication
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 70); // Trigger animation
    if (!authToken) {
      console.warn("No token found in localStorage");
      setError("Authentication token is missing. Please log in.");
      return;
    }
  }, [authToken]);

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedDepartment(false);
  };

  const filterDepartment = department?.filter(
    (department) =>
      department.DepartmentName &&
      department.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
  ) ;

  const totalPages = Math.ceil(filterDepartment?.length / departmentPerPage);

  const paginatedDepartment = filterDepartment.slice(
    (currentPage - 1) * departmentPerPage,
    currentPage * departmentPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

  if (!isOpen) return null;

  const handleUpdateDepartment = (updateDepartment) => {
    if (!updateDepartment || !updateDepartment._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    setDepartment((prevDepartment) =>
      prevDepartment.map((department) =>
        department._id === updateDepartment._id ? updateDepartment : department
      )
    );
  };

  const handdleDepartmentSelect = (department) => {
    setAddFormOpen(true);
    setSelectedDepartment(department); // Set the selected equipment
  };

  const handdleDelete = async (departmentId) => {
    const result = await DeleteDepartment(departmentId);
    if (result?.success === true) {
      setDepartment((prevDepartment) =>
        prevDepartment.filter((depart) => depart._id !== departmentId)
      );
    }
  };

  const handleAddDepartment = (newDepartment) => {
    if (!newDepartment || !newDepartment._id) {
      alert("Department ID is Missing!!");
      return;
    }

    //To Update a previous Data
    setDepartment((prevDepartment) => [...prevDepartment, newDepartment]);
  };
  if (!isOpen) return null;
  return (
    <motion.div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 px-2 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-[700x] xl:max-w-[700px] shadow-lg max-h-[90vh] sm:max-h-none overflow-y-auto"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }} // Shrinks on click
          whileHover={{ scale: 1.1 }} // Enlarges on hover
          transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
          onClick={() => {
            setAnimateExit(true); // Set the animation state to trigger upward motion
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h2 className="text-xl font-bold mb-4 xs:text-sm xs:p-2 lg-p-2 lg:text-lg">
          Department Table
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b border-gray-300">
                  Department Name
                </th>
                <th className="p-4 border-b border-gray-300 flex justify-center items-center">
                  <button
                    onClick={() => handleAddClick()}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    <FaPlus className="xs:w-3 xs:h-3 sm:w-5 sm:h-5 lg:w-5 lg:h-5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6}>
                    <LoadingTableSpinner />
                  </td>
                </tr>
              ) : paginatedDepartment.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedDepartment.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-100">
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">{department.DepartmentName}</td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => handdleDepartmentSelect(department)}
                        className="px-3 py-1 text-white  bg-blue-500 rounded hover:bg-blue-600 transition"
                      >
                        <i className="fas fa-edit"></i>
                      </button>

                      <button
                        onClick={() => handdleDelete(department._id)}
                        className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex flex-wrap gap-2 items-center justify-center mt-4">
          {/* Prev Button */}
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {/* Page Numbers */}
          <div className="hidden md:flex flex-wrap justify-center gap-1 md:gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-1 px-3 text-xs md:py-2 md:px-4 md:text-base rounded-full transition ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        {isAddFormOpen && (
          <DepartmentFormModal
            isOpen={isAddFormOpen}
            onAddDepartment={handleAddDepartment}
            onUpdate={handleUpdateDepartment}
            department={selectedDepartment}
            onClose={handleCloseModal}
          />
        )}
        <ToastContainer />
      </motion.div>
    </motion.div>
  );
};

export default DepartmentTables;
