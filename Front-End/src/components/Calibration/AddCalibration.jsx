import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { motion } from "framer-motion";
import { FaSave, FaTimes, FaCalculator } from "react-icons/fa";

const AddCalibration = ({ isOpen, onClose, onAddRequest, RequestID }) => {
  const { user } = useContext(AuthContext); 

  const [formData, setFormData] = useState({
    Request: RequestID || "", 
    Observed: "",
    Corrected: "",
    Accuracy: "100.00",
    Error: "0.00",
    CalibratedBy: user?.id || "", 
    CalibrationDate: new Date().toISOString()
  });

  useEffect(() => {
    if (RequestID) setFormData(prev => ({ ...prev, Request: RequestID }));
  }, [RequestID]);

  useEffect(() => {
    const obs = parseFloat(formData.Observed);
    const corr = parseFloat(formData.Corrected);
    if (!isNaN(obs) && !isNaN(corr) && corr !== 0) {
      const errorVal = (Math.abs(obs - corr) / corr) * 100;
      setFormData(prev => ({
        ...prev,
        Error: errorVal.toFixed(2),
        Accuracy: (100 - errorVal).toFixed(2)
      }));
    }
  }, [formData.Observed, formData.Corrected]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onAddRequest(formData); 
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} />

      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative bg-white w-full max-w-sm rounded-[1.5rem] shadow-2xl overflow-hidden border border-slate-200"
      >
        {/* Compact Header */}
        <div className="bg-[#1e3a8a] px-5 py-3 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FaCalculator className="text-yellow-400" size={14} />
            <h3 className="font-bold uppercase tracking-tight text-[11px]">New Calibration</h3>
          </div>
          <button onClick={onClose} className="text-white/30 hover:text-white transition-colors">
            <FaTimes size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {/* Two Column Input */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Observed</label>
              <input 
                type="number" step="any" name="Observed"
                value={formData.Observed} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-mono font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="text-[9px] font-black text-slate-400 uppercase ml-1 mb-1 block">Corrected</label>
              <input 
                type="number" step="any" name="Corrected"
                value={formData.Corrected} onChange={handleChange} required
                className="w-full bg-slate-50 border border-slate-200 p-2 rounded-xl text-sm font-mono font-bold focus:ring-2 ring-blue-500 outline-none transition-all"
                placeholder="0.00"
              />
            </div>
          </div>

          {/* Result Panel */}
          <div className="bg-slate-900 rounded-2xl p-3 flex justify-around">
             <div className="text-center">
                <p className="text-[8px] font-bold text-slate-500 uppercase">Error</p>
                <span className={`text-sm font-black font-mono ${parseFloat(formData.Error) > 5 ? "text-red-400" : "text-yellow-400"}`}>
                  {formData.Error}%
                </span>
             </div>
             <div className="w-[1px] bg-slate-800 my-1" />
             <div className="text-center">
                <p className="text-[8px] font-bold text-slate-500 uppercase">Accuracy</p>
                <span className="text-sm font-black font-mono text-green-400">
                  {formData.Accuracy}%
                </span>
             </div>
          </div>

          {/* Action Button */}
          <button 
            type="submit"
            className="w-full py-3 bg-[#1e3a8a] text-white rounded-xl text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-blue-800 transition-all shadow-lg active:scale-95"
          >
            <FaSave size={12} /> Save Calibration
          </button>
        </form>

        {/* Yellow Footer - Managed height */}
        <div className="bg-yellow-400 py-1.5 text-center border-t border-yellow-500">
          <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.3em]">
            Data Integrity Verified
          </p>
        </div>
      </motion.div>
    </div>
  );
};

export default AddCalibration;