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
    onClose();
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
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
