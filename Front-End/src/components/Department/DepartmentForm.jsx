import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBuilding, FaSave, FaPlusCircle, FaEdit } from "react-icons/fa";
import { DepartmentDisplayContext } from "../Context/Department/Display";

function DepartmentForm({ onClose, isOpen, department, onAddDepartment, onUpdate }) {
  const [animateExit, setAnimateExit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    DepartmentName: "",
  });

  const { AddAcceptDepartment, UpdateDepartment, customError } = useContext(DepartmentDisplayContext);

  useEffect(() => {
    if (department) {
      setValues({ DepartmentName: department.DepartmentName || "" });
    } else {
      setValues({ DepartmentName: "" });
    }
  }, [department, isOpen]);

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleCloseModal = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!values.DepartmentName.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      if (department) {
        // EDIT MODE
        const result = await UpdateDepartment(department._id, values);
        if (result?.success) {
          onUpdate(result.data);
          handleCloseModal();
        }
      } else {
        // ADD MODE
        const result = await AddAcceptDepartment(values);
        if (result?.success) {
          onAddDepartment(result.data);
          handleCloseModal();
        }
      }
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseModal}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      <motion.div
        className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
      >
        {/* Decorative Top Bar */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaBuilding size={60} />
          </div>
          <button
            onClick={handleCloseModal}
            className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"
          >
            <FaTimes size={20} />
          </button>
          
          <div className="flex items-center gap-3">
             <div className="p-2 bg-yellow-400 rounded-lg text-[#1e3a8a]">
                {department ? <FaEdit size={18} /> : <FaPlusCircle size={18} />}
             </div>
             <div>
                <h2 className="text-xl font-black uppercase tracking-tighter">
                  {department ? "Update" : "Register"} <span className="text-yellow-400">Unit</span>
                </h2>
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">
                  Department Management System
                </p>
             </div>
          </div>
        </div>

        <div className="p-8">
          {/* Custom Error Alert */}
          <AnimatePresence>
            {customError && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-6 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold rounded-r-md"
              >
                {customError}
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Department Name
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a] transition-colors">
                  <FaBuilding size={18} />
                </div>
                <input
                  type="text"
                  name="DepartmentName"
                  required
                  placeholder="e.g. Engineering Department"
                  autoComplete="off"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-[#1e3a8a] transition-all font-bold text-slate-700"
                  value={values.DepartmentName}
                  onChange={handleInput}
                />
              </div>
              <p className="text-[10px] text-slate-400 ml-1">
                Please ensure the name is unique and correctly spelled.
              </p>
            </div>

            <div className="pt-4 flex flex-col gap-3">
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest text-xs transition-all shadow-lg flex items-center justify-center gap-2
                  ${isLoading 
                    ? "bg-slate-400 cursor-not-allowed" 
                    : "bg-[#1e3a8a] hover:bg-[#112d7a] hover:shadow-blue-900/20 active:scale-95"}`}
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <FaSave />
                    {department ? "Save Changes" : "Confirm Registration"}
                  </>
                )}
              </button>
              
              <button
                type="button"
                onClick={handleCloseModal}
                className="w-full py-4 rounded-2xl font-black text-slate-400 uppercase tracking-widest text-xs hover:bg-slate-50 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>

        {/* Footer Info */}
        <div className="bg-yellow-400 py-2 px-6">
            <p className="text-[9px] font-black text-blue-900 text-center uppercase tracking-[0.2em]">
               Official Maintenance Station Entry
            </p>
        </div>
      </motion.div>
    </div>
  );
}

export default DepartmentForm;