import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaToolbox, FaTimes, FaChevronDown, FaFilePdf, FaCalendarAlt, FaLayerGroup, FaHistory } from "react-icons/fa";

function InventoryMaintenanceForm({ onClose }) {
  const [departments, setDepartments] = useState([]);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState("SELECT LOG STATUS");
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  const [values, setValues] = useState({
    department: "",
    status: "",
    from: "",
    to: "",
  });

  const clear = () => {
    setValues({ department: "", status: "", from: "", to: "" });
    setSelectedStatus("SELECT LOG STATUS");
  };

  const handleRoleSelect = (status) => {
    setSelectedStatus(status.toUpperCase());
    setValues((prevValues) => ({ ...prevValues, status }));
    setDropdownOpen(false);
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) {
        navigate("/login");
        return;
      }
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data?.status === "success") {
          setDepartments(response.data.data);
        }
      } catch (error) {
      }
    };
    fetchDepartments();
  }, [token, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/getSpecificMaintenances?Department=${values.department}&from=${values.from}&to=${values.to}&Status=${values.status}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = fileURL;
      link.setAttribute("download", `MAINTENANCE_LOG_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      clear();
      onClose();
    } catch (error) {
      setCustomError("EXTRACTION FAILED: LOGS NOT FOUND IN SELECTED RANGE.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[999] p-4 bg-slate-900/60 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div 
        initial={{ scale: 0.95, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative flex flex-col rounded-[2.5rem] bg-white w-full max-w-lg shadow-[0_20px_60px_rgba(0,0,0,0.3)] border-2 border-slate-800 overflow-hidden"
      >
        {/* Technical Header */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white flex justify-between items-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaHistory size={80} />
          </div>
          <div className="flex items-center gap-4 relative z-10">
            <div className="p-3 bg-yellow-400 text-[#1e3a8a] rounded-2xl shadow-lg">
              <FaToolbox size={20} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-200">Archive Retrieval</h2>
              <p className="text-lg font-black tracking-tight">MAINTENANCE LOGS</p>
            </div>
          </div>
          <button onClick={onClose} className="bg-white/10 hover:bg-white/20 p-2 rounded-full transition-all relative z-10">
            <FaTimes size={18} />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {customError && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 text-[10px] font-black text-red-700 uppercase tracking-widest"
              >
                {customError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Department Selection */}
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1 flex items-center gap-2">
                <FaLayerGroup className="text-[#1e3a8a]" /> Target Department
              </label>
              <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-black text-[11px] tracking-widest hover:border-[#1e3a8a] transition-all"
                onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
              >
                {values.department 
                  ? departments.find(d => d._id === values.department)?.DepartmentName.toUpperCase() 
                  : "ALL DEPARTMENTS"}
                <FaChevronDown className={`transition-transform ${departmentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {departmentDropdownOpen && (
                <ul className="absolute z-30 mt-2 bg-white border-2 border-slate-100 rounded-xl w-full max-h-40 overflow-y-auto shadow-2xl">
                   <li className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50 cursor-pointer" onClick={() => { setValues(p => ({...p, department: ""})); setDepartmentDropdownOpen(false); }}>All Departments</li>
                   {departments.map(d => (
                     <li key={d._id} className="px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] hover:text-white cursor-pointer" onClick={() => { setValues(p => ({...p, department: d._id})); setDepartmentDropdownOpen(false); }}>{d.DepartmentName}</li>
                   ))}
                </ul>
              )}
            </div>

            {/* Status Selection */}
            <div className="relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">Process Status</label>
              <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-black text-[11px] tracking-widest hover:border-[#1e3a8a] transition-all"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                {selectedStatus}
                <FaChevronDown className={`transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              {dropdownOpen && (
                <div className="absolute z-30 mt-2 bg-white border-2 border-slate-100 rounded-xl w-full shadow-2xl">
                  {["Pending", "Under Maintenance", "Success"].map(s => (
                    <button key={s} type="button" className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] hover:text-white transition-colors" onClick={() => handleRoleSelect(s)}>{s}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Date Configuration */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <FaCalendarAlt size={10} className="text-[#1e3a8a]" /> Date From
                </label>
                <input type="date" name="from" value={values.from} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-[#1e3a8a] outline-none" />
              </div>
              <div className="space-y-1">
                <label className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 flex items-center gap-1">
                  <FaCalendarAlt size={10} className="text-[#1e3a8a]" /> Date To
                </label>
                <input type="date" name="to" value={values.to} onChange={handleInputChange} className="w-full p-3 bg-slate-50 border-2 border-slate-100 rounded-xl text-xs font-bold text-slate-700 focus:border-[#1e3a8a] outline-none" />
              </div>
            </div>

            {/* Extraction Summary */}
            {(values.department || values.status || values.from) && (
              <div className="p-4 bg-blue-50/50 border-2 border-dashed border-blue-100 rounded-2xl flex flex-wrap gap-2">
                 <span className="text-[8px] font-black text-blue-400 uppercase w-full mb-1">Queue Filters Ready:</span>
                 {values.status && <span className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#1e3a8a] shadow-sm border border-blue-100">{values.status.toUpperCase()}</span>}
                 {values.from && <span className="bg-white px-2 py-1 rounded text-[8px] font-black text-[#1e3a8a] shadow-sm border border-blue-100">DATES DEFINED</span>}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-2 rounded-xl font-black text-[11px] uppercase tracking-[0.4em] transition-all flex items-center justify-center gap-3 shadow-xl
                ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-blue-900/20 active:scale-95"}`}
            >
              <FaFilePdf size={14} className="text-yellow-400" />
              {isLoading ? "SYNCING RECORDS..." : "EXTRACT AUDIT PDF"}
            </button>
          </form>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default InventoryMaintenanceForm;