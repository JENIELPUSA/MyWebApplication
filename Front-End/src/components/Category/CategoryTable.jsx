import React, { useState, useEffect, useContext } from "react";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { FaPlus, FaEdit, FaTrashAlt, FaSearch, FaTags } from "react-icons/fa";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import CategoryForm from "./CategoryForm";
import { CategoryContext } from "../../contexts/CategoryContext/categoryContext";
import { AuthContext } from "../../contexts/AuthContext";

const CategoryTable = () => {
  // ============ CONTEXT ============
  const {
    deleteCategory,
    categories,
    loading,
    setCategories,
    currentPage,
    setCurrentPage,
    categoriesPerPage,
    setCustomError,
    fetchCategories,
  } = useContext(CategoryContext);

  const { authToken } = useContext(AuthContext);

  // ============ LOCAL STATE ============
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);

  // ============ AUTH CHECK ============
  useEffect(() => {
    if (!authToken) {
      console.warn("No token found");
      setCustomError?.("Authentication token is missing. Please log in.");
    }
  }, [authToken, setCustomError]);

  // ============ HANDLERS ============
  const handleCloseForm = () => {
    setAddFormOpen(false);
    setSelectedCategory(null);
  };

  const handleAddClick = () => {
    setSelectedCategory(null);
    setAddFormOpen(true);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setAddFormOpen(true);
  };

  const handleAddCategory = async (newCategory) => {
    if (!newCategory) {
      console.warn("No category returned from form");
      return;
    }
    if (typeof fetchCategories === "function") {
      await fetchCategories();
    } else {
      setCategories((prev) => [...prev, newCategory]);
    }
  };

  const handleUpdateCategory = async (updatedCategory) => {
    if (!updatedCategory) {
      console.warn("No category returned from form");
      return;
    }
    if (typeof fetchCategories === "function") {
      await fetchCategories();
    } else {
      setCategories((prev) =>
        prev.map((cat) =>
          cat._id === updatedCategory._id ? updatedCategory : cat
        )
      );
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    const result = await deleteCategory(categoryId);
    if (result?.success === true) {
      setCategories((prev) => prev.filter((cat) => cat._id !== categoryId));
    }
  };

  // ============ FILTER + PAGINATION ============
  const safeCategories = Array.isArray(categories) ? categories : [];

  const filteredCategory = safeCategories.filter((cat) =>
    cat.CategoryName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategory.length / categoriesPerPage);

  const paginatedCategory = filteredCategory.slice(
    (currentPage - 1) * categoriesPerPage,
    currentPage * categoriesPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return;
    setCurrentPage(pageNumber);
  };

  // ============ PAGE NUMBERS (with ellipsis) ============
  const getPageNumbers = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - 1 && i <= currentPage + 1)
      ) {
        pages.push(i);
      } else if (i === currentPage - 2 || i === currentPage + 2) {
        pages.push("...");
      }
    }
    return [...new Set(pages)];
  };

  // ============ RENDER ============
  return (
    <>
      <div className="w-full bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-100 dark:border-slate-700 flex flex-col">

        {/* ==================== HEADER ==================== */}
        <div className="px-6 py-4 border-b border-blue-100 dark:border-slate-700 flex justify-between items-center
          bg-gradient-to-r from-blue-50 via-white to-amber-50
          dark:from-slate-900 dark:via-slate-900 dark:to-slate-900 rounded-t-lg">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-blue-700 dark:from-blue-500 dark:to-blue-600 rounded-lg text-white shadow-sm shadow-blue-500/30">
              <FaTags size={16} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-900 dark:text-white">
                Category Management
              </h2>
              <p className="text-xs text-blue-600/70 dark:text-slate-400">
                Manage and organize category records
              </p>
            </div>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium hidden sm:block">
            Total Categories:{" "}
            <span className="font-bold text-blue-700 dark:text-blue-400">
              {safeCategories.length}
            </span>
          </div>
        </div>

        {/* ==================== TOOLBAR ==================== */}
        <div className="p-4 flex flex-col sm:flex-row gap-3
          bg-slate-50 dark:bg-slate-800 border-b border-blue-100 dark:border-slate-700">

          {/* Search */}
          <div className="relative flex-1">
            <FaSearch
              className="absolute left-3 top-1/2 -translate-y-1/2 text-blue-400 dark:text-blue-500"
              size={14}
            />
            <input
              type="text"
              placeholder="Search Category Name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm border border-blue-200 dark:border-slate-600 rounded-lg
                focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none
                bg-white dark:bg-slate-700 text-gray-900 dark:text-white
                placeholder-gray-400 dark:placeholder-gray-500"
            />
          </div>

          {/* Add Button */}
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
            <span>Add Category</span>
          </button>
        </div>

        {/* ==================== TABLE ==================== */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gradient-to-r from-blue-700 to-blue-800 dark:from-slate-800 dark:to-slate-800
                text-white dark:text-slate-300 text-xs uppercase tracking-wider font-semibold
                border-b border-blue-800 dark:border-slate-700">
                <th className="px-6 py-3">
                  <div className="flex items-center gap-2">
                    <FaTags size={12} />
                    Category Name
                  </div>
                </th>
                <th className="px-6 py-3 text-center w-32">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50 dark:divide-slate-700 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-slate-900">
              {loading ? (
                <tr>
                  <td colSpan={2} className="py-12 text-center">
                    <div className="flex justify-center items-center gap-2 text-gray-500 dark:text-gray-400">
                      <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 dark:border-blue-400 border-t-transparent"></div>
                      <span>Loading categories...</span>
                    </div>
                  </td>
                </tr>
              ) : paginatedCategory.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="py-12 text-center text-gray-400 dark:text-gray-500 italic"
                  >
                    {searchTerm
                      ? "No matching categories found."
                      : 'No categories found. Click "Add Category" to get started.'}
                  </td>
                </tr>
              ) : (
                paginatedCategory.map((cat) => (
                  <tr
                    key={cat._id}
                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800 transition-colors"
                  >
                    <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold shrink-0">
                          {cat.CategoryName?.charAt(0).toUpperCase() || "C"}
                        </div>
                        <div>{cat.CategoryName}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center gap-2">
                        <button
                          onClick={() => handleSelectCategory(cat)}
                          className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded transition-colors"
                          title="Edit Category"
                        >
                          <FaEdit size={15} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(cat._id)}
                          className="p-1.5 text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition-colors"
                          title="Delete Category"
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

        {/* ==================== FOOTER / PAGINATION ==================== */}
        {!loading && filteredCategory.length > 0 && (
          <div className="px-6 py-3 bg-gradient-to-r from-blue-50 via-white to-amber-50
            dark:bg-slate-800 dark:from-slate-800 dark:via-slate-800 dark:to-slate-800
            border-t border-blue-100 dark:border-slate-700
            rounded-b-lg flex flex-col sm:flex-row justify-between items-center gap-3">

            <div className="text-xs text-slate-500 dark:text-slate-400">
              Showing{" "}
              <span className="font-medium text-blue-700 dark:text-blue-400">
                {(currentPage - 1) * categoriesPerPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium text-blue-700 dark:text-blue-400">
                {Math.min(currentPage * categoriesPerPage, filteredCategory.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-blue-700 dark:text-blue-400">
                {filteredCategory.length}
              </span>{" "}
              entries
            </div>

            <div className="flex items-center gap-2">
              {/* Prev */}
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
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
                disabled={currentPage === totalPages || totalPages === 0}
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
        )}
      </div>

      {/* ==================== ADD/EDIT FORM ==================== */}
      {isAddFormOpen && (
        <CategoryForm
          isOpen={isAddFormOpen}
          onAddCategory={handleAddCategory}
          category={selectedCategory}
          onUpdate={handleUpdateCategory}
          onClose={handleCloseForm}
        />
      )}
    </>
  );
};

export default CategoryTable;