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
  const [animateExit, setAnimateExit] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [categories, setCategories] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

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
    (equip.Brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
  const totalPages = Math.ceil(filteredEquipment.length / equipmentsPerPage);

  const paginatedEquipment =
    filteredEquipment.slice(
      (currentPage - 1) * equipmentsPerPage,
      currentPage * equipmentsPerPage
    ) || [];

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
    }
  };

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
