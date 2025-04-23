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
const LaboratoryTable = ({ isOpen, onClose }) => {
  const {
    laboratories,
    setLaboratories,
    currentPage,
    laboratoryPerPage,
    setCurrentPage,
    DeleteLaboratory,
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

  const filteredLaboratories = laboratories.filter(
    (lab) =>
      lab.LaboratoryName &&
      lab.LaboratoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredLaboratories.length / laboratoryPerPage); // Calculate total pages
  const paginatedLab = filteredLaboratories.slice(
    (currentPage - 1) * laboratoryPerPage,
    currentPage * laboratoryPerPage
  );
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
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
            placeholder="Search Equipment..."
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

        {isModalAddForm && (
          <AddFormModal
            isOpen={isModalAddForm}
            onAddLaboratory={handleAddLaboratory}
            OnEditLaboratory={handleUpdateLaboratory}
            laboratory={selectedLab}
            onClose={handleCloseModal}
            modalType={modalType}
            isAnimating={isAnimating}
          />
        )}
      </motion.div>
    </motion.div>
  );
};

export default LaboratoryTable;
