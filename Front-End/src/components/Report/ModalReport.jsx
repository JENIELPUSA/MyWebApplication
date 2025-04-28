import React, { useState } from "react";
import { motion } from "framer-motion";
import InventoryEquipmentForm from "./InventoryEquipmentForm";
import InventoryLab from "./InventoryLab";
import InventoryMaintenanceForm from "./InventoryMaintenanceForm";

function ModalReport({ isOpen, onClose }) {
  const [modals, setModals] = useState({
    inventorymaintenance: false,
    inventorylab: false,
    inventoryequipmet: false,
  });

  const toggleModal = (modalName) => {
    setModals((prev) => {
      // Close all modals first, then open the selected one
      const newModals = {
        inventorymaintenance: false,
        inventorylab: false,
        inventoryequipmet: false,
      };
      newModals[modalName] = true;
      return newModals;
    });
  };

  const closeAllModals = () => {
    setModals({
      inventorymaintenance: false,
      inventorylab: false,
      inventoryequipmet: false,
    });
    onClose(); // Close the modal when all modals are closed
  };

  return (
    <div className="border-2 border-indigo-400 fixed inset-0 flex items-center justify-center z-50 p-4">
      <div className="border-2 border-indigo-400 relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg gap-2">
        {/* Inventory Equipment Report Section */}
        <div className="transition duration-300 ease-in-out border-2 border-indigo-400 font-poppins text-center p-3 flex flex-row gap-2 items-center">
          <div className="flex-grow">Inventory Equipment Report</div>
          <div className="w-10 h-10 border-2 border-blue-500 rounded-full flex justify-center items-center">
            <motion.i
              onClick={() => toggleModal("inventoryequipmet")}
              className="fa fa-arrow-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{
                scale: 1.2,
                rotate: 15,
                transition: { duration: 0.3 },
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Inventory Laboratory Report Section */}
        <div className="transition duration-300 ease-in-out border-2 border-indigo-400 font-poppins text-center p-3 flex flex-row gap-2 items-center">
          <div className="flex-grow">Inventory Laboratory Report</div>
          <div className="w-10 h-10 border-2 border-blue-500 rounded-full flex justify-center items-center">
            <motion.i
              onClick={() => toggleModal("inventorylab")}
              className="fa fa-arrow-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{
                scale: 1.2,
                rotate: 15,
                transition: { duration: 0.3 },
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>

        {/* Maintenance History Report Section */}
        <div className="transition duration-300 ease-in-out border-2 border-indigo-400 font-poppins text-center p-3 flex flex-row gap-2 items-center">
          <div className="flex-grow">Maintenance History Report</div>
          <div className="w-10 h-10 border-2 border-blue-500 rounded-full flex justify-center items-center">
            <motion.i
              onClick={() => toggleModal("inventorymaintenance")}
              className="fa fa-arrow-right"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{
                scale: 1.2,
                rotate: 15,
                transition: { duration: 0.3 },
              }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      </div>

      {/* Modal Components */}
      {modals.inventorymaintenance && (
        <InventoryMaintenanceForm
          isOpen={modals.inventorymaintenance}
          onClose={closeAllModals}
        />
      )}

      {modals.inventorylab && (
        <InventoryLab
          isOpen={modals.inventorylab}
          onClose={closeAllModals}
        />
      )}

      {modals.inventoryequipmet && (
        <InventoryEquipmentForm
          isOpen={modals.inventoryequipmet}
          onClose={closeAllModals}
        />
      )}
    </div>
  );
}

export default ModalReport;
