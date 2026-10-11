import React, { useState, useContext, useEffect } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import MaintenanceRecord from "../PMSForm/MaintenanceRecord";
import EquipmentReportModal from "./EquipmentReportModal"; //  BAGO
import { motion } from "framer-motion";
import { TypeofMaintenanceContext } from "../../contexts/TypesofMainten/TypeofMaintenanceContext";
import { AuthContext } from "../../contexts/AuthContext";
import { AssignLabContext } from "../../contexts/AssignLabContext/AssignLabContext";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext";

// Lucide React Icons
import {
  ClipboardList,
  Eye,
  RefreshCw,
  Calendar,
  AlertCircle,
  Search,
  ChevronLeft,
  ChevronRight,
  FlaskConical,
  Hash,
  Barcode,
  FileText, //  BAGO
} from "lucide-react";

function MaintenanceDisplay() {
  const {
    // Data
    filteredAssigns,
    Assignlaboratories,
    loading: assignsLoading,

    // Pagination
    currentPage,
    setCurrentPage,
    assignPerPage,
    setAssignPerPage,
    totalPages,
    totalAssigns,

    // Search & Filter (server-side)
    searchQuery,
    setSearchQuery,
    laboratoryFilter,
    setLaboratoryFilter,
    statusFilter,
    setStatusFilter,
    brandFilter,
    setBrandFilter,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // Helpers
    clearFilters,
    refreshAssigns,
  } = useContext(AssignLabContext);

  //  Laboratory list mula sa LaboratoryContext
  const {
    laboratories,
    fetchLaboratoryData,
  } = useContext(LaboratoryContext);

  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] = useState(false);
  const [isMaintenanceRecordModal, setMaintenanceRecordModal] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false); //  BAGO
  const { role, user } = useContext(AuthContext);

  const canEdit = role !== "Supply";

  //  Hide Generate Report para sa "user" o "User"
  const canGenerateReport = role !== "user" && role !== "User";

  // PMS Modal State
  const [isPMSModalOpen, setPMSModalOpen] = useState(false);
  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);
  const location = useLocation();
  const { displayData, DeleteType } = useContext(TypeofMaintenanceContext);
  const laboratoryData = location.state?.selectedAssignEquipment;

  const [laboratory, setlaboartory] = useState(laboratoryData || "");

  // ==========================================
  // HELPERS
  // ==========================================
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    const options = { year: "numeric", month: "short", day: "numeric" };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  //  Helper — hanapin ang laboratory name mula sa ObjectId
  const getLaboratoryName = (laboratoryId) => {
    if (!laboratoryId || !laboratories) return "";
    const lab = laboratories.find((l) => l._id === laboratoryId);
    return lab?.LaboratoryName || "";
  };

  // ==========================================
  // EFFECTS
  // ==========================================
  useEffect(() => {
    if (laboratoryData) {
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboartory(laboratoryData);
    } else {
      localStorage.removeItem("selectedLabsData");
      setlaboartory("");
    }
  }, [laboratoryData]);

  useEffect(() => {
    if (!user) {
      localStorage.removeItem("assignedEquipments");
      localStorage.removeItem("selectedLabsData");
      setlaboartory("");
    }
  }, [user]);

  //  Fetch laboratories kung wala pa sa context
  useEffect(() => {
    if (laboratories?.length === 0 && typeof fetchLaboratoryData === "function") {
      fetchLaboratoryData();
    }
  }, [laboratories, fetchLaboratoryData]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleSelectEquipment = (equipment, lab) => {
    setSendDataEquip(equipment);
    setSendDataLab(lab);
    setOpenMaintenanceModal(true);
  };

  const handleMaintenanceRecord = (equipment, lab) => {
    setSendDataEquip(equipment);
    setSendDataLab(lab);
    setMaintenanceRecordModal(true);
  };

  const handleSendData = (equipment, lab) => {
    setTypesofMaintenanceModal(true);
    setSendDataEquip(equipment);
    setSendDataLab(lab);
  };

  const handlePMSClick = (equipment, lab) => {
    setSendDataEquip(equipment);
    setSendDataLab(lab);
    setPMSModalOpen(true);
  };

  const handleCloseModal = () => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
    setMaintenanceRecordModal(false);
    setPMSModalOpen(false);
    setReportModalOpen(false); //  BAGO
  };

  const handleRetrieve = (equipment) => {
    DeleteType(equipment);
  };

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  const handleRefresh = () => {
    refreshAssigns();
  };

  // ==========================================
  // DERIVED DATA
  // ==========================================
  const allEquipments =
    filteredAssigns?.flatMap((lab) =>
      (lab.equipments || []).map((equip) => ({
        ...equip,
        laboratoryName: lab.laboratoryName,
        laboratoryId: lab.laboratoryId,
        departmentName: lab.departmentName,
        encharge: lab.encharge,
        enchargeId: lab.enchargeId,
        labData: lab,
      }))
    ) || [];

  const uniqueEquipments = Array.from(
    new Map(allEquipments.map((equip) => [equip._id, equip])).values()
  );

  const equipmentTypes = [
    ...new Set(displayData?.map((item) => item.equipmentType)),
  ];

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  const hasActiveFilters =
    searchQuery ||
    laboratoryFilter ||
    statusFilter ||
    brandFilter;

  // ==========================================
  // RENDER — Maintenance Record Modal
  // ==========================================
  if (isMaintenanceRecordModal && canEdit) {
    return (
      <motion.div
        className="w-full"
        initial="hidden"
        animate="visible"
        variants={pageVariants}
      >
        <MaintenanceRecord
          isOpen={isMaintenanceRecordModal}
          toLab={SendDataLab}
          toEquip={SendDataEquip}
          laboratory={SendDataLab}
          equipment={SendDataEquip}
          onClose={handleCloseModal}
        />
      </motion.div>
    );
  }

  // ==========================================
  // RENDER — Main
  // ==========================================
  return (
    <motion.div
      className="space-y-4"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* View Only Banner */}
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

      <div className="border rounded-lg p-6 shadow-sm bg-white w-full">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-blue-900">
            Equipment Inventory
          </h2>
          <div className="flex items-center gap-2">
            {/*  GENERATE REPORT BUTTON — hidden kapag role ay user/User */}
            {canGenerateReport && (
              <button
                onClick={() => setReportModalOpen(true)}
                className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700
                  transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
                title="Generate Report"
              >
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Generate Report</span>
              </button>
            )}

            <button
              onClick={handleRefresh}
              disabled={assignsLoading}
              className="p-2 rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors disabled:opacity-50"
              title="Refresh equipment list"
            >
              <RefreshCw
                className={`w-4 h-4 ${assignsLoading ? "animate-spin" : ""}`}
              />
            </button>
            <span className="text-xs text-gray-500 font-medium">
              Total:{" "}
              <span className="font-bold text-blue-700">
                {totalAssigns || 0}
              </span>
            </span>
          </div>
        </div>

        {/* SEARCH & FILTER BAR */}
        <div className="mb-4 flex flex-col lg:flex-row gap-2 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search code, serial, brand..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 p-3 border border-gray-300 rounded-xl text-sm
                focus:ring-2 focus:ring-blue-500 outline-none transition-all"
            />
          </div>

          {/*  Laboratory Filter */}
          <div className="relative min-w-[200px]">
            <FlaskConical
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
              size={14}
            />
            <select
              value={laboratoryFilter}
              onChange={(e) => setLaboratoryFilter(e.target.value)}
              className="w-full pl-9 pr-8 py-3 border border-gray-300 rounded-xl text-sm
                focus:ring-2 focus:ring-blue-500 outline-none appearance-none bg-white"
            >
              <option value="">All Laboratories</option>
              {laboratories?.map((lab) => (
                <option key={lab._id} value={lab._id}>
                  {lab.LaboratoryName}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-3 border border-gray-300 rounded-xl text-sm
              focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="">All Status</option>
            <option value="Available">Available</option>
            <option value="Not Available">Not Available</option>
            <option value="Defective">Defective</option>
            <option value="Missing">Missing</option>
            <option value="Fixed">Fixed</option>
            <option value="Found">Found</option>
          </select>

          {/* Sort */}
          <select
            value={`${sortBy}|${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("|");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-3 border border-gray-300 rounded-xl text-sm
              focus:ring-2 focus:ring-blue-500 outline-none bg-white"
          >
            <option value="createdAt|desc">Newest First</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="Laboratory|asc">Laboratory (A-Z)</option>
            <option value="Laboratory|desc">Laboratory (Z-A)</option>
          </select>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="px-4 py-3 text-sm bg-gray-200 hover:bg-gray-300
                text-gray-700 rounded-xl transition-colors whitespace-nowrap"
            >
              Clear
            </button>
          )}
        </div>

        {/*  Active Filter Chips */}
        {hasActiveFilters && (
          <div className="mb-3 flex flex-wrap gap-2 items-center">
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                Search: "{searchQuery}"
                <button
                  onClick={() => setSearchQuery("")}
                  className="ml-1 hover:text-blue-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {laboratoryFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-cyan-100 text-cyan-700 rounded-full">
                Lab: {getLaboratoryName(laboratoryFilter)}
                <button
                  onClick={() => setLaboratoryFilter("")}
                  className="ml-1 hover:text-cyan-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            {statusFilter && (
              <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 text-green-700 rounded-full">
                Status: {statusFilter}
                <button
                  onClick={() => setStatusFilter("")}
                  className="ml-1 hover:text-green-900 font-bold"
                >
                  ×
                </button>
              </span>
            )}
            <span className="text-xs text-gray-500 ml-1">
              {uniqueEquipments.length} result
              {uniqueEquipments.length !== 1 ? "s" : ""}
            </span>
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse border border-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  <div className="flex items-center gap-2">
                    <Hash size={12} />
                    Code
                  </div>
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  <div className="flex items-center gap-2">
                    <Barcode size={12} />
                    Serial#
                  </div>
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  Brand
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  Category
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  Laboratory
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  Last Maint.
                </th>
                <th className="p-4 border-b text-xs font-bold uppercase text-gray-600">
                  Next Maint.
                </th>
                {canEdit && (
                  <th className="p-4 border-b text-xs font-bold uppercase text-gray-600 text-center">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {assignsLoading ? (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    className="p-10 text-center text-gray-500"
                  >
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent"></div>
                      <span>Loading equipment...</span>
                    </div>
                  </td>
                </tr>
              ) : uniqueEquipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    className="p-10 text-center text-gray-400 italic"
                  >
                    {hasActiveFilters
                      ? "No matching equipment found."
                      : "No equipment found."}
                  </td>
                </tr>
              ) : (
                uniqueEquipments.map((equipment) => (
                  <tr
                    key={equipment._id}
                    className="hover:bg-blue-50/50 transition-colors border-b"
                  >
                    <td className="p-4 text-sm">
                      <span className="font-mono text-xs font-semibold text-blue-700
                        bg-blue-50 px-2 py-1 rounded-md border border-blue-100">
                        {equipment.code || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-sm font-medium font-mono">
                      {equipment.SerialNumber || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {equipment.Brand || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      <span className="px-2 py-0.5 text-xs bg-blue-50 text-blue-700 rounded-full">
                        {equipment.categoryName || "N/A"}
                      </span>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {equipment.laboratoryName || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {formatDate(equipment.lastMaintenanceDate)}
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        {formatDate(equipment.nextMaintenanceDate)}
                        {equipment.hasMaintenance && (
                          <AlertCircle
                            className="w-4 h-4 text-red-500 animate-pulse"
                            title="Maintenance Scheduled!"
                          />
                        )}
                      </div>
                    </td>
                    {canEdit && (
                      <td className="p-4 flex space-x-2 justify-center items-center flex-wrap gap-1">
                        {equipment.hasMaintenance && (
                          <button
                            onClick={() =>
                              handlePMSClick(equipment, equipment.labData)
                            }
                            className="px-2.5 py-1 text-white bg-red-600 rounded hover:bg-red-700 transition-colors flex items-center justify-center"
                            title="Planned Maintenance System"
                          >
                            <span className="text-[10px] font-bold">PMS</span>
                          </button>
                        )}

                        <button
                          onClick={() =>
                            handleSelectEquipment(equipment, equipment.labData)
                          }
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
                            onClick={() =>
                              handleSendData(equipment, equipment.labData)
                            }
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

        {/* PAGINATION */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
          <div className="text-xs text-gray-500">
            Showing{" "}
            <span className="font-medium text-gray-700">
              {uniqueEquipments.length === 0
                ? 0
                : Math.min(
                    uniqueEquipments.length,
                    (currentPage - 1) * assignPerPage + 1
                  )}
            </span>{" "}
            to{" "}
            <span className="font-medium text-gray-700">
              {Math.min(currentPage * assignPerPage, uniqueEquipments.length)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-gray-700">
              {uniqueEquipments.length}
            </span>{" "}
            entries
          </div>

          <div className="flex items-center gap-2">
            <select
              value={assignPerPage}
              onChange={(e) => setAssignPerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-gray-300 rounded bg-white text-gray-700"
            >
              {[6, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>
                  {n} / page
                </option>
              ))}
            </select>

            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || uniqueEquipments.length === 0}
              className="p-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors"
            >
              <ChevronLeft size={14} />
            </button>

            <span className="px-3 py-1 text-xs font-medium text-gray-700">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={
                currentPage === (totalPages || 1) ||
                uniqueEquipments.length === 0
              }
              className="p-2 bg-gray-100 text-sm font-bold rounded-lg disabled:opacity-30 hover:bg-gray-200 transition-colors"
            >
              <ChevronRight size={14} />
            </button>
          </div>
        </div>

        {/* MODALS */}
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
        {isPMSModalOpen && canEdit && (
          <TypeMaintenanceModal
            isOpen={isPMSModalOpen}
            onClose={handleCloseModal}
            equipmentId={SendDataEquip?._id}
            equipment={SendDataEquip}
            laboratory={SendDataLab}
          />
        )}

        {/*  REPORT MODAL — lalabas lang kung allowed */}
        {canGenerateReport && (
          <EquipmentReportModal
            isOpen={isReportModalOpen}
            onClose={() => setReportModalOpen(false)}
            equipmentData={uniqueEquipments}
            laboratories={laboratories}
            defaultPreparedBy={user?.name || user?.username || ""}
          />
        )}
      </div>
    </motion.div>
  );
}

export default MaintenanceDisplay;