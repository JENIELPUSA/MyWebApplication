import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { FaTimes, FaFlask, FaBuilding, FaUserTie, FaSave, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import { motion, AnimatePresence } from "framer-motion";

function LaboratoryForm({ onClose, laboratory, onAddLaboratory, OnEditLaboratory }) {
  const [animateExit, setAnimateExit] = useState(false);
  const { UpdateLaboratory, AddedLaboratory, customError } = useContext(LaboratoryDisplayContext);
  const navigate = useNavigate();
  
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [encharges, setEncharges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  const [values, setValues] = useState({
    department: "",
    Encharge: "",
    LaboratoryName: "",
  });

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`, setDepartments);
    fetchData(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`, setEncharges);
    
    if (laboratory) {
      setValues({
        department: laboratory.DepartmentId || "",
        Encharge: laboratory.EnchargeId || "",
        LaboratoryName: laboratory.LaboratoryName || "",
      });
    }
  }, [laboratory]);

  const fetchData = async (url, setState) => {
    if (!token) return navigate("/");
    try {
      const response = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response?.data.status === "success") setState(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
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
    setIsLoading(true);
    try {
      const result = laboratory 
        ? await UpdateLaboratory(laboratory._id, values)
        : await AddedLaboratory(values);

      if (result?.success) {
        laboratory ? OnEditLaboratory(result.data) : onAddLaboratory(result.data[0]);
        handleClose();
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors">
            <FaTimes size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaFlask size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {laboratory ? "Update" : "New"} <span className="text-yellow-400">Facility</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Laboratory Registry Terminal</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-black rounded-r-md uppercase">
              {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Lab Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Designation</label>
              <div className="relative group">
                <FaFlask className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                <input
                  type="text"
                  name="LaboratoryName"
                  value={values.LaboratoryName}
                  onChange={(e) => setValues({...values, LaboratoryName: e.target.value})}
                  placeholder="e.g. Computer Lab 101"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Scope</label>
              <div 
                onClick={() => {setDepartmentDropdownOpen(!departmentDropdownOpen); setEnchargeDropdownOpen(false);}}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-slate-300" />
                  <span className={`text-sm font-bold ${values.department ? "text-slate-700" : "text-slate-400"}`}>
                    {values.department ? departments.find(d => d._id === values.department)?.DepartmentName : "Select Department"}
                  </span>
                </div>
                {departmentDropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
              </div>
              <AnimatePresence>
                {departmentDropdownOpen && (
                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto border-t-4 border-t-yellow-400">
                    {departments.map((dept) => (
                      <li key={dept._id} onClick={() => { setValues({...values, department: dept._id}); setDepartmentDropdownOpen(false); }}
                        className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                        {dept.DepartmentName}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Encharge Dropdown */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Personnel (Encharge)</label>
              <div 
                onClick={() => {setEnchargeDropdownOpen(!enchargeDropdownOpen); setDepartmentDropdownOpen(false);}}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FaUserTie className="text-slate-300" />
                  <span className={`text-sm font-bold ${values.Encharge ? "text-slate-700" : "text-slate-400"}`}>
                    {values.Encharge ? 
                      (() => {
                        const user = encharges.find(e => e._id === values.Encharge);
                        return user ? `${user.FirstName} ${user.LastName}` : "Select Encharge";
                      })() : "Select Encharge"}
                  </span>
                </div>
                {enchargeDropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
              </div>
              <AnimatePresence>
                {enchargeDropdownOpen && (
                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto border-t-4 border-t-yellow-400">
                    {encharges.map((user) => (
                      <li key={user._id} onClick={() => { setValues({...values, Encharge: user._id}); setEnchargeDropdownOpen(false); }}
                        className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                        {user.FirstName} {user.LastName}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3 mt-4
                ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"}`}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><FaSave /> {laboratory ? "Commit Changes" : "Initialize Facility"}</>
              )}
            </button>
          </form>
        </div>

        {/* Technical Footer */}
        <div className="bg-yellow-400 py-2 text-center">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.3em]">System Asset Registry</p>
        </div>
      </motion.div>
    </div>
  );
}

export default LaboratoryForm;
