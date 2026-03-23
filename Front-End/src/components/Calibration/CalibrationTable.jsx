import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "../Context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import LoadingTableSpinner from "../ReusableComponent/loadingTableSpiner";
import AddRequest from "./AddCalibration";
import {
  FaClock,
  FaCheckCircle,
  FaBalanceScale,
  FaTimes,
  FaPlus,
  FaSearchPlus,
  FaExclamationTriangle,
  FaMicrochip,
  FaLaptop,
  FaTv // Gagamitin para sa Monitor component
} from "react-icons/fa";

const CalibrationTable = ({ toLab, toEquip, onClose, isOpen }) => {
  const [animateExit, setAnimateExit] = useState(false);
  const { authToken, role } = useContext(AuthContext);
  const [calibrations, setCalibrations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isFormModalOpen, setFormModalOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      setTimeout(() => {
        const laptopHistory = [
          { 
            _id: "L1", 
            CalibrationDate: new Date().toISOString(), 
            Component: "Monitor (Color Accuracy)",
            Observed: "6400", // Kelvin (Color Temp)
            Corrected: "6500", 
            ErrorField: "1.54", 
            AccuracyField: "98.46", 
            CalibratedBy: { name: "Engr. Reyes" }, 
            Status: "Success",
            Unit: "K"
          },
          { 
            _id: "L2", 
            CalibrationDate: new Date(Date.now() - 86400000 * 5).toISOString(), 
            Component: "Battery/Power Path",
            Observed: "19.2", 
            Corrected: "19.5", 
            ErrorField: "1.53", 
            AccuracyField: "98.47", 
            CalibratedBy: { name: "Tech. Santos" }, 
            Status: "Success",
            Unit: "V"
          },
          { 
            _id: "L3", 
            CalibrationDate: new Date(Date.now() - 86400000 * 15).toISOString(), 
            Component: "Monitor (Brightness)",
            Observed: "280", 
            Corrected: "300", 
            ErrorField: "6.67", 
            AccuracyField: "93.33", 
            CalibratedBy: { name: "Engr. Reyes" }, 
            Status: "Pending",
            Unit: "nits"
          },
          { 
            _id: "L4", 
            CalibrationDate: new Date(Date.now() - 86400000 * 45).toISOString(), 
            Component: "CPU Thermal Sensor",
            Observed: "85.2", 
            Corrected: "80.0", 
            ErrorField: "6.50", 
            AccuracyField: "93.50", 
            CalibratedBy: { name: "Tech. Santos" }, 
            Status: "Success",
            Unit: "°C"
          }
        ];
        setCalibrations(laptopHistory);
        setLoading(false);
      }, 600);
    }
  }, [isOpen]);

  const formatDateTime = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const handleCloseTrigger = () => {
    setAnimateExit(true);
    setTimeout(onClose, 300);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={handleCloseTrigger}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-[2px]" 
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={animateExit ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
        className={`relative w-full max-w-4xl h-[85vh] bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-300 flex flex-col ${isFormModalOpen ? "blur-sm grayscale-[0.5]" : ""}`}
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] px-6 py-4 text-white flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-yellow-400 rounded-xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaLaptop size={20} />
            </div>
            <div>
              <h2 className="text-base font-black uppercase tracking-tight">Laptop <span className="text-yellow-400">Technical Audit</span></h2>
              <p className="text-[9px] text-blue-200 uppercase font-bold tracking-[0.2em]">Display & Hardware Verification</p>
            </div>
          </div>
          <button onClick={handleCloseTrigger} className="bg-white/10 hover:bg-red-500 w-10 h-10 rounded-full flex items-center justify-center transition-all">
            <FaTimes size={14}/>
          </button>
        </div>

        {/* Device Snapshot Bar */}
        <div className="bg-slate-50 border-b border-slate-200 px-8 py-3 flex justify-between items-center text-[11px] flex-shrink-0">
          <div className="flex gap-8">
            <p><span className="text-slate-400 font-bold uppercase tracking-widest">Serial:</span> <span className="text-blue-600 font-mono font-bold tracking-widest">{toEquip?.SerialNumber || "LP-9920-X"}</span></p>
            <p><span className="text-slate-400 font-bold uppercase tracking-widest">Display Type:</span> <span className="text-slate-700 font-black">OLED 144Hz</span></p>
          </div>
          <div className="flex items-center gap-2 text-slate-500 font-bold uppercase">
            <FaTv className="text-yellow-500"/> 
            <span>{toLab?.departmentName || "Multimedia Lab"}</span>
          </div>
        </div>

        {/* History Table */}
        <div className="p-6 flex-grow overflow-hidden flex flex-col">
          <div className="flex-grow overflow-y-auto rounded-2xl border border-slate-200 shadow-inner bg-white custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10">
                <tr className="bg-slate-800 text-white text-[10px] uppercase tracking-widest">
                  <th className="p-4 pl-6 border-r border-slate-700">Audit Date</th>
                  <th className="p-4">Component Tested</th>
                  <th className="p-4 text-center">Observed</th>
                  <th className="p-4 text-center">Reference</th>
                  <th className="p-4 text-center bg-red-900/30">Error %</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">
                    {role === "User" && (
                      <button onClick={() => setFormModalOpen(true)} className="bg-yellow-400 text-blue-900 p-2 rounded-lg hover:scale-110 shadow-sm">
                        <FaPlus size={12} />
                      </button>
                    )}
                  </th>
                </tr>
              </thead>
              <tbody className="text-[12px] font-bold text-slate-600">
                {loading ? (
                  <tr><td colSpan={7} className="p-24 text-center"><LoadingTableSpinner /></td></tr>
                ) : (
                  calibrations.map((data) => (
                    <tr key={data._id} className="border-b border-slate-100 hover:bg-blue-50/40 transition-colors group">
                      <td className="p-4 pl-6 font-normal text-slate-400 italic">{formatDateTime(data.CalibrationDate)}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          {data.Component.includes("Monitor") ? <FaTv className="text-blue-400" /> : <FaMicrochip className="text-slate-400" />}
                          <span className="text-slate-700">{data.Component}</span>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-blue-600">{data.Observed} {data.Unit}</td>
                      <td className="p-4 text-center font-mono text-slate-500">{data.Corrected} {data.Unit}</td>
                      <td className="p-4 text-center">
                        <span className={`font-mono inline-flex items-center gap-1 ${parseFloat(data.ErrorField) > 5 ? "text-red-500" : "text-slate-500"}`}>
                          {parseFloat(data.ErrorField) > 5 && <FaExclamationTriangle size={10} className="animate-pulse"/>}
                          {data.ErrorField}%
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black border ${
                          data.Status === 'Success' ? 'bg-green-100/50 text-green-700 border-green-200' : 'bg-orange-100/50 text-orange-700 border-orange-200'
                        }`}>
                          {data.Status === 'Success' ? <FaCheckCircle size={10}/> : <FaClock size={10}/>}
                          {data.Status}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <button className="text-slate-300 hover:text-blue-600 transition-all transform group-hover:scale-125">
                          <FaSearchPlus size={16}/>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-yellow-400 py-2 text-center border-t border-yellow-500 flex-shrink-0">
          <p className="text-[8px] font-black text-blue-900 uppercase tracking-[0.5em]">Device Integrity Protocol • Lab Verified Log</p>
        </div>
      </motion.div>

      <AnimatePresence>
        {isFormModalOpen && (
          <AddRequest
            isOpen={isFormModalOpen}
            onClose={() => setFormModalOpen(false)}
            onAddRequest={(newData) => setCalibrations(prev => [newData, ...prev])}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalibrationTable;