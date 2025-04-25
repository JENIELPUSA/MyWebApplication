import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

function InventoryLab({ onClose }) {
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [departments, setDepartments] = useState([]);
  const [values, setValues] = useState({
    department: "",
  });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  // Function to fetch data with token validation
  const fetchData = async (url, setState, errorMessage) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      const response = await axios.get(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

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
  useEffect(() => {
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
      setDepartments,
      "Failed to fetch departments"
    );
  }, []);


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
  
    // Do your logic (API call, generate PDF, etc.)
    console.log("Selected Department:", selectedDepartment);
  
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
      link.setAttribute('download', `Department_Labs_${Date.now()}.pdf`);  // Specify the file name
      document.body.appendChild(link);  // Append the link to the DOM
      link.click();  // Trigger the download
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
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
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
          <h4 className="block text-2xl font-medium text-slate-800 mb-2">
            Select Department
          </h4>
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
    </motion.div>
  );
}

export default InventoryLab;
