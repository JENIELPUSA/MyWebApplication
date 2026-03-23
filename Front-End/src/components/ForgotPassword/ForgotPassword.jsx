<<<<<<< HEAD
import React, { useState } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { FaMailBulk, FaTimes, FaKey, FaChevronLeft } from "react-icons/fa";

const ForgotPassword = ({ isOpen, onClose }) => {
  const [values, setValues] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const [animateExit, setAnimateExit] = useState(false);

  if (!isOpen) return null;
=======
import React, { useContext, useState,useEffect } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import LoadingSpinner from "../ReusableComponent/loadingSpiner";
import { AuthContext } from "../Context/AuthContext";
import { motion } from "framer-motion";

const ForgotPassword = ({ isOpen, onClose }) => {
  const{authToken}=useContext(AuthContext)
  const [values, setValues] = useState({ email: "" });
  const [loading, setLoading] = useState(false);
  const[isVisible,setIsVisible]=useState(false)
  const [animateExit, setAnimateExit] = useState(false);


   useEffect(() => {
        setTimeout(() => setIsVisible(true), 70); // Trigger animation
        if (!authToken) {
          console.warn("No token found in localStorage");
          setError("Authentication token is missing. Please log in.");
          return;
        }
      }, [authToken]);

  if (!isOpen) return null; // Don't render the modal if it's closed
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
<<<<<<< HEAD
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
=======
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/forgotPassword`,
        values
      );

      if (res.data.status === "Success") {
<<<<<<< HEAD
        setTimeout(handleCloseModal, 3000);
      }
    } catch (error) {
    } finally {
      setLoading(false);
=======
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("Error sending password reset email.");
    } finally {
      setLoading(false);
      setValues({ email: "" }); // Clears the input field after submission
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  return (
<<<<<<< HEAD
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
=======
    <motion.div
    className="fixed inset-0 flex items-center justify-center z-50 px-4 overflow-y-auto"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
  >
    <motion.div
      className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
      initial={{ opacity: 0, y: -50 }}
      animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      transition={{ duration: 0.3, ease: "easeInOut" }}
    >
      {/* Close Icon */}
      <motion.button
        className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
        aria-label="Close"
        whileTap={{ scale: 0.8 }} // Shrinks on click
        whileHover={{ scale: 1.1 }} // Enlarges on hover
        transition={{ duration: 0.3, ease: "easeInOut" }} // Defines the duration of the scale animations
        onClick={() => {
          setAnimateExit(true); // Set the animation state to trigger upward motion
          setTimeout(handleCloseModal, 500); // Close after 500ms to match the animation duration
        }}
      >
        <i className="fas fa-times"></i>
      </motion.button>

    <h2 className=" xs:text-lg text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
      Forgot Password
    </h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <label className="block text-gray-700 font-semibold mb-2">
          Email
        </label>
        <input
          type="email"
          name="email"
          placeholder="Enter Email"
          autoComplete="off"
          className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={values.email}
          onChange={handleChange}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white lg:py-3 xs:py-2 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105 flex justify-center items-center"
      >
        {loading ? <LoadingSpinner /> : "Forgot Password"}
      </button>
    </form>
    <ToastContainer />
  </motion.div>
</motion.div>

  );
};

export default ForgotPassword;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
