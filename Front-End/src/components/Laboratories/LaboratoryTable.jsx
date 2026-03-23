<<<<<<< HEAD
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

=======
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaPlus } from "react-icons/fa";
import AddFormModal from "./LaboratoryForm";
import { AuthContext } from "../Context/AuthContext";
//Import a context Comming from creating context
import { LaboratoryContext } from "../CountContext";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { useModal } from "../Context/ModalContex/modaleffect";
import { motion } from "framer-motion";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
const LaboratoryTable = ({ isOpen, onClose }) => {
  const {
    laboratories,
    setLaboratories,
    currentPage,
    laboratoryPerPage,
    setCurrentPage,
    DeleteLaboratory,
<<<<<<< HEAD
    loading
  } = useContext(LaboratoryDisplayContext);

  const { modalType, isAnimating } = useModal();
  const { setLaboratoryCount } = useContext(LaboratoryContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLab, setSelectedLab] = useState(null);
  const [isModalAddForm, setAddFormOpen] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  // --- LOGIC: FILTER & PAGINATION ---
=======
  } = useContext(LaboratoryDisplayContext);
  const { modalType, isAnimating } = useModal();
  const { authToken } = useContext(AuthContext);
  const { setLaboratoryCount } = useContext(LaboratoryContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLab, setSelectedLab] = useState(null); // Initialize as null, not an array
  const [isModalAddForm, setAddFormOpen] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  const handleCloseModal = () => {
    setAddFormOpen(false);
    //importante ito para satwing mag close ang modal ay mag refresh ang value
    setSelectedLab(null);
  };

  const handleDeleteLab = async (laboratoryId) => {
    const result = await DeleteLaboratory(laboratoryId);
    if (result.success === true) {
      setLaboratories((prevLabs) =>
        prevLabs.filter((laboratory) => laboratory._id !== laboratoryId)
      );
      setLaboratoryCount((prevCount) => prevCount - 1);
    }
  };

  const handleAddLaboratory = (newLaboratory) => {
    toast.success("Laboratory added successfully"); // You can also change this message
    setLaboratories((prevLaboratories) => [...prevLaboratories, newLaboratory]);
  };

  const handleUpdateLaboratory = (updateLab) => {
    if (!updateLab || !updateLab._id) {
      alert("User ID is missing. Cannot update.");
      return;
    }

    setLaboratories((prevLab) =>
      prevLab.map((laboratory) =>
        laboratory._id === updateLab._id ? updateLab : laboratory
      )
    );

    // Optionally, if you want to fetch the updated users from the server
    // fetchUsers();
  };

  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const onLabSelect = (laboratory) => {
    setAddFormOpen(true);
    setSelectedLab(laboratory);
  };

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const filteredLaboratories = laboratories?.filter(
    (lab) =>
      lab.LaboratoryName &&
      lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
<<<<<<< HEAD
  ) || [];

  const totalPages = Math.ceil(filteredLaboratories.length / laboratoryPerPage);
=======
  );

  const totalPages = Math.ceil(filteredLaboratories?.length / laboratoryPerPage); // Calculate total pages
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const paginatedLab = filteredLaboratories.slice(
    (currentPage - 1) * laboratoryPerPage,
    currentPage * laboratoryPerPage
  );
<<<<<<< HEAD

=======
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
=======
  if (!isOpen) return null;

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
          Laboratory Table
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Laboratory..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>
        {/*Para hindi masamaang nasa taas sa pag drog sa scrollbar */}
        <div className="overflow-x-auto">
          <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm sm:p-4 p-4 border-b border-gray-300">
                  Laboratory
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm sm:p-4 p-4 border-b border-gray-300">
                  Department
                </th>
                <th className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm sm:p-4 p-4 border-b border-gray-300">
                  Encharge
                </th>
                <th className="p-4 border-b border-gray-300 flex justify-center items-center">
                  <button
                    onClick={() => handleAddClick()}
                    className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                  >
                    <FaPlus className="w-5 h-5" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedLab.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedLab.map((laboratory) => (
                  <tr
                    key={laboratory._id}
                    className="hover:bg-gray-100 transition-colors"
                  >
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">
                      {laboratory.LaboratoryName}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">
                      {laboratory.department || "N/A"}
                    </td>
                    <td className="xs:text-xs xs:p-2 lg-p-2 lg:text-sm border border-gray-300 p-2">
                      {laboratory.EnchargeName || "N/A"}
                    </td>
                    <td className="border border-gray-300 p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => onLabSelect(laboratory)}
                        className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600 transition"
                      >
                        <i className="fas fa-edit"></i>{" "}
                        {/* Font Awesome edit icon */}
                      </button>
                      <button
                        onClick={() => handleDeleteLab(laboratory._id)}
                        className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600 transition"
                      >
                        <i className="fas fa-trash-alt"></i>{" "}
                        {/* Font Awesome trash icon */}
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
          Showing {(currentPage - 1) * laboratoryPerPage + 1} to{" "}
          {Math.min(currentPage * laboratoryPerPage, filteredLaboratories.length)}{" "}
          of {filteredLaboratories.length} results
        </div>

        {isModalAddForm && (
          <AddFormModal
            isOpen={isModalAddForm}
            onAddLaboratory={handleAddLaboratory}
            OnEditLaboratory={handleUpdateLaboratory}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
            laboratory={selectedLab}
            onClose={handleCloseModal}
            modalType={modalType}
            isAnimating={isAnimating}
          />
        )}
<<<<<<< HEAD
      </AnimatePresence>
    </div>
  );
};

export default LaboratoryTable;
=======
      </motion.div>
    </motion.div>
  );
};

export default LaboratoryTable;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
