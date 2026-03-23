import React, { useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Loader2 } from "lucide-react";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import { DepartmentDisplayContext } from "../Context/Department/Display";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";
import { AddAssignContext } from "../Context/AssignContext/AddAssignContext";

const SetupModal = ({
  isOpen,
  onClose,
  selectedForm,
  selectedDept,
  setSelectedDept,
  selectedLab,
  setSelectedLab,
}) => {
  const { downloadPMSEquipmentHistory } = useContext(AddAssignContext);
  const { department } = useContext(DepartmentDisplayContext);
  const {
    isLabDropdown,
    fetchLaboratoryDropdown,
    loading: labLoading,
  } = useContext(LaboratoryDisplayContext);

  const { downloadPMSreport, loading: downloadLoading } = useContext(
    RequestDisplayContext,
  );

  const handleGenerate = async () => {
    if (!selectedLab) return alert("Palihug pagpili og Laboratory");

    const labId = selectedLab;
    const title = selectedForm?.title;

    try {
      if (title == "EQUIPMENT HISTORY") {
        await downloadPMSEquipmentHistory(labId);
      } else {
        // 1. Sugdan ang download (mag-true ang downloadLoading)
        await downloadPMSreport(labId, title);
      }

      // 2. Human sa malampuson nga download, i-close ang modal
      onClose();
    } catch (error) {
      console.error("Error generating report:", error);
      // Dili nato i-close ang modal kung naay error para makit-an sa user
    }
  };

  const labData = Array.isArray(isLabDropdown) ? isLabDropdown : [];
  const filteredLaboratories = labData;

  // Kinatibuk-ang loading state para sa button
  const isProcessing = labLoading || downloadLoading;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-blue-950/70 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="bg-white w-full max-w-[320px] rounded-2xl shadow-2xl overflow-hidden border-t-8 border-blue-900"
          >
            {/* Header */}
            <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
              <span className="text-[10px] font-black text-blue-900 uppercase tracking-widest">
                Setup Details
              </span>
              <button
                onClick={onClose}
                disabled={isProcessing} // Disable close button while downloading
                className="hover:rotate-90 transition-transform p-1 disabled:opacity-30"
              >
                <X size={18} className="text-slate-400" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="text-center pb-3">
                <p className="text-[10px] font-black text-blue-900 leading-tight uppercase">
                  {selectedForm?.title || "Generate Form"}
                </p>
              </div>

              <div className="space-y-3">
                {/* Department Select */}
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-slate-400 uppercase">
                    Department
                  </label>
                  <select
                    disabled={isProcessing}
                    onChange={(e) => {
                      const deptId = e.target.value;
                      setSelectedDept(deptId);
                      setSelectedLab("");
                      if (deptId) fetchLaboratoryDropdown(deptId);
                    }}
                    value={selectedDept}
                    className="w-full text-[11px] p-2.5 border border-slate-200 rounded-lg font-bold text-blue-900 outline-none focus:border-yellow-400 cursor-pointer disabled:bg-slate-50"
                  >
                    <option value="">-- SELECT --</option>
                    {department?.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.DepartmentName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Laboratory Select */}
                <div
                  className={`relative space-y-1 ${!selectedDept || isProcessing ? "opacity-30 pointer-events-none" : "opacity-100"}`}
                >
                  <label className="text-[9px] font-black text-slate-400 uppercase flex justify-between">
                    <span>Laboratory</span>
                    {labLoading && (
                      <span className="text-blue-600 animate-pulse lowercase italic">
                        fetching...
                      </span>
                    )}
                  </label>

                  <div className="relative">
                    <select
                      disabled={isProcessing || !selectedDept}
                      onChange={(e) => setSelectedLab(e.target.value)}
                      value={selectedLab}
                      className="w-full text-[11px] p-2.5 border border-slate-200 rounded-lg font-bold text-blue-900 outline-none focus:border-yellow-400 cursor-pointer"
                    >
                      <option value="">
                        {labLoading ? "Loading..." : "-- SELECT --"}
                      </option>
                      {!labLoading &&
                        filteredLaboratories.map((lab) => (
                          <option key={lab._id} value={lab._id}>
                            {lab.LaboratoryName || lab.labName}
                          </option>
                        ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Submit Button with Loading Spinner */}
              <motion.button
                whileHover={selectedLab && !isProcessing ? { scale: 1.02 } : {}}
                whileTap={selectedLab && !isProcessing ? { scale: 0.98 } : {}}
                disabled={!selectedLab || isProcessing}
                className="w-full py-3 bg-blue-900 text-yellow-400 rounded-xl text-[10px] font-black uppercase shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
                onClick={handleGenerate}
              >
                {downloadLoading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Downloading PDF...
                  </>
                ) : (
                  "Generate Report"
                )}
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default SetupModal;
