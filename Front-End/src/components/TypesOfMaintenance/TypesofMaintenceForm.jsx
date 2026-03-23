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
    onClose();
  };

  return (
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