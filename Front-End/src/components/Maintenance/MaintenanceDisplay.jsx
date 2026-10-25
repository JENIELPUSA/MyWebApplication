import React, {
  useState,
  useContext,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
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
import { CategoryContext } from "../../contexts/CategoryContext/CategoryContext";

import {
  AlertCircle,
  Eye,
  RefreshCw,
  Calendar,
  FileText,
  Search,
  X,
  Loader2,
  Filter,
  FlaskConical,
  Microscope,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ============================================================
// Helpers
// ============================================================
const isValidObjectId = (id) =>
  typeof id === "string" && /^[a-f\d]{24}$/i.test(id);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const options = { year: "numeric", month: "short", day: "numeric" };
  return new Date(dateString).toLocaleDateString(undefined, options);
};

const pageVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
};

function MaintenanceDisplay() {
  // ============================================================
  // STATE — SEARCH & PAGINATION
  // ============================================================
  const [searchInput, setSearchInput] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [equipmentsPerPage, setEquipmentsPerPage] = useState(6);
  const [sortBy] = useState("createdAt");
  const [sortOrder] = useState("desc");

  // STATE — FILTERS
  const [filterLaboratory, setFilterLaboratory] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [showFilters, setShowFilters] = useState(false);

  // STATE — MODALS
  const [isOpenMaintenanceModal, setOpenMaintenanceModal] = useState(false);
  const [isTypesofMaintenanceModal, setTypesofMaintenanceModal] = useState(false);
  const [isMaintenanceRecordModal, setMaintenanceRecordModal] = useState(false);
  const [isReportModalOpen, setReportModalOpen] = useState(false);

  // ============================================================
  // CONTEXT
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
  const { categories, fetchCategoryData } = useContext(CategoryContext);

  const canEdit = role !== "Supply";
  const canGenerateReport = role !== "user" && role !== "User";

  const [SendDataLab, setSendDataLab] = useState(null);
  const [SendDataEquip, setSendDataEquip] = useState(null);

  const location = useLocation();
  const laboratoryData = location.state?.selectedAssignEquipment;

  const isFirstRender = useRef(true);

  const displayAssignRef = useRef(displayAssign);
  useEffect(() => {
    displayAssignRef.current = displayAssign;
  }, [displayAssign]);

  // ============================================================
  // LOCAL STATE — LOCALSTORAGE HYDRATION
  // ============================================================
  const [assignEquipments, setAssignEquipments] = useState(() => {
    const saved = localStorage.getItem("assignedEquipments");
    return saved ? JSON.parse(saved) : [];
  });

  const [laboratory, setlaboratory] = useState(() => {
    const saved = localStorage.getItem("selectedLabsData");
    return saved ? JSON.parse(saved) : laboratoryData || "";
  });

  const labId = useMemo(() => {
    return (
      laboratory?._id ||
      laboratory?.laboratoryId ||
      laboratoryData?._id ||
      laboratoryData?.laboratoryId ||
      null
    );
  }, [
    laboratory?._id,
    laboratory?.laboratoryId,
    laboratoryData?._id,
    laboratoryData?.laboratoryId,
  ]);

  // ============================================================
  // DEBOUNCED SEARCH (500ms)
  // ============================================================
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchTerm(searchInput);
      setCurrentPage(1);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // ============================================================
  // MAIN FETCH
  // ============================================================
  useEffect(() => {
    if (isFirstRender.current && laboratoryData) {
      isFirstRender.current = false;
      return;
    }
    isFirstRender.current = false;

    const queryParams = {
      page: currentPage,
      limit: equipmentsPerPage,
      search: searchTerm.trim(),
      sortBy,
      sortOrder,
    };

    if (filterLaboratory && isValidObjectId(filterLaboratory)) {
      queryParams.laboratory = filterLaboratory;
    } else if (labId && isValidObjectId(labId)) {
      queryParams.laboratory = labId;
    }

    if (filterCategory && isValidObjectId(filterCategory)) {
      queryParams.category = filterCategory;
    }

    if (typeof displayAssignRef.current === "function") {
      displayAssignRef.current(queryParams);
    }
  }, [
    currentPage,
    equipmentsPerPage,
    searchTerm,
    sortBy,
    sortOrder,
    filterLaboratory,
    filterCategory,
    labId,
  ]);

  // ============================================================
  // SAVE LABORATORY DATA
  // ============================================================
  useEffect(() => {
    if (laboratoryData) {
      localStorage.setItem("selectedLabsData", JSON.stringify(laboratoryData));
      setlaboratory(laboratoryData);
    }
  }, [laboratoryData]);

  // ============================================================
  // SAVE EQUIPMENTS FROM LOCATION STATE
  // ============================================================
  useEffect(() => {
    const equipments = location.state?.selectedAssignEquipment?.equipments;
    if (equipments && equipments.length > 0) {
      localStorage.setItem("assignedEquipments", JSON.stringify(equipments));
      setAssignEquipments(equipments);
    }
  }, [location.state]);

  // ============================================================
  // SYNC
  // ============================================================
  useEffect(() => {
    if (Array.isArray(assigns)) {
      const allEquipments = assigns.flatMap((lab) => lab.equipments || []);
      setAssignEquipments(allEquipments);
      localStorage.setItem("assignedEquipments", JSON.stringify(allEquipments));
    }
  }, [assigns]);

  // ============================================================
  // FETCH LABORATORIES
  // ============================================================
  useEffect(() => {
    if (laboratories?.length === 0 && typeof fetchLaboratoryData === "function") {
      fetchLaboratoryData();
    }
  }, [laboratories, fetchLaboratoryData]);

  // ============================================================
  // FETCH CATEGORIES
  // ============================================================
  useEffect(() => {
    if (
      (!categories || categories.length === 0) &&
      typeof fetchCategoryData === "function"
    ) {
      fetchCategoryData();
    }
  }, [categories, fetchCategoryData]);

  // ============================================================
  // EQUIPMENT → ASSIGN METADATA MAP
  // ============================================================
  const equipmentAssignMap = useMemo(() => {
    const map = {};
    (assigns || []).forEach((assign) => {
      (assign.equipments || []).forEach((equip) => {
        const equipId = equip?._id;
        if (equipId) {
          map[equipId] = {
            laboratoryName:
              assign.laboratoryName || assign.laboratoryId || "N/A",
            departmentName: assign.departmentName || "N/A",
            encharge: assign.encharge || "N/A",
          };
        }
      });
    });
    return map;
  }, [assigns]);

  // ============================================================
  // HANDLERS
  // ============================================================
  const handleCloseModal = useCallback(() => {
    setOpenMaintenanceModal(false);
    setTypesofMaintenanceModal(false);
    setMaintenanceRecordModal(false);
    setReportModalOpen(false);
  }, []);

  const handleSelectEquipment = useCallback(
    (equipment) => {
      setSendDataEquip(equipment);
      setSendDataLab(laboratory);
      setOpenMaintenanceModal(true);
    },
    [laboratory]
  );

  const handleSendData = useCallback(
    (equipment) => {
      setSendDataEquip(equipment);
      setSendDataLab(laboratory);
      setTypesofMaintenanceModal(true);
    },
    [laboratory]
  );

  const handleRetrieve = useCallback(
    (equipment) => {
      DeleteType(equipment);
    },
    [DeleteType]
  );

  const handleClearSearch = useCallback(() => {
    setSearchInput("");
    setSearchTerm("");
    setCurrentPage(1);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilterLaboratory("");
    setFilterCategory("");
    setCurrentPage(1);

    if (typeof displayAssignRef.current === "function") {
      displayAssignRef.current();
    }
  }, []);

  const hasActiveFilters = useMemo(
    () => !!(filterLaboratory || filterCategory),
    [filterLaboratory, filterCategory]
  );

  const goToPage = useCallback(
    (page) => {
      const safePage = Math.max(1, Math.min(page, pagination.totalPages || 1));
      setCurrentPage(safePage);
    },
    [pagination.totalPages]
  );

  // ============================================================
  // DERIVED DATA
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
  const currentPageNum = pagination.currentPage || 1;

  const tableColSpan = canEdit ? 9 : 8;

  // ============================================================
  // PAGE NUMBERS (with ellipsis)
  // ============================================================
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPageNum - 1 && i <= currentPageNum + 1)
      ) {
        pages.push(i);
      } else if (i === currentPageNum - 2 || i === currentPageNum + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  // ============================================================
  // HIDE EVERYTHING ELSE WHEN MAINTENANCE RECORD IS OPEN
  // ============================================================
  if (isMaintenanceRecordModal && canEdit) {
    return (
      <motion.div
        className="w-full bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 transition-colors"
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
      className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col"
      initial="hidden"
      animate="visible"
      variants={pageVariants}
    >
      {/* ============================================================
          VIEW-ONLY BANNER
         ============================================================ */}
      {!canEdit && (
        <div className="mx-6 mt-4 bg-blue-50 dark:bg-blue-950 border-2 border-blue-200 dark:border-blue-800 rounded-lg p-3 flex items-center justify-between transition-colors">
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

      {/* ============================================================
          HEADER
         ============================================================ */}
      <div
        className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
        bg-gradient-to-r from-blue-50 via-white to-amber-50
        dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
            <FlaskConical size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-900 dark:text-white">
              Equipment Inventory
            </h2>
            <p className="text-xs text-blue-600/70 dark:text-slate-400">
              Monitor and organize laboratory equipment
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Total Equipment:{" "}
            <span className="font-bold text-blue-700 dark:text-blue-400">
              {totalRecords || 0}
            </span>
          </div>
          {canGenerateReport && (
            <button
              onClick={() => setReportModalOpen(true)}
              className="flex items-center gap-2 px-3 py-2
                bg-gradient-to-b from-emerald-600 to-emerald-700
                hover:from-emerald-700 hover:to-emerald-800
                dark:from-emerald-500 dark:to-emerald-600 dark:hover:from-emerald-600 dark:hover:to-emerald-700
                text-white rounded-lg transition-all text-sm font-semibold
                shadow-sm shadow-emerald-500/30 whitespace-nowrap"
              title="Generate Report"
            >
              <FileText className="w-4 h-4" />
              <span className="hidden sm:inline">Generate Report</span>
            </button>
          )}
        </div>
      </div>

      {/* ============================================================
          SEARCH + FILTER TOGGLE + PER PAGE
         ============================================================ */}
      <div
        className="p-4 flex flex-col sm:flex-row gap-3
        bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500"
            size={14}
          />
          <input
            type="text"
            placeholder="Search by Serial Number, Brand, Code, Specification..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-10 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white
              placeholder-gray-400 dark:placeholder-gray-500"
          />
          {searchInput && (
            <button
              onClick={handleClearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              title="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {assignLoading && (
            <Loader2 className="absolute right-9 top-1/2 -translate-y-1/2 w-4 h-4 text-blue-500 dark:text-blue-400 animate-spin" />
          )}
        </div>

        {/* Filter toggle */}
        <button
          onClick={() => setShowFilters((s) => !s)}
          className={`flex items-center justify-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg transition-all whitespace-nowrap
            ${
              hasActiveFilters
                ? "bg-gradient-to-b from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-sm shadow-blue-500/30"
                : "bg-white dark:bg-slate-700 border border-blue-200 dark:border-slate-600 text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-slate-600"
            }`}
        >
          <Filter className="w-4 h-4" />
          Filters
          {hasActiveFilters && (
            <span className="bg-white text-blue-600 text-xs font-bold px-1.5 rounded-full">
              ✓
            </span>
          )}
        </button>

        {/* Per page */}
        <select
          value={equipmentsPerPage}
          onChange={(e) => {
            setEquipmentsPerPage(Number(e.target.value));
            setCurrentPage(1);
          }}
          className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
            focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
            bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
        >
          <option value={6}>6 / page</option>
          <option value={10}>10 / page</option>
          <option value={20}>20 / page</option>
          <option value={50}>50 / page</option>
        </select>
      </div>

      {/* ============================================================
          FILTER PANEL
         ============================================================ */}
      {showFilters && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
              Laboratory
            </label>
            <select
              value={filterLaboratory}
              onChange={(e) => {
                setFilterLaboratory(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded-lg text-sm
                bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Laboratories</option>
              {(laboratories || []).map((lab) => (
                <option key={lab._id} value={lab._id}>
                  {lab.LaboratoryName || lab.laboratoryName || lab.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-bold uppercase text-gray-600 dark:text-gray-400">
              Category
            </label>
            <select
              value={filterCategory}
              onChange={(e) => {
                setFilterCategory(e.target.value);
                setCurrentPage(1);
              }}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded-lg text-sm
                bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            >
              <option value="">All Categories</option>
              {(categories || []).map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.CategoryName || cat.categoryName || cat.name}
                </option>
              ))}
            </select>
          </div>

          {hasActiveFilters && (
            <div className="sm:col-span-2 flex justify-end">
              <button
                onClick={handleClearFilters}
                className="text-xs font-semibold text-red-600 dark:text-red-400 hover:underline flex items-center gap-1"
              >
                <X className="w-3 h-3" /> Clear all filters
              </button>
            </div>
          )}
        </div>
      )}

      {/* ============================================================
          SEARCH RESULT INFO
         ============================================================ */}
      {searchTerm && (
        <div className="px-4 py-2 text-xs text-gray-600 dark:text-gray-400 border-b border-blue-100 dark:border-slate-700 bg-white dark:bg-slate-900">
          Showing results for:{" "}
          <span className="font-semibold text-blue-700 dark:text-blue-300">
            "{searchTerm}"
          </span>{" "}
          ({totalRecords} found)
        </div>
      )}

      {/* ============================================================
          TABLE
         ============================================================ */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr
              className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
              text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
              border-b border-blue-800 dark:border-slate-700"
            >
              <th className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <Microscope size={12} />
                  Code
                </div>
              </th>
              <th className="px-4 py-3">Serial#</th>
              <th className="px-4 py-3">Brand</th>
              <th className="px-4 py-3">Category</th>
              <th className="px-4 py-3">Specification</th>
              <th className="px-4 py-3">Dept / Lab / Encharge</th>
              <th className="px-4 py-3">Last Maint.</th>
              <th className="px-4 py-3">Next Maint.</th>
              {canEdit && <th className="px-4 py-3 text-center">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
            {assignLoading ? (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="py-12 text-center text-gray-500 dark:text-gray-400"
                >
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    <span>Loading equipment...</span>
                  </div>
                </td>
              </tr>
            ) : uniqueEquipments.length === 0 ? (
              <tr>
                <td
                  colSpan={tableColSpan}
                  className="py-12 text-center text-gray-400 dark:text-gray-500 italic"
                >
                  {searchTerm || hasActiveFilters
                    ? "No equipment found for the current search/filters."
                    : "No equipment found."}
                </td>
              </tr>
            ) : (
              uniqueEquipments.map((equipment) => {
                const meta = equipmentAssignMap[equipment._id] || {};
                return (
                  <tr
                    key={equipment._id}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-4 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {equipment.code?.charAt(0).toUpperCase() || "E"}
                        </div>
                        <div className="font-mono text-xs">
                          {equipment.code || "N/A"}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-gray-700 dark:text-gray-300">
                      {equipment.SerialNumber || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      {equipment.Brand || "N/A"}
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className="px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                        border border-gray-200 dark:border-slate-600"
                      >
                        {equipment.categoryName || "N/A"}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300 max-w-xs truncate">
                      {equipment.Specification || "N/A"}
                    </td>
                    <td className="px-4 py-4 text-gray-600 dark:text-gray-300">
                      <div className="flex flex-col leading-tight gap-0.5">
                        <span className="font-semibold text-gray-800 dark:text-gray-100 text-xs">
                          {meta.departmentName || "N/A"}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-300">
                          {meta.laboratoryName || "N/A"}
                        </span>
                        <span className="text-xs italic text-gray-500 dark:text-gray-400">
                          {meta.encharge || "N/A"}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-gray-600 dark:text-gray-300">
                      {formatDate(equipment.lastMaintenanceDate)}
                    </td>
                    <td className="px-4 py-4 text-xs font-semibold text-gray-700 dark:text-gray-200">
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
                      <td className="px-4 py-4">
                        <div className="flex justify-center items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleSelectEquipment(equipment)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="View Details"
                          >
                            <Eye size={15} />
                          </button>

                          {equipmentTypes.includes(equipment._id) ? (
                            <button
                              onClick={() => handleRetrieve(equipment)}
                              className="p-1.5 text-orange-500 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-900/30 rounded transition-colors"
                              title="Retrieve"
                            >
                              <RefreshCw size={15} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleSendData(equipment)}
                              className="p-1.5 text-indigo-500 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded transition-colors"
                              title="Schedule Maintenance"
                            >
                              <Calendar size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* ============================================================
          FOOTER / PAGINATION
         ============================================================ */}
      <div
        className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
        dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
        border-t border-blue-100 dark:border-slate-700
        rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3"
      >
        <div className="text-xs text-slate-500 dark:text-slate-400">
          Page{" "}
          <span className="font-medium text-blue-700 dark:text-blue-400">
            {currentPageNum}
          </span>{" "}
          of{" "}
          <span className="font-medium text-blue-700 dark:text-blue-400">
            {totalPages}
          </span>{" "}
          •{" "}
          <span className="font-medium text-blue-700 dark:text-blue-400">
            {totalRecords}
          </span>{" "}
          total record{totalRecords !== 1 ? "s" : ""}
          {searchTerm && " (filtered)"}
        </div>

        <div className="flex items-center gap-2">
          {/* Prev */}
          <button
            onClick={() => goToPage(currentPageNum - 1)}
            disabled={currentPageNum <= 1 || assignLoading}
            className="p-2 border border-blue-200 dark:border-slate-600 rounded
              bg-white dark:bg-slate-700
              disabled:opacity-30
              hover:bg-blue-50 dark:hover:bg-slate-600
              transition-colors text-blue-700 dark:text-blue-400"
          >
            <ChevronLeft size={12} />
          </button>

          {/* Page Numbers */}
          <div className="flex gap-0.5">
            {getPageNumbers().map((num, i) => (
              <button
                key={i}
                onClick={() => typeof num === "number" && goToPage(num)}
                disabled={num === "..." || assignLoading}
                className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                  currentPageNum === num
                    ? "bg-blue-600 dark:bg-blue-500 text-white"
                    : num === "..."
                    ? "cursor-default text-gray-300 dark:text-gray-600"
                    : "hover:bg-blue-50 dark:hover:bg-slate-700 text-blue-800 dark:text-slate-300"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            onClick={() => goToPage(currentPageNum + 1)}
            disabled={currentPageNum >= totalPages || assignLoading}
            className="p-2 border border-blue-200 dark:border-slate-600 rounded
              bg-white dark:bg-slate-700
              disabled:opacity-30
              hover:bg-blue-50 dark:hover:bg-slate-600
              transition-colors text-blue-700 dark:text-blue-400"
          >
            <ChevronRight size={12} />
          </button>
        </div>
      </div>

      {/* ============================================================
          MODALS
         ============================================================ */}
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
    </motion.div>
  );
}

export default MaintenanceDisplay;