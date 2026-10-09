import React, { useState, useEffect, useContext } from "react";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { FaPlus, FaEdit, FaTrashAlt } from "react-icons/fa";
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
    fetchCategories, // ✅ optional — kung meron sa context
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

  // ✅ FIXED: Ang form mismo ang tumatawag sa API.
  // Ito ay tinatawag lang pagkatapos ng successful API response.
  const handleAddCategory = async (newCategory) => {
    if (!newCategory) {
      console.warn("No category returned from form");
      return;
    }
    // ✅ I-refresh mula sa backend kung may fetchCategories
    if (typeof fetchCategories === "function") {
      await fetchCategories();
    } else {
      // Fallback: local state update
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

  // ============ RENDER ============
  return (
    <div className="w-full bg-white rounded-xl shadow-sm border border-gray-200 p-4 sm:p-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
        <div>
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Category Table
          </h2>
          <p className="text-xs sm:text-sm text-gray-500">
            Manage your categories
          </p>
        </div>

        <button
          onClick={handleAddClick}
          className="flex items-center justify-center gap-2 px-4 py-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition text-sm font-medium w-full sm:w-auto"
        >
          <FaPlus className="w-4 h-4" />
          Add Category
        </button>
      </div>

      {/* SEARCH */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Category Name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
      </div>

      {/* TABLE */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse border border-gray-200 rounded-lg">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-xs sm:text-sm font-semibold text-gray-600 uppercase p-3 border-b border-gray-200">
                Category Name
              </th>
              <th className="text-xs sm:text-sm font-semibold text-gray-600 uppercase p-3 border-b border-gray-200 text-center w-32">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2}>
                  <LoadingTableSpinner />
                </td>
              </tr>
            ) : paginatedCategory.length === 0 ? (
              <tr>
                <td colSpan={2} className="p-8 text-center text-gray-500 text-sm">
                  No Results Found
                </td>
              </tr>
            ) : (
              paginatedCategory.map((cat) => (
                <tr
                  key={cat._id}
                  className="hover:bg-gray-50 transition border-b border-gray-100"
                >
                  <td className="text-sm p-3 text-gray-700">
                    {cat.CategoryName}
                  </td>
                  <td className="p-3">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => handleSelectCategory(cat)}
                        className="p-2 text-white bg-blue-500 rounded-lg hover:bg-blue-600 transition"
                        title="Edit"
                      >
                        <FaEdit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteCategory(cat._id)}
                        className="p-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition"
                        title="Delete"
                      >
                        <FaTrashAlt className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION */}
      {!loading && filteredCategory.length > 0 && (
        <div className="flex flex-row items-center justify-between flex-wrap mt-4 text-sm gap-2">
          <div className="text-gray-700">
            Page {currentPage} of {totalPages || 1}
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => paginate(currentPage - 1)}
              className="py-1.5 px-3 text-xs sm:text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={currentPage === 1}
            >
              Prev
            </button>
            <button
              onClick={() => paginate(currentPage + 1)}
              className="py-1.5 px-3 text-xs sm:text-sm bg-gray-200 rounded-lg hover:bg-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition"
              disabled={currentPage === totalPages || totalPages === 0}
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* SHOWING INFO */}
      {!loading && filteredCategory.length > 0 && (
        <div className="mt-2 text-xs sm:text-sm text-center text-gray-500">
          Showing {(currentPage - 1) * categoriesPerPage + 1} to{" "}
          {Math.min(currentPage * categoriesPerPage, filteredCategory.length)} of{" "}
          {filteredCategory.length} results
        </div>
      )}

      {/* ADD/EDIT FORM */}
      {isAddFormOpen && (
        <CategoryForm
          isOpen={isAddFormOpen}
          onAddCategory={handleAddCategory}
          category={selectedCategory}
          onUpdate={handleUpdateCategory}
          onClose={handleCloseForm}
        />
      )}
    </div>
  );
};

export default CategoryTable;