import React, { useState, useContext,useEffect} from "react";
import { useLocation } from "react-router-dom";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";

import AddFormModal from "../Laboratories/LaboratoryForm.jsx";
import { useNavigate } from "react-router-dom";

import { LaboratoryDisplayContext } from "../Context/Laboratory/Display.jsx";
import { motion } from "framer-motion";

const Laboratory = ({ onClose }) => {
  const location = useLocation();
  const [isModalAddForm, setAddFormOpen] = useState(false);
  const { Assignlaboratories } = useContext(AssignContext); // Access context
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Items per page for pagination
  const [selectedLab, setSelectedLab] = useState(null);
  const navigate = useNavigate();
  const { laboratories, loading } = useContext(LaboratoryDisplayContext);


//para sa pagawa ng localStorage //yang selectedLab na yan yan ang susi para
//magtrigger ang mga data kasi dyaan na nakabase ang  filter na data
//para pag refresh hindi mag empty ang UI natin
const selectedLabsFromState = location.state?.selectedLab;

const [selectedLabs, setSelectedLabs] = useState(() => {
  const saved = localStorage.getItem("selectedLabs");
  //Kung may nahanap na data sa localStorage (saved), ito ay iko-convert mula sa string pabalik sa JavaScript object gamit ang JSON.parse(saved).
  return saved ? JSON.parse(saved) : selectedLabsFromState || "";
});

useEffect(() => {
  //for example may value na siya na "HeadOffice" na galing sa return sa taas
  if (selectedLabsFromState) {
    //Kapag may laman ang selectedLabsFromState, isinasave ito sa localStorage gamit ang localStorage.setItem.
    //Ang JSON.stringify ay ginagamit para gawing string ang object (kasi localStorage ay tanging string lang ang kayang itago)
    localStorage.setItem("selectedLabs", JSON.stringify(selectedLabsFromState));
    setSelectedLabs(selectedLabsFromState);
  }
}, [selectedLabsFromState]);//ito ay dependencies kungmay nabago mag render yan siya



  // Filter the laboratories based on selectedLab
  const results = Array.isArray(Assignlaboratories)
    ? Assignlaboratories.filter((lab) =>
        lab.departmentName?.toLowerCase().includes(selectedLabs?.toLowerCase())
      )
    : [];

  // Pagination logic
  const totalPages = Math.ceil(results.length / itemsPerPage); // Calculate total pages here

  const nextPage = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const prevPage = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const indexOfLastLab = currentPage * itemsPerPage;
  const indexOfFirstLab = indexOfLastLab - itemsPerPage;
  const currentLabs = results.slice(indexOfFirstLab, indexOfLastLab);

  //nag set ng total data upang lumabas ang pagination
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
    navigate("/RequestMaintenances", { state: { selectedAssignEquipment } }); // Send data to another route
  };

  //const onLabSelect = (laboratory) => {
  //setAddFormOpen(true);
  //setSelectedLab(laboratory);
  //};

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
    initial="hidden" animate="visible" variants={pageVariants}
    >
      {/* Rooms Section */}
      <h2 className="text-xl font-medium text-gray-600 mb-4 font-poppins">Rooms</h2>

      {/* Add vertical Line */}
      <hr className="border-t-2 border-gray-300 mb-4" />

      <motion.div className="px-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 font-poppins"
      initial="hidden" animate="visible" variants={pageVariants}>
        { currentLabs.length === 0 ? (
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
              className="bg-white text-gray-700 rounded-2xl shadow-lg p-6 relative transform hover:scale-105 transition-all"
              style={{
                boxShadow:
                  "8px 8px 15px rgba(0, 0, 0, 0.1), -8px -8px 15px rgba(255, 255, 255, 0.7)",
              }}
            >
              {/* Room Title */}
              <h3 className="text-xl font-semibold mb-4">
                {lab.laboratoryName} - {lab.encharge}
              </h3>

              {/* Equipment Count */}
              <span className="absolute top-4 right-4 bg-gray-400 text-white px-3 py-1 rounded-full text-xs">
                {lab.equipmentsCount} Equipment
              </span>

              {/* Buttons */}
              <div className="flex gap-4 mt-8">
                <button
                  onClick={() => onLabSelect(lab.laboratoryId)}
                  className="flex justify-center items-center bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-md"
                >
                  <i className="fas fa-pen"></i>
                </button>
                <button
                  onClick={() => handleSelectDisplay(lab)}
                  className="flex justify-center items-center bg-blue-500 hover:bg-blue-600 w-12 h-12 rounded-md"
                >
                  <i className="fas fa-desktop"></i>
                </button>
              </div>
            </div>
          ))
        )}
      </motion.div>

      {/* Pagination Controls */}
      {showPagination && (
        <div className="flex justify-center items-center mt-10 space-x-4">
          <button
            onClick={prevPage}
            disabled={currentPage === 1}
            className={`px-4 py-2 rounded-md text-lg font-medium ${
              currentPage === 1
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Prev
          </button>
          <span className="text-lg text-gray-700">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={nextPage}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 rounded-md text-lg font-medium ${
              currentPage === totalPages
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-500 text-white hover:bg-blue-600"
            }`}
          >
            Next
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