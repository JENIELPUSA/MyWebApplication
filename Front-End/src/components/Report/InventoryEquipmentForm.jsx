import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { FaFilePdf, FaTimes, FaCalendarAlt, FaFilter, FaMicrochip, FaCaretDown } from "react-icons/fa";
=======
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

function InventoryEquipmentForm({ onClose }) {
  const [departments, setDepartments] = useState([]);
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
<<<<<<< HEAD
  const [selectedStatus, setSelectedStatus] = useState("SELECT STATUS");
=======
  const [selectedStatus, setSelectedStatus] = useState("Select Status");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const dropdownRef = useRef(null);

  const [values, setValues] = useState({
    status: "",
    from: "",
    to: "",
  });

  const clear = () => {
<<<<<<< HEAD
    setValues({ status: "", from: "", to: "" });
    setSelectedStatus("SELECT STATUS");
=======
    setValues({
      status: "",
      from: "",
      to: "",
    });
    setSelectedStatus("Select Status");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/getEquipment?from=${values.from}&to=${values.to}&status=${values.status}`,
        {
          headers: { Authorization: `Bearer ${token}` },
          responseType: "blob",
        }
      );

      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = fileURL;
<<<<<<< HEAD
      link.setAttribute("download", `Equipment_Registry_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      clear();
    } catch (error) {
      // Error handling logic remains the same...
      setCustomError("EXTRACTION ERROR: DATA RANGE INVALID OR SYSTEM BUSY.");
=======
      link.setAttribute("download", `Equipment${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("PDF successfully generated and downloaded!");
      clear();
    } catch (error) {
      if (
        error.response &&
        error.response.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setCustomError(errorData.message || "Something went wrong.");
          } catch {
            setCustomError("Unexpected error occurred.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        const fallbackMessage =
          error?.response?.data?.message || "Something went wrong.";
        setCustomError(fallbackMessage);
      }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  const handleRoleSelect = (status) => {
<<<<<<< HEAD
    setSelectedStatus(status.toUpperCase());
=======
    setSelectedStatus(status);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    setValues((prevValues) => ({ ...prevValues, status }));
    setDropdownOpen(false);
  };

<<<<<<< HEAD
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
=======
  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target)
      ) {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

<<<<<<< HEAD
  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[999] p-4 bg-slate-900/60 backdrop-blur-sm"
=======
  // Auto-clear error after 5 seconds
  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError("");
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
<<<<<<< HEAD
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative flex flex-col rounded-[2rem] bg-white w-full max-w-md shadow-2xl border-2 border-slate-800 overflow-hidden"
      >
        {/* Navy Header Accent */}
        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-[#1e3a8a] rounded-lg shadow-lg shadow-yellow-400/20">
              <FaMicrochip size={16} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200">System Export</h2>
              <p className="text-sm font-black tracking-tight">EQUIPMENT REGISTRY</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <FaTimes />
          </button>
        </div>

        <div className="p-8">
          {/* Custom Error Message */}
          <AnimatePresence>
            {customError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-6 px-4 py-3 text-[10px] font-black text-red-700 bg-red-50 border-l-4 border-red-500 uppercase tracking-widest"
              >
                {customError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
              Define telemetry parameters to generate an official maintenance record.
            </p>

            {/* Status Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Data Status Filter
              </label>
              <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-black text-xs tracking-widest hover:border-[#1e3a8a] transition-all"
                onClick={() => setDropdownOpen((prev) => !prev)}
              >
                {selectedStatus}
                <FaCaretDown className={`transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {dropdownOpen && (
                <div className="absolute left-0 right-0 mt-2 z-20 bg-white border-2 border-slate-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in duration-200">
                  {["Available", "Not Available"].map((status) => (
                    <button
                      key={status}
                      type="button"
                      className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] hover:text-white transition-colors"
                      onClick={() => handleRoleSelect(status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Range Inputs */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <FaCalendarAlt size={10} className="text-[#1e3a8a]" /> Start
                </label>
                <input
                  type="date"
                  name="from"
                  value={values.from}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-[#1e3a8a] outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-2">
                  <FaCalendarAlt size={10} className="text-[#1e3a8a]" /> End
                </label>
                <input
                  type="date"
                  name="to"
                  value={values.to}
                  onChange={handleInputChange}
                  className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-[#1e3a8a] outline-none"
                />
              </div>
            </div>

            {/* Selected Filters Summary Badge */}
            <AnimatePresence>
              {(values.status || values.from || values.to) && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <FaFilter size={10} className="text-yellow-500" />
                    <h5 className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Active Extraction Profile</h5>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {values.status && <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[8px] font-black text-[#1e3a8a] uppercase">{values.status}</span>}
                    {values.from && <span className="px-2 py-1 bg-white border border-slate-200 rounded-md text-[8px] font-black text-[#1e3a8a] uppercase">SINCE: {values.from}</span>}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-[#1e3a8a] text-white py-4 rounded-xl font-black text-xs uppercase tracking-[0.3em] shadow-lg shadow-blue-900/20 hover:bg-blue-900 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3"
            >
              <FaFilePdf size={14} className="text-yellow-400" />
              Generate Data Fragment
            </button>
          </form>
        </div>
      </motion.div>
=======
      <motion.div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Custom Error Message */}
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <p className="text-slate-500 font-light mb-6">
            Please select a status, and date if you want specific display.
          </p>

          {/* Status Dropdown */}
          <div className="relative mb-4" ref={dropdownRef}>
            <label className="text-sm text-slate-600 mb-1 block">Status</label>
            <button
              type="button"
              className="w-full p-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-700 text-left"
              onClick={() => setDropdownOpen((prev) => !prev)}
            >
              {selectedStatus}
            </button>
            {dropdownOpen && (
              <div className="absolute left-0 right-0 mt-1 z-10 bg-white border border-gray-300 rounded-md shadow-lg">
                {["Available", "Not Available"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                    onClick={() => handleRoleSelect(status)}
                  >
                    {status}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Date Range Inputs */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="sm:w-1/2">
              <label className="block mb-1 text-sm text-slate-600">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={values.from}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="sm:w-1/2">
              <label className="block mb-1 text-sm text-slate-600">
                To Date
              </label>
              <input
                type="date"
                name="to"
                value={values.to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
          >
            Generate PDF
          </button>
        </form>

        {/* Selected Filters Summary */}
        {(values.department || values.status || values.from || values.to) && (
          <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded-md shadow-sm">
            <h5 className="text-slate-700 font-semibold mb-2">
              Selected Filters
            </h5>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              {values.department && (
                <li>
                  <span className="font-medium">Department:</span>{" "}
                  {departments.find((d) => d._id === values.department)
                    ?.DepartmentName || "N/A"}
                </li>
              )}
              {values.status && (
                <li>
                  <span className="font-medium">Status:</span> {values.status}
                </li>
              )}
              {values.from && (
                <li>
                  <span className="font-medium">From:</span>{" "}
                  {new Date(values.from).toLocaleDateString()}
                </li>
              )}
              {values.to && (
                <li>
                  <span className="font-medium">To:</span>{" "}
                  {new Date(values.to).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>
        )}
      </motion.div>

      <ToastContainer />
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </motion.div>
  );
}

<<<<<<< HEAD
export default InventoryEquipmentForm;
=======
export default InventoryEquipmentForm;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
