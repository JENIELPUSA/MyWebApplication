import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
<<<<<<< HEAD
import { FaTimes, FaFlask, FaBuilding, FaUserTie, FaSave, FaChevronDown, FaChevronUp } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import { motion, AnimatePresence } from "framer-motion";

function LaboratoryForm({ onClose, laboratory, onAddLaboratory, OnEditLaboratory }) {
  const [animateExit, setAnimateExit] = useState(false);
  const { UpdateLaboratory, AddedLaboratory, customError } = useContext(LaboratoryDisplayContext);
  const navigate = useNavigate();
  
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false);

  const [departments, setDepartments] = useState([]);
  const [encharges, setEncharges] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

=======
import { FaPlus } from "react-icons/fa";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { LaboratoryDisplayContext } from "../Context/Laboratory/Display";
import { AssignContext } from "../Context/DisplayAssignContext.jsx";
import { motion } from "framer-motion";
function LaboratoryForm({
  onClose,
  laboratory,
  onAddLaboratory,
  OnEditLaboratory,
}) {
  const [animateExit, setAnimateExit] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { fetchAssignData } = useContext(AssignContext);
  const { UpdateLaboratory,AddedLaboratory,customError } = useContext(LaboratoryDisplayContext);
  const navigate = useNavigate();
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false); // Separate state for Department dropdown
  const [enchargeDropdownOpen, setEnchargeDropdownOpen] = useState(false); // Separate state for Encharge dropdown

  const [departments, setDepartments] = useState([]);
  const [encharges, setEncharges] = useState([]);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [values, setValues] = useState({
    department: "",
    Encharge: "",
    LaboratoryName: "",
  });
