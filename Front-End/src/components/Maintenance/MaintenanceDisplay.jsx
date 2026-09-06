import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";
import CalibrationTable from "../Calibration/CalibrationTable";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import { motion } from "framer-motion";
import { TypeofMaintenanceContext } from "../../contexts/TypesofMainten/TypeofMaintenanceContext";
import { AuthContext } from "../../contexts/AuthContext";

// Lucide React Icons
import {
  Wrench,
  Eye,
  RefreshCw,
  Calendar,
  AlertCircle
} from "lucide-react";

function MaintenanceDisplay() {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [isCalibration, setCalibration] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] = useState(false);
  const { role } = useContext(AuthContext);

  // Check if user has edit permissions
  const canEdit = role !== "Supply";

  // NEW STATE: Para sa PMS Modal
  const [isPMSModalOpen, setPMSModalOpen] = useState(false);
  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);
  const location = useLocation();
  const { displayData, DeleteType } = useContext(TypeofMaintenanceContext);
  const [equipmentsPerPage] = useState(6);
  const laboratoryData = location.state?.selectedAssignEquipment;

  const [assignEquipments, setAssignEquipments] = useState(() => {
    const saved = localStorage.getItem("assignedEquipments");
    return saved ? JSON.parse(saved) : [];
  });

  const [laboratory, setlaboartory] = useState(() => {
    const saved = localStorage.getItem("selectedLabsData");
    return saved ? JSON.parse(saved) : laboratoryData || "";
  });

  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  useEffect(() => {
    if (laboratoryData) {
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboartory(laboratoryData);
    }
  }, [laboratoryData]);

  useEffect(() => {
    const equipments = location.state?.selectedAssignEquipment?.equipments;
    if (equipments && equipments.length > 0) {
      localStorage.setItem("assignedEquipments", JSON.stringify(equipments));
      setAssignEquipments(equipments);
    }
  }, [location.state]);

  const handleSelectEquipment = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setOpenMaintenanceModal(true);
  };

  const handleCalibration = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setCalibration(true);
  };

  const handleSendData = (equipment, laboratory) => {
    setTypesofMaintenanceModal(true);
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
  };

  const handlePMSClick = (equipment, laboratory) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setPMSModalOpen(true);
  };

  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
    setCalibration(false);
    setPMSModalOpen(false);
  };

  const handleRetrieve = (equipment) => {
    DeleteType(equipment);
  };

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const uniqueEquipments = Array.from(
    new Map(assignEquipments.map((equip) => [equip._id, equip])).values()
  );

  const filteredEquipment = uniqueEquipments.filter((equip) =>
    (equip.SerialNumber?.toLowerCase() || "").includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredEquipment.length / equipmentsPerPage);
  const paginatedEquipment = filteredEquipment.slice(
    (currentPage - 1) * equipmentsPerPage,
    currentPage * equipmentsPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) setCurrentPage(pageNumber);
  };

  const equipmentTypes = [...new Set(displayData?.map((item) => item.equipmentType))];

  return (
    <motion.div className="space-y-4" initial="hidden" animate="visible" variants={pageVariants}>
      {/* View Only Banner for Supply Role */}
      {!canEdit && (
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-800">View Only Mode</span>
          </div>
          <span className="text-xs font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
            {role || "Supply"} Role
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div variants={pageVariants} className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">In-charge</h2>
          <p className="text-gray-900 font-bold text-lg">{laboratory.encharge || "No Encharge Info"}</p>
        </motion.div>

        <motion.div variants={pageVariants} className="border rounded-lg p-4 shadow-sm bg-white">
          <h2 className="text-sm font-medium text-gray-500 mb-1 uppercase tracking-wider">Department ID</h2>
          <p className="text-gray-900 font-bold text-lg">{laboratory._id || "No Department Info"}</p>
        </motion.div>
      </div>

      <div className="border rounded-lg p-6 shadow-sm bg-white w-full">
        <h2 className="text-xl md:text-2xl font-black mb-4 text-blue-900">Equipment Inventory</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Serial Number..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full p-3 border border-gray-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Serial#</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Brand</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Category</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Last Maint.</th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">Next Maint.</th>
                {/* HIDE Actions Header when role is Supply */}
                {canEdit && (
                  <th className="p-4 border-b text-xs font-bold uppercase text-gray-600 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {paginatedEquipment.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 6 : 5} className="p-10 text-center text-gray-400 italic">
                    No equipment found.
                  </td>
                </tr>
              ) : (
                paginatedEquipment.map((equipment) => (
                  <tr key={equipment._id} className="hover:bg-blue-50/50 transition-colors border-b">
                    <td className="p-4 text-sm font-medium">{equipment.SerialNumber}</td>
                    <td className="p-4 text-sm text-gray-600">{equipment.Brand}</td>
                    <td className="p-4 text-sm text-gray-600">{equipment.categoryName}</td>
                    <td className="p-4 text-sm text-gray-600">{formatDate(equipment.lastMaintenanceDate)}</td>
                    <td className="p-4 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        {formatDate(equipment.nextMaintenanceDate)}
                        {equipment.hasMaintenance && (
                          <AlertCircle className="w-4 h-4 text-red-500 animate-pulse" title="Maintenance Scheduled!" />
                        )}
                      </div>
                    </td>
                    {/* HIDE ALL Action Buttons when role is Supply */}
                    {canEdit && (
                      <td className="p-4 flex space-x-2 justify-center items-center flex-wrap gap-1">
                        {/* PMS BUTTON */}
                        {equipment.hasMaintenance && (
                          <button
                            onClick={() => handlePMSClick(equipment, laboratory)}
                            className="px-2.5 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                            title="Planned Maintenance System"
                          >
                            <span className="text-[10px] font-bold">PMS</span>
                          </button>
                        )}

                        <button
                          onClick={() => handleCalibration(equipment, laboratory)}
                          className="p-2 text-white bg-teal-500 rounded-lg hover:bg-teal-600 transition-colors"
                          title="Calibration"
                        >
                          <Wrench className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleSelectEquipment(equipment, laboratory)}
                          className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {equipmentTypes.includes(equipment._id) ? (
                          <button
                            onClick={() => handleRetrieve(equipment)}
                            className="p-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600 transition-colors"
                            title="Retrieve"
                          >
                            <RefreshCw className="w-4 h-4" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleSendData(equipment, laboratory)}
                            className="p-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600 transition-colors"
                            title="Schedule Maintenance"
                          >
                            <Calendar className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between mt-6">
          <p className="text-xs text-gray-500">
            Page {currentPage} of {totalPages || 1}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="px-4 py-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              className="px-4 py-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30"
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>

        {/* Modals Container - Only open if canEdit */}
        {isOpenMaintenanceModal && canEdit && (
          <MaintenanceDisplayModal
            isOpen={isOpenMaintenanceModal}
            Lab={SendDataLab}
            Equip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
        {isTypesofMaintenanceModal && canEdit && (
          <TypesofMaintenceForm
            isOpen={isTypesofMaintenanceModal}
            toLab={SendDataLab}
            toEquip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}
        {isCalibration && canEdit && (
          <CalibrationTable
            isOpen={isCalibration}
            toLab={SendDataLab}
            toEquip={SendDataEquip}
            onClose={handleCloseModal}
          />
        )}

        {/* NEW: PMS Modal Integration */}
        {isPMSModalOpen && canEdit && (
          <TypeMaintenanceModal
            isOpen={isPMSModalOpen}
            onClose={handleCloseModal}
            equipmentId={SendDataEquip?._id}
            equipment={SendDataEquip}
            laboratory={SendDataLab}
          />
        )}
      </div>
    </motion.div>
  );
}

export default MaintenanceDisplay;