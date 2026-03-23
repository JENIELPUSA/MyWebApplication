import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaFlask, FaTimes, FaChevronDown, FaFilePdf, FaExclamationTriangle } from "react-icons/fa";

function InventoryLab({ onClose }) {
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [values, setValues] = useState({ department: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");

  const fetchData = async (url, setState, errorMessage) => {
    if (!token) {
      navigate("/login");
      return;
    }
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data?.status === "success") {
        setState(response.data.data);
      } 
    } catch (error) {
    }
  };

  useEffect(() => {
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
      setDepartments,
      "Failed to fetch departments"
    );
  }, []);

  const handleCategoryChange = (deptId) => {
    setValues({ department: deptId });
    setDepartmentDropdownOpen(false);
  };

  const handleSubmitte = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const selectedDepartment = values.department;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/getSpecificDepartments?department=${selectedDepartment}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Lab_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose(); // Close modal after success
    } catch (error) {
      setCustomError("SYSTEM ERROR: UNABLE TO GENERATE LABORATORY TELEMETRY.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => setCustomError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

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
        {/* Header Section */}
        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-[#1e3a8a] rounded-lg shadow-lg">
              <FaFlask size={18} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 leading-none mb-1">Laboratory Module</h2>
              <p className="text-sm font-black tracking-tight">SPECIFIC DEPT. REGISTRY</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
            <FaTimes size={18} className="text-blue-200 hover:text-white" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {customError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3"
              >
                <FaExclamationTriangle className="text-red-500" size={14} />
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{customError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmitte} className="space-y-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
              Select a target department to extract laboratory equipment logs and asset distribution.
            </p>

            {/* Department Selector */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Target Department
              </label>
              <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-black text-xs tracking-widest hover:border-[#1e3a8a] transition-all"
                onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
              >
                <span>
                  {values.department
                    ? departments.find((cat) => cat._id === values.department)?.DepartmentName.toUpperCase()
                    : "SELECT DEPARTMENT"}
                </span>
                <FaChevronDown className={`text-[#1e3a8a] transition-transform ${departmentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {departmentDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 mt-2 bg-white border-2 border-slate-100 rounded-xl w-full max-h-48 overflow-y-auto shadow-xl"
                >
                  <li
                    className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                    onClick={() => handleCategoryChange("")}
                  >
                    -- RESET SELECTION --
                  </li>
                  {departments.map((dept) => (
                    <li
                      key={dept._id}
                      className="px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] hover:text-white transition-colors cursor-pointer"
                      onClick={() => handleCategoryChange(dept._id)}
                    >
                      {dept.DepartmentName}
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg
                ${isLoading 
                  ? "bg-slate-400 cursor-wait" 
                  : "bg-[#1e3a8a] hover:bg-blue-900 text-white shadow-blue-900/20 active:scale-95"}`}
            >
              {isLoading ? (
                "SYNCING DATA..."
              ) : (
                <>
                  <FaFilePdf className="text-yellow-400" />
                  Generate Lab Report
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
               System Node: BIPSU-LAB-EXTRACTOR-V1
             </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

export default InventoryLab;