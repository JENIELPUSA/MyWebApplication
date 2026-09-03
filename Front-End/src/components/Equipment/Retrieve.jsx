import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { CheckCircle, AlertCircle, X } from "lucide-react";
import { AssignContext } from "../../contexts/AssignLabContext/AssignLabContext";
import { DeleteAssignContext } from "../../contexts/CountContext/CountContext";
import { motion } from "framer-motion";

const Retrieve = ({ isOpen, onClose, equipment, onEditStatus }) => {
  const { deleteAssignment } = useContext(DeleteAssignContext);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const token = localStorage.getItem("token");
  const { fetchAssignData } = useContext(AssignContext);
  const [animateExit, setAnimateExit] = useState(false);

  // Reset states when the modal is reopened
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsLoading(false);
      setError(null);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleRetriveSync = async (equipment) => {
    await axios.delete(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/Releted/${equipment}`,
      {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      }
    );
  };

  const handleRetrieve = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment?equipmentId=${equipment}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item) => {
          deleteAssignment(item.assignLabId);
          fetchAssignData();
        });

        // Update equipment status on the server
        const AssignStatusUpdate = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipment}`,
          { status: "Available" },
          {
            withCredentials: true,
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // Call onEditStatus to update the parent component
        onEditStatus(AssignStatusUpdate.data.data);

        // Show success message
        setIsSuccess(true);

        handleRetriveSync(equipment);

        // Reset states after showing success feedback
        setTimeout(() => {
          setIsSuccess(false);
          setIsLoading(false);
          onClose();
        }, 2000);
      } else {
        setError("Unexpected data format from the API.");
      }
    } catch (error) {
      console.error("Error retrieving equipment:", error);
      setError(error.response?.data?.message || "Failed to retrieve equipment");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 xs:p-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative text-center"
        initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Button */}
        <button
          onClick={() => {
            setAnimateExit(true);
            setTimeout(onClose, 500);
          }}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>

        {/* Header Section */}
        <div className="text-center">
          {isSuccess ? (
            <CheckCircle
              size={48}
              className="mx-auto mb-4 text-green-500"
              strokeWidth={1.5}
            />
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <AlertCircle size={24} className="text-red-500" strokeWidth={1.5} />
            </div>
          )}
          <h2 className="xs:text-lg sm:text-xl lg:text-xl font-bold text-gray-800">
            {isSuccess ? "Success!" : "Retrieve Equipment"}
          </h2>
          {!isSuccess && (
            <p className="xs:text-sm sm:text-xl lg:text-xl text-gray-600 mt-2">
              Are you sure you want to retrieve this equipment? This action
              cannot be undone.
            </p>
          )}
          {error && !isSuccess && (
            <p className="text-sm text-red-500 mt-2">{error}</p>
          )}
        </div>

        {/* Footer Section */}
        <div className="mt-6 flex justify-between">
          {!isSuccess && (
            <motion.button
              aria-label="Close"
              whileTap={{ scale: 0.8 }}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={() => {
                setAnimateExit(true);
                setTimeout(onClose, 500);
              }}
              className="xs:text-sm sm:text-lg lg:text-lg xs:px-4 sm:px-5 sm:py-2 xs:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </motion.button>
          )}
          {!isSuccess && (
            <motion.button
              whileTap={{ scale: 0.95 }}
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              onClick={handleRetrieve}
              className={`xs:text-sm sm:text-lg lg:text-lg xs:px-4 sm:px-5 sm:py-2 xs:py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition ${isLoading ? "opacity-70 cursor-not-allowed" : ""
                }`}
              disabled={isLoading}
            >
              {isLoading ? "Retrieving..." : "Retrieve"}
            </motion.button>
          )}
        </div>

        {/* Success State */}
        {isSuccess && (
          <p className="text-center text-green-600 font-medium mt-4">
            Equipment has been successfully retrieved.
          </p>
        )}
      </motion.div>
    </motion.div>
  );
};

export default Retrieve;