import React, { useState, useEffect } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../Context/AuthContext";

function InventoryMaintenanceForm({ onClose }) {
  const [departments, setDepartments] = useState([]);
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [customError, setCustomError] = useState("");
  const [values, setValues] = useState({
    department: "",
    status: "",
    from: "",
    to: "",
  });

  const clear = () => {
    setValues({
      department: "",
      status: "",
      from: "",
      to: "",
    });
  };

  useEffect(() => {
    const fetchDepartments = async () => {
      if (!token) {
        navigate("/login");
        return;
      } else if (customError) {
        const timer = setTimeout(() => {
          setCustomError("");
        }, 5000);
        return () => clearTimeout(timer);
      }

      try {
        const response = await axios.get(
          "http://127.0.0.1:3000/api/v1/departments",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (response.data?.status === "success") {
          setDepartments(response.data.data);
        } else {
          toast.error("Unexpected response format");
        }
      } catch (error) {
        toast.error("Failed to fetch departments");
        console.error("Fetch error:", error);
      }
    };

    fetchDepartments();
  }, [token, navigate, customError]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Filters to submit:", values.from);
    // Add your PDF generation logic here
    try {
      const res = await axios.get(
        `http://127.0.0.1:3000/api/v1/MaintenanceRequest/getSpecificMaintenances?Department=${values.department}&from=${values.from}&to=${values.to}&Status=${values.status}`,
        { headers: { Authorization: `Bearer ${token}` }, responseType: "blob" }
      );
      // If the request is successful, handle the file download
      const fileURL = window.URL.createObjectURL(new Blob([res.data])); // Create an object URL for the file
      const link = document.createElement("a"); // Create an anchor element
      link.href = fileURL; // Set the file URL to the anchor's href
      link.setAttribute("download", `Department_Labs_${Date.now()}.pdf`); // Specify the file name
      document.body.appendChild(link); // Append the link to the DOM
      link.click(); // Trigger the download
      document.body.removeChild(link);
      clear();
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

  return (
    <motion.div
      className="fixed inset-0 flex items-center justify-center z-50"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        {/* Close Button */}
        <button
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          onClick={onClose}
        >
          <i className="fas fa-times"></i>
        </button>

        {/* Custom Error Message */}
        {customError && (
          <div className="mb-4 px-4 py-2 text-sm text-red-700 bg-red-100 border border-red-400 rounded">
            {customError}
          </div>
        )}
        <form onSubmit={handleSubmit}>
          <h4 className="text-2xl font-medium text-slate-800 mb-2">
            Select Department
          </h4>
          <p className="text-slate-500 font-light mb-6">
            Please select a department, status, and date if you want specific
            display.
          </p>

          {/* Department Dropdown */}
          <div className="relative w-full mb-4">
            <label className="block mb-1 text-sm text-slate-600">
              Department
            </label>
            <div
              className="w-full bg-white text-slate-700 text-sm border border-slate-300 rounded-md px-3 py-2 cursor-pointer flex justify-between items-center"
              onClick={() => setDepartmentDropdownOpen((prev) => !prev)}
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
              <ul className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-md w-full max-h-40 overflow-y-auto shadow-md">
                <li
                  className="px-3 py-2 hover:bg-slate-100 cursor-pointer"
                  onClick={() => {
                    setValues((prev) => ({ ...prev, department: "" }));
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
                      setValues((prev) => ({
                        ...prev,
                        department: department._id,
                      }));
                      setDepartmentDropdownOpen(false);
                    }}
                  >
                    {department.DepartmentName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="mb-4">
            <label className="block mb-1 text-sm text-slate-600">Status</label>
            <select
              name="status"
              value={values.status}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
            >
              <option value="">Select Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          {/* Date Range */}
          <div className="flex gap-4 mb-4">
            <div className="w-1/2">
              <label className="block mb-1 text-sm text-slate-600">
                From Date
              </label>
              <input
                type="date"
                name="from"
                value={values.from}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
            <div className="w-1/2">
              <label className="block mb-1 text-sm text-slate-600">
                To Date
              </label>
              <input
                type="date"
                name="to"
                value={values.to}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="mt-4 w-full bg-blue-600 text-white py-2 rounded-md"
          >
            Generate PDF
          </button>
        </form>

        {/* Selected Filters Display */}
        {(values.department || values.status || values.from || values.to) && (
          <div className="mt-6 bg-slate-50 border border-slate-200 p-4 rounded-md shadow-sm">
            <h5 className="text-slate-700 font-semibold mb-2">
              Selected Filters
            </h5>
            <ul className="text-sm text-slate-600 list-disc list-inside space-y-1">
              {values.department && (
                <li>
                  <span className="font-medium">Department:</span>{" "}
                  {departments.find((d) => d._id === values.department)
                    ?.DepartmentName || "N/A"}
                </li>
              )}
              {values.status && (
                <li>
                  <span className="font-medium">Status:</span> {values.status}
                </li>
              )}
              {values.from && (
                <li>
                  <span className="font-medium">From:</span>{" "}
                  {new Date(values.from).toLocaleDateString()}
                </li>
              )}
              {values.to && (
                <li>
                  <span className="font-medium">To:</span>{" "}
                  {new Date(values.to).toLocaleDateString()}
                </li>
              )}
            </ul>
          </div>
        )}
      </motion.div>

      <ToastContainer />
    </motion.div>
  );
}

export default InventoryMaintenanceForm;
