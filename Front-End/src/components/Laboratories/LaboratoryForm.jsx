import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
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
  const [values, setValues] = useState({
    department: "",
    Encharge: "",
    LaboratoryName: "",
  });
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

  // Fetch departments and encharges on component mount
  useEffect(() => {
    setTimeout(() => setIsVisible(true), 70);
    Checklaboratories();
    if (laboratory) {
      setValues({
        department: laboratory.DepartmentId || "",
        Encharge: laboratory.EnchargeId || "",
        LaboratoryName: laboratory.LaboratoryName || "",
      });
    }
  }, [laboratory]);

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
      } else {
        await addLaboratory();
      }
    } catch (error) {
      console.error("Error during submission:", error);
      toast.error(
        error.response?.data?.message || "Operation failed. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

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
        <p className="xs:text-sm sm:text-sm lg:text-2xl text-slate-500 font-light mb-6">
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
