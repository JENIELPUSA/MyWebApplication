import React, { useState, useContext, useEffect } from "react";
import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext";
import {
  Plus, ChevronLeft, ChevronRight, Edit,
  Trash2, RefreshCw, PlusCircle, Search,
  Package, Tag, Barcode, Info, ClipboardList,
  Hash, Calendar, UserCheck, Filter, X
} from "lucide-react";
import EquipmentformModal from "./Equipment";
import RetrieveForm from "./Retrieve";
import PopupModal from "./popupModal";
import ConfirmDeleteModal from "../../components/ReusableComponent/ConfirmationDeleteModal";
import { MaintenanceRequestContext } from "../../contexts/MaintenanceRequestContext/MaintenanceRequestContext";

const EquipmentForm = () => {
  const {
    equipment,
    setEquipment,
    currentPage,
    setCurrentPage,
    equipmentsPerPage,
    totalPages,
    totalEquipments,
    DeleteDatas,
    UpdateStatus,
    fetchEquipmentData,
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,
    categoryFilter,
    setCategoryFilter,
    resetFilters,
  } = useContext(EquipmentDataContext);
  const { view } = useContext(MaintenanceRequestContext);

  const [isFormModalOpen, setFormModalOpen] = useState(false);
  const [isRetrieveModalOpen, setIsRetrieveModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedEquipment, setSelectedEquipment] = useState(null);

  // ✅ DELETE CONFIRMATION STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [equipmentToDelete, setEquipmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ✅ LOCAL CATEGORY LIST
  const [availableCategories, setAvailableCategories] = useState([]);

  // ==========================================
  // DERIVE UNIQUE CATEGORIES FROM EQUIPMENT
  // ==========================================
  useEffect(() => {
    const map = new Map();
    (equipment || []).forEach((item) => {
      if (item.Category && item.CategoryName) {
        map.set(String(item.Category), item.CategoryName);
      }
    });
    setAvailableCategories(Array.from(map, ([_id, name]) => ({ _id, name })));
  }, [equipment]);

  // ==========================================
  // REFETCH WHEN VIEW CHANGES
  // ==========================================
  useEffect(() => {
    if (view) {
      fetchEquipmentData();
    }
  }, [view, fetchEquipmentData]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleAssignClick = (item) => {
    if (item.status === "Not Available") {
      setSelectedEquipment(item._id);
      setIsRetrieveModalOpen(true);
    } else {
      setSelectedEquipment(item);
      setIsAssignModalOpen(true);
    }
  };

  const handleCloseSubModals = () => {
    setFormModalOpen(false);
    setIsRetrieveModalOpen(false);
    setIsAssignModalOpen(false);
    setSelectedEquipment(null);
  };

  const handleDeleteClick = (item) => {
    setEquipmentToDelete(item);
    setIsDeleteModalOpen(true);
  };

  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setEquipmentToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!equipmentToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await DeleteDatas(equipmentToDelete._id);
      setIsDeleteModalOpen(false);
      setEquipmentToDelete(null);
    } catch (err) {
      alert("Failed to delete equipment.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    fetchEquipmentData();
  };

  const handleStatusChange = async (id, newStatus) => {
    setEquipment(prev =>
      prev.map(eq => (eq._id === id ? { ...eq, status: newStatus } : eq))
    );

    const res = await UpdateStatus(id, newStatus);

    if (!res.success) {
      alert(res.error || "Failed to update status.");
      fetchEquipmentData();
    }
  };

  const handleClearFilters = () => {
    resetFilters?.();
  };

  const hasActiveFilters =
    (searchQuery && searchQuery.trim() !== "") ||
    (statusFilter && statusFilter !== "") ||
    (categoryFilter && categoryFilter !== "");

  // ==========================================
  // HELPERS
  // ==========================================
  const getStatusStyle = (status) => {
    switch (status) {
      case "Available":
        return "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border-emerald-300 dark:border-emerald-700";
      case "Not Available":
        return "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-300 dark:border-amber-700";
      case "Defective":
        return "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400 border-rose-300 dark:border-rose-700";
      case "Missing":
        return "bg-slate-200 text-slate-700 dark:bg-slate-700 dark:text-slate-300 border-slate-400 dark:border-slate-600";
      case "Fixed":
        return "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-300 dark:border-blue-700";
      case "Found":
        return "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 border-cyan-300 dark:border-cyan-700";
      default:
        return "bg-gray-100 text-gray-700 dark:bg-slate-700 dark:text-gray-300 border-gray-300 dark:border-gray-600";
    }
  };

  const STATUS_OPTIONS = ["Defective", "Missing", "Fixed", "Found"];

  const FILTER_STATUS_OPTIONS = [
    "Available",
    "Not Available",
    "Defective",
    "Missing",
    "Fixed",
    "Found",
  ];

  const formatDate = (dateValue) => {
    if (!dateValue) return "N/A";
    try {
      return new Date(dateValue).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "N/A";
    }
  };

  const getInitials = (name) => {
    if (!name) return "N/A";
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  };

  const getAvatarColor = (name) => {
    if (!name) return "bg-slate-400";
    const colors = [
      "bg-blue-600", "bg-blue-700", "bg-indigo-600",
      "bg-amber-500", "bg-yellow-600", "bg-cyan-600",
      "bg-sky-600", "bg-blue-500", "bg-amber-600"
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
          bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <Package size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Equipment Inventory
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Manage your equipment and assets
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Refresh equipment list"
            >
              <RefreshCw size={16} />
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Items:{" "}
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {totalEquipments || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS & ADD BAR — ONE LINE */}
        <div className="p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">

          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={16} />
            <input
              type="text"
              placeholder="Search Code, Brand, Serial..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500 pointer-events-none" size={14} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full lg:w-40 pl-9 pr-7 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                appearance-none cursor-pointer"
            >
              <option value="">All Statuses</option>
              {FILTER_STATUS_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
          </div>

          {/* Category Filter */}
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500 pointer-events-none" size={14} />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full lg:w-48 pl-9 pr-7 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                appearance-none cursor-pointer"
            >
              <option value="">All Categories</option>
              <option value="unassigned">— Unassigned —</option>
              {availableCategories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
            <ChevronRight size={14} className="absolute right-2 top-1/2 -translate-y-1/2 rotate-90 text-gray-400 pointer-events-none" />
          </div>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <button
              onClick={handleClearFilters}
              className="flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold
                text-rose-600 dark:text-rose-400
                bg-rose-50 dark:bg-rose-900/20
                border border-rose-200 dark:border-rose-800
                rounded-lg hover:bg-rose-100 dark:hover:bg-rose-900/40
                transition-colors whitespace-nowrap"
              title="Clear all filters"
            >
              <X size={13} strokeWidth={2.5} />
              Clear
            </button>
          )}

          {/* Add Equipment */}
          <button
            onClick={() => setFormModalOpen(true)}
            className="flex items-center justify-center gap-2 px-4 py-2
              bg-gradient-to-b from-blue-600 to-blue-700
              hover:from-blue-700 hover:to-blue-800
              dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700
              text-white rounded-lg transition-all text-sm font-semibold
              shadow-sm shadow-blue-500/30 whitespace-nowrap"
          >
            <Plus size={16} strokeWidth={2} />
            <span>Add Equipment</span>
          </button>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><Hash size={12} /> Code</div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><Barcode size={12} /> Serial Number</div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><Tag size={12} /> Brand & Specs</div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><ClipboardList size={12} /> Location & Encharge</div>
                </th>
                <th className="px-4 py-3">
                  <div className="flex items-center gap-2"><Calendar size={12} /> Date Acquired</div>
                </th>
                <th className="px-4 py-3 text-center">
                  <div className="flex items-center justify-center gap-2"><Info size={12} /> Status</div>
                </th>
                <th className="px-4 py-3">Remarks</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {equipment.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {searchQuery || statusFilter || categoryFilter
                      ? "No matching equipment found."
                      : 'No equipment found. Click "Add Equipment" to get started.'}
                  </td>
                </tr>
              ) : (
                equipment.map((item, index) => (
                  <tr
                    key={`${item._id}-${item.SerialNumber || index}-${index}`}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs font-semibold text-blue-700 dark:text-blue-400
                        bg-blue-100 dark:bg-blue-900/30 px-2 py-1 rounded-md border border-blue-200 dark:border-blue-800">
                        {item.code || 'N/A'}
                      </span>
                    </td>

                    <td className="px-4 py-4 font-mono text-xs text-gray-600 dark:text-gray-400">
                      {item.SerialNumber || 'N/A'}
                    </td>

                    <td className="px-4 py-4">
                      <div className="font-medium text-gray-900 dark:text-white">{item.Brand || 'N/A'}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[150px]" title={item.Specification}>
                        {item.Specification || 'N/A'}
                      </div>
                      {item.CategoryName && (
                        <span className="inline-block mt-1 text-[10px] font-semibold
                          bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400
                          border border-amber-200 dark:border-amber-800
                          px-1.5 py-0.5 rounded">
                          {item.CategoryName}
                        </span>
                      )}
                    </td>

                    <td className="px-4 py-4">
                      <div className="mb-1">
                        <div className="text-sm text-blue-800 dark:text-blue-300 font-medium">
                          {item.DepartmentName || "N/A"}
                        </div>
                        <div className="text-xs text-gray-400 dark:text-gray-500">
                          {item.LaboratoryName || "No Lab"}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-blue-50 dark:border-slate-700">
                        <div className={`w-6 h-6 rounded-full ${getAvatarColor(item.EnchargeName)} flex items-center justify-center text-white text-[9px] font-bold flex-shrink-0`}>
                          {getInitials(item.EnchargeName)}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-1">
                            <UserCheck size={10} className="text-blue-400 dark:text-blue-500 flex-shrink-0" />
                            <span className="text-xs font-medium text-gray-700 dark:text-gray-300 truncate max-w-[110px]" title={item.EnchargeName}>
                              {item.EnchargeName || "No Encharge"}
                            </span>
                          </div>
                          {item.EnchargeId && (
                            <div className="text-[9px] text-gray-400 dark:text-gray-500 truncate max-w-[120px] font-mono" title={item.EnchargeId}>
                              {item.EnchargeId}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600 dark:text-gray-400">
                        {formatDate(item.DateAcquired)}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <select
                        value={item.status || ""}
                        onChange={(e) => handleStatusChange(item._id, e.target.value)}
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase border cursor-pointer
                          focus:outline-none focus:ring-2 focus:ring-blue-500 ${getStatusStyle(item.status)}`}
                      >
                        {!STATUS_OPTIONS.includes(item.status) && item.status && (
                          <option value={item.status} className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 normal-case">
                            {item.status}
                          </option>
                        )}
                        {STATUS_OPTIONS.map((opt) => (
                          <option key={opt} value={opt} className="bg-white dark:bg-slate-800 text-gray-800 dark:text-gray-200 normal-case">
                            {opt}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="px-4 py-4">
                      <span className="text-xs text-gray-600 dark:text-gray-400 bg-slate-100 dark:bg-slate-700 px-2 py-1 rounded-md inline-block max-w-[120px] truncate" title={item.remarks}>
                        {item.remarks || "No remarks"}
                      </span>
                    </td>

                    <td className="px-4 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => { setSelectedEquipment(item); setFormModalOpen(true); }}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit Equipment"
                        >
                          <Edit size={16} strokeWidth={1.5} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(item)}
                          className="p-1.5 text-rose-500 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-900/30 rounded transition-colors"
                          title="Delete Equipment"
                        >
                          <Trash2 size={16} strokeWidth={1.5} />
                        </button>

                        {item.status !== "Missing" && item.status !== "Defective" && (
                          <button
                            onClick={() => handleAssignClick(item)}
                            className={`p-1.5 rounded transition-colors ${item.status === "Not Available"
                              ? 'text-amber-600 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/30'
                              : 'text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30'
                              }`}
                            title={item.status === "Not Available" ? "Retrieve Equipment" : "Assign Equipment"}
                          >
                            {item.status === "Not Available" ? (
                              <RefreshCw size={16} strokeWidth={1.5} />
                            ) : (
                              <PlusCircle size={16} strokeWidth={1.5} />
                            )}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* FOOTER / PAGINATION */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
          border-t border-blue-100 dark:border-slate-700
          rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-blue-700 dark:text-blue-400">
              {totalEquipments === 0 ? 0 : Math.min(totalEquipments, (currentPage - 1) * equipmentsPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * equipmentsPerPage, totalEquipments)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalEquipments}</span> entries
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalEquipments === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronLeft size={14} strokeWidth={2} />
            </button>

            <span className="px-3 py-1 text-xs font-medium text-blue-800 dark:text-slate-300">
              Page {currentPage} of {totalPages || 1}
            </span>

            <button
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === (totalPages || 1) || totalEquipments === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <ChevronRight size={14} strokeWidth={2} />
            </button>
          </div>
        </div>

        {/* SUB-MODALS */}
        {isFormModalOpen && <EquipmentformModal isOpen={isFormModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
        {isRetrieveModalOpen && <RetrieveForm isOpen={isRetrieveModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
        {isAssignModalOpen && <PopupModal isOpen={isAssignModalOpen} onClose={handleCloseSubModals} equipment={selectedEquipment} />}
      </div>

      {/* ✅ REUSABLE DELETE CONFIRMATION MODAL */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Equipment?"
        description="This action cannot be undone. The equipment will be permanently removed from your inventory."
        confirmText="Yes, Delete"
        itemIcon={Package}
        itemDetails={
          equipmentToDelete
            ? {
                code: equipmentToDelete.code,
                brand: equipmentToDelete.Brand,
                specification: equipmentToDelete.Specification,
                serialNumber: equipmentToDelete.SerialNumber,
              }
            : null
        }
      />
    </>
  );
};

export default EquipmentForm;