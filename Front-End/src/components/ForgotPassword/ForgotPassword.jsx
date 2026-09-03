import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaMailBulk, FaTimes, FaKey, FaChevronLeft } from "react-icons/fa";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [values, setValues] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/forgotPassword`,
        values
      );

      if (res.data.status === "Success") {
        setTimeout(handleCloseModal, 3000);
      }
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleCloseModal}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      <motion.div
        className="relative w-full max-w-md bg-white rounded-[2rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
        initial={{ opacity: 0, y: 50, scale: 0.9 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.9 } : { opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4, ease: "circOut" }}
      >
        {/* Top Accent Bar */}
        <div className="h-2 bg-yellow-400 w-full" />

        <div className="px-8 py-10">
          {/* Close Button */}
          <button
            onClick={handleCloseModal}
            className="absolute top-5 right-5 text-slate-400 hover:text-red-500 transition-colors p-2"
          >
            <FaTimes size={20} />
          </button>

          {/* Header */}
          <div className="flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-blue-50 rounded-3xl flex items-center justify-center text-[#1e3a8a] mb-4 shadow-inner">
              <FaKey size={35} />
            </div>
            <h2 className="text-2xl font-black text-slate-800 uppercase tracking-tighter">
              Account <span className="text-[#1e3a8a]">Recovery</span>
            </h2>
            <p className="text-slate-500 text-xs text-center mt-2 font-medium">
              Enter your registered email address to receive <br /> a password reset link.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">
                Authorized Email
              </label>
              <div className="relative group">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-[#1e3a8a] transition-colors">
                  <FaMailBulk size={18} />
                </div>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="name@company.com"
                  className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-4 focus:ring-blue-600/10 focus:border-[#1e3a8a] transition-all font-bold text-slate-700"
                  value={values.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-widest text-xs transition-all shadow-lg 
                ${loading 
                  ? "bg-slate-400 cursor-not-allowed" 
                  : "bg-[#1e3a8a] hover:bg-[#112d7a] hover:shadow-blue-900/20 active:scale-95"}`}
            >
              {loading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Send Reset Link"
              )}
            </button>
          </form>

          {/* Footer Link */}
          <div className="mt-8 flex justify-center">
             <button 
              onClick={handleCloseModal}
              className="flex items-center gap-2 text-xs font-black text-[#1e3a8a] hover:text-yellow-600 transition-colors uppercase tracking-tighter"
             >
                <FaChevronLeft size={10} /> Back to Login
             </button>
          </div>
        </div>

        {/* Technical Label */}
        <div className="bg-slate-50 py-3 border-t border-slate-100">
           <p className="text-[8px] text-center text-slate-400 font-bold uppercase tracking-[0.3em]">
              Security Protocol v3.0.1
           </p>
        </div>
      </motion.div>
    </div>
  );
};

export default ForgotPassword;
