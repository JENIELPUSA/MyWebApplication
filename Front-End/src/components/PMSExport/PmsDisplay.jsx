import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, X, FileDown, ShieldCheck } from "lucide-react";
import SetupModal from "./SetupModal"; 

const PmsDisplay = ({ isOpen, onClose }) => {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLab, setSelectedLab] = useState("");

  if (!isOpen) return null;

  // Gi-update ang titles aron mas mubo/clean (Value for UI)
  const pmsForms = [
    { id: 1, title: "EQUIPMENT HISTORY", fullTitle: "EQUIPMENT/TOOL HISTORY FILE", status: "Ready", lastExport: "Oct 24, 2023" },
    { id: 2, title: "MAINTENANCE SCHEDULE", fullTitle: "GENERAL MAINTENANCE SCHEDULE", status: "Ready", lastExport: "Oct 25, 2023" },
    { id: 3, title: "MAINTENANCE RECORD", fullTitle: "EQUIPMENT MAINTENANCE RECORD", status: "Ready", lastExport: "Nov 02, 2023" },
    { id: 4, title: "TOOLS RECORD", fullTitle: "TOOLS AND MAINTENANCE RECORD", status: "Ready", lastExport: "Dec 15, 2023" },
    { id: 5, title: "SCHEDULED REPAIR", fullTitle: "MAINTENANCE PLAN/SCHEDULE (SCHEDULE REPAIR)", status: "Ready", lastExport: "Jan 05, 2024" },
    { id: 6, title: "UNSCHEDULED REPAIR", fullTitle: "MAINTENANCE PLAN/SCHEDULE (UNSCHEDULE REPAIR)", status: "Ready", lastExport: "Jan 10, 2024" },
    { id: 7, title: "CALIBRATION RECORD", fullTitle: "INSTRUMENT CALIBRATION RECORD", status: "Ready", lastExport: "Jan 12, 2024" },
  ];

  const handleExportClick = (form) => {
    setSelectedForm(form);
    setIsSelectionModalOpen(true);
  };

  // Variants
  const backdropVariants = { hidden: { opacity: 0 }, visible: { opacity: 1 } };
  const modalVariants = {
    hidden: { opacity: 0, scale: 0.9, y: 20 },
    visible: { opacity: 1, scale: 1, y: 0, transition: { type: "spring", duration: 0.5, bounce: 0.3 } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.2 } }
  };
  const itemVariants = {
    hidden: { opacity: 0, x: -10 },
    visible: (i) => ({ opacity: 1, x: 0, transition: { delay: i * 0.05 } })
  };

  return (
    <motion.div 
      initial="hidden" animate="visible" variants={backdropVariants}
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-blue-900/40 backdrop-blur-sm"
    >
      <motion.div 
        variants={modalVariants}
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col border-t-8 border-yellow-400 max-h-[85vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-blue-900">
          <div className="flex items-center gap-3">
            <motion.div initial={{ rotate: -20 }} animate={{ rotate: 0 }} className="bg-yellow-400 p-1.5 rounded-lg shadow-sm">
              <ShieldCheck className="text-blue-900" size={20} />
            </motion.div>
            <div>
              <h1 className="text-sm font-black text-white tracking-widest uppercase leading-none">Maintenance Documents</h1>
              <p className="text-[9px] text-blue-200 font-bold mt-1 uppercase">BiPSU Export Management</p>
            </div>
          </div>
          <button onClick={onClose} className="text-blue-200 hover:text-white transition-colors p-1.5 hover:bg-white/10 rounded-full">
            <X size={22} />
          </button>
        </div>

        {/* List Area */}
        <div className="overflow-y-auto flex-1 bg-slate-50/50 p-4">
          <div className="space-y-2">
            {pmsForms.map((form, i) => (
              <motion.div 
                key={form.id} custom={i} variants={itemVariants} whileHover={{ x: 5 }}
                className="flex items-center justify-between px-5 py-3 rounded-xl border border-slate-200 bg-white hover:border-blue-900 hover:shadow-md transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="text-blue-900 bg-blue-50 p-1.5 rounded-md group-hover:bg-blue-900 group-hover:text-yellow-400 transition-colors">
                    <FileText size={16} />
                  </div>
                  <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-tight leading-tight max-w-[280px]">
                    {form.title} {/* Mubo na nga title ang ipakita */}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="hidden sm:block text-right">
                    <p className="text-[8px] text-slate-400 font-bold uppercase">Exported</p>
                    <p className="text-[10px] text-blue-900 font-black">{form.lastExport}</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleExportClick(form)}
                    className="flex items-center gap-2 px-3 py-2 rounded-lg bg-yellow-400 text-blue-900 hover:bg-blue-900 hover:text-yellow-400 font-black text-[9px] uppercase transition-all shadow-sm"
                  >
                    <FileDown size={14} />
                    <span>Export</span>
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-2 bg-white border-t border-slate-100 flex justify-between items-center">
          <p className="text-[8px] font-black text-blue-900/30 uppercase tracking-[0.3em]">Biliran Province State University</p>
          <div className="flex gap-1.5">
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="w-1.5 h-1.5 rounded-full bg-blue-900"></motion.div>
            <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2, delay: 0.5 }} className="w-1.5 h-1.5 rounded-full bg-yellow-400"></motion.div>
          </div>
        </div>
      </motion.div>

      {/* SETUP MODAL: Gikuha na ang departmentData prop */}
      <SetupModal 
        isOpen={isSelectionModalOpen}
        onClose={() => setIsSelectionModalOpen(false)}
        selectedForm={selectedForm} // Ipadala ang napili nga form object
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedLab={selectedLab}
        setSelectedLab={setSelectedLab}
      />
    </motion.div>
  );
};

export default PmsDisplay;