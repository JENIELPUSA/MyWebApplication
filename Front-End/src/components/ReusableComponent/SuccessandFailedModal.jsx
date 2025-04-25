import { useState } from "react";
import { motion } from "framer-motion";

export default function StatusModal({ isOpen, onClose, status = "success" }) {
  const isSuccess = status === "success";

  return isOpen ? (
    <div className="fixed inset-0 flex items-center justify-center bg-opacity-40 z-50 2xs:p-4 xs:p-4">
      <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full relative text-center">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
        >
          ✕
        </button>

        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className={`mx-auto mb-4 w-16 h-16 flex items-center justify-center rounded-full ${
            isSuccess ? "bg-green-100" : "bg-red-100"
          }`}
        >
          <motion.div
            initial={{ rotate: -180 }}
            animate={{ rotate: 0 }}
            transition={{ duration: 0.5 }}
            className="text-3xl"
          >
            {isSuccess ? "✅" : "❌"}
          </motion.div>
        </motion.div>

        {/* Heading */}
        <h2 className="text-xl font-semibold mb-2">
          {isSuccess ? "Successfully accepted!" : "Action Failed!"}
        </h2>

        {/* Message */}
        <p className="text-gray-500 text-sm mb-4">
          {isSuccess
            ? "Your request has been successfully accepted and processed."
            : "Oops! Something went wrong. Please try again later."}
        </p>

        {/* Button */}
        <button
          onClick={onClose}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-400 w-full"
        >
          Got it
        </button>
      </div>
    </div>
  ) : null;
}
