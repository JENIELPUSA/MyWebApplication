import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import { motion } from "framer-motion";
import { AddTypeMaintenance } from "../Context/TypesofMainten/addmaintenance";

function MaintenanceDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] =
    useState(false);
  const [assignEquipments, setAssignEquipments] = useState([]);
  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);

  const location = useLocation();
  const laboratory = location.state?.selectedAssignEquipment || {};
  const { displayData, DeleteType } = useContext(AddTypeMaintenance);
  const [equipmentsPerPage] = useState(6);

  // Store equipment list from location.state only once
  useEffect(() => {
    const equipments =
      location.state?.selectedAssignEquipment?.equipments || [];
    setAssignEquipments(equipments);
  }, [location.state]);

  const handleSelectEquipment = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setOpenMaintenanceModal(true);
  };

  const handleSendData = (equipment, laboratory) => {
    setTypesofMaintenanceModal(true);
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
  };

  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
  };

  const handleRetrieve = (equipment) => {
    DeleteType(equipment);
  };

  // Animation Variants
  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  // Remove duplicate equipment entries
  const uniqueEquipments = Array.from(
    new Map(assignEquipments.map((equip) => [equip._id, equip])).values()
  );

  const filteredEquipment = uniqueEquipments.filter((equip) =>
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

  // Remove duplicate equipmentType IDs
  const equipmentTypes = [
    ...new Set(displayData?.map((item) => item.equipmentType)),
  ];

  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* Header Section */}
      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-4 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-lg md:text-xl font-medium text-gray-700 mb-2">
          In-charge
        </h2>
        <div className="border-t pt-2">
          <p className="xs:text-xs text-gray-900 font-semibold text-sm md:text-base">
            {laboratory.encharge || "No Encharge Info"}
          </p>
        </div>
      </motion.div>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-4 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-lg md:text-xl font-medium text-gray-700 mb-2">
          Department
        </h2>
        <div className="border-t pt-2">
          <p className="xs:text-xs text-gray-900 font-semibold text-sm md:text-base">
            {laboratory._id || "No Department Info"}
          </p>
        </div>
      </motion.div>

      {/* Equipment Table */}
      <div
        initial="hidden"
        animate="visible"
        variants={pageVariants}
        className="border rounded-lg p-6 shadow-sm bg-white w-full"
      >
        <h2 className="xs:text-xs text-xl md:text-2xl font-bold mb-4">
          Equipment Table
        </h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Reset to page 1 on search
            }}
            className="w-full p-2 border rounded-lg text-sm md:text-base"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse mb-4 border border-gray-300  sm:px-6 md:px-10 lg:px-20 xl:px-40">
            <thead>
              <tr>
                <th className="xs:p-1 xs:text-xs p-4 border-b border-gray-300 text-sm md:text-base">
                  Serial#
                </th>
                <th className="xs:p-1 xs:text-xs p-4 border-b border-gray-300 text-sm md:text-base">
                  Brand
                </th>
                <th className="xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base">
                  Specification
                </th>
                <th className=" xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base">
                  Category
                </th>
                <th className=" xs:p-1 xs:text-xs  p-4 border-b border-gray-300 text-sm md:text-base text-center">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="border p-2 text-center text-gray-500 text-sm md:text-base"
                  >
                    No Results Found
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((equipment) => (
                  <tr key={equipment._id} className="hover:bg-gray-100">
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.SerialNumber}
                    </td>
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.Brand}
                    </td>
                    <td className="xs:p-1 xs:text-xs border p-2 text-sm md:text-base">
                      {equipment.Specification}
                    </td>
                    <td className="border p-2 text-sm md:text-base">
                      {equipment.categoryName}
                    </td>

                    <td className="border p-2 flex space-x-2 justify-center">
                      <button
                        onClick={() =>
                          handleSelectEquipment(equipment, laboratory)
                        }
                        className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                      >
                        <i className="fas fa-tools"></i>
                      </button>

                      {equipmentTypes.includes(equipment._id) ? (
                        <button
                          onClick={() => handleRetrieve(equipment)}
                          className="px-3 py-1 text-white bg-red-500 rounded hover:bg-blue-600"
                        >
                          <i className="fas fa-sync-alt"></i>
                        </button>
                      ) : (
                        <button
                          onClick={() => handleSendData(equipment, laboratory)}
                          className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                        >
                          <i className="fas fa-calendar-alt"></i>
                        </button>
                      )}
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
        {isOpenMaintenanceModal && (
          <MaintenanceDisplayModal
            isOpen={isOpenMaintenanceModal}
            Lab={SendDataLab}
            Equip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}

        {isTypesofMaintenanceModal && (
          <TypesofMaintenceForm
            isOpen={isTypesofMaintenanceModal}
            toLab={SendDataLab}
            toEquip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
      </div>
    </motion.div>
  );
}

export default MaintenanceDisplay;
