import React, { useState, useEffect, useRef } from "react";
import { FaTimes, FaSave, FaPlus, FaEdit, FaChevronDown } from "react-icons/fa";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";

const ProblemFormModal = ({
  isOpen,
  onUpdate,
  problem,
  onClose,
  createProblem,
  categories,
}) => {
  const [formData, setFormData] = useState({ title: "", category: "" });
  const [errors, setErrors] = useState({});
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dropdownRef = useRef(null);

  // ✅ StatusModal states
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [modalMessage, setModalMessage] = useState("");

  const categoryNames = categories?.map((cat) => cat.CategoryName) || [];

  /* ============================================================
   * Close dropdown on outside click
   * ============================================================ */
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  /* ============================================================
   * Reset form when modal opens/closes or problem changes
   * ============================================================ */
  useEffect(() => {
    if (problem) {
      setFormData({
        title: problem.title || "",
        category:
          typeof problem.category === "object"
            ? problem.category?.CategoryName || ""
            : problem.category || "",
      });
    } else {
      setFormData({ title: "", category: "" });
    }
    setErrors({});
    setFilteredCategories(categoryNames);
    setIsDropdownOpen(false);
    setIsSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [problem, categories, isOpen]);

  /* ============================================================
   * Handlers
   * ============================================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleCategoryInputChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, category: value }));
    if (value.trim()) {
      setFilteredCategories(
        categoryNames.filter((cat) =>
          cat.toLowerCase().includes(value.toLowerCase())
        )
      );
    } else {
      setFilteredCategories(categoryNames);
    }
    setIsDropdownOpen(true);
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, category }));
    setFilteredCategories(categoryNames);
    setIsDropdownOpen(false);
    if (errors.category) setErrors((prev) => ({ ...prev, category: "" }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.category.trim()) newErrors.category = "Category is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  /* ============================================================
   * Submit
   * ============================================================ */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const data = {
      title: formData.title.trim(),
      category: formData.category.trim(),
    };

    try {
      if (problem) {
        // ✅ EDIT MODE
        await onUpdate({ _id: problem._id, ...data });
        setModalStatus("success");
        setModalMessage("Problem updated successfully.");
        setShowModal(true);
        setIsSubmitting(false);
        return; // ⬅️ huwag i-close agad — hintayin ang StatusModal
      }

      if (createProblem) {
        // ✅ ADD MODE
        const result = await createProblem(data);

        if (result?.success === true) {
          setModalStatus("success");
          setModalMessage("Problem created successfully.");
          setShowModal(true);
          setIsSubmitting(false);
          return; // ⬅️ huwag i-close agad — hintayin ang StatusModal
        } else {
          setErrors({
            submit:
              result?.data?.message ||
              result?.error ||
              "Failed to create problem",
          });
          setIsSubmitting(false);
          return;
        }
      }
    } catch (error) {
      console.error("Error submitting problem:", error);
      setErrors({ submit: error.message || "An error occurred" });
      setIsSubmitting(false);
    }
  };

  /* ============================================================
   * Close form (reset + close)
   * ============================================================ */
  const handleClose = () => {
    setFormData({ title: "", category: "" });
    setErrors({});
    setIsDropdownOpen(false);
    setIsSubmitting(false);
    onClose();
  };

  /* ============================================================
   * Close StatusModal AND form
   * ============================================================ */
  const handleStatusModalClose = () => {
    setShowModal(false);
    handleClose();
  };

  /* ============================================================
   * Render
   * ============================================================ */
  return (
    <>
      {/* ✅ FORM MODAL — guarded lang ito, hindi ang buong component */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-xl w-full max-w-md shadow-xl border border-gray-200 dark:border-gray-700">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 dark:border-gray-700">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                  {problem ? <FaEdit size={14} /> : <FaPlus size={14} />}
                </div>
                <h3 className="text-lg font-bold text-gray-800 dark:text-white">
                  {problem ? "Edit Problem" : "Add New Problem"}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="p-2 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-gray-500 dark:text-gray-400"
                disabled={isSubmitting}
                aria-label="Close"
              >
                <FaTimes size={18} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4" noValidate>
              {/* Title Input */}
              <div>
                <label
                  htmlFor="problem-title"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Problem Title <span className="text-red-500">*</span>
                </label>
                <input
                  id="problem-title"
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Enter problem title..."
                  disabled={isSubmitting}
                  required
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
                    errors.title
                      ? "border-red-500"
                      : "border-gray-300 dark:border-gray-600"
                  } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-500">{errors.title}</p>
                )}
              </div>

              {/* Category Input with Dropdown */}
              <div>
                <label
                  htmlFor="problem-category"
                  className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1"
                >
                  Category <span className="text-red-500">*</span>
                  <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-2">
                    (Type to search or add new)
                  </span>
                </label>
                <div className="relative" ref={dropdownRef}>
                  <div className="relative">
                    <input
                      id="problem-category"
                      type="text"
                      name="category"
                      value={formData.category}
                      onChange={handleCategoryInputChange}
                      onFocus={() => setIsDropdownOpen(true)}
                      placeholder="Type category or select from list..."
                      disabled={isSubmitting}
                      required
                      autoComplete="off"
                      className={`w-full px-4 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white dark:bg-slate-800 text-gray-900 dark:text-white ${
                        errors.category
                          ? "border-red-500"
                          : "border-gray-300 dark:border-gray-600"
                      } ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}
                    />
                    <button
                      type="button"
                      onClick={() =>
                        !isSubmitting && setIsDropdownOpen(!isDropdownOpen)
                      }
                      disabled={isSubmitting}
                      aria-label="Toggle category list"
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                    >
                      <FaChevronDown
                        size={14}
                        className={`transition-transform ${
                          isDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>
                  </div>

                  {/* Dropdown List */}
                  {isDropdownOpen && !isSubmitting && (
                    <div className="absolute z-10 w-full mt-1 bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-48 overflow-y-auto">
                      {/* "Add new" option */}
                      {formData.category.trim() &&
                        !categoryNames.some(
                          (cat) =>
                            cat.toLowerCase() ===
                            formData.category.toLowerCase().trim()
                        ) && (
                          <div
                            className="px-4 py-2 hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer text-blue-600 dark:text-blue-400 border-b border-gray-100 dark:border-gray-700 flex items-center gap-2"
                            onClick={() =>
                              handleCategorySelect(formData.category.trim())
                            }
                          >
                            <FaPlus size={12} />
                            <span>
                              Add new category: "
                              <strong>{formData.category.trim()}</strong>"
                            </span>
                          </div>
                        )}

                      {/* Category suggestions */}
                      {filteredCategories.length > 0 ? (
                        filteredCategories.map((cat, index) => (
                          <div
                            key={`${cat}-${index}`}
                            className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-slate-700 cursor-pointer text-gray-700 dark:text-gray-300 transition-colors"
                            onClick={() => handleCategorySelect(cat)}
                          >
                            {cat}
                            {cat.toLowerCase() ===
                              formData.category.toLowerCase().trim() && (
                              <span className="ml-2 text-xs text-blue-500">
                                ✓
                              </span>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 italic">
                          No matching categories found. Type and click "Add
                          new" above.
                        </div>
                      )}
                    </div>
                  )}
                </div>
                {errors.category && (
                  <p className="mt-1 text-sm text-red-500">{errors.category}</p>
                )}
              </div>

              {/* Submit Error */}
              {errors.submit && (
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">
                    {errors.submit}
                  </p>
                </div>
              )}

              {/* Actions */}
              <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isSubmitting}
                  className="flex-1 px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors text-gray-700 dark:text-gray-300 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {problem ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>
                      <FaSave size={14} />
                      {problem ? "Update" : "Save"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* STATUS MODAL — laging mounted, hindi affected ng `isOpen` */}
      <StatusModal
        isOpen={showModal}
        onClose={handleStatusModalClose}
        status={modalStatus}
        message={modalMessage}
        showCancel={false}
        submitText="OK"
      />
    </>
  );
};

export default ProblemFormModal;