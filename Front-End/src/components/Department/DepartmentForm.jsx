import React, { useState, useEffect,useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { motion } from "framer-motion";
import { DepartmentDisplayContext } from "../Context/Department/Display";

function DepartmentForm({ onClose,isOpen, department, onAddDepartment, onUpdate }) {
  if (!isOpen) return null;
  const token = localStorage.getItem("token");
const [animateExit, setAnimateExit] = useState(false);
  const [values, setValues] = useState({
    DepartmentName: "",
  });

  const {AddAcceptDepartment,UpdateDepartment,customError}=useContext(DepartmentDisplayContext)

  const resetForm = () => {
    setValues({
      DepartmentName: "",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    setValues({
      DepartmentName: department?.DepartmentName || "",
    });
  }, [department]);

  const addDepartment = async () => {
    const result=await AddAcceptDepartment(values)
    if(result?.success===true){
      onAddDepartment(result.data);
      setValues({ DepartmentName: "" });
    }
  };

  const editDepartment = async () => {
    const result=await UpdateDepartment(department._id,values)
    if(result?.success===true){
      onUpdate(result.data); // Pass updated user data to the parent
      resetForm();
    }
    

  };

  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues({ ...values, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    toast.dismiss();
    setIsLoading(true);
      if (department) {
        await editDepartment();
      } else {
        await addDepartment();
        onClose()
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
                setTimeout(onClose, 500); // Close after 500ms to match the animation duration
              }}
            >
              <i className="fas fa-times"></i>
            </motion.button>
  
        <h4 className="xs:text-lg sm:text-lg lg:text-lg block text-2xl font-medium text-slate-800 mb-2">
          {department ? "Edit Department" : "Add Department"}
        </h4>
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {department
            ? "Update the department details"
            : "Enter department details to register."}
        </p>
  
        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Department Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Department Name"
                autoComplete="off"
                name="DepartmentName"
                onChange={handleInput}
                value={values.DepartmentName || ""}
              />
            </div>
          </div>
  
          <button
            className={`mt-8 w-full rounded-md py-2 px-4 border border-transparent text-center text-sm text-white transition-all shadow-md ${
              isLoading
                ? "bg-gray-500 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {department ? "Edit Department" : "Add Department"}
          </button>
  
          <ToastContainer
           
          />
        </form>
      </motion.div>
    </motion.div>
  );
  
}

export default DepartmentForm;