import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PopupModal from "./popupModal";
import EquipmentformModal from "./Equipment";
import RetrieveForm from "./Retrieve";
import { FaPlus } from "react-icons/fa";
import { EquipmentContext } from "../CountContext";
import { EquipmentDisplayContext } from "../Context/EquipmentContext/DisplayContext";

const ModalTable = ({ isOpen, onClose }) => {
  const { setEquipmentCount } = useContext(EquipmentContext);
  const {
    equipment,
    setEquipment,
    currentPage,
    setCurrentPage,
    equipmentsPerPage
  
  } = useContext(EquipmentDisplayContext);

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
    const category = categories.find((cat) => cat._id === newEquipment.Category);
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
    if (!equipmentID) {
      toast.error("Equipment ID is required to delete.");
      return;
    }

    try {
      await axios.delete(
        `http://127.0.0.1:3000/api/v1/equipment/${equipmentID}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setEquipment((prevEquipment) =>
        prevEquipment.filter((equipment) => equipment._id !== equipmentID)
      );
      setEquipmentCount((prevCount) => prevCount - 1);
      toast.success("Equipment deleted successfully!");
    } catch (error) {
      console.error("Error deleting equipment:", error);
      toast.error("Failed to delete equipment.");
    }
  };

  // Filtered and paginated equipment data
  const filteredEquipment = equipment.filter((equip) =>
    (equip.Brand?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );
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

  const handleAddEquipment = (newEquipment) => {
    const category = categories.find((cat) => cat._id === newEquipment.Category);
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
    <div className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-4xl w-full text-black shadow-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700"
        >
          <i className="fas fa-times"></i>
        </button>

        <h2 className="text-xl font-bold mb-4">Equipment Table</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg"
          />
        </div>

        <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
          <thead>
            <tr>
              <th className="p-4 border-b border-gray-300">Serial#</th>
              <th className="p-4 border-b border-gray-300">Brand</th>
              <th className="p-4 border-b border-gray-300">Specification</th>
              <th className="p-4 border-b border-gray-300">Status</th>
              <th className="p-4 border-b border-gray-300">Category</th>
              <th className="p-4 border-b border-gray-300">
                <button
                  onClick={handleAddClick}
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedEquipment.length === 0 ? (
              <tr>
                <td colSpan={6} className="border p-2 text-center text-gray-500">
                  No Results Found
                </td>
              </tr>
            ) : (
              paginatedEquipment.map((equipment) => (
                <tr key={equipment._id} className="hover:bg-gray-100">
                  <td className="border p-2">{equipment.SerialNumber}</td>
                  <td className="border p-2">{equipment.Brand}</td>
                  <td className="border p-2">{equipment.Specification}</td>
                  <td
                    className={`border p-2 ${
                      equipment.status === "Available"
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {equipment.status}
                  </td>
                  <td className="border p-2">
                    {equipment.CategoryName || "N/A"}
                  </td>
                  <td className="border p-2 flex space-x-2 justify-center">
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

        <div className="flex justify-between items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-2 px-4 rounded-full ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-2 px-4 bg-gray-200 rounded-full"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {isModalOpen && (
             //name ng component
          <PopupModal
            isOpen={isModalOpen}
            onClose={handleCloseModal}
            onConfirm={handleEquipmentUpdate}
            equipment={selectedEquipment}
            onAddAssign={handleAssign}
          />
        )}

        {isFormModalOpen && (
             //name ng component
          <EquipmentformModal
            isOpen={isFormModalOpen}
            onAddEquipment={handleAddEquipment}
            onClose={handleCloseModal}
            equipment={selectedEquipment}
            onEditEquipment={handleEditEquipment}
          />
        )}

        {isRetrieveModalOpen && (
             //name ng component
          <RetrieveForm
            isOpen={isRetrieveModalOpen}
            onClose={handleCloseModal}
            equipment={selectedEquipment}
            onEditStatus={handleEditEquipment}
          />
        )}
      </div>
    </div>
  );
};

export default ModalTable;
