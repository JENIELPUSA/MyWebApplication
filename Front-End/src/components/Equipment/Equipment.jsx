import React, { useState, useEffect, useContext, useRef, useCallback } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaTimes,
  FaTools,
  FaBarcode,
  FaTags,
  FaInfoCircle,
  FaChevronDown,
  FaChevronUp,
  FaSave,
  FaCalendarAlt,
  FaStickyNote,
  FaHashtag,
} from "react-icons/fa";
import StatusModal from "../ReusableComponent/SuccessandFailedModal";
import { EquipmentDataContext } from "../../contexts/EquipmentContext/EquipmentContext";

function Equipment({
  isOpen,
  onClose,
  equipment,
  onAddEquipment,
  onEditEquipment,
}) {
  const {
    sendaddEquipment,
    customError,
    setCustomError,
    EditEquipmentData,
  } = useContext(EquipmentDataContext);

  const navigate = useNavigate();
  const dropdownRef = useRef(null);

  const [animateExit, setAnimateExit] = useState(false);
  const [categories, setCategories] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [modalMessage, setModalMessage] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState({ type: null, message: "" });

  const token = localStorage.getItem("token");

  const [values, setValues] = useState({
    code: "",
    Category: "",
    Specification: "",
    Brand: "",
    SerialNumber: "",
    remarks: "",
    DateAcquired: "",
  });

  /* ---------------- Helpers ---------------- */

  const resetForm = useCallback(() => {
    setValues({
      code: "",
      Category: "",
      Specification: "",
      Brand: "",
      SerialNumber: "",
      remarks: "",
      DateAcquired: "",
    });
  }, []);

  const toLocalDateInput = (dateStr) => {
    if (!dateStr) return "";
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return "";
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const checkTokenAndFetchCategories = useCallback(async () => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/categorys`,
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );
      if (response.data?.status === "success") {
        setCategories(response.data.data || []);
      }
    } catch (err) {
      console.error("Error fetching categories:", err);
      setFeedback({
        type: "error",
        message:
          err?.response?.data?.message ||
          err.message ||
          "Failed to load categories.",
      });
    }
  }, [token, navigate]);

  /* ---------------- Effects ---------------- */

  useEffect(() => {
    if (!isOpen) return;

    setDropdownOpen(false);
    setFeedback({ type: null, message: "" });
    setAnimateExit(false);
    setIsLoading(false);
    if (setCustomError) setCustomError(null);

    checkTokenAndFetchCategories();

    if (equipment) {
      setValues({
        code: equipment.code || "",
        Brand: equipment.Brand || "",
        SerialNumber: equipment.SerialNumber || "",
        Specification: equipment.Specification || "",
        Category: equipment.CategoryId || equipment.Category || "",
        remarks: equipment.remarks || "",
        DateAcquired: toLocalDateInput(equipment.DateAcquired),
      });
    } else {
      resetForm();
    }
  }, [equipment, isOpen, checkTokenAndFetchCategories, resetForm, setCustomError]);

  useEffect(() => {
    if (!dropdownOpen) return;
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [dropdownOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleEsc = (e) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  /* ---------------- Handlers ---------------- */

  const handleInput = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    if (feedback.type) setFeedback({ type: null, message: "" });
  };

  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return;

    if (!values.Brand?.trim() || !values.SerialNumber?.trim()) {
      setFeedback({
        type: "error",
        message: "Brand and Serial Number are required.",
      });
      return;
    }
    if (!values.Category) {
      setFeedback({ type: "error", message: "Please select a category." });
      return;
    }

    setIsLoading(true);
    setFeedback({ type: null, message: "" });

    try {
      const result = equipment
        ? await EditEquipmentData(equipment._id, values)
        : await sendaddEquipment(values);

      if (result?.success) {
        resetForm();

        // ✅ Ipakita muna ang success modal BAGO i-close ang form
        setModalStatus("success");
        setModalMessage(
          equipment
            ? "Equipment updated successfully."
            : "Equipment added successfully."
        );
        setShowModal(true);

        if (setCustomError) setCustomError(null);

        // ✅ I-delay ang pag-close ng form (hintayin mag-render ang modal)
        setTimeout(() => handleClose(), 300);

        setFeedback({
          type: "success",
          message: equipment
            ? "Equipment updated successfully."
            : "Equipment added successfully.",
        });
      } else {
        setModalStatus("failed");
        setModalMessage(result?.message || "Failed to save equipment.");
        setShowModal(true);
        setFeedback({
          type: "error",
          message: result?.message || "Failed to save equipment.",
        });
      }
    } catch (error) {
      console.error("Error submitting equipment:", error);
      setModalStatus("failed");
      setModalMessage(
        error?.response?.data?.message ||
          error.message ||
          "Unexpected error occurred."
      );
      setShowModal(true);
      setFeedback({
        type: "error",
        message:
          error?.response?.data?.message ||
          error.message ||
          "Unexpected error occurred.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // ⚠️ CRITICAL — huwag i-return null kung bukas pa ang StatusModal
  if (!isOpen && !showModal) return null;

  const selectedCategoryName =
    categories.find((c) => c._id === values.Category)?.CategoryName || "";

  /* ---------------- Render ---------------- */

  return (
    <>
      {/* ===== EQUIPMENT FORM MODAL — i-render lang kung isOpen ===== */}
      {isOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="equipment-modal-title"
            initial={{ opacity: 0, y: 50, scale: 0.95 }}
            animate={
              animateExit
                ? { opacity: 0, y: 50, scale: 0.95 }
                : { opacity: 1, y: 0, scale: 1 }
            }
            className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
          >
            {/* Header */}
            <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaTools size={70} />
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={handleClose}
                className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"
              >
                <FaTimes size={20} />
              </button>
              <div className="flex items-center gap-3">
                <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
                  <FaTools size={20} />
                </div>
                <div>
                  <h2
                    id="equipment-modal-title"
                    className="text-xl font-black uppercase tracking-tighter"
                  >
                    {equipment ? "Modify" : "Register"}{" "}
                    <span className="text-yellow-400">Equipment</span>
                  </h2>
                  <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">
                    Asset Management Terminal
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              {feedback.type === "error" && (
                <div
                  role="alert"
                  className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-md"
                >
                  {feedback.message}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Brand */}
                  <div className="space-y-1">
                    <label
                      htmlFor="Brand"
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    >
                      Manufacturer / Brand
                    </label>
                    <div className="relative group">
                      <FaTags className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                      <input
                        id="Brand"
                        type="text"
                        name="Brand"
                        value={values.Brand}
                        onChange={handleInput}
                        placeholder="e.g. Caterpillar"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Serial Number */}
                  <div className="space-y-1">
                    <label
                      htmlFor="SerialNumber"
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    >
                      Asset Serial S/N
                    </label>
                    <div className="relative group">
                      <FaBarcode className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                      <input
                        id="SerialNumber"
                        type="text"
                        name="SerialNumber"
                        value={values.SerialNumber}
                        onChange={handleInput}
                        placeholder="SN-000-000"
                        required
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Code */}
                  <div className="space-y-1">
                    <label
                      htmlFor="code"
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    >
                      Equipment Code
                    </label>
                    <div className="relative group">
                      <FaHashtag className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                      <input
                        id="code"
                        type="text"
                        name="code"
                        value={values.code}
                        onChange={handleInput}
                        placeholder="e.g. EQ-0001"
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                      />
                    </div>
                  </div>

                  {/* Date Acquired */}
                  <div className="space-y-1">
                    <label
                      htmlFor="DateAcquired"
                      className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                    >
                      Date Acquired
                    </label>
                    <div className="relative group">
                      <FaCalendarAlt className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                      <input
                        id="DateAcquired"
                        type="date"
                        name="DateAcquired"
                        value={values.DateAcquired}
                        onChange={handleInput}
                        max={new Date().toISOString().split("T")[0]}
                        className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Category Dropdown */}
                <div className="space-y-1 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    Equipment Category
                  </label>
                  <button
                    type="button"
                    aria-haspopup="listbox"
                    aria-expanded={dropdownOpen}
                    onClick={() => setDropdownOpen((o) => !o)}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
                  >
                    <span
                      className={`text-sm font-bold ${
                        values.Category ? "text-slate-700" : "text-slate-400"
                      }`}
                    >
                      {selectedCategoryName || "Select Type..."}
                    </span>
                    {dropdownOpen ? (
                      <FaChevronUp className="text-blue-600" />
                    ) : (
                      <FaChevronDown className="text-slate-300" />
                    )}
                  </button>

                  <AnimatePresence>
                    {dropdownOpen && (
                      <motion.ul
                        role="listbox"
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-48 overflow-y-auto border-t-4 border-t-yellow-400"
                      >
                        {categories.length === 0 ? (
                          <li className="px-4 py-3 text-sm font-bold text-slate-400 italic">
                            No categories available
                          </li>
                        ) : (
                          categories.map((cat) => (
                            <li
                              key={cat._id}
                              role="option"
                              aria-selected={values.Category === cat._id}
                              onClick={() => {
                                setValues((prev) => ({
                                  ...prev,
                                  Category: cat._id,
                                }));
                                setDropdownOpen(false);
                              }}
                              className={`px-4 py-3 text-sm font-bold cursor-pointer transition-colors border-b border-slate-50 last:border-0 ${
                                values.Category === cat._id
                                  ? "bg-blue-50 text-[#1e3a8a]"
                                  : "text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a]"
                              }`}
                            >
                              {cat.CategoryName}
                            </li>
                          ))
                        )}
                      </motion.ul>
                    )}
                  </AnimatePresence>
                </div>

                {/* Specification */}
                <div className="space-y-1">
                  <label
                    htmlFor="Specification"
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                  >
                    Technical Specification
                  </label>
                  <div className="relative group">
                    <FaInfoCircle className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                    <textarea
                      id="Specification"
                      name="Specification"
                      value={values.Specification}
                      onChange={handleInput}
                      placeholder="Describe technical details..."
                      rows="3"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                {/* Remarks */}
                <div className="space-y-1">
                  <label
                    htmlFor="remarks"
                    className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1"
                  >
                    Remarks
                  </label>
                  <div className="relative group">
                    <FaStickyNote className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                    <textarea
                      id="remarks"
                      name="remarks"
                      value={values.remarks}
                      onChange={handleInput}
                      placeholder="Additional notes..."
                      rows="2"
                      className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all resize-none"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3 ${
                    isLoading
                      ? "bg-slate-400 cursor-not-allowed"
                      : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"
                  }`}
                >
                  {isLoading ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <FaSave />{" "}
                      {equipment ? "Update Asset" : "Initialize Asset"}
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className="bg-yellow-400 py-2 text-center">
              <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">
                Authorized Personnel Access Only
              </p>
            </div>
          </motion.div>
        </div>
      )}

      {/* ===== STATUS MODAL — NASA LABAS ng `isOpen` guard ===== */}
      {/* Kaya hindi ito kasama sa unmount ng Equipment form */}
      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus === "success" ? "success" : "error"}
        message={modalMessage}
        showCancel={false}
        submitText="OK"
      />
    </>
  );
}

export default Equipment;