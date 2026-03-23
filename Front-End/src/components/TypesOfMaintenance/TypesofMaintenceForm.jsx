<<<<<<< HEAD
import React, { useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AddTypeMaintenance } from "../Context/TypesofMainten/addmaintenance";
import { FaTimes, FaCalendarAlt, FaChevronDown, FaChevronUp, FaSave } from "react-icons/fa";

function TypesofMaintenceForm({ isOpen, onClose, toLab, toEquip }) {
  const { Types } = useContext(AddTypeMaintenance);
  const scheduleTypes = ['weekly', 'monthly', 'semi-annually', 'annually'];

  const [values, setValues] = useState({ scheduleType: '' });
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);

  if (!isOpen) return null;

  const handleCategoryChange = (val) => {
    setValues({ scheduleType: val });
    setScheduleDropdownOpen(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!values.scheduleType) return;
    
    Types(toEquip, values.scheduleType, toLab, toLab.departmentId);
    handleClose();
  };

  const handleClose = () => {
    setValues({ scheduleType: '' });
=======
import React, { useState, useEffect, useContext } from "react";
import { motion } from "framer-motion";
import { toast,ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import {AddTypeMaintenance} from "../Context/TypesofMainten/addmaintenance"

function TypesofMaintenceForm({ isOpen, onClose,toLab,toEquip }) {
  if (!isOpen) return null;
  const {Types}=useContext(AddTypeMaintenance)

  const scheduleTypes = ['weekly', 'monthly', 'semi-annually', 'annually'];

  // Initialize state for form values
  const [values, setValues] = useState({
    scheduleType: '', // This will store the selected schedule type
  });

  // Manage dropdown state
  const [scheduleDropdownOpen, setScheduleDropdownOpen] = useState(false);

  // Handle schedule type selection
  const handleCategoryChange = (e) => {
    const { name, value } = e.target;
    setValues((prevValues) => ({
      ...prevValues,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const vals=values.scheduleType;
    Types(toEquip,vals,toLab,toLab.departmentId)
    handleClose();
 
  };

  const handleClose = () => {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    onClose();
  };

  return (
<<<<<<< HEAD
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[2000] p-4 bg-slate-900/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative flex flex-col bg-white w-full max-w-md border-4 border-[#1e3a8a] shadow-[0_20px_50px_rgba(0,0,0,0.3)] overflow-hidden"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
        >
          {/* Industrial Header Bar */}
          <div className="bg-[#1e3a8a] p-4 flex justify-between items-center border-b-4 border-yellow-400">
            <div className="flex items-center gap-2 text-white">
              <FaCalendarAlt className="text-yellow-400" />
              <span className="font-black text-xs uppercase tracking-[0.2em]">Maintenance_Scheduler</span>
            </div>
            <button 
              onClick={handleClose}
              className="text-white/70 hover:text-yellow-400 transition-colors"
            >
              <FaTimes size={20} />
            </button>
          </div>

          <div className="p-8">
            <h4 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-1">
              Set Interval
            </h4>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-8">
              Configure periodic service parameters for the equipment.
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="relative">
                <label className="block mb-2 text-[10px] font-black text-[#1e3a8a] uppercase tracking-widest">
                  Service Cycle Type
                </label>
                
                {/* Custom Industrial Dropdown */}
                <div
                  className={`w-full bg-slate-50 border-2 transition-all px-4 py-3 cursor-pointer flex justify-between items-center ${
                    scheduleDropdownOpen ? "border-yellow-500 bg-white" : "border-slate-300"
                  }`}
                  onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
                >
                  <span className={`text-sm font-bold uppercase ${values.scheduleType ? "text-slate-900" : "text-slate-400"}`}>
                    {values.scheduleType || "Select_Protocol"}
                  </span>
                  {scheduleDropdownOpen ? <FaChevronUp className="text-yellow-600" /> : <FaChevronDown className="text-[#1e3a8a]" />}
                </div>

                {/* Dropdown Menu */}
                <AnimatePresence>
                  {scheduleDropdownOpen && (
                    <motion.ul
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute z-20 mt-1 bg-white border-2 border-slate-900 w-full shadow-xl"
                    >
                      {scheduleTypes.map((type) => (
                        <li
                          key={type}
                          className="px-4 py-3 hover:bg-yellow-400 hover:text-[#1e3a8a] cursor-pointer text-xs font-black uppercase tracking-widest transition-colors border-b border-slate-100 last:border-0"
                          onClick={() => handleCategoryChange(type)}
                        >
                          {type.replace('-', '_')}
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </div>

              {/* Action Button */}
              <button
                className="w-full group relative bg-[#1e3a8a] hover:bg-blue-900 text-white font-black text-xs uppercase tracking-[0.3em] py-4 transition-all overflow-hidden flex items-center justify-center gap-2"
                type="submit"
                disabled={!values.scheduleType}
              >
                <div className="absolute inset-y-0 left-0 w-1 bg-yellow-400 transition-all group-hover:w-full opacity-10" />
                <FaSave className="text-yellow-400" />
                Register Schedule
              </button>
            </form>
          </div>

          {/* System ID Footer Decor */}
          <div className="bg-slate-100 px-8 py-2 border-t border-slate-200">
             <p className="text-[8px] font-bold text-slate-400 uppercase tracking-[0.4em]">
               Module: MAINT-TYPE-REG-SYS-01
             </p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export default TypesofMaintenceForm;
=======
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 2xs:p-4 xs:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          whileTap={{ scale: 0.8 }}
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          onClick={handleClose}
        >
          <i className="fas fa-times"></i>
        </motion.button>

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          Schedule Types
        </h4>
        <p className="text-slate-500 font-light mb-6">
          Select the details to register a maintenance type.
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            {/* Custom Maintenance Schedule Type Dropdown */}
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Maintenance Schedule
              </label>
              <div
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                onClick={() => setScheduleDropdownOpen(!scheduleDropdownOpen)}
              >
                <span>
                  {values.scheduleType
                    ? scheduleTypes.find((type) => type === values.scheduleType)
                    : "Select Schedule Type"}
                </span>
                <i
                  className={`fas ${
                    scheduleDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                  } text-gray-500`}
                />
              </div>

              {scheduleDropdownOpen && (
                <ul
                  className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                >
                  <li
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      handleCategoryChange({
                        target: { name: "scheduleType", value: "" },
                      });
                      setScheduleDropdownOpen(false);
                    }}
                  >
                    Select Schedule Type
                  </li>
                  {scheduleTypes.map((type) => (
                    <li
                      key={type}
                      className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        handleCategoryChange({
                          target: { name: "scheduleType", value: type },
                        });
                        setScheduleDropdownOpen(false);
                      }}
                    >
                      {type}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <button
            className="mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            type="submit"
          >
            Add Type
          </button>

         
        </form>
        
      </motion.div>
      <ToastContainer/>
    </motion.div>
  );
}

export default TypesofMaintenceForm;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
