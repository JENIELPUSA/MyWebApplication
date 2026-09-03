import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AssignContext } from "../../contexts/DisplayAssignContext/DisplayAssignContext.jsx";
import AddFormModal from "../Laboratories/LaboratoryForm.jsx";
import { useNavigate } from "react-router-dom";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext.jsx";
import { motion } from "framer-motion";

// Lucide React Icons
import { 
  Building2, 
  Pencil, 
  Monitor, 
  ChevronLeft, 
  ChevronRight, 
  Layers 
} from "lucide-react";

const Laboratory = ({ onClose }) => {
  const location = useLocation();
  const [isModalAddForm, setAddFormOpen] = useState(false);
  
  // Safe context access with fallback
  const assignContext = useContext(AssignContext);
  const Assignlaboratories = assignContext?.Assignlaboratories || [];
  
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;
  const [selectedLab, setSelectedLab] = useState(null);
  const navigate = useNavigate();
  
  // Safe context access with fallback
  const labContext = useContext(LaboratoryContext);
  const laboratories = labContext?.laboratories || [];
  const loading = labContext?.loading || false;

  const selectedLabsFromState = location.state?.selectedLab;

  const [selectedLabs, setSelectedLabs] = useState(() => {
    const saved = localStorage.getItem("selectedLabs");
    return saved ? JSON.parse(saved) : selectedLabsFromState || "";
  });

  useEffect(() => {
    if (selectedLabsFromState) {
      localStorage.setItem("selectedLabs", JSON.stringify(selectedLabsFromState));
      setSelectedLabs(selectedLabsFromState);
    }
  }, [selectedLabsFromState]);

  const results = Array.isArray(Assignlaboratories)
    ? Assignlaboratories.filter((lab) =>
        lab.departmentName?.toLowerCase().includes(selectedLabs?.toLowerCase())
      )
    : [];

  const totalPages = Math.ceil(results.length / itemsPerPage);

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastLab = currentPage * itemsPerPage;
  const indexOfFirstLab = indexOfLastLab - itemsPerPage;
  const currentLabs = results.slice(indexOfFirstLab, indexOfLastLab);

  const showPagination = results.length > 5;

  const handleCloseModal = () => {
    setAddFormOpen(false);
  };

  const onLabSelect = (laboratoryId) => {
    const Result = laboratories.find((lab) => lab._id === laboratoryId);
    if (Result) {
      setSelectedLab(Result);
      setAddFormOpen(true);
    } else {
      console.log("Laboratory not found.");
    }
  };

  const handleSelectDisplay = (selectedAssignEquipment) => {
    console.log("Selected Lab:", selectedAssignEquipment);
    navigate("/dashboard/RequestMaintenances", { state: { selectedAssignEquipment } });
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={pageVariants}
      // Dito idinagdag ang bg-slate-50 para sa white-gray background at pinalitan din ang sticky header background para magtugma
      className="h-screen max-h-[calc(100vh-120px)] overflow-y-auto font-poppins px-4 py-2 bg-slate-50"
    >
      {/* Rooms Section Header */}
      <div className="flex items-center gap-2 mb-4 sticky top-0 bg-slate-50 z-10 py-2">
        <Building2 className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-medium text-gray-700 font-poppins">
          Rooms
        </h2>
      </div>

      {/* Add vertical Line */}
      <hr className="border-t-2 border-gray-200 mb-4" />

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-poppins pb-4"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        {loading ? (
          // Loading State
          <div className="col-span-3 text-center h-64 flex items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-700 dark:text-gray-400 text-lg font-medium mt-4">
                Loading laboratories...
              </p>
            </div>
          </div>
        ) : currentLabs.length === 0 ? (
          // No Data Available Message
          <div className="col-span-3 text-center h-64 flex items-center justify-center">
            <p className="text-gray-700 dark:text-gray-400 text-lg font-medium">
              No data available.
            </p>
          </div>
        ) : (
          // Render Labs if Data Exists
          currentLabs.map((lab) => (
            <div
              key={lab._id}
              className="bg-white text-gray-700 rounded-2xl shadow-sm border border-gray-200/80 p-6 relative transform hover:scale-[1.02] transition-all h-[200px] flex flex-col"
            >
              {/* Room Title */}
              <h3 className="text-xl font-semibold mb-2 line-clamp-2 pr-16 text-slate-800">
                {lab.laboratoryName} - {lab.encharge}
              </h3>

              {/* Equipment Count */}
              <span className="absolute top-4 right-4 bg-blue-50 text-blue-600 font-medium px-3 py-1 rounded-full text-xs flex items-center gap-1 border border-blue-100 shadow-sm">
                <Layers className="w-3.5 h-3.5" />
                {lab.equipmentsCount} Equip.
              </span>

              {/* Buttons - positioned at bottom */}
              <div className="flex gap-3 mt-auto">
                <button
                  onClick={() => onLabSelect(lab.laboratoryId)}
                  className="flex justify-center items-center bg-blue-600 hover:bg-blue-700 w-11 h-11 rounded-xl text-white shadow-sm transition-all cursor-pointer"
                  title="Edit Laboratory Details"
                >
                  <Pencil className="w-5 h-5" />
                </button>
                <button
                  onClick={() => handleSelectDisplay(lab)}
                  className="flex justify-center items-center bg-indigo-600 hover:bg-indigo-700 w-11 h-11 rounded-xl text-white shadow-sm transition-all cursor-pointer"
                  title="View Equipment & Maintenance"
                >
                  <Monitor className="w-5 h-5" />
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination Controls - Sticky at bottom */}
      {showPagination && (
        <div className="sticky bottom-0 bg-slate-50 py-4 border-t border-gray-200 flex justify-center items-center space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentPage === 1
                ? "bg-gray-200/60 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            <ChevronLeft className="w-4 h-4" />
            Prev
          </button>
          
          <span className="text-sm font-medium text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`flex items-center gap-1 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              currentPage === totalPages
                ? "bg-gray-200/60 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
            }`}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}

      {isModalAddForm && (
        <AddFormModal
          isOpen={isModalAddForm}
          laboratory={selectedLab}
          onClose={handleCloseModal}
        />
      )}
    </motion.div>
  );
};

export default Laboratory;