<<<<<<< HEAD
import React, { useState, useContext } from "react";
import { EquipmentContext } from "../CountContext";
import { EquipmentDisplayContext } from "../Context/EquipmentContext/DisplayContext";
import { 
  FaPlus, FaChevronLeft, FaChevronRight, FaEdit, 
  FaTrashAlt, FaSyncAlt, FaPlusCircle, FaTimes, FaSearch 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import PopupModal from "./popupModal";
import EquipmentformModal from "./Equipment";
import RetrieveForm from "./Retrieve";
=======
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "./popupModal";
import EquipmentformModal from "./Equipment";
import RetrieveForm from "./Retrieve";
import { FaPlus } from "react-icons/fa";
import { motion } from "framer-motion";
import { EquipmentContext } from "../CountContext";
import { EquipmentDisplayContext } from "../Context/EquipmentContext/DisplayContext";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

const ModalTable = ({ isOpen, onClose }) => {
  const { setEquipmentCount } = useContext(EquipmentContext);
  const {
    equipment,
    setEquipment,
    currentPage,
    setCurrentPage,
    equipmentsPerPage,
    DeleteDatas,
  } = useContext(EquipmentDisplayContext);
<<<<<<< HEAD

  const [searchTerm, setSearchTerm] = useState("");
=======
  const [animateExit, setAnimateExit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

<<<<<<< HEAD
  // Guard Clause: Kung hindi open ang modal, huwag mag-render ng kahit ano
  if (!isOpen) return null;

  // --- PAGINATION & FILTER LOGIC ---
  const filteredEquipment = equipment?.filter((equip) =>
    (equip.SerialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (equip.Brand?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
    (equip.DepartmentName?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredEquipment.length / equipmentsPerPage);
  
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * equipmentsPerPage,
    currentPage * equipmentsPerPage
  );
=======
  const token = localStorage.getItem("token");

  const handleAssignClick = (equipment) => {
    if (equipment.status === "Not Available") {
      setIsRetrieveModalOpen(true);
      setSelectedEquipment(equipment._id);
    } else {
      setIsModalOpen(true);
      setSelectedEquipment(equipment);
    }
  };

  const handleAddClick = () => {
    setFormModalOpen(true);
  };

  const handleSelectEquipment = (equipment) => {
    setFormModalOpen(true);
    setSelectedEquipment(equipment);
  };

  const handleEditEquipment = (newEquipment) => {
    const category = categories?.find(
      (cat) => cat._id === newEquipment.Category
    );
    const updatedEquipment = {
      ...newEquipment,
      Category: {
        CategoryName: category ? category.CategoryName : "N/A",
        CategoryId: category ? category._id : null,
      },
    };

    setEquipment((prevEquipment) =>
      prevEquipment.map((equipment) =>
        equipment._id === newEquipment._id ? updatedEquipment : equipment
      )
    );
  };

  const handleAssign = (newEquip) => {
    toast.success("Equipment assigned successfully");
    setEquipment((prevEquipment) => [...prevEquipment, newEquip]);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setFormModalOpen(false);
    setIsRetrieveModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleEquipmentUpdate = (updatedEquipment) => {
    setEquipment((prevList) =>
      prevList.map((equipment) =>
        equipment._id === updatedEquipment.id
          ? { ...equipment, status: updatedEquipment.status }
          : equipment
      )
    );
  };

  const handleDeleteEquipment = async (equipmentID) => {
    await DeleteDatas(equipmentID);
    setEquipment((prevEquipment) => {
      const updated = prevEquipment.filter(
        (equipment) => equipment._id !== equipmentID
      );
      return updated;
    });
    setEquipmentCount((prevCount) => prevCount - 1);
  };

  // Filtered and paginated equipment data
  const filteredEquipment = equipment?.filter((equip) =>
    (equip.SerialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEquipment.length / equipmentsPerPage);

  const paginatedEquipment =
    filteredEquipment.slice(
      (currentPage - 1) * equipmentsPerPage,
      currentPage * equipmentsPerPage
    ) || [];
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

<<<<<<< HEAD
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
  const handleAssignClick = (item) => {
    if (item.status === "Not Available") {
      setSelectedEquipment(item._id);
      setIsRetrieveModalOpen(true);
    } else {
      setSelectedEquipment(item);
      setIsModalOpen(true);
    }
  };

  const handleCloseSubModals = () => {
    setIsModalOpen(false);
    setFormModalOpen(false);
    setIsRetrieveModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this equipment?")) {
      await DeleteDatas(id);
      setEquipment(prev => prev.filter(e => e._id !== id));
      setEquipmentCount(prev => prev - 1);
    }
  };

  return (
    <div className="fixed inset-0 z-[999] flex items-center justify-center p-4">
      {/* BACKDROP */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
      />

      {/* MODAL CONTENT */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-6xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div>
            <h2 className="text-2xl font-black text-gray-800 tracking-tight">Equipment Inventory</h2>
            <p className="text-sm text-gray-500 font-medium">Manage and monitor system assets</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <FaTimes className="text-gray-400 group-hover:text-red-500 transition-colors" size={20} />
          </button>
        </div>

        {/* SEARCH & ADD BAR */}
        <div className="p-6 flex flex-col md:flex-row gap-4 bg-gray-50/50">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by Serial, Brand, or Department..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white shadow-sm"
            />
          </div>
          <button
            onClick={() => setFormModalOpen(true)}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-200 active:scale-95"
          >
            <FaPlus /> <span>Add New Asset</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-auto px-6 py-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-4 py-3">Serial Number</th>
                <th className="px-4 py-3">Brand & Specs</th>
                <th className="px-4 py-3">Location (Dept/Lab)</th>
                <th className="px-4 py-3 text-center">Status</th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              <AnimatePresence>
                {paginatedEquipment.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-20 text-center text-gray-400 font-medium">
                      No matching equipment found.
                    </td>
                  </tr>
                ) : (
                  paginatedEquipment.map((item) => (
                    <motion.tr 
                      layout
                      key={item._id} 
                      className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50/30 transition-all group"
                    >
                      <td className="px-4 py-4 rounded-l-2xl border-y border-l font-bold text-gray-700">
                        {item.SerialNumber}
                      </td>
                      
                      <td className="px-4 py-4 border-y">
                        <div className="font-bold text-gray-800">{item.Brand}</div>
                        <div className="text-[11px] text-gray-400 truncate max-w-[150px]" title={item.Specification}>
                          {item.Specification}
                        </div>
                      </td>

                      <td className="px-4 py-4 border-y">
                        <div className="text-xs font-bold text-blue-600">{item.DepartmentName || "N/A"}</div>
                        <div className="text-[10px] text-gray-500 italic">{item.LaboratoryName || "No Lab"}</div>
                      </td>

                      <td className="px-4 py-4 border-y text-center">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tighter ${
                          item.status === "Available" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {item.status}
                        </span>
                      </td>

                      <td className="px-4 py-4 border-y">
                        <div className="text-[11px] text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block max-w-[120px] truncate">
                          {item.remarks || "No remarks"}
                        </div>
                      </td>

                      <td className="px-4 py-4 rounded-r-2xl border-y border-r text-center">
                        <div className="flex justify-center gap-1">
                          <button onClick={() => { setSelectedEquipment(item); setFormModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors" title="Edit">
                            <FaEdit size={14} />
                          </button>
                          <button onClick={() => handleDelete(item._id)} className="p-2 text-red-500 hover:bg-red-100 rounded-xl transition-colors" title="Delete">
                            <FaTrashAlt size={14} />
                          </button>
                          <button onClick={() => handleAssignClick(item)} className="p-2 text-green-600 hover:bg-green-100 rounded-xl transition-colors" title="Assign/Retrieve">
                            {item.status === "Not Available" ? <FaSyncAlt size={14} /> : <FaPlusCircle size={14} />}
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))
                )}
              </AnimatePresence>
=======
  const handleAddEquipment = (newEquipment) => {
    const category =
      categories?.find((cat) => cat._id === newEquipment.Category) || [];

    const updatedEquipment = {
      ...newEquipment,
      Category: {
        CategoryName: category ? category.CategoryName : "N/A",
        CategoryId: category ? category._id : null,
      },
    };
    setEquipment((prevEquipment) => [...prevEquipment, updatedEquipment]);
  };

  return (
    <motion.div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 px-2 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-screen-lg shadow-lg max-h-[90vh] sm:max-h-none overflow-y-auto"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Button */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={() => {
            setAnimateExit(true);
            setTimeout(onClose, 500);
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h2 className="text-xl font-bold mb-4 xs:text-sm xs:p-2 lg-p-2 lg:text-lg">
          Equipment Table
        </h2>

        {/* Search Input */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm sm:p-4 border-b border-gray-300">
                  Serial#
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-2 sm:p-4 border-b border-gray-300">
                  Brand
                </th>
                <th className=" xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-2 sm:p-4 border-b border-gray-300">
                  Specification
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-2 sm:p-4 border-b border-gray-300">
                  Status
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm p-2 sm:p-4 border-b border-gray-300">
                  Category
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
              {paginatedEquipment.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((equipment) => (
                  <tr key={equipment._id} className="hover:bg-gray-100">
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">
                      {equipment.SerialNumber}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">
                      {equipment.Brand}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">
                      {equipment.Specification}
                    </td>
                    <td
                      className={`xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2 ${
                        equipment.status === "Available"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {equipment.status}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2">
                      {equipment.CategoryName || "N/A"}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => handleSelectEquipment(equipment)}
                        className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteEquipment(equipment._id)}
                        className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                      <button
                        onClick={() => handleAssignClick(equipment)}
                        className="px-3 py-1 text-white bg-green-500 rounded hover:bg-red-600"
                      >
                        {equipment.status === "Not Available" ? (
                          <i className="fas fa-sync-alt"></i>
                        ) : (
                          <i className="fas fa-plus-circle"></i>
                        )}
                      </button>
                    </td>
                  </tr>
                ))
              )}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
            </tbody>
          </table>
        </div>

<<<<<<< HEAD
        {/* FOOTER / PAGINATION */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {Math.min(filteredEquipment.length, (currentPage - 1) * equipmentsPerPage + 1)}-{Math.min(currentPage * equipmentsPerPage, filteredEquipment.length)} of {filteredEquipment.length}
          </div>

          <div className="flex items-center gap-1 bg-white p-1.5 rounded-2xl shadow-sm border">
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
                  onClick={() => typeof num === 'number' && paginate(num)}
                  disabled={num === "..."}
                  className={`w-8 h-8 rounded-xl text-xs font-bold transition-all ${
                    currentPage === num 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                      : "hover:bg-gray-100 text-gray-500"
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>

            <button 
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* SUB-MODALS */}
      {isModalOpen && <PopupModal isOpen={isModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
      {isFormModalOpen && <EquipmentformModal isOpen={isFormModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
      {isRetrieveModalOpen && <RetrieveForm isOpen={isRetrieveModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
    </div>
  );
};

export default ModalTable;
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
  Showing {(currentPage - 1) * equipmentsPerPage + 1} to{" "}
  {Math.min(currentPage * equipmentsPerPage, filteredEquipment.length)} of{" "}
  {filteredEquipment.length} results
</div>


        {/* Modals */}
        {isModalOpen && (
          <PopupModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleEquipmentUpdate}
            equipment={selectedEquipment}
            onAddAssign={handleAssign}
          />
        )}

        {isFormModalOpen && (
          <EquipmentformModal
            isOpen={isFormModalOpen}
            onAddEquipment={handleAddEquipment}
            onClose={handleCloseModal}
            equipment={selectedEquipment}
            onEditEquipment={handleEditEquipment}
          />
        )}

        {isRetrieveModalOpen && (
          <RetrieveForm
            isOpen={isRetrieveModalOpen}
            onClose={handleCloseModal}
            equipment={selectedEquipment}
            onEditStatus={handleEditEquipment}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default ModalTable;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
