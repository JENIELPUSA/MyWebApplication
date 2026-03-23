import React, { useState } from "react";
<<<<<<< HEAD
import { motion, AnimatePresence } from "framer-motion";
import { 
  FaTimes, FaChevronRight, FaFileAlt, 
  FaFlask, FaTools, FaChartBar, FaHardHat 
} from "react-icons/fa";
=======
import { motion } from "framer-motion";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import InventoryEquipmentForm from "./InventoryEquipmentForm";
import InventoryLab from "./InventoryLab";
import InventoryMaintenanceForm from "./InventoryMaintenanceForm";

function ModalReport({ isOpen, onClose }) {
  const [modals, setModals] = useState({
    inventorymaintenance: false,
    inventorylab: false,
<<<<<<< HEAD
    inventoryequipment: false,
  });

  // Check kung may nakabukas na kahit anong sub-form
  const isSubModalOpen = Object.values(modals).some((status) => status === true);

=======
    inventoryequipment: false, // ✅ fixed typo
  });

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
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
<<<<<<< HEAD
  };

  const getIcon = (modal) => {
    switch (modal) {
      case "inventoryequipment": return <FaFileAlt className="text-blue-600" />;
      case "inventorylab": return <FaFlask className="text-blue-600" />;
      case "inventorymaintenance": return <FaTools className="text-blue-600" />;
      default: return <FaChartBar />;
    }
=======
    onClose();
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  if (!isOpen) return null;

  return (
<<<<<<< HEAD
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
=======
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm p-4">
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="relative w-full max-w-md rounded-2xl bg-white/80 backdrop-blur-xl shadow-xl px-6 py-8 space-y-5 border border-gray-300"
      >
        <h2 className="text-xl font-bold text-gray-800 text-center mb-2">
          Generate Report
        </h2>

        {[
          { label: "Inventory Equipment Report", modal: "inventoryequipment" },
          { label: "Inventory Laboratory Report", modal: "inventorylab" },
          { label: "Maintenance History Report", modal: "inventorymaintenance" },
        ].map((item, index) => (
          <motion.div
            key={index}
            whileHover={{
              scale: 1.03,
              boxShadow: "0 4px 20px rgba(99,102,241,0.3)",
              transition: { duration: 0.3 },
            }}
            onClick={() => toggleModal(item.modal)}
            className="flex justify-between items-center p-4 bg-white border border-indigo-200 rounded-xl cursor-pointer hover:bg-indigo-50 transition-all"
          >
            <div className="text-gray-800 font-medium">{item.label}</div>
            <motion.div
              whileHover={{ rotate: 15, scale: 1.2 }}
              className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center shadow-inner"
            >
              <i className="fas fa-chevron-right" />
            </motion.div>
          </motion.div>
        ))}

        <button
          onClick={closeAllModals}
          className="absolute top-3 right-4 text-gray-500 hover:text-red-500 transition-all"
        >
          <i className="fas fa-times text-lg" />
        </button>
      </motion.div>

      {/* Sub-Modals */}
      {modals.inventorymaintenance && (
        <InventoryMaintenanceForm isOpen onClose={closeAllModals} />
      )}
      {modals.inventorylab && (
        <InventoryLab isOpen onClose={closeAllModals} />
      )}
      {modals.inventoryequipment && (
        <InventoryEquipmentForm isOpen onClose={closeAllModals} />
      )}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </div>
  );
}

<<<<<<< HEAD
export default ModalReport;
=======
export default ModalReport;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
