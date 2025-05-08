import React, { useState,useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { motion } from 'framer-motion';
import {AuthContext} from '../Context/AuthContext';
function ResetPassword(onClose) {
  const [animateExit, setAnimateExit] = useState(false);
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const { token } = useParams();
    const {logout}=useContext(AuthContext);
    const navigate = useNavigate();
    const handleSubmit = async (e) => {
        e.preventDefault();

        if (password !== confirmPassword) {
            toast.error("Passwords do not match!");
            return;
        }

        try {
            const res = await axios.patch(
                `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/authentication/resetPassword/${token}`,
                { password, confirmPassword },
                { headers: { "Content-Type": "application/json" } }
            );

            console.log("Server Response:", res.data);

            if (res.data.status === "Success") {
                toast.success("SuccessFully Updated!");
                setTimeout(() => {
                  navigate("/");
                  }, 2000);       
                
            } else {
                toast.error('Failed to reset password. Please try again.');
            }
        } catch (error) {
            console.error('Error response:', error.response?.data || error.message);
            toast.error('There was an error resetting the password. Please try again.');
        }
    };

    return (
      <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
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
            setTimeout(onClose, 500); // Close after 500ms to match the animation duration
          }}
        >
          <i className="fas fa-times"></i>
        </motion.button>
            <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-6">
              New Password
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  placeholder="Enter New Password"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                />
              </div>


              <div className="mb-4">
                <label
                  htmlFor="confirmPassword"
                  className="block text-gray-700 font-semibold mb-2"
                >
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Confirm Password"
                  autoComplete="off"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e) => {
                    setConfirmPassword(e.target.value);
                  }}
                />
              </div>
    
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-500 to-indigo-500 text-white py-3 rounded-lg hover:shadow-lg transition-transform transform hover:scale-105"
              >
                Create New Password
              </button>
            </form>
            <ToastContainer />
          </motion.div>
        </motion.div>
    );
}

export default ResetPassword;
