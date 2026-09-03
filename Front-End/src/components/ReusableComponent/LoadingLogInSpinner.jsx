import React from "react";
import { motion } from "framer-motion";

const LoadingScreen = () => {
  return (
    <motion.div
      className="fixed inset-0 bg-black bg-opacity-100 flex flex-col items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className="w-8 h-8 md:w-12 md:h-12 border-4 md:border-6 border-white border-t-transparent rounded-full animate-spin"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.5, ease: "easeInOut" }}
      ></motion.div>
      <motion.p
        className="mt-6 text-white text-base md:text-lg font-semibold"
        animate={{
          y: [0, -5, 0, 5, 0], // taas-baba-taas-baba (wave effect)
        }}
        transition={{
          repeat: Infinity, // paulit-ulit
          duration: 1, // 1 second per full wave
          ease: "easeInOut",
        }}
      >
        Logging in...
      </motion.p>
    </motion.div>
  );
};

export default LoadingScreen;
