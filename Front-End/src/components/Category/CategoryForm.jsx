import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { CategoryContext } from "../../contexts/CategoryContext/categoryContext";

function CategoryForm({ isOpen, onClose, category, onAddCategory, onUpdate }) {
  // ✅ FIXED: Tamang names mula sa context
  const { addCategory, updateCategory, customError } = useContext(CategoryContext);

  // ============ LOCAL STATE ============
  const [values, setValues] = useState({
    CategoryName: "",
  });
  const [animateExit, setAnimateExit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // ============ RESET ============
  const resetForm = () => {
    setValues({ CategoryName: "" });
  };

  // ============ POPULATE FORM KAPAG EDIT MODE ============
  useEffect(() => {
    setValues({
      CategoryName: category?.CategoryName || "",
    });
  }, [category, isOpen]);

  // ============ ADD CATEGORY ============
  const handleAddCategory = async () => {
    const result = await addCategory(values); // ✅ addCategory (tama)
    if (result?.success === true) {
      onAddCategory(result.data); // Pass bagong category sa parent
      resetForm();
    }
  };

  // ============ EDIT CATEGORY ============
  const handleEditCategory = async () => {
    const result = await updateCategory(category._id, values); // ✅ updateCategory (tama)
    if (result?.success === true) {
      onUpdate(result.data);
      resetForm();
    }
  };

  // ============ INPUT HANDLER ============
  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  // ============ SUBMIT ============
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (category && category._id) {
        await handleEditCategory();
        onClose();
      } else {
        await handleAddCategory();
        onClose();
      }
    } catch (error) {
      console.error("There was an error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  // ============ RENDER ============
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center px-4 overflow-y-auto z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="flex flex-col relative rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Button */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={() => {
            setAnimateExit(true);
            setTimeout(onClose, 500);
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h4 className="xs:text-lg sm:text-lg lg:text-2xl block text-2xl font-medium text-slate-800 mb-2">
          {category ? "Edit category" : "Add category"}
        </h4>

        {/* Custom Error */}
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}

        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {category
            ? "Update the category details"
            : "Enter category details to register."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Category Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Category Name"
                autoComplete="off"
                name="CategoryName"
                onChange={handleInput}
                value={values.CategoryName}
                disabled={isLoading}
              />
            </div>
          </div>

          <button
            className={`mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
              isLoading
                ? "bg-gray-500"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading
              ? "Saving..."
              : category
              ? "Edit Category"
              : "Add Category"}
          </button>
        </form>
      </motion.div>
    </motion.div>
  );
}

export default CategoryForm;