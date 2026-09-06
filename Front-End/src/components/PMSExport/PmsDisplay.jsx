import React, { useState } from "react";
import { motion } from "framer-motion";
import { FileText, FileDown, ShieldCheck, Printer, Calendar, Clock, CheckCircle, Download } from "lucide-react";
import SetupModal from "./SetupModal"; 

const PmsDisplay = () => {
  const [isSelectionModalOpen, setIsSelectionModalOpen] = useState(false);
  const [selectedForm, setSelectedForm] = useState(null);
  const [selectedDept, setSelectedDept] = useState("");
  const [selectedLab, setSelectedLab] = useState("");

  const pmsForms = [
    { id: 1, title: "EQUIPMENT HISTORY", fullTitle: "EQUIPMENT/TOOL HISTORY FILE", status: "Ready", lastExport: "Oct 24, 2023", icon: "📋" },
    { id: 2, title: "MAINTENANCE SCHEDULE", fullTitle: "GENERAL MAINTENANCE SCHEDULE", status: "Ready", lastExport: "Oct 25, 2023", icon: "📅" },
    { id: 3, title: "MAINTENANCE RECORD", fullTitle: "EQUIPMENT MAINTENANCE RECORD", status: "Ready", lastExport: "Nov 02, 2023", icon: "🔧" },
    { id: 4, title: "TOOLS RECORD", fullTitle: "TOOLS AND MAINTENANCE RECORD", status: "Ready", lastExport: "Dec 15, 2023", icon: "🛠️" },
    { id: 5, title: "SCHEDULED REPAIR", fullTitle: "MAINTENANCE PLAN/SCHEDULE (SCHEDULE REPAIR)", status: "Ready", lastExport: "Jan 05, 2024", icon: "📊" },
    { id: 6, title: "UNSCHEDULED REPAIR", fullTitle: "MAINTENANCE PLAN/SCHEDULE (UNSCHEDULE REPAIR)", status: "Ready", lastExport: "Jan 10, 2024", icon: "⚡" },
    { id: 7, title: "CALIBRATION RECORD", fullTitle: "INSTRUMENT CALIBRATION RECORD", status: "Ready", lastExport: "Jan 12, 2024", icon: "🎯" },
  ];

  const handleExportClick = (form) => {
    setSelectedForm(form);
    setIsSelectionModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsSelectionModalOpen(false);
  };


  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: (i) => ({ opacity: 1, y: 0, transition: { delay: i * 0.03 } })
  };

  return (
    <div className="w-full bg-gradient-to-br from-slate-50 to-white rounded-2xl shadow-xl overflow-hidden border border-blue-100">
      {/* Header - BIPSU Theme */}
      <div className="relative px-6 py-5 bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-400 rounded-full blur-2xl translate-y-1/3 -translate-x-1/4" />
        </div>
        
        <div className="relative flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="bg-yellow-400 p-2.5 rounded-xl shadow-lg shadow-yellow-400/30">
              <ShieldCheck className="text-blue-900" size={24} />
            </div>
            <div>
              <h1 className="text-base font-black text-white tracking-widest uppercase leading-tight">
                Maintenance Documents
              </h1>
              <div className="flex items-center gap-2 mt-0.5">
                <p className="text-[10px] text-blue-200 font-bold uppercase tracking-wider">
                  BiPSU Export Management
                </p>
                <span className="w-1.5 h-1.5 rounded-full bg-yellow-400" />
                <p className="text-[10px] text-yellow-300 font-bold uppercase tracking-wider">
                  v2.0
                </p>
              </div>
            </div>
          </div>
          
          {/* Status Badge */}
          <div className="hidden md:flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
              <span className="text-[9px] text-white font-bold uppercase tracking-widest">System Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-3 gap-0 border-b border-slate-100 bg-slate-50/80">
        <div className="px-4 py-3 text-center border-r border-slate-100">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Total Documents</p>
          <p className="text-sm font-black text-blue-900">{pmsForms.length}</p>
        </div>
        <div className="px-4 py-3 text-center border-r border-slate-100">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Available</p>
          <p className="text-sm font-black text-green-600">{pmsForms.filter(f => f.status === "Ready").length}</p>
        </div>
        <div className="px-4 py-3 text-center">
          <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">Last Update</p>
          <p className="text-[9px] font-black text-blue-900">Jan 12, 2024</p>
        </div>
      </div>

      {/* List Area */}
      <div className="p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
            Available Documents
          </h2>
          <span className="text-[8px] text-slate-400 font-bold bg-slate-100 px-2 py-0.5 rounded-full">
            {pmsForms.length} items
          </span>
        </div>
        
        <div className="space-y-2">
          {pmsForms.map((form, i) => (
            <motion.div 
              key={form.id} 
              custom={i} 
              variants={itemVariants} 
              initial="hidden"
              animate="visible"
              whileHover={{ scale: 1.01, x: 3 }}
              className="group flex items-center justify-between px-4 py-3 rounded-xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg transition-all duration-200"
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex-shrink-0 text-2xl">
                  {form.icon}
                </div>
                <div className="min-w-0">
                  <h3 className="text-[10px] font-black text-blue-900 uppercase tracking-tight leading-tight truncate">
                    {form.title}
                  </h3>
                  <p className="text-[7px] text-slate-400 font-bold uppercase tracking-wider truncate">
                    {form.fullTitle}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-shrink-0">
                <div className="hidden md:flex items-center gap-2 text-right">
                  <div className="flex items-center gap-1">
                    <Clock className="text-slate-300" size={10} />
                    <p className="text-[8px] text-slate-400 font-bold">{form.lastExport}</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-1">
                  <span className="hidden sm:inline-block text-[7px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full border border-green-100">
                    {form.status}
                  </span>
                </div>

                <motion.button
                  whileTap={{ scale: 0.9 }}
                  whileHover={{ scale: 1.05 }}
                  onClick={() => handleExportClick(form)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-yellow-400 to-yellow-500 text-blue-900 hover:from-blue-900 hover:to-blue-800 hover:text-yellow-400 font-black text-[8px] uppercase transition-all shadow-sm hover:shadow-md border border-yellow-300 hover:border-blue-700"
                >
                  <Download size={12} />
                  <span>Export</span>
                </motion.button>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-2.5 bg-gradient-to-r from-blue-900 to-blue-800 flex justify-between items-center">
        <p className="text-[7px] font-black text-blue-300/60 uppercase tracking-[0.3em]">
          Biliran Province State University
        </p>
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse delay-150" />
            <div className="w-1.5 h-1.5 rounded-full bg-blue-300 animate-pulse delay-300" />
          </div>
          <span className="text-[7px] text-blue-300/40 font-bold uppercase tracking-widest">
            PMS v2.0
          </span>
        </div>
      </div>

      {/* SETUP MODAL */}
      <SetupModal 
        isOpen={isSelectionModalOpen}
        onClose={handleCloseModal}
        selectedForm={selectedForm}
        selectedDept={selectedDept}
        setSelectedDept={setSelectedDept}
        selectedLab={selectedLab}
        setSelectedLab={setSelectedLab}
      />
    </div>
  );
};

export default PmsDisplay;