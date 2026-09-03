import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { DepartmentDisplayContext } from "../../contexts/DepartmentContext/DepartmentContext";
import { 
  FaPlus, FaEdit, FaTrashAlt, FaSearch, 
  FaChevronLeft, FaChevronRight, FaBuilding,
  FaWarehouse
} from "react-icons/fa";
import DepartmentFormModal from "./DepartmentForm";

const DepartmentTables = () => {
  const {
    loading,
    department,
    setDepartment,
    departmentPerPage,
    currentPage,
    setCurrentPage,
    DeleteDepartment,
  } = useContext(DepartmentDisplayContext);

  const { authToken } = useContext(AuthContext);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDepartment, setSelectedDepartment] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // --- LOGIC: FILTER & PAGINATION ---
  const filterDepartment = department?.filter(
    (dept) =>
      dept.DepartmentName &&
      dept.DepartmentName.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const totalPages = Math.ceil(filterDepartment.length / departmentPerPage);
  const paginatedDepartment = filterDepartment.slice(
    (currentPage - 1) * departmentPerPage,
    currentPage * departmentPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
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

  // --- HANDLERS ---
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

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this department?")) {
      const result = await DeleteDepartment(id);
      if (result?.success) {
        setDepartment((prev) => prev.filter((d) => d._id !== id));
      }
    }
  };

  return (
    <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <FaBuilding size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-800 dark:text-white">Department List</h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">Manage organization branches</p>
          </div>
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          Total Departments: <span className="font-bold text-blue-600 dark:text-blue-400">{department?.length || 0}</span>
        </div>
      </div>

      {/* SEARCH & ACTIONS */}
      <div className="p-4 flex flex-col sm:flex-row gap-3 bg-gray-50 dark:bg-slate-800 border-b border-gray-200 dark:border-gray-700">
        <div className="relative flex-1">
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={14} />
          <input
            type="text"
            placeholder="Search departments..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-700 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500"
          />
        </div>
        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold shadow-sm whitespace-nowrap"
        >
          <FaPlus size={12} /> <span>Add Department</span>
        </button>
      </div>

      {/* TABLE SECTION */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-gray-300 text-xs uppercase tracking-wider font-semibold border-b border-gray-200 dark:border-gray-700">
              <th className="px-6 py-3">
                <div className="flex items-center gap-2">
                  <FaWarehouse size={12} />
                  Department Name
                </div>
              </th>
              <th className="px-6 py-3 text-center">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
            {loading ? (
              <tr>
                <td colSpan={2} className="py-12 text-center text-gray-500 dark:text-gray-400">
                  <div className="flex justify-center items-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                    <span>Loading departments...</span>
                  </div>
                </td>
              </tr>
            ) : paginatedDepartment.length === 0 ? (
              <tr>
                <td colSpan={2} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                  {searchTerm ? 'No matching departments found.' : 'No departments found. Click "Add Department" to get started.'}
                </td>
              </tr>
            ) : (
              paginatedDepartment.map((dept) => (
                <tr key={dept._id} className="hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                        {dept.DepartmentName?.charAt(0).toUpperCase() || 'D'}
                      </div>
                      <span>{dept.DepartmentName}</span>
                    </div>
                  </td>
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
                        onClick={() => handleDelete(dept._id)}
                        className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                        title="Delete Department"
                      >
                        <FaTrashAlt size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER / PAGINATION */}
      <div className="px-6 py-3 bg-gray-50 dark:bg-slate-800 border-t border-gray-200 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Showing <span className="font-medium text-gray-700 dark:text-gray-300">
            {filterDepartment.length === 0 ? 0 : Math.min(filterDepartment.length, (currentPage - 1) * departmentPerPage + 1)}
          </span> to{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">
            {Math.min(currentPage * departmentPerPage, filterDepartment.length)}
          </span> of{' '}
          <span className="font-medium text-gray-700 dark:text-gray-300">{filterDepartment.length}</span> entries
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1 || filterDepartment.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
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
                    : "hover:bg-gray-100 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300"
                }`}
              >
                {num}
              </button>
            ))}
          </div>

          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage === totalPages || filterDepartment.length === 0}
            className="p-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-slate-700 disabled:opacity-30 hover:bg-gray-100 dark:hover:bg-slate-600 transition-colors text-gray-700 dark:text-gray-300"
          >
            <FaChevronRight size={10} />
          </button>
        </div>
      </div>

      {/* FORM MODAL - Still a modal for adding/editing department */}
      {isAddFormOpen && (
        <DepartmentFormModal
          isOpen={isAddFormOpen}
          onAddDepartment={(newDept) => {
            setDepartment((prev) => [...prev, newDept]);
            handleCloseModal();
          }}
          onUpdate={(updated) => {
            setDepartment((prev) => prev.map((d) => d._id === updated._id ? updated : d));
            handleCloseModal();
          }}
          department={selectedDepartment}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default DepartmentTables;