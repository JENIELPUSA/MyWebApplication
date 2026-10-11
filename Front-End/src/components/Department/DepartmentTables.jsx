import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { DepartmentDisplayContext } from "../../contexts/DepartmentContext/DepartmentContext";
import {
  FaPlus, FaEdit, FaTrashAlt, FaSearch,
  FaChevronLeft, FaChevronRight, FaBuilding,
  FaWarehouse
} from "react-icons/fa";
import DepartmentFormModal from "./DepartmentForm";
import ConfirmDeleteModal from "../../components/ReusableComponent/ConfirmationDeleteModal";

const DepartmentTables = () => {
  const {
    // Data
    filteredDepartments,
    loading,
    totalDepartments,
    totalPages,

    // Pagination
    currentPage,
    setCurrentPage,
    departmentPerPage,
    setDepartmentsPerPage,

    // Search & Filter
    searchQuery,
    setSearchQuery,
    statusFilter,
    setStatusFilter,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // CRUD
    setDepartment,
    DeleteDepartment,
  } = useContext(DepartmentDisplayContext);

  const { role } = useContext(AuthContext);

  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // ✅ DELETE CONFIRMATION STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [departmentToDelete, setDepartmentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Check if user has edit/delete permissions
  const canEdit = role !== "Supply";
  const canAdd = role !== "Supply";

  // ─── Reset sa page 1 kapag nag-change ang perPage ───────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [departmentPerPage, setCurrentPage]);

  // ==========================================
  // PAGINATION
  // ==========================================
  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= (totalPages || 1)) {
      setCurrentPage(pageNumber);
    }
  };

  // Helper para sa Page Numbers (Ellipsis Logic)
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
  const handleAddClick = () => {
    setSelectedDepartment(null);
    setAddFormOpen(true);
  };

  const handleEditClick = (dept) => {
    setSelectedDepartment(dept);
    setAddFormOpen(true);
  };

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedDepartment(null);
  };

  // ✅ Buksan ang delete modal
  const handleDeleteClick = (dept) => {
    setDepartmentToDelete(dept);
    setIsDeleteModalOpen(true);
  };

  // ✅ Isara ang delete modal
  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setDepartmentToDelete(null);
  };

  // ✅ Actual delete (tatawagin ng ConfirmDeleteModal)
  const handleConfirmDelete = async () => {
    if (!departmentToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await DeleteDepartment(departmentToDelete._id);
      setIsDeleteModalOpen(false);
      setDepartmentToDelete(null);
    } catch (err) {
      alert("Failed to delete department.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleRefresh = () => {
    // fetchCategoryData is auto-called via context dependencies
    // pero pwede mong i-force refresh sa pamamagitan ng pag-reset ng page
    setCurrentPage(1);
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
              <FaBuilding size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Department List
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Manage organization branches
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Total Departments:{" "}
              <span className="font-bold text-blue-700 dark:text-blue-400">
                {totalDepartments || 0}
              </span>
            </div>
          </div>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="p-4 flex flex-col sm:flex-row gap-3
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
          {/* Search */}
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={14} />
            <input
              type="text"
              placeholder="Search departments..."
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
            <option value="DepartmentName|asc">Name (A-Z)</option>
            <option value="DepartmentName|desc">Name (Z-A)</option>
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
              <span>Add Department</span>
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
                    <FaWarehouse size={12} />
                    Department Name
                  </div>
                </th>
                {canEdit && (
                  <th className="px-6 py-3 text-center">Actions</th>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={canEdit ? 2 : 1} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                      <span>Loading departments...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredDepartments.length === 0 ? (
                <tr>
                  <td colSpan={canEdit ? 2 : 1} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {searchQuery ? 'No matching departments found.' : 'No departments found. Click "Add Department" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredDepartments.map((dept) => (
                  <tr key={dept._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                          {dept.DepartmentName?.charAt(0).toUpperCase() || 'D'}
                        </div>
                        <div>
                          <div>{dept.DepartmentName}</div>
                          {dept.DepartmentCode && (
                            <div className="text-[10px] text-gray-400 dark:text-gray-500 font-mono">
                              {dept.DepartmentCode}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    {canEdit && (
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEditClick(dept)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit Department"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(dept)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Department"
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
              {totalDepartments === 0 ? 0 : Math.min(totalDepartments, (currentPage - 1) * departmentPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * departmentPerPage, totalDepartments)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalDepartments}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Per Page */}
            <select
              value={departmentPerPage}
              onChange={(e) => setDepartmentsPerPage(Number(e.target.value))}
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
              disabled={currentPage === 1 || totalDepartments === 0}
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
              disabled={currentPage === (totalPages || 1) || totalDepartments === 0}
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
        {isAddFormOpen && canEdit && (
          <DepartmentFormModal
            isOpen={isAddFormOpen}
            onAddDepartment={(newDept) => {
              setDepartment((prev) => [...prev, newDept]);
              handleCloseModal();
            }}
            onUpdate={(updated) => {
              setDepartment((prev) => prev.map((d) => (d._id === updated._id ? updated : d)));
              handleCloseModal();
            }}
            department={selectedDepartment}
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
        title="Delete Department?"
        description="This action cannot be undone. The department will be permanently removed from the system."
        confirmText="Yes, Delete"
        itemIcon={FaBuilding}
        itemDetails={
          departmentToDelete
            ? {
                code: departmentToDelete._id,
                brand: departmentToDelete.DepartmentName,
                specification: departmentToDelete.DepartmentCode || "N/A",
              }
            : null
        }
      />
    </>
  );
};

export default DepartmentTables;