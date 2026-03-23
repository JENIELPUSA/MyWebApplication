import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaChevronRight, FaFileAlt, 
  FaFlask, FaTools, FaChartBar, FaHardHat 
} from "react-icons/fa";
import InventoryEquipmentForm from "./InventoryEquipmentForm";
import InventoryLab from "./InventoryLab";
import InventoryMaintenanceForm from "./InventoryMaintenanceForm";

function ModalReport({ isOpen, onClose }) {
  const [modals, setModals] = useState({
    inventorymaintenance: false,
    inventorylab: false,
    inventoryequipment: false,
  });

  // Check kung may nakabukas na kahit anong sub-form
  const isSubModalOpen = Object.values(modals).some((status) => status === true);

  const toggleModal = (modalName) => {
    setModals({
      inventorymaintenance: false,
      inventorylab: false,
      inventoryequipment: false,
      [modalName]: true,
    });
  };

  const closeAllModals = () => {
    setModals({
      inventorymaintenance: false,
      inventorylab: false,
      inventoryequipment: false,
    });
  };

  const getIcon = (modal) => {
    switch (modal) {
      case "inventoryequipment": return <FaFileAlt className="text-blue-600" />;
      case "inventorylab": return <FaFlask className="text-blue-600" />;
      case "inventorymaintenance": return <FaTools className="text-blue-600" />;
      default: return <FaChartBar />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Backdrop Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      {/* --- MAIN SELECTION MENU --- */}
      <AnimatePresence mode="wait">
        {!isSubModalOpen && (
          <motion.div
            key="main-menu"
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -20, opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="relative z-10 w-full max-w-md rounded-[2rem] bg-white shadow-2xl overflow-hidden border-2 border-blue-900"
          >
            {/* Industrial Header */}
            <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
              <div className="absolute top-0 right-0 p-4 opacity-10">
                <FaHardHat size={80} />
              </div>
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors"
              >
                <FaTimes size={20} />
              </button>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                Report <span className="text-yellow-400">Terminal</span>
              </h2>
              <p className="text-xs text-blue-200 font-medium uppercase tracking-widest mt-1">
                Select category to generate
              </p>
            </div>

            <div className="p-6 space-y-3 bg-slate-50">
              {[
                { 
                    label: "Equipment Inventory", 
                    modal: "inventoryequipment", 
                    desc: "Full asset & machinery logs" 
                },
                { 
                    label: "Laboratory Assets", 
                    modal: "inventorylab", 
                    desc: "Scientific tools & chemicals" 
                },
                { 
                    label: "Maintenance History", 
                    modal: "inventorymaintenance", 
                    desc: "Preventive & corrective logs" 
                },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  whileHover={{ x: 8 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => toggleModal(item.modal)}
                  className="group flex items-center gap-4 p-4 bg-white border border-slate-200 hover:border-blue-400 rounded-2xl cursor-pointer transition-all shadow-sm hover:shadow-md"
                >
                  <div className="p-3 rounded-xl bg-blue-50 group-hover:bg-yellow-400 transition-colors shadow-inner">
                    {getIcon(item.modal)}
                  </div>

                  <div className="flex-1">
                    <div className="text-[14px] font-black text-slate-800 uppercase tracking-tight group-hover:text-blue-700 transition-colors">
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                      {item.desc}
                    </div>
                  </div>

                  <FaChevronRight size={12} className="text-slate-300 group-hover:text-blue-600" />
                </motion.div>
              ))}
            </div>

            <div className="bg-yellow-400 py-2 px-6">
                <p className="text-[9px] font-black text-blue-900 text-center uppercase tracking-[0.2em]">
                   EPDO Maintenance System
                </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- SUB-MODAL FORMS --- */}
      {/* Nilagyan ng sariling AnimatePresence ang bawat isa 
          para sigurado ang exit/entry animation nila.
      */}
      <AnimatePresence>
        {modals.inventorymaintenance && (
          <div className="z-[110] relative">
            <InventoryMaintenanceForm isOpen={true} onClose={closeAllModals} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modals.inventorylab && (
          <div className="z-[110] relative">
            <InventoryLab isOpen={true} onClose={closeAllModals} />
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {modals.inventoryequipment && (
          <div className="z-[110] relative">
            <InventoryEquipmentForm isOpen={true} onClose={closeAllModals} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default ModalReport;
