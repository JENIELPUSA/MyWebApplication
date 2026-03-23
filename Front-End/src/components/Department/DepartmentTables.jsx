import React, { useState, useEffect, useContext } from "react";
<<<<<<< HEAD
import { AuthContext } from "../Context/AuthContext";
import { DepartmentDisplayContext } from "../Context/Department/Display";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaTimes, 
  FaSearch, FaChevronLeft, FaChevronRight 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import DepartmentFormModal from "./DepartmentForm";
=======
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../Context/AuthContext";

import ReactDOM from "react-dom";

import { FaPlus } from "react-icons/fa";

import DepartmentFormModal from "./DepartmentForm";
import { motion } from "framer-motion";

import { DepartmentDisplayContext } from "../Context/Department/Display";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
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
<<<<<<< HEAD

  const { authToken } = useContext(AuthContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // --- LOGIC: FILTER & PAGINATION ---
  const filterDepartment = department?.filter(
    (dept) =>
      dept.DepartmentName &&
      dept.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filterDepartment.length / departmentPerPage);
  const paginatedDepartment = filterDepartment.slice(
=======
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
  );

  const totalPages = Math.ceil(filterDepartment?.length / departmentPerPage);

  const paginatedDepartment = filterDepartment?.slice(
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    (currentPage - 1) * departmentPerPage,
    currentPage * departmentPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

<<<<<<< HEAD
  // Helper para sa Page Numbers (Ellipsis Logic)
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  // --- HANDLERS ---
  const handleAddClick = () => {
    setSelectedDepartment(null);
    setAddFormOpen(true);
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    setAddFormOpen(true);
  };

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedDepartment(null);
  };

  const handdleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      const result = await DeleteDepartment(id);
      if (result?.success) {
        setDepartment((prev) => prev.filter((d) => d._id !== id));
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => { setAnimateExit(true); setTimeout(onClose, 300); }}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* MODAL CONTAINER */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={animateExit ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Department List</h2>
            <p className="text-sm text-gray-500 font-medium">Manage organization branches</p>
          </div>
          <button
            onClick={() => { setAnimateExit(true); setTimeout(onClose, 300); }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <FaTimes className="text-gray-400 group-hover:text-red-500" size={20} />
          </button>
        </div>

        {/* SEARCH & ADD BAR */}
        <div className="p-6 flex flex-col sm:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search departments..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm bg-white"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
          >
            <FaPlus /> <span>Add</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-auto px-6 py-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-4 py-3">Department Name</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-10"><LoadingTableSpinner /></td>
                </tr>
              ) : paginatedDepartment.length === 0 ? (
                <tr>
                  <td colSpan={2} className="py-20 text-center text-gray-400 font-medium italic">
                    No departments found.
                  </td>
                </tr>
              ) : (
                paginatedDepartment.map((dept) => (
                  <motion.tr
                    layout
                    key={dept._id}
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="px-4 py-4 rounded-l-2xl border-y border-l font-bold text-gray-700">
                      {dept.DepartmentName}
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl border-y border-r text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => handleEditClick(dept)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handdleDelete(dept._id)}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
=======
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
            placeholder="Search DepartmentName..."
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
              ) : paginatedDepartment?.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedDepartment?.map((department) => (
                  <tr key={department._id} className="hover:bg-gray-100">
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">
                      {department.DepartmentName}
                    </td>
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
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                ))
              )}
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {/* FOOTER / PAGINATION */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {Math.min(filterDepartment.length, (currentPage - 1) * departmentPerPage + 1)} to {Math.min(currentPage * departmentPerPage, filterDepartment.length)} of {filterDepartment.length}
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
            >
              <FaChevronLeft size={12} />
            </button>

            <div className="flex gap-1">
              {getPageNumbers().map((num, i) => (
                <button
                  key={i}
                  onClick={() => typeof num === "number" && paginate(num)}
                  disabled={num === "..."}
                  className={`w-8 h-8 rounded-xl text-[11px] font-black transition-all ${
                    currentPage === num
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                      : num === "..." ? "cursor-default text-gray-300" : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages || filterDepartment.length === 0}
              className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* SUB-MODAL */}
      <AnimatePresence>
        {isAddFormOpen && (
          <DepartmentFormModal
            isOpen={isAddFormOpen}
            onAddDepartment={(newDept) => {
              setDepartment((prev) => [...prev, newDept]);
              handleCloseModal();
            }}
            onUpdate={(updated) => {
              setDepartment((prev) => prev.map((d) => d._id === updated._id ? updated : d));
              handleCloseModal();
            }}
=======
        {/* Pagination */}
        <div className="flex flex-row items-center justify-between flex-wrap mt-4 text-sm gap-2">
          {/* Left side: Page X of Y */}
          <div className="text-gray-700">
            Page {currentPage} of {totalPages}
          </div>

          {/* Right side: Prev and Next buttons */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === 1}
            >
              Prev
            </button>

            <button
              onClick={() => paginate(currentPage + 1)}
              className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded disabled:opacity-50"
              disabled={currentPage === totalPages}
            >
              Next
            </button>
          </div>
        </div>

        {/* Showing Info */}
        <div className="mt-2 text-sm text-center text-gray-700">
          Showing {(currentPage - 1) * departmentPerPage + 1} to{" "}
          {Math.min(currentPage * departmentPerPage, filterDepartment.length)}{" "}
          of {filterDepartment.length} results
        </div>
        {isAddFormOpen && (
          <DepartmentFormModal
            isOpen={isAddFormOpen}
            onAddDepartment={handleAddDepartment}
            onUpdate={handleUpdateDepartment}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
            department={selectedDepartment}
            onClose={handleCloseModal}
          />
        )}
<<<<<<< HEAD
      </AnimatePresence>
    </div>
  );
};

export default DepartmentTables;
=======
        <ToastContainer />
      </motion.div>
    </motion.div>
  );
};

export default DepartmentTables;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
