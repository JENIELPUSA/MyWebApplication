import { motion, AnimatePresence } from "framer-motion";
import { FaCheckCircle, FaExclamationTriangle, FaTimes, FaShieldAlt } from "react-icons/fa";

export default function StatusModal({ isOpen, onClose, status = "success" }) {
  const isSuccess = status === "success";

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center z-[1000] p-4 bg-slate-900/70 backdrop-blur-md">
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            className="bg-white rounded-[2.5rem] shadow-[0_25px_70px_rgba(0,0,0,0.4)] max-w-sm w-full relative overflow-hidden border-2 border-[#1e3a8a]"
          >
            {/* BIPSU Header Accent */}
            <div className={`h-4 w-full ${isSuccess ? "bg-yellow-400" : "bg-red-500"}`} />

            <div className="p-10 text-center">
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute top-6 right-6 text-slate-400 hover:text-[#1e3a8a] transition-all"
              >
                <FaTimes size={20} />
              </button>

              {/* Icon Container with BIPSU Yellow Aura */}
              <div className="relative mx-auto mb-8 w-24 h-24 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: [1, 1.4, 1.2] }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2,
                    ease: "easeInOut"
                  }}
                  className={`absolute inset-0 rounded-full opacity-30 ${
                    isSuccess ? "bg-yellow-400" : "bg-red-400"
                  }`}
                />
                
                <motion.div
                  initial={{ y: -20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  className={`relative z-10 w-full h-full flex items-center justify-center rounded-[2rem] shadow-xl ${
                    isSuccess 
                      ? "bg-[#1e3a8a] text-yellow-400 shadow-blue-900/30" 
                      : "bg-red-600 text-white shadow-red-900/30"
                  } text-4xl border-4 border-white`}
                >
                  {isSuccess ? <FaCheckCircle /> : <FaExclamationTriangle />}
                </motion.div>
              </div>

              {/* Status Header */}
              <div className="space-y-1 mb-6">
                <h2 className="text-[10px] font-black uppercase tracking-[0.4em] text-[#1e3a8a]/60">
                  {isSuccess ? "Security Verified" : "System Alert"}
                </h2>
                <h3 className={`text-2xl font-black tracking-tighter ${isSuccess ? "text-[#1e3a8a]" : "text-red-700"}`}>
                  {isSuccess ? "SUCCESSFUL" : "FAILED"}
                </h3>
              </div>

              {/* Message */}
              <p className="text-[12px] font-bold text-slate-500 uppercase tracking-wide mb-10 leading-relaxed px-2">
                {isSuccess
                  ? "Ang iyong request ay matagumpay na na-proseso sa aming system database."
                  : "Nagkaroon ng problema sa pag-proseso. Mangyaring suriin ang iyong koneksyon."}
              </p>

              {/* BIPSU Styled Action Button */}
              <button
                onClick={onClose}
                className={`w-full py-4 rounded-2xl font-black text-[11px] uppercase tracking-[0.3em] transition-all shadow-lg active:scale-95 flex items-center justify-center gap-3 ${
                  isSuccess 
                    ? "bg-[#1e3a8a] text-white hover:bg-blue-900 shadow-blue-900/20" 
                    : "bg-slate-800 text-white hover:bg-slate-900"
                }`}
              >
                {isSuccess && <FaShieldAlt className="text-yellow-400" />}
                Ipagpatuloy
              </button>
            </div>

            {/* Technical Footer Decoration */}
            <div className="bg-[#1e3a8a] py-2 flex justify-center gap-4">
               {[...Array(6)].map((_, i) => (
                 <div key={i} className="h-1 w-4 bg-yellow-400/40 rounded-full" />
               ))}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}