import React, { useState } from "react";
import { 
  FaFileAlt, FaFlask, FaTools, FaChartBar, 
  FaHardHat, FaClipboardList, FaMicroscope, FaWrench,
  FaArrowLeft
} from "react-icons/fa";
import InventoryEquipmentForm from "./InventoryEquipmentForm";
import InventoryLab from "./InventoryLab";
import InventoryMaintenanceForm from "./InventoryMaintenanceForm";

function ModalReport({ isOpen, onClose }) {
  const [selectedReport, setSelectedReport] = useState(null);

  const closeAllModals = () => {
    setSelectedReport(null);
    if (onClose) onClose();
  };

  const getReportIcon = (modal) => {
    switch (modal) {
      case "inventoryequipment": return <FaClipboardList className="text-blue-600 dark:text-blue-400" size={18} />;
      case "inventorylab": return <FaMicroscope className="text-blue-600 dark:text-blue-400" size={18} />;
      case "inventorymaintenance": return <FaWrench className="text-blue-600 dark:text-blue-400" size={18} />;
      default: return <FaChartBar size={18} />;
    }
  };

  const getReportTitle = (modal) => {
    switch (modal) {
      case "inventoryequipment": return "Equipment Inventory Report";
      case "inventorylab": return "Laboratory Assets Report";
      case "inventorymaintenance": return "Maintenance History Report";
      default: return "Report";
    }
  };

  const getReportDescription = (modal) => {
    switch (modal) {
      case "inventoryequipment": return "Full asset & machinery logs management";
      case "inventorylab": return "Scientific tools & chemicals inventory";
      case "inventorymaintenance": return "Preventive & corrective maintenance logs";
      default: return "";
    }
  };

  // If a report is selected, show the report content
  if (selectedReport) {
    return (
      <div className="w-full h-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 flex flex-col">
        {/* Report Header */}
        <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 rounded-t-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg text-white">
              {getReportIcon(selectedReport)}
            </div>
            <div>
              <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300">{getReportTitle(selectedReport)}</h2>
              <p className="text-xs text-blue-600 dark:text-blue-400">{getReportDescription(selectedReport)}</p>
            </div>
          </div>
          <button
            onClick={() => setSelectedReport(null)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-blue-700 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
          >
            <FaArrowLeft size={14} />
            Back to Reports
          </button>
        </div>

        {/* Report Content - Inline, no modal with scroll */}
        <div className="p-6 flex-1 overflow-y-auto bg-white dark:bg-slate-900">
          {selectedReport === "inventoryequipment" && (
            <InventoryEquipmentForm 
              isOpen={true} 
              onClose={closeAllModals} 
              isModal={false}
            />
          )}
          {selectedReport === "inventorylab" && (
            <InventoryLab 
              isOpen={true} 
              onClose={closeAllModals}
              isModal={false}
            />
          )}
          {selectedReport === "inventorymaintenance" && (
            <InventoryMaintenanceForm 
              isOpen={true} 
              onClose={closeAllModals}
              isModal={false}
            />
          )}
        </div>
      </div>
    );
  }

  // Main Menu - Show report options
  return (
    <div className="w-full h-[600px] bg-white dark:bg-slate-900 rounded-lg shadow-sm border border-blue-200 dark:border-blue-800 flex flex-col">
      {/* HEADER */}
      <div className="px-6 py-4 border-b border-blue-200 dark:border-blue-800 flex justify-between items-center bg-blue-50 dark:bg-blue-900/30 rounded-t-lg flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600 dark:bg-blue-500 rounded-lg text-white">
            <FaHardHat size={18} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-blue-800 dark:text-blue-300">Report Terminal</h2>
            <p className="text-xs text-blue-600 dark:text-blue-400">Select category to generate report</p>
          </div>
        </div>
        <div className="text-xs text-blue-700 dark:text-blue-300 font-medium bg-yellow-300 dark:bg-yellow-500/30 px-3 py-1 rounded-full">
          EPDO Maintenance System
        </div>
      </div>

      {/* REPORT OPTIONS */}
      <div className="p-6 grid grid-cols-1 md:grid-cols-3 gap-4 flex-1 content-center bg-white dark:bg-slate-900">
        {/* Equipment Inventory */}
        <div
          onClick={() => setSelectedReport("inventoryequipment")}
          className="p-6 rounded-xl border-2 border-transparent bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-xl bg-blue-600 dark:bg-blue-500 shadow-sm group-hover:shadow-md transition-all">
              <FaClipboardList className="text-white" size={24} />
            </div>
            <h3 className="mt-4 font-bold text-blue-800 dark:text-blue-300 text-sm uppercase tracking-wide">
              Equipment Inventory
            </h3>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Full asset & machinery logs
            </p>
            <div className="mt-4 px-4 py-1.5 bg-yellow-300 dark:bg-yellow-500/30 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300 border border-yellow-400 dark:border-yellow-500/30 group-hover:bg-yellow-400 dark:group-hover:bg-yellow-500/50 group-hover:text-blue-900 dark:group-hover:text-blue-200 group-hover:border-yellow-500 dark:group-hover:border-yellow-400 transition-all">
              Generate Report →
            </div>
          </div>
        </div>

        {/* Laboratory Assets */}
        <div
          onClick={() => setSelectedReport("inventorylab")}
          className="p-6 rounded-xl border-2 border-transparent bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-xl bg-blue-600 dark:bg-blue-500 shadow-sm group-hover:shadow-md transition-all">
              <FaMicroscope className="text-white" size={24} />
            </div>
            <h3 className="mt-4 font-bold text-blue-800 dark:text-blue-300 text-sm uppercase tracking-wide">
              Laboratory Assets
            </h3>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Scientific tools & chemicals
            </p>
            <div className="mt-4 px-4 py-1.5 bg-yellow-300 dark:bg-yellow-500/30 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300 border border-yellow-400 dark:border-yellow-500/30 group-hover:bg-yellow-400 dark:group-hover:bg-yellow-500/50 group-hover:text-blue-900 dark:group-hover:text-blue-200 group-hover:border-yellow-500 dark:group-hover:border-yellow-400 transition-all">
              Generate Report →
            </div>
          </div>
        </div>

        {/* Maintenance History */}
        <div
          onClick={() => setSelectedReport("inventorymaintenance")}
          className="p-6 rounded-xl border-2 border-transparent bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 hover:border-blue-400 dark:hover:border-blue-500 cursor-pointer transition-all hover:shadow-md group"
        >
          <div className="flex flex-col items-center text-center">
            <div className="p-4 rounded-xl bg-blue-600 dark:bg-blue-500 shadow-sm group-hover:shadow-md transition-all">
              <FaWrench className="text-white" size={24} />
            </div>
            <h3 className="mt-4 font-bold text-blue-800 dark:text-blue-300 text-sm uppercase tracking-wide">
              Maintenance History
            </h3>
            <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
              Preventive & corrective logs
            </p>
            <div className="mt-4 px-4 py-1.5 bg-yellow-300 dark:bg-yellow-500/30 rounded-full text-xs font-medium text-blue-800 dark:text-blue-300 border border-yellow-400 dark:border-yellow-500/30 group-hover:bg-yellow-400 dark:group-hover:bg-yellow-500/50 group-hover:text-blue-900 dark:group-hover:text-blue-200 group-hover:border-yellow-500 dark:group-hover:border-yellow-400 transition-all">
              Generate Report →
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div className="px-6 py-3 bg-blue-50 dark:bg-blue-900/30 border-t border-blue-200 dark:border-blue-800 rounded-b-lg flex-shrink-0">
        <p className="text-[10px] font-bold text-blue-600 dark:text-blue-400 text-center uppercase tracking-[0.2em]">
          EPDO Maintenance System • Report Generation Portal
        </p>
      </div>
    </div>
  );
}

export default ModalReport;