import React, { useState, useContext, useEffect } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";
import { DeleteAssignContext } from "../CountContext";
import { motion } from "framer-motion";

const Retrieve = ({ isOpen, onClose, equipment, onEditStatus }) => {
  const { deleteAssignment } = useContext(DeleteAssignContext);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");
  const { fetchAssignData } = useContext(AssignContext);
   const [animateExit, setAnimateExit] = useState(false);

  // Reset states when the modal is reopened
  useEffect(() => {
    if (!isOpen) {
      setIsSuccess(false);
      setIsLoading(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;
  
  const handleRetrieve = async () => {
    setIsLoading(true); // Start loading
    try {

      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment?equipmentId=${equipment}`,
        {
          withCredentials: true ,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      
      if (response.data && Array.isArray(response.data.data)) {
        response.data.data.forEach((item) => {
          deleteAssignment(item.assignLabId);  // This assumes each item has an assignLabId field
          fetchAssignData();
        });

           // Update equipment status on the server
      const AssignStatusUpdate = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${equipment}`,
        { status: "Available" },
        { withCredentials: true ,
          headers: { Authorization: `Bearer ${token}` } }
      );
      // Call onEditStatus to update the parent component
      onEditStatus(AssignStatusUpdate.data.data);
  
      // Show success message
      setIsSuccess(true);
  
      // Reset states after showing success feedback
      setTimeout(() => {
        setIsSuccess(false);
        setIsLoading(false);
        onClose(); // Close modal
      }, 2000);
      } else {
        setError("Unexpected data format from the API.");
      }
   
    } catch (error) {
      console.error("Error retrieving equipment:", error);
      toast.error("Failed to retrieve the equipment. Please try again.");
    } finally {
      setIsLoading(false); // Stop loading
    }
  };
  
  
  return (
    <motion.div 
    className="fixed inset-0 flex items-center justify-center z-50 xs:p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    >

      <motion.div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative text-center "
      initial={{ opacity: 0, y: -50 }}
        animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -50 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
        >
        {/* Header Section */}
        <div className="text-center">
          {isSuccess ? (
            <CheckCircleIcon
              style={{ fontSize: "48px", color: "#4CAF50" }}
              className="mx-auto mb-4"
            />
          ) : (
            <div className="w-12 h-12 bg-red-100 rounded-full mx-auto mb-4 flex items-center justify-center">
              <svg
                className="w-6 h-6 text-red-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M13 16h-1v-4h-1m1-4h.01M12 20.5c4.694 0 8.5-3.806 8.5-8.5S16.694 3.5 12 3.5 3.5 7.306 3.5 12 7.306 20.5 12 20.5z"
                ></path>
              </svg>
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
        </div>

        {/* Footer Section */}
        <div className="mt-6 flex justify-between">
          {!isSuccess && (
            <motion.button
            aria-label="Close"
            whileTap={{ scale: 0.8 }} // Shrinks on click
            whileHover={{ scale: 1.1 }} // Enlarges on hover
            transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
            onClick={() => {
              setAnimateExit(true); // Set the animation state to trigger upward motion
              setTimeout(onClose, 500); // Close after 500ms to match the animation duration
            }}
              className="xs:text-sm sm:text-lg lg:text-lg xs:px-4 sm:px-5 sm:py-2 xs:py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-100 transition"
            >
              Cancel
            </motion.button>
          )}
          {!isSuccess && (
            <button
           
              onClick={handleRetrieve}
              className={`xs:text-sm sm:text-lg lg:text-lg xs:px-4 sm:px-5 sm:py-2 xs:py-2 text-white bg-red-500 rounded-lg hover:bg-red-600 transition ${
                isLoading ? "opacity-70 cursor-not-allowed" : ""
              }`}
              disabled={isLoading}
            >
              {isLoading ? "Retrieving..." : "Retrieve"}
            </button>
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
