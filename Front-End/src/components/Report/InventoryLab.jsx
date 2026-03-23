<<<<<<< HEAD
import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { FaFlask, FaTimes, FaChevronDown, FaFilePdf, FaExclamationTriangle } from "react-icons/fa";
=======
import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

function InventoryLab({ onClose }) {
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
<<<<<<< HEAD
  const [values, setValues] = useState({ department: "" });
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");

=======
  const [values, setValues] = useState({
    department: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  // Function to fetch data with token validation
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const fetchData = async (url, setState, errorMessage) => {
    if (!token) {
      navigate("/login");
      return;
    }
<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });
<<<<<<< HEAD
      if (response.data?.status === "success") {
        setState(response.data.data);
      } 
    } catch (error) {
    }
  };

=======

      if (response.data?.status === "success") {
        setState(response.data.data);
      } else {
        toast.error(errorMessage || "Unexpected response format");
      }
    } catch (error) {
      toast.error(errorMessage || "Error fetching data");
      console.error(`Error fetching data from ${url}:`, error);
    }
  };

  // Fetch departments on component mount
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  useEffect(() => {
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
      setDepartments,
      "Failed to fetch departments"
    );
  }, []);

<<<<<<< HEAD
  const handleCategoryChange = (deptId) => {
    setValues({ department: deptId });
    setDepartmentDropdownOpen(false);
  };

  const handleSubmitte = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    
    const selectedDepartment = values.department;

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/getSpecificDepartments?department=${selectedDepartment}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }
      );

      const fileURL = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = fileURL;
      link.setAttribute('download', `Lab_Report_${Date.now()}.pdf`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose(); // Close modal after success
    } catch (error) {
      setCustomError("SYSTEM ERROR: UNABLE TO GENERATE LABORATORY TELEMETRY.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => setCustomError(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [customError]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-[999] p-4 bg-slate-900/60 backdrop-blur-sm"
=======

  // Handle department change
  const handleCategoryChange = (e) => {
    const selectedDepartmentId = e.target.value;
    setValues((prevValues) => ({
      ...prevValues,
      department: selectedDepartmentId,
    }));
  };

  const handleSubmitte = async (e) => {
    e.preventDefault(); // prevents page reload
    if(values.From && values.to){
      toast.error("Please select a From and To Date.");
    }
  
    // Get selected department from state
    const selectedDepartment = values.department;
  
 
  
    try {
      // Make the API request to generate the PDF
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory/getSpecificDepartments?department=${selectedDepartment}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: 'blob' }  // Important to specify 'blob' for file download
      );
  
      // If the request is successful, handle the file download
      const fileURL = window.URL.createObjectURL(new Blob([res.data]));  // Create an object URL for the file
      const link = document.createElement('a');  // Create an anchor element
      link.href = fileURL;  // Set the file URL to the anchor's href
      link.setAttribute('download', `Laboratory${Date.now()}.pdf`);  // Specify the file name
      document.body.appendChild(link);  // Append the link to the DOM
      link.click();  // Trigger the download
      toast.success("PDF successfully generated and downloaded!");
      document.body.removeChild(link);  // Clean up by removing the link from the DOM
    } catch (error) {
      if (
        error.response &&
        error.response.data instanceof Blob &&
        error.response.data.type === "application/json"
      ) {
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const errorData = JSON.parse(reader.result);
            setCustomError(errorData.message || "Something went wrong.");
          } catch (e) {
            setCustomError("Unexpected error occurred.");
          }
        };
        reader.readAsText(error.response.data);
      } else {
        const fallbackMessage =
          error?.response?.data?.message || "Something went wrong.";
        setCustomError(fallbackMessage);
      }
    
    }
  };
    // Auto-clear error after 5 seconds
    useEffect(() => {
      if (customError) {
        const timer = setTimeout(() => {
          setCustomError("");
        }, 5000);
        return () => clearTimeout(timer);
      }
    }, [customError]);

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
<<<<<<< HEAD
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="relative flex flex-col rounded-[2rem] bg-white w-full max-w-md shadow-2xl border-2 border-slate-800 overflow-hidden"
      >
        {/* Header Section */}
        <div className="bg-[#1e3a8a] p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-400 text-[#1e3a8a] rounded-lg shadow-lg">
              <FaFlask size={18} />
            </div>
            <div>
              <h2 className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-200 leading-none mb-1">Laboratory Module</h2>
              <p className="text-sm font-black tracking-tight">SPECIFIC DEPT. REGISTRY</p>
            </div>
          </div>
          <button onClick={onClose} className="hover:rotate-90 transition-transform duration-300">
            <FaTimes size={18} className="text-blue-200 hover:text-white" />
          </button>
        </div>

        <div className="p-8">
          <AnimatePresence>
            {customError && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                className="mb-6 px-4 py-3 bg-red-50 border-l-4 border-red-500 flex items-center gap-3"
              >
                <FaExclamationTriangle className="text-red-500" size={14} />
                <span className="text-[10px] font-black text-red-700 uppercase tracking-widest">{customError}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <form onSubmit={handleSubmitte} className="space-y-6">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider leading-relaxed">
              Select a target department to extract laboratory equipment logs and asset distribution.
            </p>

            {/* Department Selector */}
            <div className="relative" ref={dropdownRef}>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block ml-1">
                Target Department
              </label>
              <button
                type="button"
                className="w-full flex justify-between items-center p-4 bg-slate-50 border-2 border-slate-100 rounded-xl text-slate-700 font-black text-xs tracking-widest hover:border-[#1e3a8a] transition-all"
                onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
              >
                <span>
                  {values.department
                    ? departments.find((cat) => cat._id === values.department)?.DepartmentName.toUpperCase()
                    : "SELECT DEPARTMENT"}
                </span>
                <FaChevronDown className={`text-[#1e3a8a] transition-transform ${departmentDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {departmentDropdownOpen && (
                <motion.ul
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="absolute z-20 mt-2 bg-white border-2 border-slate-100 rounded-xl w-full max-h-48 overflow-y-auto shadow-xl"
                >
                  <li
                    className="px-5 py-3 text-[10px] font-black text-slate-400 uppercase hover:bg-slate-50 cursor-pointer border-b border-slate-50"
                    onClick={() => handleCategoryChange("")}
                  >
                    -- RESET SELECTION --
                  </li>
                  {departments.map((dept) => (
                    <li
                      key={dept._id}
                      className="px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#1e3a8a] hover:text-white transition-colors cursor-pointer"
                      onClick={() => handleCategoryChange(dept._id)}
                    >
                      {dept.DepartmentName}
                    </li>
                  ))}
                </motion.ul>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-4 mt-4 rounded-xl font-black text-[11px] uppercase tracking-[0.3em] transition-all flex items-center justify-center gap-3 shadow-lg
                ${isLoading 
                  ? "bg-slate-400 cursor-wait" 
                  : "bg-[#1e3a8a] hover:bg-blue-900 text-white shadow-blue-900/20 active:scale-95"}`}
            >
              {isLoading ? (
                "SYNCING DATA..."
              ) : (
                <>
                  <FaFilePdf className="text-yellow-400" />
                  Generate Lab Report
                </>
              )}
            </button>
          </form>
          
          <div className="mt-8 text-center">
             <p className="text-[8px] font-black text-slate-300 uppercase tracking-[0.4em]">
               System Node: BIPSU-LAB-EXTRACTOR-V1
             </p>
          </div>
        </div>
      </motion.div>
=======
        className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg"
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {/* Close Icon */}
        <motion.button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
          
        </motion.button>
            {/* Custom Error Message */}
            {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <form onSubmit={handleSubmitte}>
          <p className="text-slate-500 font-light mb-6">
            Please select a department if you want Specific Display.
          </p>

          {/* Department Dropdown */}
          <div className="relative w-full mb-4">
            <label className="block mb-1 text-sm text-slate-600">
              Department
            </label>
            <div
              className="w-full bg-white text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setDepartmentDropdownOpen(!departmentDropdownOpen)}
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

          {/* Submit Button */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
          >
            Generate PDF
          </button>
        </form>
      </motion.div>

      <ToastContainer />
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    </motion.div>
  );
}

<<<<<<< HEAD
export default InventoryLab;
=======
export default InventoryLab;
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
