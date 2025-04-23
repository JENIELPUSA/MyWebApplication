import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { UserDisplayContext } from "../Context/User/DisplayUser";

function SignUpForm({ onClose, isOpen, user, onUpdate, onAddUser }) {
  const token = localStorage.getItem("token");
  const [animateExit, setAnimateExit] = useState(false);
  const [customError, setCustomError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
const {AddUser,UpdateUser}=useContext(UserDisplayContext)
  const [values, setValues] = useState({
    FirstName: "",
    Middle: "",
    LastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    setValues({
      FirstName: user?.FirstName || "",
      Middle: user?.Middle || "",
      LastName: user?.LastName || "",
      email: user?.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [user]);

  const resetForm = () => {
    setValues({
      FirstName: "",
      Middle: "",
      LastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleValidation = () => {
    const { FirstName, LastName, email, password, confirmPassword } = values;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!FirstName || !LastName || !email || (!user && !password)) {
      setCustomError("Please fill in all required fields.");
      return false;
    }

    if (!emailPattern.test(email)) {
      setCustomError("Please enter a valid email address.");
      return false;
    }

    if (!user && password !== confirmPassword) {
      setCustomError("Passwords do not match.");
      return false;
    }

    setCustomError(""); // Clear previous errors
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    if (!handleValidation()) return;

    setIsLoading(true);

      if (user) {
        await editUser();
      } else {
        await signUpUser();
      }
  };

  const editUser = async () => {
   const result=await UpdateUser(user._id,values)
   if(result?.success===true){
    onUpdate(result.data)
    resetForm();
    onClose();
  }  
  };

  const signUpUser = async () => {
    const result=await AddUser(values)
    if(result?.success===true){
      onAddUser(result.data)
      resetForm();
      onClose();
    }  
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4 overflow-y-auto"
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
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
          onClick={() => {
            setAnimateExit(true);
            setTimeout(onClose, 500);
          }}
        >
          ✕
        </motion.button>

        <h4 className="xs:text-lg sm:text-sm lg:text-2xl text-2xl font-medium text-slate-800 mb-2">
          {user ? "Edit User" : "Sign Up"}
        </h4>
        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {user
            ? "Update the user details"
            : "Nice to meet you! Enter your details to register."}
        </p>

        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col lg:gap-4  xs:gap-2">
            <div className="flex gap-3">
              <div className="w-1/2">
                <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">
                  First Name
                </label>
                <input
                  type="text"
                  name="FirstName"
                  value={values.FirstName}
                  onChange={handleInput}
                  placeholder="Your First Name"
                  className="xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border border-slate-200 rounded px-3 py-2"
                />
              </div>
              <div className="w-1/2 ">
                <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">
                  Middle Name
                </label>
                <input
                  type="text"
                  name="Middle"
                  value={values.Middle}
                  onChange={handleInput}
                  placeholder="Your Middle Name"
                  className="xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border border-slate-200 rounded px-3 py-2"
                />
              </div>
            </div>
            <div>
              <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">
                Last Name
              </label>
              <input
                type="text"
                name="LastName"
                value={values.LastName}
                onChange={handleInput}
                placeholder="Your Last Name"
                className="xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border border-slate-200 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">Email</label>
              <input
                type="email"
                name="email"
                value={values.email}
                onChange={handleInput}
                placeholder="Your Email"
                className="xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border border-slate-200 rounded px-3 py-2"
              />
            </div>
            <div>
              <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={values.password}
                onChange={handleInput}
                disabled={user}
                placeholder={
                  user ? "New Password (Optional)" : "Your Password"
                }
                className={`xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border rounded px-3 py-2 ${
                  user
                    ? "text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-slate-700 border-slate-200"
                }`}
              />
            </div>
            <div>
              <label className="xs:text-xs  sm:text-sm lg:text-sm text-sm text-slate-600 mb-1 block">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={values.confirmPassword}
                onChange={handleInput}
                disabled={user}
                placeholder="Confirm Your Password"
                className={`xs:text-xs  sm:text-sm lg:text-sm w-full text-sm border rounded px-3 py-2 ${
                  user
                    ? "text-gray-400 border-gray-300 bg-gray-50 cursor-not-allowed"
                    : "text-slate-700 border-slate-200"
                }`}
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className={`xs:text-xs  sm:text-sm lg:text-sm mt-6 w-full text-white text-sm rounded-md py-2 px-4 transition-all ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500"
            }`}
          >
            {user ? "Update User" : "Submit"}
          </button>
        </form>
        <ToastContainer />
      </motion.div>
    </motion.div>
  );
}

export default SignUpForm;
