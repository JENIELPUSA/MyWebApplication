<<<<<<< HEAD
import React, { useState, useEffect, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaBuilding, FaSave, FaPlusCircle, FaEdit } from "react-icons/fa";
import { DepartmentDisplayContext } from "../Context/Department/Display";

function DepartmentForm({ onClose, isOpen, department, onAddDepartment, onUpdate }) {
  const [animateExit, setAnimateExit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
=======
import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { DepartmentDisplayContext } from "../Context/Department/Display";

function DepartmentForm({ onClose,isOpen, department, onAddDepartment, onUpdate }) {
  if (!isOpen) return null;
  const token = localStorage.getItem("token");
const [animateExit, setAnimateExit] = useState(false);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [values, setValues] = useState({
    DepartmentName: "",
  });

<<<<<<< HEAD
  const { AddAcceptDepartment, UpdateDepartment, customError } = useContext(DepartmentDisplayContext);

  useEffect(() => {
    if (department) {
      setValues({ DepartmentName: department.DepartmentName || "" });
    } else {
      setValues({ DepartmentName: "" });
    }
  }, [department, isOpen]);
=======
  const {AddAcceptDepartment,UpdateDepartment,customError}=useContext(DepartmentDisplayContext)

  const resetForm = () => {
    setValues({
      DepartmentName: "",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValues({
      DepartmentName: department?.DepartmentName || "",
    });
  }, [department]);

  const addDepartment = async () => {
    const result=await AddAcceptDepartment(values)
    if(result?.success===true){
      onAddDepartment(result.data);
      setValues({ DepartmentName: "" });
    }
  };

  const editDepartment = async () => {
    const result=await UpdateDepartment(department._id,values)
    if(result?.success===true){
      onUpdate(result.data); // Pass updated user data to the parent
      resetForm();
    }
    

  };
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

<<<<<<< HEAD
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
=======
  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setIsLoading(true);
      if (department) {
        await editDepartment();
      } else {
        await addDepartment();
        onClose()
      } 
  };

  return (
    <motion.div
          className="fixed inset-0 flex items-center justify-center z-50 px-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
            initial={{ opacity: 0, y: -50 }}
            animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Close Icon */}
            <motion.button
              className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
              aria-label="Close"
              whileTap={{ scale: 0.8 }} // Shrinks on click
              whileHover={{ scale: 1.1 }} // Enlarges on hover
              transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
              onClick={() => {
                setAnimateExit(true); // Set the animation state to trigger upward motion
                setTimeout(onClose, 500); // Close after 500ms to match the animation duration
              }}
            >
              <i className="fas fa-times"></i>
            </motion.button>
  
        <h4 className="xs:text-lg sm:text-lg lg:text-lg block text-2xl font-medium text-slate-800 mb-2">
          {department ? "Edit Department" : "Add Department"}
        </h4>
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {department
            ? "Update the department details"
            : "Enter department details to register."}
        </p>
  
        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Department Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Department Name"
                autoComplete="off"
                name="DepartmentName"
                onChange={handleInput}
                value={values.DepartmentName || ""}
              />
            </div>
          </div>
  
          <button
            className={`mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {department ? "Edit Department" : "Add Department"}
          </button>
  
          <ToastContainer
           
          />
        </form>
      </motion.div>
    </motion.div>
  );
  
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
}

export default DepartmentForm;