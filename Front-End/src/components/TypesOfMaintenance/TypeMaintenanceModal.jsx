import React, { useState, useContext, useCallback } from "react";
import axios from "axios";
import { AuthContext } from "../Context/AuthContext";
import socket from "../../socket";
import { motion, AnimatePresence } from "framer-motion";
import { MessagePOSTcontext } from "../Context/MessageContext/POSTmessage";
import {
  FaTimes,
  FaSpinner,
  FaCheckSquare,
  FaSquare,
  FaFileAlt,
} from "react-icons/fa";

function TypeMaintenanceModal({
  isOpen,
  onClose,
  equipmentId,
}) {
  const { setSendPost } = useContext(MessagePOSTcontext);
  const { authToken } = useContext(AuthContext);

  const [isLoading, setIsLoading] = useState(false);

  const [values, setValues] = useState({
    Remarks: "", // Ibinalik ang state para sa Textbox
    RoutineInspectionCleaning: false,
    Lubrication: false,
    Overhauling: false,
    MinorAdjustment: false,
    ReplaceWornOutParts: false,
    Repair: false,
    GeneralRecondition: false,
    RepairPart: "",
    FrequencyCode: "D",
    AdjustmentSetting: "",
    ManHoursUsed: 8,
    CounterMeasures: "",
    ImprovementInRepairProcedure: "",
    SparePartsMaterialsUsed: "",
    RepairDate: new Date().toISOString().split("T")[0],
  });

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      const ID = equipmentId;

      if (!ID) {
        console.error("Missing ID: Cannot submit without Equipment ID");
        return;
      }

      setIsLoading(true);

      try {
        const payload = {
          equipmentId: equipmentId,
          AnalysisOfTrouble: values.Remarks, // Isinama sa payload mula sa state
          RoutineInspectionCleaning: values.RoutineInspectionCleaning,
          Lubrication: values.Lubrication,
          Overhauling: values.Overhauling,
          MinorAdjustment: values.MinorAdjustment,
          ReplaceWornOutParts: values.ReplaceWornOutParts,
          Repair: values.Repair,
          GeneralRecondition: values.GeneralRecondition,
          RepairPart: values.RepairPart,
          FrequencyCode: values.FrequencyCode,
          AdjustmentSetting: values.AdjustmentSetting,
          ManHoursUsed: Number(values.ManHoursUsed),
          CounterMeasures: values.CounterMeasures,
          ImprovementInRepairProcedure: values.ImprovementInRepairProcedure,
          SparePartsMaterialsUsed: values.SparePartsMaterialsUsed.split(",")
            .map((s) => s.trim())
            .filter((s) => s !== ""),
          RepairDate: values.RepairDate,
        };

        const response = await axios.post(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest/Pmscreate`,
          payload,
          { headers: { Authorization: `Bearer ${authToken}` } }
        );

        if (response.data?.status === "success") {
          socket.emit("RequestMaintenance", response.data.data);
          
          setSendPost({
            ...response.data,
            message: "BIPSU Maintenance Report Submitted.",
            Status: "Accepted",
          });

          setTimeout(onClose, 800);
        }
      } catch (error) {
        console.error("Submission Error:", error);
      } finally {
        setIsLoading(false);
      }
    },
    [authToken, values, onClose, setSendPost, equipmentId]
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 flex items-center justify-center z-[1000] p-2 bg-blue-950/30 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative flex flex-col rounded-xl bg-white w-full max-w-lg shadow-2xl border-t-4 border-[#1e3a8a] overflow-hidden max-h-[92vh]"
        >
          {/* Header */}
          <div className="bg-[#1e3a8a] px-5 py-3 flex justify-between items-center text-white shrink-0">
            <div className="flex items-center gap-3">
              <FaFileAlt className="text-yellow-400" size={18} />
              <div>
                <h4 className="text-sm font-bold uppercase tracking-tight leading-none">
                  Maintenance Log Report
                </h4>
                <p className="text-[9px] font-medium text-yellow-400 uppercase mt-0.5">
                  BIPSU MIS-Support
                </p>
              </div>
            </div>
            <button onClick={onClose} className="hover:text-red-300 transition-colors">
              <FaTimes size={18} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto flex-1 custom-scrollbar">
            <div className="space-y-4">
              
              {/* REMARKS SECTION - Ito ang binalik nating textbox */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-[#1e3a8a] uppercase flex items-center gap-1.5">
                  <span className="w-1 h-3 bg-yellow-400 rounded-full"></span> Findings & Remarks
                </label>
                <textarea
                  className="bipsu-input min-h-[70px] py-2"
                  placeholder="Enter technical details..."
                  value={values.Remarks}
                  onChange={(e) => setValues({ ...values, Remarks: e.target.value })}
                  required
                />
              </div>

              {/* ACTIVITIES CHECKLIST */}
              <div>
                <label className="text-[10px] font-bold text-[#1e3a8a] uppercase block mb-2 tracking-tight">
                  Activities Performed
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: "RoutineInspectionCleaning", label: "Cleaning" },
                    { id: "Lubrication", label: "Lubrication" },
                    { id: "Overhauling", label: "Overhauling" },
                    { id: "MinorAdjustment", label: "Adjustment" },
                    { id: "ReplaceWornOutParts", label: "Parts Replace" },
                    { id: "Repair", label: "Repair" },
                  ].map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setValues((prev) => ({ ...prev, [item.id]: !prev[item.id] }))}
                      className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition-all ${
                        values[item.id] ? "border-[#1e3a8a] bg-blue-50 text-[#1e3a8a]" : "border-slate-100 text-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      {values[item.id] ? <FaCheckSquare className="text-yellow-500" size={12} /> : <FaSquare className="opacity-10" size={12} />}
                      <span className="text-[9px] font-bold uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* LOG DATA GRID */}
              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Countermeasures</label>
                  <input
                    className="bipsu-input py-1.5 text-xs"
                    value={values.CounterMeasures}
                    onChange={(e) => setValues({ ...values, CounterMeasures: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Adjustment/Setting</label>
                  <input
                    className="bipsu-input py-1.5 text-xs"
                    value={values.AdjustmentSetting}
                    onChange={(e) => setValues({ ...values, AdjustmentSetting: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Man-Hours</label>
                  <input
                    type="number"
                    className="bipsu-input py-1.5 text-xs"
                    value={values.ManHoursUsed}
                    onChange={(e) => setValues({ ...values, ManHoursUsed: e.target.value })}
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Repair Date</label>
                  <input
                    type="date"
                    className="bipsu-input py-1.5 text-xs"
                    value={values.RepairDate}
                    onChange={(e) => setValues({ ...values, RepairDate: e.target.value })}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[9px] font-bold text-slate-500 uppercase tracking-tighter">Spare Parts Used</label>
                <input
                  className="bipsu-input py-2 text-xs"
                  placeholder="HDD, RAM, etc."
                  value={values.SparePartsMaterialsUsed}
                  onChange={(e) => setValues({ ...values, SparePartsMaterialsUsed: e.target.value })}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`mt-6 w-full py-3 rounded-lg text-[11px] font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                isLoading ? "bg-slate-200 text-slate-400" : "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-md active:scale-95"
              }`}
            >
              {isLoading ? <FaSpinner className="animate-spin" /> : "Submit Final Report"}
            </button>
          </form>

          <div className="h-1.5 w-full bg-[#facc15] shrink-0"></div>
        </motion.div>
      </div>

      <style>{`
        .bipsu-input {
          width: 100%;
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          padding-left: 0.75rem;
          padding-right: 0.75rem;
          font-size: 0.813rem;
          outline: none;
          transition: 0.2s;
        }
        .bipsu-input:focus { border-color: #1e3a8a; }
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
      `}</style>
    </AnimatePresence>
  );
}

export default TypeMaintenanceModal;