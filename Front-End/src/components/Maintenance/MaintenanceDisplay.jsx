import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";

function MaintenanceDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const location = useLocation();
  const laboratory = location.state?.selectedAssignEquipment || {}; // Default to empty object if undefined
  const [equipmentsPerPage, setequipmentsPerPage] = useState(6);
  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);

  // Ensure equipment is only accessed if it's available
  const AssignEquipmentSpecific = laboratory.equipments || []; // Default to empty array if undefined

  const handleSelectEquipment = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setOpenMaintenanceModal(true);
  };

  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
  };

  const filteredEquipment = AssignEquipmentSpecific.filter((equip) =>
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

  return (
    <div className="p-6 space-y-6">
      {/* Header Section */}
      <div className="border rounded-lg p-4 shadow-sm bg-white w-full">
        <h2 className="text-lg md:text-xl font-medium text-gray-700 mb-2">In-charge</h2>
        <div className="border-t pt-2">
          <p className="text-gray-900 font-semibold text-sm md:text-base">
            {laboratory.encharge || "No Encharge Info"}
          </p>
        </div>
      </div>

      <div className="border rounded-lg p-4 shadow-sm bg-white w-full">
        <h2 className="text-lg md:text-xl font-medium text-gray-700 mb-2">Department</h2>
        <div className="border-t pt-2">
          <p className="text-gray-900 font-semibold text-sm md:text-base">
            {laboratory._id || "No Department Info"}
          </p>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="border rounded-lg p-6 shadow-sm bg-white w-full">
        <h2 className="text-xl md:text-2xl font-bold mb-4">Equipment Table</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full p-2 border rounded-lg text-sm md:text-base"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse mb-4 border border-gray-300">
            <thead>
              <tr>
                <th className="p-4 border-b border-gray-300 text-sm md:text-base">Serial#</th>
                <th className="p-4 border-b border-gray-300 text-sm md:text-base">Brand</th>
                <th className="p-4 border-b border-gray-300 text-sm md:text-base">Specification</th>
                <th className="p-4 border-b border-gray-300 text-sm md:text-base">Category</th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.length === 0 ? (
                <tr>
                  <td colSpan={6} className="border p-2 text-center text-gray-500 text-sm md:text-base">
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((equipment) => (
                  <tr key={equipment._id} className="hover:bg-gray-100">
                    <td className="border p-2 text-sm md:text-base">{equipment.SerialNumber}</td>
                    <td className="border p-2 text-sm md:text-base">{equipment.Brand}</td>
                    <td className="border p-2 text-sm md:text-base">{equipment.Specification}</td>
                    <td className="border p-2 text-sm md:text-base">{equipment.categoryName}</td>
                    <td className="border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() => handleSelectEquipment(equipment, laboratory)}
                        className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-tools"></i> Maintenance
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-2 px-4 bg-gray-200 rounded-full text-sm md:text-base"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          <div className="flex space-x-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-2 px-4 rounded-full text-sm md:text-base ${
                  currentPage === i + 1 ? "bg-blue-500 text-white" : "border"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-2 px-4 bg-gray-200 rounded-full text-sm md:text-base"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>
        {isOpenMaintenanceModal && (
          <MaintenanceDisplayModal
            isOpen={isOpenMaintenanceModal}
            Lab={SendDataLab}
            Equip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </div>
  );
}

export default MaintenanceDisplay;
