import React, { useState, useContext, useEffect } from "react";
import {
  FaPlus, FaEdit, FaTrashAlt, FaSearch,
  FaChevronLeft, FaChevronRight, FaList,
  FaTag, FaClock, FaFilter
} from "react-icons/fa";
import ProblemFormModal from "./ProblemAddModal";
import ConfirmDeleteModal from "../../components/ReusableComponent/ConfirmationDeleteModal";
import { ProblemContext } from "../../contexts/ProblemContext/ProblemContext";
import { CategoryContext } from "../../contexts/CategoryContext/categoryContext";

// --- CATEGORY COLOR MAP ---
const CATEGORY_COLORS = {
  'Aircon': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'Laptop': 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400',
  'Water Dispenser': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
  'Printer': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Desktop': 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  'Server': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  'Network Switch': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'Projector': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'Router': 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400',
  'Monitor': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'Keyboard': 'bg-gray-100 text-gray-700 dark:bg-gray-800/50 dark:text-gray-300',
  'Mouse': 'bg-slate-100 text-slate-700 dark:bg-slate-800/50 dark:text-slate-300',
  'UPS': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'Scanner': 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-900/30 dark:text-fuchsia-400',
  'Telephone': 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
  'CCTV': 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-400',
  'Biometrics': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  'Network Cable': 'bg-stone-100 text-stone-700 dark:bg-stone-800/50 dark:text-stone-300',
  'Server Rack': 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800/50 dark:text-zinc-300',
  'Generator': 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  'Firewall': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'NAS Storage': 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const CATEGORIES = Object.keys(CATEGORY_COLORS);

const formatDate = (dateString) => {
  if (!dateString) return "N/A";
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const ProblemTable = () => {
  const {
    // Data
    filteredProblems,
    loading,
    totalProblems,
    totalPages,

    // Pagination
    currentPage,
    setCurrentPage,
    problemPerPage,
    setProblemPerPage,

    // Search & Filter
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    priorityFilter,
    setPriorityFilter,
    fromDate,
    setFromDate,
    toDate,
    setToDate,

    // Sorting
    sortBy,
    setSortBy,
    sortOrder,
    setSortOrder,

    // CRUD
    createProblem,
    updateProblem,
    deleteProblem,
  } = useContext(ProblemContext);

  const { categories } = useContext(CategoryContext);

  const [selectedProblem, setSelectedProblem] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // ✅ DELETE CONFIRMATION STATES
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [problemToDelete, setProblemToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // ─── Reset sa page 1 kapag nag-change ang perPage ───────────────
  useEffect(() => {
    setCurrentPage(1);
  }, [problemPerPage, setCurrentPage]);

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
  const handleAddClick = () => {
    setSelectedProblem(null);
    setAddFormOpen(true);
  };

  const handleEditClick = (problem) => {
    setSelectedProblem(problem);
    setAddFormOpen(true);
  };

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedProblem(null);
  };

  // ✅ CREATE — context auto-refetch
  const handleCreateProblem = async (data) => {
    return await createProblem(data);
  };

  // ✅ UPDATE — context auto-refetch
  const handleUpdateProblem = async (id, data) => {
    return await updateProblem(id, data);
  };

  // ✅ Buksan ang delete modal
  const handleDeleteClick = (problem) => {
    setProblemToDelete(problem);
    setIsDeleteModalOpen(true);
  };

  // ✅ Isara ang delete modal
  const handleCancelDelete = () => {
    if (isDeleting) return;
    setIsDeleteModalOpen(false);
    setProblemToDelete(null);
  };

  // ✅ Actual delete (tatawagin ng ConfirmDeleteModal)
  const handleConfirmDelete = async () => {
    if (!problemToDelete || isDeleting) return;
    setIsDeleting(true);
    try {
      await deleteProblem(problemToDelete._id);
      setIsDeleteModalOpen(false);
      setProblemToDelete(null);
    } catch (err) {
      alert("Failed to delete problem.");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleClearFilters = () => {
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setPriorityFilter("");
    setFromDate("");
    setToDate("");
    setCurrentPage(1);
  };

  const hasActiveFilters =
    searchQuery || categoryFilter || statusFilter || priorityFilter || fromDate || toDate;

  // Category list (galing sa CategoryContext o fallback sa hardcoded)
  const categoryList = categories?.length > 0
    ? categories.map(c => c.CategoryName)
    : CATEGORIES;

  // ==========================================
  // RENDER
  // ==========================================
  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col">

        {/* HEADER */}
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
          bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <FaList size={18} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Problem Management
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Track and manage system issues
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Total Problems:{" "}
            <span className="font-bold text-blue-700 dark:text-blue-400">
              {totalProblems || 0}
            </span>
          </div>
        </div>

        {/* FILTER & SEARCH */}
        <div className="p-4 bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={14} />
              <input
                type="text"
                placeholder="Search problems by title, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                  bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                  placeholder-gray-400 dark:placeholder-gray-500"
              />
            </div>

            {/* Category Filter */}
            <div className="relative min-w-[180px]">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500" size={14} />
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="w-full pl-9 pr-8 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                  bg-white dark:bg-slate-700 text-gray-900 dark:text-white appearance-none"
              >
                <option value="">All Categories</option>
                {categoryList.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Status</option>
              <option value="Open">Open</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
              <option value="Closed">Closed</option>
            </select>

            {/* Priority Filter */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white"
            >
              <option value="">All Priority</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>

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
              <option value="title|asc">Title (A-Z)</option>
              <option value="title|desc">Title (Z-A)</option>
              <option value="priority|desc">Priority (High-Low)</option>
            </select>

            {/* Clear + Add */}
            <div className="flex gap-2">
              {hasActiveFilters && (
                <button
                  onClick={handleClearFilters}
                  className="px-4 py-2 text-sm bg-gray-200 dark:bg-slate-700 hover:bg-gray-300 dark:hover:bg-slate-600
                    text-gray-700 dark:text-gray-300 rounded-lg transition-colors whitespace-nowrap"
                >
                  Clear Filters
                </button>
              )}
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
                <span>Add Problem</span>
              </button>
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2 items-center">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-full">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery("")} className="ml-1 hover:text-blue-900">×</button>
                </span>
              )}
              {categoryFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 rounded-full">
                  Category: {categoryFilter}
                  <button onClick={() => setCategoryFilter("")} className="ml-1 hover:text-purple-900">×</button>
                </span>
              )}
              {statusFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Status: {statusFilter}
                  <button onClick={() => setStatusFilter("")} className="ml-1 hover:text-green-900">×</button>
                </span>
              )}
              {priorityFilter && (
                <span className="inline-flex items-center gap-1 px-3 py-1 text-xs bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                  Priority: {priorityFilter}
                  <button onClick={() => setPriorityFilter("")} className="ml-1 hover:text-orange-900">×</button>
                </span>
              )}
              <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                {totalProblems} result{totalProblems !== 1 ? 's' : ''}
              </span>
            </div>
          )}
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-6 py-3 w-12">#</th>
                <th className="px-6 py-3">
                  <div className="flex items-center gap-2"><FaList size={12} /> Problem Title</div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center gap-2"><FaTag size={12} /> Category</div>
                </th>
                <th className="px-6 py-3">
                  <div className="flex items-center gap-2"><FaClock size={12} /> Created</div>
                </th>
                <th className="px-6 py-3 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex justify-center items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                      <span>Loading problems...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredProblems.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-gray-400 dark:text-gray-500 italic">
                    {hasActiveFilters
                      ? 'No problems match your filters.'
                      : 'No problems found. Click "Add Problem" to get started.'}
                  </td>
                </tr>
              ) : (
                filteredProblems.map((problem, index) => {
                  const globalIndex = (currentPage - 1) * problemPerPage + index + 1;
                  const categoryColor = CATEGORY_COLORS[problem.category] || 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';

                  return (
                    <tr key={problem._id} className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors">
                      <td className="px-6 py-4 text-gray-400 dark:text-gray-500 text-xs">{globalIndex}</td>
                      <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold">
                            {problem.title?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <span>{problem.title}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 text-xs font-medium rounded-full ${categoryColor}`}>
                          {problem.category || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm">
                        {formatDate(problem.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center gap-2">
                          <button
                            onClick={() => handleEditClick(problem)}
                            className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                            title="Edit Problem"
                          >
                            <FaEdit size={15} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(problem)}
                            className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                            title="Delete Problem"
                          >
                            <FaTrashAlt size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* PAGINATION */}
        <div className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
          border-t border-blue-100 dark:border-slate-700
          rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400">
            Showing <span className="font-medium text-blue-700 dark:text-blue-400">
              {totalProblems === 0 ? 0 : Math.min(totalProblems, (currentPage - 1) * problemPerPage + 1)}
            </span> to{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">
              {Math.min(currentPage * problemPerPage, totalProblems)}
            </span> of{' '}
            <span className="font-medium text-blue-700 dark:text-blue-400">{totalProblems}</span> entries
          </div>

          <div className="flex items-center gap-2">
            {/* Per Page */}
            <select
              value={problemPerPage}
              onChange={(e) => setProblemPerPage(Number(e.target.value))}
              className="px-2 py-1 text-xs border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700 text-blue-800 dark:text-slate-300"
            >
              {[5, 10, 25, 50, 100].map((n) => (
                <option key={n} value={n}>{n} / page</option>
              ))}
            </select>

            {/* Prev */}
            <button
              onClick={() => paginate(currentPage - 1)}
              disabled={currentPage === 1 || totalProblems === 0}
              className="p-2 border border-blue-200 dark:border-slate-600 rounded
                bg-white dark:bg-slate-700
                disabled:opacity-30
                hover:bg-blue-50 dark:hover:bg-slate-600
                transition-colors text-blue-700 dark:text-blue-400"
            >
              <FaChevronLeft size={10} />
            </button>

            {/* Page Numbers */}
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
              disabled={currentPage === (totalPages || 1) || totalProblems === 0}
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

        {/* MODAL */}
        {isAddFormOpen && (
          <ProblemFormModal
            isOpen={isAddFormOpen}
            onUpdate={handleUpdateProblem}
            problem={selectedProblem}
            onClose={handleCloseModal}
            categories={categories}
            createProblem={handleCreateProblem}
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
        title="Delete Problem?"
        description="This action cannot be undone. The problem will be permanently removed from the system."
        confirmText="Yes, Delete"
        itemIcon={FaList}
        itemDetails={
          problemToDelete
            ? {
                code: problemToDelete._id,
                brand: problemToDelete.title,
                specification: problemToDelete.category,
                serialNumber: problemToDelete.priority || "N/A",
              }
            : null
        }
      />
    </>
  );
};

export default ProblemTable;