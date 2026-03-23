import React, { useState, useContext } from "react";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaTools, FaSave, FaClipboardList, FaExclamationTriangle, FaWrench } from "react-icons/fa";
import socket from "../../socket";

function AddRequest({
  DepartmentID,
  EquipmentID,
  LaboratoryID,
  description,
  onClose,
  isOpen,
  onAddRequest,
}) {
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
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
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
    } finally {
      setIsLoading(false);
    }
  };

  return (
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
  );
}

export default AddRequest;