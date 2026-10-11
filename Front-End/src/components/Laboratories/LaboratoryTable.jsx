import React, { useState, useContext, useEffect } from "react";
import { LaboratoryContext } from "../../contexts/LaboratoryContext/LaboratoryContext";
import { AuthContext } from "../../contexts/AuthContext";
import {
  FaPlus, FaEdit, FaTrashAlt, FaSearch,
  FaChevronLeft, FaChevronRight, FaFlask,
  FaMicroscope
} from "react-icons/fa";
import AddFormModal from "./LaboratoryForm";
import ConfirmDeleteModal from "../../components/ReusableComponent/ConfirmationDeleteModal";

const LaboratoryTable = () => {
  const {
    // Data
    filteredLaboratories,
    loading,
    totalLaboratories,
    totalPages,

    // Pagination
    currentPage,
    setCurrentPage,
    laboratoryPerPage,
    setLaboratoryPerPage,

    // Search & Filter
    searchQuery,
    setSearchQuery,
    departmentFilter,
    setDepartmentFilter,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // CRUD
    setLaboratories,
    DeleteLaboratory,
  } = useContext(LaboratoryContext);

  const { role } = useContext(AuthContext);

  const [selectedLab, setSelectedLab] = useState(null);
  const [isModalAddForm, setAddFormOpen] = useState(false);

  // ✅ DELETE CONFIRMATION STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [labToDelete, setLabToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user has edit/delete permissions
  const canEdit = role !== "Supply";
  const canAdd = role !== "Supply";

  // ─── Reset sa page 1 kapag nag-change ang perPage ───────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [laboratoryPerPage, setCurrentPage]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedLab(null);
  };

  const handleAddClick = () => {
    setSelectedLab(null);
    setAddFormOpen(true);
  };

  const onLabSelect = (laboratory) => {
    setSelectedLab(laboratory);
    setAddFormOpen(true);
  };

  // ✅ Buksan ang delete modal
  const handleDeleteClick = (lab) => {
    setLabToDelete(lab);
    setIsDeleteModalOpen(true);
  };

  // ✅ Isara ang delete modal
  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setLabToDelete(null);
  };

  // ✅ Actual delete (tatawagin ng ConfirmDeleteModal)
  const handleConfirmDelete = async () => {
    if (!labToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await DeleteLaboratory(labToDelete._id);
      setIsDeleteModalOpen(false);
      setLabToDelete(null);
    } catch (err) {
      alert("Failed to delete laboratory.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    setCurrentPage(1); // Trigger auto-refetch via context
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
              <FaFlask size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Laboratory Management
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Monitor and organize lab facilities
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleRefresh}
              className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400
                hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
              title="Refresh laboratory list"
            >
              <FaChevronRight size={14} className="rotate-0" />
            </button>
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Laboratories:{" "}
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {totalLaboratories || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH, FILTER & ACTIONS */}
        <div className="p-4 flex flex-col sm:flex-row gap-3
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={14} />
            <input
              type="text"
              placeholder="Search laboratory name, RefNo..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Sort */}
          <select
            value={`${sortBy}|${sortOrder}`}
            onChange={(e) => {
              const [field, order] = e.target.value.split("|");
              setSortBy(field);
              setSortOrder(order);
            }}
            className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
              focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
              bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
          >
            <option value="createdAt|desc">Newest First</option>
            <option value="createdAt|asc">Oldest First</option>
            <option value="LaboratoryName|asc">Name (A-Z)</option>
            <option value="LaboratoryName|desc">Name (Z-A)</option>
            <option value="RefNo|asc">RefNo (A-Z)</option>
          </select>

          {/* Add Button */}
          {canAdd && (
            <button
              onClick={handleAddClick}
              className="flex items-center justify-center gap-2 px-4 py-2
                bg-gradient-to-b from-blue-600 to-blue-700
                hover:from-blue-700 hover:to-blue-800
                dark:from-blue-500 dark:to-blue-600 dark:hover:from-blue-600 dark:hover:to-blue-700
                text-white rounded-lg transition-all text-sm font-semibold
                shadow-sm shadow-blue-500/30 whitespace-nowrap"
            >
              <FaPlus size={12} />
              <span>Add Laboratory</span>
            </button>
          )}
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <FaMicroscope size={12} />
                    Lab Name
                  </div>
                </th>
                <th className="px-6 py-3">Department</th>
                <th className="px-6 py-3">In-charge</th>
                {canEdit && (
                  <th className="px-6 py-3 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 4 : 3} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                      <span>Loading laboratories...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredLaboratories.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 4 : 3} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {searchQuery ? 'No matching laboratories found.' : 'No laboratories found. Click "Add Laboratory" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredLaboratories.map((lab) => (
                  <tr key={lab._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {lab.LaboratoryName?.charAt(0).toUpperCase() || 'L'}
                        </div>
                        <div>
                          <div>{lab.LaboratoryName}</div>
                          {lab.RefNo && (
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                              {lab.RefNo}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold
                        bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300
                        border border-gray-200 dark:border-slate-600">
                        {lab.department || "Unassigned"}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-600 dark:text-gray-400">
                      {lab.EnchargeName || "N/A"}
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => onLabSelect(lab)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit Laboratory"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(lab)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Laboratory"
                          >
                            <FaTrashAlt size={15} />
                          </button>
                        </div>
                      </td>
                    )}
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
              {totalLaboratories === 0 ? 0 : Math.min(totalLaboratories, (currentPage - 1) * laboratoryPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * laboratoryPerPage, totalLaboratories)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalLaboratories}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Per Page */}
            <select
              value={laboratoryPerPage}
              onChange={(e) => setLaboratoryPerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700 text-blue-800 dark:text-slate-300"
            >
              {[6, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            {/* Prev */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalLaboratories === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <FaChevronLeft size={10} />
            </button>

            {/* Page Numbers with Ellipsis */}
            <div className="flex gap-0.5">
              {getPageNumbers().map((num, i) => (
                <button
                  key={i}
                  onClick={() => typeof num === "number" && paginate(num)}
                  disabled={num === "..."}
                  className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
                    currentPage === num
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
              onClick={() => paginate(currentPage + 1)}
              disabled={currentPage === (totalPages || 1) || totalLaboratories === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <FaChevronRight size={10} />
            </button>
          </div>
        </div>

        {/* FORM MODAL - Only show if user can edit */}
        {isModalAddForm && canEdit && (
          <AddFormModal
            isOpen={isModalAddForm}
            onAddLaboratory={(newLab) => {
              setLaboratories((prev) => [...prev, newLab]);
              handleCloseModal();
            }}
            OnEditLaboratory={(updated) => {
              setLaboratories((prev) => prev.map((l) => (l._id === updated._id ? updated : l)));
              handleCloseModal();
            }}
            laboratory={selectedLab}
            onClose={handleCloseModal}
          />
        )}
      </div>

      {/* ============================================================
           REUSABLE DELETE CONFIRMATION MODAL
          ============================================================ */}
      <ConfirmDeleteModal
        isOpen={isDeleteModalOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
        title="Delete Laboratory?"
        description="This action cannot be undone. The laboratory will be permanently removed from the system."
        confirmText="Yes, Delete"
        itemIcon={FaFlask}
        itemDetails={
          labToDelete
            ? {
                code: labToDelete._id,
                brand: labToDelete.LaboratoryName,
                specification: labToDelete.department || "Unassigned",
                serialNumber: labToDelete.EnchargeName || "N/A",
              }
            : null
        }
      />
    </>
  );
};

export default LaboratoryTable;