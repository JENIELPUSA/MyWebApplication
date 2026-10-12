import React, { useState, useContext, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocation } from "react-router-dom";
import MaintenanceDisplayModal from "../MaintenanceRequest/MaintenanceModalDisplay";
import TypesofMaintenceForm from "../TypesOfMaintenance/TypesofMaintenceForm";
import MaintenanceRecord from "../PMSForm/MaintenanceRecord";
import EquipmentReportModal from "./EquipmentReportModal";
import { motion } from "framer-motion";
import { TypeofMaintenanceContext } from "../../contexts/TypesofMainten/TypeofMaintenanceContext";
import { AddAssignContext } from "../../contexts/AssignContext/AddAssignContext";
import { AuthContext } from "../../contexts/AuthContext";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext";

// Lucide React Icons
import {
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  FileText,
  Search,
  X,
  Loader2,
} from "lucide-react";

function MaintenanceDisplay() {
  // ============================================================
  // ✅ SEARCH & PAGINATION STATE (server-driven)
  // ============================================================
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentsPerPage, setEquipmentsPerPage] = useState(6);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] = useState(false);
  const [isMaintenanceRecordModal, setMaintenanceRecordModal] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);

  // ============================================================
  // ✅ CONTEXT
  // ============================================================
  const { role, user } = useContext(AuthContext);
  const {
    assigns,
    displayAssign,
    pagination,
    loading: assignLoading,
  } = useContext(AddAssignContext);
  const { displayData, DeleteType } = useContext(TypeofMaintenanceContext);
  const { laboratories, fetchLaboratoryData } = useContext(LaboratoryContext);

  const canEdit = role !== "Supply";
  const canGenerateReport = role !== "user" && role !== "User";

  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);

  const location = useLocation();
  const laboratoryData = location.state?.selectedAssignEquipment;

  const isFirstRender = useRef(true);

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

  // ============================================================
  // ✅ DEBOUNCED SEARCH (500ms)
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchInput]);

  // ============================================================
  // ✅ SERVER-SIDE FETCH
  // ============================================================
  useEffect(() => {
    if (isFirstRender.current && laboratoryData) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;

    const labId =
      laboratory?._id ||
      laboratory?.laboratoryId ||
      laboratoryData?._id ||
      laboratoryData?.laboratoryId;

    const queryParams = {
      page: currentPage,
      limit: equipmentsPerPage,
      search: searchTerm.trim(),
      sortBy,
      sortOrder,
    };

    if (labId) {
      queryParams.laboratory = labId;
    }

    if (typeof displayAssign === "function") {
      displayAssign(queryParams);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, equipmentsPerPage, searchTerm, sortBy, sortOrder, laboratory?._id]);

  // ============================================================
  // Save laboratoryData to localStorage
  // ============================================================
  useEffect(() => {
    if (laboratoryData) {
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboartory(laboratoryData);
    }
  }, [laboratoryData]);

  // ============================================================
  // Save equipments to localStorage
  // ============================================================
  useEffect(() => {
    const equipments = location.state?.selectedAssignEquipment?.equipments;
    if (equipments && equipments.length > 0) {
      localStorage.setItem("assignedEquipments", JSON.stringify(equipments));
      setAssignEquipments(equipments);
    }
  }, [location.state]);

  // ============================================================
  // ✅ SYNC
  // ============================================================
  useEffect(() => {
    if (assigns && assigns.length > 0) {
      const allEquipments = assigns.flatMap((lab) => lab.equipments || []);
      if (allEquipments.length > 0) {
        setAssignEquipments(allEquipments);
        localStorage.setItem("assignedEquipments", JSON.stringify(allEquipments));
      }
    }
  }, [assigns]);

  // ============================================================
  // Fetch laboratories
  // ============================================================
  useEffect(() => {
    if (laboratories?.length === 0 && typeof fetchLaboratoryData === "function") {
      fetchLaboratoryData();
    }
  }, [laboratories, fetchLaboratoryData]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCloseModal = useCallback(() => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
    setMaintenanceRecordModal(false);
    setReportModalOpen(false);
  }, []);

  const handleSelectEquipment = useCallback((equipment) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setOpenMaintenanceModal(true);
  }, [laboratory]);

  const handleSendData = useCallback((equipment) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setTypesofMaintenanceModal(true);
  }, [laboratory]);

  const handleMaintenanceRecord = useCallback((equipment) => {
    setSendDataEquip(equipment);
    setSendDataLab(laboratory);
    setMaintenanceRecordModal(true);
  }, [laboratory]);

  const handleRetrieve = useCallback((equipment) => {
    DeleteType(equipment);
  }, [DeleteType]);

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const goToPage = useCallback((page) => {
    const safePage = Math.max(1, Math.min(page, pagination.totalPages || 1));
    setCurrentPage(safePage);
  }, [pagination.totalPages]);

  const pageVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  // ============================================================
  // ✅ DERIVED DATA
  // ============================================================
  const uniqueEquipments = useMemo(() => {
    return Array.from(
      new Map(assignEquipments.map((equip) => [equip._id, equip])).values()
    );
  }, [assignEquipments]);

  const equipmentTypes = useMemo(
    () => displayData?.map((item) => item.equipment) || [],
    [displayData]
  );

  const totalPages = pagination.totalPages || 1;
  const totalRecords = pagination.totalRecords || 0;

  // ============================================================
  // HIDE EVERYTHING ELSE WHEN MAINTENANCE RECORD IS OPEN
  // ============================================================
  if (isMaintenanceRecordModal && canEdit) {
    return (
      <motion.div
        className="w-full bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors"
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

  return (
    <motion.div
      className="space-y-4 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 transition-colors min-h-screen p-1"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* View Only Banner for Supply Role */}
      {!canEdit && (
        <div className="bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between transition-colors">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
              View Only Mode
            </span>
          </div>
          <span className="text-xs font-bold text-blue-600 dark:text-blue-300 bg-blue-100 dark:bg-blue-900 px-3 py-1 rounded-full">
            {role || "Supply"} Role
          </span>
        </div>
      )}

      <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 shadow-sm bg-white dark:bg-gray-800 w-full transition-colors">
        {/* HEADER */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl md:text-2xl font-black text-blue-900 dark:text-blue-300">
            Equipment Inventory
          </h2>

          {canGenerateReport && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700
                dark:bg-emerald-500 dark:hover:bg-emerald-600
                transition-colors flex items-center gap-2 text-sm font-medium shadow-sm"
              title="Generate Report"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </button>
          )}
        </div>

        {/* ============================================================ */}
        {/* ✅ SEARCH BAR                                                 */}
        {/* ============================================================ */}
        <div className="mb-4 flex flex-col sm:flex-row gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
            <input
              type="text"
              placeholder="Search by Serial Number, Brand, Code, Specification..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-10 pr-10 p-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm
                bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-all"
            />
            {searchInput && (
              <button
                onClick={handleClearSearch}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                title="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            {assignLoading && (
              <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
            )}
          </div>

          <select
            value={equipmentsPerPage}
            onChange={(e) => {
              setEquipmentsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="p-3 border border-gray-300 dark:border-gray-600 rounded-xl text-sm
              bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100
              focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 outline-none transition-colors"
          >
            <option value={6}>6 per page</option>
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>

        {/* ✅ SEARCH RESULT INFO */}
        {searchTerm && (
          <div className="mb-3 text-sm text-gray-600 dark:text-gray-400">
            Showing results for:{" "}
            <span className="font-semibold text-blue-700 dark:text-blue-300">
              "{searchTerm}"
            </span>{" "}
            ({totalRecords} found)
          </div>
        )}

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="min-w-full text-left table-auto border-collapse border border-gray-200 dark:border-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Code</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Serial#</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Brand</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Category</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Specification</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Last Maint.</th>
                <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300">Next Maint.</th>
                {canEdit && (
                  <th className="p-4 border-b border-gray-200 dark:border-gray-700 text-xs font-bold uppercase text-gray-600 dark:text-gray-300 text-center">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {assignLoading ? (
                <tr>
                  <td colSpan={canEdit ? 8 : 7} className="p-10 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-6 h-6 text-blue-500 dark:text-blue-400 animate-spin" />
                      <span className="text-sm text-gray-500 dark:text-gray-400">
                        Loading equipment...
                      </span>
                    </div>
                  </td>
                </tr>
              ) : uniqueEquipments.length === 0 ? (
                <tr>
                  <td
                    colSpan={canEdit ? 8 : 7}
                    className="p-10 text-center text-gray-400 dark:text-gray-500 italic"
                  >
                    {searchTerm
                      ? `No equipment found for "${searchTerm}".`
                      : "No equipment found."}
                  </td>
                </tr>
              ) : (
                uniqueEquipments.map((equipment) => (
                  <tr
                    key={equipment._id}
                    className="hover:bg-blue-50/50 dark:hover:bg-gray-700/50 transition-colors border-b border-gray-200 dark:border-gray-700"
                  >
                    <td className="p-4 text-sm font-medium">{equipment.code || "N/A"}</td>
                    <td className="p-4 text-sm font-medium">{equipment.SerialNumber || "N/A"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{equipment.Brand || "N/A"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">{equipment.categoryName || "N/A"}</td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {equipment.Specification || "N/A"}
                    </td>
                    <td className="p-4 text-sm text-gray-600 dark:text-gray-300">
                      {formatDate(equipment.lastMaintenanceDate)}
                    </td>
                    <td className="p-4 text-sm font-semibold">
                      <div className="flex items-center gap-2">
                        {formatDate(equipment.nextMaintenanceDate)}
                        {equipment.hasMaintenance && (
                          <AlertCircle
                            className="w-4 h-4 text-red-500 dark:text-red-400 animate-pulse"
                            title="Maintenance Scheduled!"
                          />
                        )}
                      </div>
                    </td>

                    {canEdit && (
                      <td className="p-4">
                        <div className="flex space-x-2 justify-center items-center flex-wrap gap-1">
                          <button
                            onClick={() => handleSelectEquipment(equipment)}
                            className="p-2 text-white bg-blue-600 rounded-lg hover:bg-blue-700
                              dark:bg-blue-500 dark:hover:bg-blue-600 transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {equipmentTypes.includes(equipment._id) ? (
                            <button
                              onClick={() => handleRetrieve(equipment)}
                              className="p-2 text-white bg-orange-500 rounded-lg hover:bg-orange-600
                                dark:bg-orange-400 dark:hover:bg-orange-500 transition-colors"
                              title="Retrieve"
                            >
                              <RefreshCw className="w-4 h-4" />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendData(equipment)}
                              className="p-2 text-white bg-indigo-500 rounded-lg hover:bg-indigo-600
                                dark:bg-indigo-400 dark:hover:bg-indigo-500 transition-colors"
                              title="Schedule Maintenance"
                            >
                              <Calendar className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* ============================================================ */}
        {/* ✅ PAGINATION                                                 */}
        {/* ============================================================ */}
        <div className="flex flex-col sm:flex-row items-center justify-between mt-6 gap-3">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Page {pagination.currentPage || 1} of {totalPages} •{" "}
            {totalRecords} total record{totalRecords !== 1 ? "s" : ""}
            {searchTerm && ` (filtered)`}
          </p>

          <div className="flex gap-1 items-center flex-wrap justify-center">
            <button
              onClick={() => goToPage(pagination.currentPage - 1)}
              disabled={pagination.currentPage <= 1 || assignLoading}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                text-sm font-bold rounded-lg disabled:opacity-30
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Prev
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => {
                return (
                  p === 1 ||
                  p === totalPages ||
                  Math.abs(p - pagination.currentPage) <= 1
                );
              })
              .map((page, idx, arr) => (
                <React.Fragment key={page}>
                  {idx > 0 && page - arr[idx - 1] > 1 && (
                    <span className="px-1 text-gray-400 dark:text-gray-500">...</span>
                  )}
                  <button
                    onClick={() => goToPage(page)}
                    disabled={assignLoading}
                    className={`px-3 py-2 text-sm font-bold rounded-lg transition-colors ${
                      pagination.currentPage === page
                        ? "bg-blue-600 text-white dark:bg-blue-500"
                        : "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 hover:bg-gray-200 dark:hover:bg-gray-600"
                    }`}
                  >
                    {page}
                  </button>
                </React.Fragment>
              ))}

            <button
              onClick={() => goToPage(pagination.currentPage + 1)}
              disabled={pagination.currentPage >= totalPages || assignLoading}
              className="px-3 py-2 bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100
                text-sm font-bold rounded-lg disabled:opacity-30
                hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Next
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