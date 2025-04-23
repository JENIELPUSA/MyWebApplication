import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import { FaPlus } from "react-icons/fa";
import CategoryAddForm from "./CategoryForm";
import { CategoryDisplayContext } from "../Context/Category/Display";
import { AuthContext } from "../Context/AuthContext";
import { motion } from "framer-motion";
const CategoryTable = ({ isOpen, onClose }) => {
  const {
    RemoveCategory,
    category,
    loading,
    setCategory,
    currentPage,
    setCurrentPage,
    categoryPerPage,
  } = useContext(CategoryDisplayContext); // List of departments
  const [searchTerm, setSearchTerm] = useState(""); // Search term for filtering
  const token = localStorage.getItem("token"); // Token for API authentication
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [isAddFormOpen, setAddFormOpen] = useState(false);
  const { authToken } = useContext(AuthContext);
  const [isVisible, setIsVisible] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 70); // Trigger animation
    if (!authToken) {
      console.warn("No token found in localStorage");
      setError("Authentication token is missing. Please log in.");
      return;
    }
  }, [authToken]);

  const handleCloseModal = () => {
    setAddFormOpen(false);
    setSelectedCategory(null);
    setIsVisible(false);
  };
  const handleAddClick = () => {
    setAddFormOpen(true);
  };

  const handleAddCategory = (newCategory) => {
    if (!newCategory || !newCategory._id) {
      alert("Department ID is Missing!!");
      return;
    }

    setCategory((prevCategory) => [...prevCategory, newCategory]);
  };

  const handleSelectCategory = (category) => {
    setSelectedCategory(category);
    setAddFormOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    const result = await RemoveCategory(categoryId);
    if (result.success === true) {
      setCategory((prevCategory) =>
        prevCategory.filter((depart) => depart._id !== categoryId)
      );
    }
  };

  const handleUpdateCategory = (UpdateCategory) => {
    if (!UpdateCategory || !UpdateCategory._id) {
      alert("Category ID is missing. Cannot update.");
      return;
    }

    setCategory((prevCategory) =>
      prevCategory.map((category) =>
        category._id === UpdateCategory._id ? UpdateCategory : category
      )
    );
  };

  if (!isOpen) return null;

  // Filter equipment based on search term
  const filteredCategory = category.filter((category) =>
    category.CategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalPages = Math.ceil(filteredCategory.length / categoryPerPage); // Calculate total pages

  const paginatedCategory = filteredCategory.slice(
    (currentPage - 1) * categoryPerPage,
    currentPage * categoryPerPage
  );

  const paginate = (pageNumber) => {
    if (pageNumber < 1 || pageNumber > totalPages) return; // Check for valid page number
    setCurrentPage(pageNumber); // Update current page
  };

  const isNoCategory = filteredCategory.length === 0; // Fixed here

  return (
    <motion.div
      className="fixed inset-0 bg-gray-500 bg-opacity-50 flex justify-center items-center z-50 px-2 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-screen-sm sm:max-w-screen-md lg:max-w-[700x] xl:max-w-[700px] shadow-lg max-h-[90vh] sm:max-h-none overflow-y-auto"

        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }} // Shrinks on click
          whileHover={{ scale: 1.1 }} // Enlarges on hover
          transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
          onClick={() => {
            setAnimateExit(true); // Set the animation state to trigger upward motion
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

       
        <h2 className="text-xl font-bold mb-4 xs:text-sm xs:p-2 lg-p-2 lg:text-lg">
          Category Table</h2>

        <div className="mb-4">
          <input
            type="text"
            placeholder="Search Equipment..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full p-2 border rounded-lg xs:text-sm xs:p-2 lg-p-2 lg:text-sm"
          />
        </div>
        <div className="overflow-x-auto">
        <table className="w-full text-left table-auto border-collapse mb-4 border border-gray-300">
          <thead>
            <tr>
              <th className=" xs:text-sm xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300">Category Name</th>
              <th className=" xs:text-sm xs:p-2 lg-p-2 lg:text-sm p-4 border-b border-gray-300 flex justify-center items-center">
                <button
                  onClick={() => handleAddClick()}
                  className="px-3 py-1 text-white bg-blue-500 rounded hover:bg-blue-600"
                >
                  <FaPlus className="w-5 h-5" />
                </button>
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6}>
                  <LoadingTableSpinner />
                </td>
              </tr>
            ) : paginatedCategory.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="border p-2 text-center text-gray-500"
                >
                  No Results Found
                </td>
              </tr>
            ) : (
              paginatedCategory.map((category) => (
                <tr key={category._id} className="hover:bg-gray-100 just">
                  <td className=" xs:text-sm xs:p-2 lg-p-2 lg:text-sm border p-2">{category.CategoryName}</td>
                  <td className=" xs:text-sm xs:p-2 lg-p-2 lg:text-sm border p-2 flex space-x-2 justify-center">
                    <button
                      onClick={() => handleSelectCategory(category)}
                      className="px-3 py-1 text-white  bg-blue-500 rounded hover:bg-blue-600 transition"
                    >
                      <i className="fas fa-edit"></i>
                    </button>

                    <button
                      onClick={() => handleDeleteCategory(category._id)}
                      className="px-3 py-1 text-white bg-red-500 rounded hover:bg-red-600"
                    >
                      <i className="fas fa-trash-alt"></i>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
          
        </div>



        {/* Pagination */}
        <div className="flex flex-wrap gap-2 items-center justify-center mt-4">
          {/* Prev Button */}
          <button
            onClick={() => paginate(currentPage - 1)}
            className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
            disabled={currentPage === 1}
          >
            Prev
          </button>

          {/* Page Numbers */}
          <div className="hidden md:flex flex-wrap justify-center gap-1 md:gap-2">
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i}
                onClick={() => paginate(i + 1)}
                className={`py-1 px-3 text-xs md:py-2 md:px-4 md:text-base rounded-full transition ${
                  currentPage === i + 1
                    ? "bg-blue-500 text-white"
                    : "border border-gray-300 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => paginate(currentPage + 1)}
            className="py-1 px-3 text-xs md:py-2 md:px-4 md:text-base bg-gray-200 rounded-full disabled:opacity-50"
            disabled={currentPage === totalPages}
          >
            Next
          </button>
        </div>

        {isAddFormOpen && (
          <CategoryAddForm
            isOpen={isAddFormOpen}
            onAddCategory={handleAddCategory}
            category={selectedCategory}
            onUpdate={handleUpdateCategory}
            onClose={handleCloseModal}
          />
        )}
        <ToastContainer />
      </motion.div>
    </motion.div>
  );
};

export default CategoryTable;
