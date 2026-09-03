import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaFilePdf, FaTimes, FaCalendarAlt, FaFilter, FaMicrochip, FaCaretDown } from "react-icons/fa";

function InventoryEquipmentForm({ onClose }) {
  const [departments, setDepartments] = useState([]);
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("SELECT STATUS");
  const dropdownRef = useRef(null);

  const [values, setValues] = useState({
    status: "",
    from: "",
    to: "",
  });

  const clear = () => {
    setValues({ status: "", from: "", to: "" });
    setSelectedStatus("SELECT STATUS");
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
      link.setAttribute("download", `Equipment_Registry_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      clear();
    } catch (error) {
      // Error handling logic remains the same...
      setCustomError("EXTRACTION ERROR: DATA RANGE INVALID OR SYSTEM BUSY.");
    }
  };

  const handleRoleSelect = (status) => {
    setSelectedStatus(status.toUpperCase());
    setValues((prevValues) => ({ ...prevValues, status }));
    setDropdownOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[999] p-4 bg-slate-900/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
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
    </motion.div>
  );
}

export default InventoryEquipmentForm;
