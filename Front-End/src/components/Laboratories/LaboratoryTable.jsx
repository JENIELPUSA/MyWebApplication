import React, { useState, useContext } from "react";
import { LaboratoryContext } from "../CountContext";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import { useModal } from "../Context/ModalContex/modaleffect";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaTimes, 
  FaSearch, FaChevronLeft, FaChevronRight, FaFlask 
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import AddFormModal from "./LaboratoryForm";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";

const LaboratoryTable = ({ isOpen, onClose }) => {
  const {
    laboratories,
    setLaboratories,
    currentPage,
    laboratoryPerPage,
    setCurrentPage,
    DeleteLaboratory,
    loading
  } = useContext(LaboratoryDisplayContext);

  const { modalType, isAnimating } = useModal();
  const { setLaboratoryCount } = useContext(LaboratoryContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLab, setSelectedLab] = useState(null);
  const [isModalAddForm, setAddFormOpen] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  // --- LOGIC: FILTER & PAGINATION ---
  const filteredLaboratories = laboratories?.filter(
    (lab) =>
      lab.LaboratoryName &&
      lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filteredLaboratories.length / laboratoryPerPage);
  const paginatedLab = filteredLaboratories.slice(
    (currentPage - 1) * laboratoryPerPage,
    currentPage * laboratoryPerPage
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
  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedLab(null);
  };

  const handleAddClick = () => {
    setSelectedLab(null);
    setAddFormOpen(true);
  };

  const onLabSelect = (laboratory) => {
    setSelectedLab(laboratory);
    setAddFormOpen(true);
  };

  const handleDeleteLab = async (id) => {
    if (window.confirm("Delete this laboratory?")) {
      const result = await DeleteLaboratory(id);
      if (result.success) {
        setLaboratories((prev) => prev.filter((lab) => lab._id !== id));
        setLaboratoryCount((prev) => prev - 1);
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

      {/* MAIN MODAL */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={animateExit ? { opacity: 0, scale: 0.9, y: -20 } : { opacity: 1, scale: 1, y: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white w-full max-w-4xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* HEADER */}
        <div className="px-8 py-6 border-b flex justify-between items-center bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-50 rounded-2xl text-blue-600">
              <FaFlask size={20} />
            </div>
            <div>
              <h2 className="text-2xl font-black text-gray-800 tracking-tight">Laboratory Management</h2>
              <p className="text-sm text-gray-500 font-medium">Monitor and organize lab facilities</p>
            </div>
          </div>
          <button
            onClick={() => { setAnimateExit(true); setTimeout(onClose, 300); }}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors group"
          >
            <FaTimes className="text-gray-400 group-hover:text-red-500" size={20} />
          </button>
        </div>

        {/* SEARCH & ADD BAR */}
        <div className="p-6 flex flex-col sm:flex-row gap-4 bg-gray-50/50 border-b border-gray-100">
          <div className="relative flex-1">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search laboratory name..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
              className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all shadow-sm"
            />
          </div>
          <button
            onClick={handleAddClick}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all font-bold shadow-lg shadow-blue-100 active:scale-95"
          >
            <FaPlus /> <span>New Lab</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="flex-1 overflow-auto px-6 py-2">
          <table className="w-full text-left border-separate border-spacing-y-2">
            <thead className="sticky top-0 bg-white z-10">
              <tr className="text-gray-400 text-[11px] uppercase tracking-widest font-bold">
                <th className="px-4 py-3">Lab Name</th>
                <th className="px-4 py-3">Department</th>
                <th className="px-4 py-3">In-charge</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="text-sm">
              {loading ? (
                <tr><td colSpan={4}><LoadingTableSpinner /></td></tr>
              ) : paginatedLab.length === 0 ? (
                <tr>
                  <td colSpan={4} className="py-20 text-center text-gray-400 font-medium italic">
                    No laboratories found.
                  </td>
                </tr>
              ) : (
                paginatedLab.map((lab) => (
                  <motion.tr
                    layout
                    key={lab._id}
                    className="bg-white border border-gray-100 shadow-sm hover:shadow-md hover:bg-blue-50/30 transition-all group"
                  >
                    <td className="px-4 py-4 rounded-l-2xl border-y border-l font-bold text-gray-700">
                      {lab.LaboratoryName}
                    </td>
                    <td className="px-4 py-4 border-y text-gray-500 font-medium">
                      {lab.department || "Unassigned"}
                    </td>
                    <td className="px-4 py-4 border-y text-gray-500">
                      {lab.EnchargeName || "N/A"}
                    </td>
                    <td className="px-4 py-4 rounded-r-2xl border-y border-r text-center">
                      <div className="flex justify-center gap-2">
                        <button
                          onClick={() => onLabSelect(lab)}
                          className="p-2.5 text-blue-600 hover:bg-blue-100 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <FaEdit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteLab(lab._id)}
                          className="p-2.5 text-red-500 hover:bg-red-100 rounded-xl transition-colors"
                          title="Delete"
                        >
                          <FaTrashAlt size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="p-6 bg-gray-50 border-t flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest">
            Showing {Math.min(filteredLaboratories.length, (currentPage - 1) * laboratoryPerPage + 1)}-{Math.min(currentPage * laboratoryPerPage, filteredLaboratories.length)} of {filteredLaboratories.length}
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
              disabled={currentPage === totalPages || filteredLaboratories.length === 0}
              className="p-2 disabled:opacity-20 hover:text-blue-600 transition-colors"
            >
              <FaChevronRight size={12} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* FORM MODAL */}
      <AnimatePresence>
        {isModalAddForm && (
          <AddFormModal
            isOpen={isModalAddForm}
            onAddLaboratory={(newLab) => {
              setLaboratories(prev => [...prev, newLab]);
              handleCloseModal();
            }}
            OnEditLaboratory={(updated) => {
              setLaboratories(prev => prev.map(l => l._id === updated._id ? updated : l));
              handleCloseModal();
            }}
            laboratory={selectedLab}
            onClose={handleCloseModal}
            modalType={modalType}
            isAnimating={isAnimating}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default LaboratoryTable;