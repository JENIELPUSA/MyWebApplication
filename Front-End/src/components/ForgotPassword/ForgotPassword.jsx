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

  const handleChange = (e) => {
    setValues({ ...values, [e.target.name]: e.target.value });
  };

  const handleCloseModal = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose();
    }, 200);
  };

  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/forgotPassword`,
        values
      );

      if (res.data.status === "Success") {
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error("Error sending password reset email.");
    } finally {
      setLoading(false);
      setValues({ email: "" }); // Clears the input field after submission
    }
  };

  return (
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
