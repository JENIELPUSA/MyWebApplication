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

  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

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

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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
            </tbody>
          </table>
        </div>

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
