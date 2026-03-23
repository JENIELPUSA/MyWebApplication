<<<<<<< HEAD
import React, { useState, useContext } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTools, FaSave, FaClipboardList, FaExclamationTriangle, FaWrench } from "react-icons/fa";
import socket from "../../socket";

=======
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { motion } from "framer-motion";
import socket from "../../socket";

// Gawa ka ng new instance ng socket client
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
function AddRequest({
  DepartmentID,
  EquipmentID,
  LaboratoryID,
  description,
  onClose,
  isOpen,
  onAddRequest,
}) {
<<<<<<< HEAD
  const { addDescription, customError } = useContext(RequestDisplayContext);
  const [animateExit, setAnimateExit] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [values, setValues] = useState({
    Description: description || "",
  });

  if (!isOpen) return null;

  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
=======
  const { addDescription,customError} = useContext(
    RequestDisplayContext
  );
  if (!isOpen) return null;
  const [animateExit, setAnimateExit] = useState(false);
  const [values, setValues] = useState({
    Description: "",
  });

  const resetForm = () => {
    setValues({
      Description: "",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  const addDepartment = async () => {
    setIsLoading(true); // Disable the button
    // Ensure addDescription is called and awaited first
    const result=await addDescription(
      values.Description,
      EquipmentID,
      LaboratoryID,
      DepartmentID
    );
    if(result?.success===true){
      onAddRequest(result.data)
      socket.emit("RequestMaintenance",result.data )  
      socket.emit("newRequest",{
        message:"New Request Added",
        data:result.data
      })
      resetForm();
      onClose();
       
    }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
<<<<<<< HEAD
    setIsLoading(true);

    try {
      const result = await addDescription(
        values.Description,
        EquipmentID,
        LaboratoryID,
        DepartmentID
      );

      if (result?.success === true) {
        onAddRequest(result.data);
        socket.emit("RequestMaintenance", result.data);
        socket.emit("newRequest", {
          message: "New Request Added",
          data: result.data,
        });
        handleClose();
      }
    } catch (error) {
      console.error("Error:", error);
=======
    toast.dismiss();
    setIsLoading(true);

    try {
      await addDepartment();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Operation failed. Please try again.");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    } finally {
      setIsLoading(false);
    }
  };

  return (
<<<<<<< HEAD
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop with Blur */}
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
        className="relative w-full max-w-lg bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
      >
        {/* Header - Industrial Blue */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <FaWrench size={70} />
          </div>
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"
          >
            <FaTimes size={20} />
          </button>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaTools size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {description ? "Modify" : "New"} <span className="text-yellow-400">Request</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-[0.2em]">
                Maintenance Operations Log
              </p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10px] font-black uppercase rounded-r-md">
              <FaExclamationTriangle className="inline mr-2" /> {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                Issue Description
              </label>
              <div className="relative group">
                <FaClipboardList className="absolute left-4 top-4 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                <textarea
                  name="Description"
                  value={values.Description}
                  onChange={handleInput}
                  rows="4"
                  placeholder="Clearly describe the equipment issue or required service..."
                  className="w-full pl-11 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all resize-none shadow-inner"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3
                ${
                  isLoading
                    ? "bg-slate-400 cursor-not-allowed"
                    : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"
                }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <FaSave /> {description ? "Update Request" : "Submit Request"}
                </>
              )}
            </button>
          </form>
        </div>

        {/* Footer Accent */}
        <div className="bg-yellow-400 py-2 text-center">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-widest">
            System Maintenance Protocol Alpha
          </p>
        </div>
      </motion.div>
    </div>
=======
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
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

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {description ? "Edit Description" : "Input Description"}
        </h4>

        <p className="text-slate-500 font-light mb-6">
          {description
            ? "Update the description details"
            : "Enter description details to send request."}
        </p>
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Description
              </label>
              <textarea
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Description"
                autoComplete="off"
                name="Description"
                onChange={handleInput}
                value={values.Description || ""}
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
            {description ? "Edit Description" : "Add Description"}
          </button>

          <ToastContainer />
        </form>
      </motion.div>
    </motion.div>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  );
}

export default AddRequest;