<<<<<<< HEAD

  useEffect(() => {
    fetchData(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`, setDepartments);
    fetchData(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`, setEncharges);
    
=======
  const [isLoading, setIsLoading] = useState(false);
  const token = localStorage.getItem("token");

  // Function to fetch data with token validation
  const fetchData = async (url, setState, errorMessage) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(url, {
        withCredentials: true ,
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response?.data.status === "success") {
        setState(response.data.data);
      } else {
        toast.error(errorMessage || "Unexpected response format");
      }
    } catch (error) {
      toast.error(errorMessage || "Error fetching data");
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  // Fetch departments and encharges on component mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 70);
    Checklaboratories();
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    if (laboratory) {
      setValues({
        department: laboratory.DepartmentId || "",
        Encharge: laboratory.EnchargeId || "",
        LaboratoryName: laboratory.LaboratoryName || "",
      });
    }
  }, [laboratory]);

<<<<<<< HEAD
  const fetchData = async (url, setState) => {
    if (!token) return navigate("/");
    try {
      const response = await axios.get(url, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response?.data.status === "success") setState(response.data.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const handleClose = () => {
    setAnimateExit(true);
    setTimeout(() => {
      setAnimateExit(false);
      onClose();
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const result = laboratory 
        ? await UpdateLaboratory(laboratory._id, values)
        : await AddedLaboratory(values);

      if (result?.success) {
        laboratory ? OnEditLaboratory(result.data) : onAddLaboratory(result.data[0]);
        handleClose();
      }
    } catch (error) {
=======
  const Checklaboratories = async () => {
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
      setDepartments,
      "Failed to fetch departments"
    );
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/users`,
      setEncharges,
      "Failed to fetch encharges"
    );
  };

  // Update input values
  const handleInput = (event) => {
    const { name, value } = event.target;
    setValues((prevValues) => ({ ...prevValues, [name]: value }));
  };

  const handleCategoryChange = (e) => {
    const selectedDepartmentId = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      department: selectedDepartmentId,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (laboratory) {
        await editLaboratory();
        onClose()
      } else {
        await addLaboratory();
        onClose()
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    } finally {
      setIsLoading(false);
    }
  };

<<<<<<< HEAD
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={handleClose}
        className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, y: 50, scale: 0.95 }}
        animate={animateExit ? { opacity: 0, y: 50, scale: 0.95 } : { opacity: 1, y: 0, scale: 1 }}
        className="relative w-full max-w-md bg-white rounded-[2.5rem] overflow-hidden shadow-2xl border-2 border-[#1e3a8a]"
      >
        {/* Header */}
        <div className="bg-[#1e3a8a] px-8 py-6 text-white relative">
          <button onClick={handleClose} className="absolute top-4 right-4 text-white/50 hover:text-yellow-400 transition-colors">
            <FaTimes size={18} />
          </button>
          
          <div className="flex items-center gap-3">
            <div className="p-3 bg-yellow-400 rounded-2xl text-[#1e3a8a] shadow-lg shadow-yellow-400/20">
              <FaFlask size={20} />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter">
                {laboratory ? "Update" : "New"} <span className="text-yellow-400">Facility</span>
              </h2>
              <p className="text-[10px] text-blue-200 font-bold uppercase tracking-widest">Laboratory Registry Terminal</p>
            </div>
          </div>
        </div>

        <div className="p-8">
          {customError && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[11px] font-black rounded-r-md uppercase">
              {customError}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Lab Name Input */}
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Facility Designation</label>
              <div className="relative group">
                <FaFlask className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-[#1e3a8a]" />
                <input
                  type="text"
                  name="LaboratoryName"
                  value={values.LaboratoryName}
                  onChange={(e) => setValues({...values, LaboratoryName: e.target.value})}
                  placeholder="e.g. Computer Lab 101"
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-4 focus:ring-blue-600/5 focus:border-[#1e3a8a] outline-none font-bold text-slate-700 text-sm transition-all"
                />
              </div>
            </div>

            {/* Department Dropdown */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Department Scope</label>
              <div 
                onClick={() => {setDepartmentDropdownOpen(!departmentDropdownOpen); setEnchargeDropdownOpen(false);}}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FaBuilding className="text-slate-300" />
                  <span className={`text-sm font-bold ${values.department ? "text-slate-700" : "text-slate-400"}`}>
                    {values.department ? departments.find(d => d._id === values.department)?.DepartmentName : "Select Department"}
                  </span>
                </div>
                {departmentDropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
              </div>
              <AnimatePresence>
                {departmentDropdownOpen && (
                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto border-t-4 border-t-yellow-400">
                    {departments.map((dept) => (
                      <li key={dept._id} onClick={() => { setValues({...values, department: dept._id}); setDepartmentDropdownOpen(false); }}
                        className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                        {dept.DepartmentName}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            {/* Encharge Dropdown */}
            <div className="space-y-1 relative">
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Assigned Personnel (Encharge)</label>
              <div 
                onClick={() => {setEnchargeDropdownOpen(!enchargeDropdownOpen); setDepartmentDropdownOpen(false);}}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl flex justify-between items-center cursor-pointer group hover:border-blue-400 transition-all"
              >
                <div className="flex items-center gap-3">
                  <FaUserTie className="text-slate-300" />
                  <span className={`text-sm font-bold ${values.Encharge ? "text-slate-700" : "text-slate-400"}`}>
                    {values.Encharge ? 
                      (() => {
                        const user = encharges.find(e => e._id === values.Encharge);
                        return user ? `${user.FirstName} ${user.LastName}` : "Select Encharge";
                      })() : "Select Encharge"}
                  </span>
                </div>
                {enchargeDropdownOpen ? <FaChevronUp className="text-blue-600" /> : <FaChevronDown className="text-slate-300" />}
              </div>
              <AnimatePresence>
                {enchargeDropdownOpen && (
                  <motion.ul initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="absolute z-[60] w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl max-h-40 overflow-y-auto border-t-4 border-t-yellow-400">
                    {encharges.map((user) => (
                      <li key={user._id} onClick={() => { setValues({...values, Encharge: user._id}); setEnchargeDropdownOpen(false); }}
                        className="px-4 py-3 text-sm font-bold text-slate-600 hover:bg-blue-50 hover:text-[#1e3a8a] cursor-pointer border-b border-slate-50 last:border-0 transition-colors">
                        {user.FirstName} {user.LastName}
                      </li>
                    ))}
                  </motion.ul>
                )}
              </AnimatePresence>
            </div>

            <button type="submit" disabled={isLoading}
              className={`w-full py-4 rounded-2xl font-black text-white uppercase tracking-[0.2em] text-xs transition-all shadow-lg flex items-center justify-center gap-3 mt-4
                ${isLoading ? "bg-slate-400 cursor-not-allowed" : "bg-[#1e3a8a] hover:bg-[#112d7a] active:scale-95 shadow-blue-900/20"}`}>
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <><FaSave /> {laboratory ? "Commit Changes" : "Initialize Facility"}</>
              )}
            </button>
          </form>
        </div>

        {/* Technical Footer */}
        <div className="bg-yellow-400 py-2 text-center">
          <p className="text-[9px] font-black text-blue-900 uppercase tracking-[0.3em]">System Asset Registry</p>
        </div>
      </motion.div>
    </div>
  );
}

export default LaboratoryForm;
=======
  // Add new laboratory
  const addLaboratory = async () => {
      const result=await AddedLaboratory(values)
      if(result?.success===true){
        onAddLaboratory(result.data[0])
      }
  };

  // Edit existing laboratory
  const editLaboratory = async () => {
      const result=await UpdateLaboratory(laboratory._id,values)
      if(result?.success===true){
        console.log(result)
        OnEditLaboratory(result.data);
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

        <h4 className="xs:text-lg sm:text-sm lg:text-2xl block text-2xl font-medium text-slate-800 mb-2">
          {laboratory ? "Edit Laboratory" : "Create Laboratory"}
        </h4>
        <p className="xs:text-sm sm:text-sm lg:text-sm text-slate-500 font-light mb-6">
          {laboratory
            ? "Update the laboratory details"
            : "Enter laboratory details to register."}
        </p>
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            {/* Laboratory Name */}
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Laboratory Name
              </label>
              <input
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Laboratory Name"
                autoComplete="off"
                name="LaboratoryName"
                value={values.LaboratoryName || ""}
                onChange={handleInput}
              />
            </div>

            {/* Custom Department Dropdown */}
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Department
              </label>
              <div
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                onClick={() =>
                  setDepartmentDropdownOpen(!departmentDropdownOpen)
                }
              >
                <span>
                  {values.department
                    ? departments.find((cat) => cat._id === values.department)
                        ?.DepartmentName || "Select Department"
                    : "Select Department"}
                </span>
                <i
                  className={`fas ${
                    departmentDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                  } text-gray-500`}
                />
              </div>

              {departmentDropdownOpen && (
                <ul
                  className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                >
                  <li
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      handleCategoryChange({
                        target: { name: "department", value: "" },
                      });
                      setDepartmentDropdownOpen(false);
                    }}
                  >
                    Select Department
                  </li>
                  {departments.map((department) => (
                    <li
                      key={department._id}
                      className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        handleCategoryChange({
                          target: { name: "department", value: department._id },
                        });
                        setDepartmentDropdownOpen(false);
                      }}
                    >
                      {department.DepartmentName}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* Custom Encharge Dropdown */}
            <div className="relative w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Encharge
              </label>
              <div
                className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
                onClick={() => setEnchargeDropdownOpen(!enchargeDropdownOpen)}
              >
                <span>
                  {values.Encharge
                    ? encharges.find(
                        (encharge) => encharge._id === values.Encharge
                      )
                      ? `${
                          encharges.find(
                            (encharge) => encharge._id === values.Encharge
                          ).FirstName
                        } ${
                          encharges.find(
                            (encharge) => encharge._id === values.Encharge
                          ).LastName
                        }`
                      : "Select Encharge"
                    : "Select Encharge"}
                </span>
                <i
                  className={`fas ${
                    enchargeDropdownOpen ? "fa-chevron-up" : "fa-chevron-down"
                  } text-gray-500`}
                />
              </div>

              {enchargeDropdownOpen && (
                <ul
                  className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto"
                  style={{ boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)" }}
                >
                  <li
                    className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                    onClick={() => {
                      setValues({ ...values, Encharge: "" });
                      setEnchargeDropdownOpen(false);
                    }}
                  >
                    Select Encharge
                  </li>
                  {encharges.map((encharge) => (
                    <li
                      key={encharge._id}
                      className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                      onClick={() => {
                        setValues({ ...values, Encharge: encharge._id });
                        setEnchargeDropdownOpen(false);
                      }}
                    >
                      {`${encharge.FirstName} ${encharge.LastName}`}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
            disabled={isLoading}
          >
            {isLoading ? "Submitting..." : laboratory ? "Update" : "Create"}
          </button>
        </form>
      </motion.div>

      <ToastContainer />
    </motion.div>
  );
}

export default LaboratoryForm;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
