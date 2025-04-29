import React, { useState } from "react";
import { motion } from "framer-motion";
import InventoryEquipmentForm from "./InventoryEquipmentForm";
import InventoryLab from "./InventoryLab";
import InventoryMaintenanceForm from "./InventoryMaintenanceForm";

function ModalReport({ isOpen, onClose }) {
  const [modals, setModals] = useState({
    inventorymaintenance: false,
    inventorylab: false,
    inventoryequipment: false, // ✅ fixed typo
  });

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
    onClose();
  };

  if (!isOpen) return null;

  return (
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
    </div>
  );
}

export default ModalReport;
