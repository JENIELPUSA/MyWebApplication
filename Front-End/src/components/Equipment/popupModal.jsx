import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { AddAssignContext } from "../../contexts/AssignContext/AddAssignContext";
import { motion } from "framer-motion";
import {
  X,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

const PopupModal = ({
  isOpen,
  onClose,
  onConfirm,
  equipment,
  onAssignSuccess,
}) => {
  const [laboratories, setLaboratories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [filteredLaboratories, setFilteredLaboratories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState(null);
  const { addAssignEquipment } = useContext(AddAssignContext);
  const [values, setValues] = useState({
    id: "",
    brand: "",
    status: "",
    Laboratory: "",
    department: "",
  });

  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [LaboratoryDropdownOpen, setLaboratoryDropdownOpen] = useState(false);
  const [isBothSelected, setIsBothSelected] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const [animateExit, setAnimateExit] = useState(false);

  const steps = ["Select Department", "Select Laboratory", "Review & Submit"];

  useEffect(() => {
    fetchInitialData();

    if (equipment) {
      setValues({
        id: equipment._id || "",
        serialNumber: equipment.SerialNumber || "",
        brand: equipment.Brand || "",
        status: equipment.status || "",
        Laboratory: equipment.Laboratory || "",
        department: "",
      });
    }
  }, [equipment]);

  // Filter departments that have at least one laboratory
  useEffect(() => {
    if (laboratories.length > 0 && departments.length > 0) {
      const departmentsWithLabs = departments.filter((dept) =>
        laboratories.some((lab) => lab.department === dept.DepartmentName)
      );
      setFilteredDepartments(departmentsWithLabs);
    } else {
      setFilteredDepartments([]);
    }
  }, [laboratories, departments]);

  // Fetch department and laboratory data
  const fetchInitialData = async () => {
    const fetchData = async (url, setState, errorMessage) => {
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const response = await axios.get(url, {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.status === "success") {
          setState(response.data.data);
        }
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
      }
    };

    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/departments`,
      setDepartments,
      "Failed to fetch departments"
    );
    fetchData(
      `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/laboratory`,
      setLaboratories,
      "Failed to fetch laboratories"
    );
  };

  // Helper: get currently selected laboratory object
  const getSelectedLaboratory = () =>
    filteredLaboratories.find((lab) => lab._id === values.Laboratory);

  // ✅ FIXED: Auto-advance papuntang Laboratory step pagkatapos pumili ng department
  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setValues((prev) => ({
      ...prev,
      department: selectedDepartment,
      Laboratory: "",
    }));

    const filtered = laboratories.filter(
      (lab) => lab.department === selectedDepartment
    );
    setFilteredLaboratories(filtered);
    setIsBothSelected(!!selectedDepartment && !!values.Laboratory);

    // Auto-advance sa Step 2 (Laboratory) kapag may napiling department
    if (selectedDepartment) {
      setActiveStep(1);
    }
  };

  // ✅ FIXED: Walang auto-advance — kailangan i-review muna bago mag-submit
  const handleLaboratoryChange = (e) => {
    const selectedLabId = e.target.value;
    setValues((prev) => ({
      ...prev,
      Laboratory: selectedLabId,
    }));

    setIsBothSelected(!!values.department && !!selectedLabId);
  };

  // Move to the next step in the stepper
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  // Submit the form after selection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      if (equipment.status === "Not Available") {
        await ReassignEquipment();
      } else {
        await assignEquipment();
      }
    } catch (error) {
      console.error("Error during submission:", error);
      setError(error.message || "Failed to assign equipment");
    } finally {
      setIsLoading(false);
    }
  };

  // Reassign equipment if it's not available
  const ReassignEquipment = async () => {
    const AssigId = equipment._id;

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment/`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const fetchedData = response?.data.data;
      const searchedData = fetchedData?.filter(
        (item) => item.EquipmentID === AssigId
      );
      console.log("Filtered Data (using EquipmentID):", searchedData);
    } catch (error) {
      console.error("Error reassigning equipment:", error);
    }
  };

  // Assign equipment to the selected department and laboratory
  const assignEquipment = async () => {
    try {
      const selectedLab = getSelectedLaboratory();

      const assignData = {
        id: values.id,
        Laboratory: values.Laboratory,
        department: values.department,
        status: values.status,
        EnchargeId: selectedLab?.EnchargeId || "",
        EnchargeName: selectedLab?.EnchargeName || "",
      };

      await addAssignEquipment(assignData);

      if (onAssignSuccess) {
        onAssignSuccess(assignData);
      }

      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (error) {
      console.error("Error in assignEquipment:", error);
      throw new Error(
        error.response?.data?.message || "Failed to assign equipment"
      );
    }
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit}>
      <motion.div
        className="fixed inset-0 flex items-center justify-center p-4 overflow-x-auto z-50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="relative bg-white rounded-lg p-6 shadow-lg w-96 max-w-full"
          initial={{ opacity: 0, y: -50 }}
          animate={animateExit ? { opacity: 0, y: -50 } : { opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* ✅ FIXED: type="button" para hindi mag-submit ang form */}
          <motion.button
            type="button"
            className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
            whileTap={{ scale: 0.8 }}
            whileHover={{ scale: 1.1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            onClick={() => {
              setAnimateExit(true);
              setTimeout(onClose, 500);
            }}
          >
            <X size={20} />
          </motion.button>

          <h2 className="text-lg font-bold mb-6 text-gray-800">
            {values.status === "Not Available"
              ? "Re-Assign Equipment"
              : "Assign Equipment"}
          </h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              <AlertCircle size={16} className="inline mr-2" />
              {error}
            </div>
          )}

          {/* Custom Stepper */}
          <div className="relative">
            <div className="flex items-center justify-between mb-6">
              {steps.map((label, index) => (
                <div key={index} className="flex items-center flex-1">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-colors ${
                        activeStep >= index
                          ? "bg-indigo-600 text-white"
                          : "bg-gray-200 text-gray-500"
                      }`}
                    >
                      {activeStep > index ? <CheckCircle size={16} /> : index + 1}
                    </div>
                    <span className="text-xs text-gray-500 mt-1 text-center hidden sm:block">
                      {label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div
                      className={`h-0.5 flex-1 mx-2 transition-colors ${
                        activeStep > index ? "bg-indigo-600" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4">
              {/* Step 1: Department Selection */}
              {activeStep === 0 && (
                <div className="relative w-full">
                  <label className="block mb-1 text-sm font-medium text-slate-600">
                    Department
                  </label>
                  <div
                    className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-lg px-3 py-2.5 cursor-pointer flex justify-between items-center hover:border-indigo-400 transition-colors"
                    onClick={() =>
                      setDepartmentDropdownOpen(!departmentDropdownOpen)
                    }
                  >
                    <span className="truncate">
                      {values.department
                        ? departments.find(
                            (cat) => cat._id === values.department
                          )?.DepartmentName || "Select Department"
                        : "Select Department"}
                    </span>
                    {departmentDropdownOpen ? (
                      <ChevronUp
                        size={16}
                        className="text-gray-500 flex-shrink-0 ml-2"
                      />
                    ) : (
                      <ChevronDown
                        size={16}
                        className="text-gray-500 flex-shrink-0 ml-2"
                      />
                    )}
                  </div>

                  {departmentDropdownOpen && (
                    <ul className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-lg w-full max-h-40 overflow-y-auto shadow-lg">
                      <li
                        className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-600 transition-colors"
                        onClick={() => {
                          handleDepartmentChange({
                            target: { name: "department", value: "" },
                          });
                          setDepartmentDropdownOpen(false);
                        }}
                      >
                        Select Department
                      </li>
                      {filteredDepartments.length > 0 ? (
                        filteredDepartments.map((department) => (
                          <li
                            key={department._id}
                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors"
                            onClick={() => {
                              handleDepartmentChange({
                                target: {
                                  name: "department",
                                  value: department.DepartmentName,
                                },
                              });
                              setDepartmentDropdownOpen(false);
                            }}
                          >
                            {department.DepartmentName}
                          </li>
                        ))
                      ) : (
                        <li className="px-3 py-2 text-sm text-gray-400 text-center italic">
                          No departments with available laboratories
                        </li>
                      )}
                    </ul>
                  )}
                </div>
              )}

              {/* Step 2: Laboratory Selection */}
              {activeStep === 1 && (
                <div className="relative w-full">
                  <label className="block mb-1 text-sm font-medium text-slate-600">
                    Laboratory
                  </label>

                  {/* ✅ FIXED: Fallback kapag walang napiling department pa */}
                  {!values.department ? (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      Please select a department first.
                    </div>
                  ) : filteredLaboratories.length === 0 ? (
                    /* ✅ FIXED: Fallback kapag walang laboratory sa napiling department */
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-700 text-sm flex items-center gap-2">
                      <AlertCircle size={16} />
                      No laboratories available for this department.
                    </div>
                  ) : (
                    <>
                      <div
                        className="w-full bg-white placeholder:text-slate-400 text-slate-700 text-sm border border-slate-300 rounded-lg px-3 py-2.5 cursor-pointer flex justify-between items-center hover:border-indigo-400 transition-colors"
                        onClick={() =>
                          setLaboratoryDropdownOpen(!LaboratoryDropdownOpen)
                        }
                      >
                        <span className="truncate">
                          {values.Laboratory
                            ? (() => {
                                const lab = getSelectedLaboratory();
                                return lab
                                  ? `${lab.LaboratoryName} — ${
                                      lab.EnchargeName || "N/A"
                                    }`
                                  : "Select Laboratory";
                              })()
                            : "Select Laboratory"}
                        </span>
                        {LaboratoryDropdownOpen ? (
                          <ChevronUp
                            size={16}
                            className="text-gray-500 flex-shrink-0 ml-2"
                          />
                        ) : (
                          <ChevronDown
                            size={16}
                            className="text-gray-500 flex-shrink-0 ml-2"
                          />
                        )}
                      </div>

                      {LaboratoryDropdownOpen && (
                        <ul className="absolute z-10 mt-1 bg-white border border-slate-300 rounded-lg w-full max-h-40 overflow-y-auto shadow-lg">
                          <li
                            className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-600 transition-colors"
                            onClick={() => {
                              handleLaboratoryChange({
                                target: { name: "Laboratory", value: "" },
                              });
                              setLaboratoryDropdownOpen(false);
                            }}
                          >
                            Select Laboratory
                          </li>
                          {filteredLaboratories.map((lab) => (
                            <li
                              key={lab._id}
                              className="px-3 py-2 hover:bg-slate-50 cursor-pointer text-sm text-slate-700 transition-colors"
                              onClick={() => {
                                handleLaboratoryChange({
                                  target: {
                                    name: "Laboratory",
                                    value: lab._id,
                                  },
                                });
                                setLaboratoryDropdownOpen(false);
                              }}
                            >
                              <div className="font-medium">
                                {lab.LaboratoryName}
                              </div>
                              <div className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                                <User size={12} />
                                Incharge: {lab.EnchargeName || "N/A"}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Step 3: Review */}
              {activeStep === 2 && (
                <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                  <h3 className="font-semibold text-gray-800 mb-3 text-sm flex items-center gap-2">
                    <CheckCircle size={16} className="text-indigo-600" />
                    Review Your Inputs
                  </h3>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Department:</span>{" "}
                      {values.department || "Not Selected"}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Laboratory:</span>{" "}
                      {getSelectedLaboratory()?.LaboratoryName ||
                        "Not Selected"}
                    </p>
                    <p className="text-sm text-gray-700 flex items-center gap-1">
                      <span className="font-medium">Encharge:</span>{" "}
                      <span className="inline-flex items-center gap-1">
                        <User size={14} className="text-indigo-600" />
                        {getSelectedLaboratory()?.EnchargeName ||
                          "Not Selected"}
                      </span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-end mt-6 space-x-2">
              {/* ✅ FIXED: type="button" para hindi mag-submit */}
              <button
                type="button"
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
                disabled={activeStep === 0}
                className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
                  activeStep === 0
                    ? "text-gray-400 cursor-not-allowed"
                    : "text-gray-700 border border-gray-300 hover:bg-gray-50"
                }`}
              >
                Back
              </button>

              {activeStep < steps.length - 1 ? (
                /* ✅ FIXED: type="button" para hindi mag-submit */
                <button
                  type="button"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                  className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Next
                </button>
              ) : (
                /* ✅ Ito lang ang type="submit" — tama lang */
                <button
                  type="submit"
                  disabled={isLoading}
                  className={`px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors ${
                    isLoading ? "opacity-70 cursor-not-allowed" : ""
                  }`}
                >
                  {isLoading
                    ? "Processing..."
                    : values.status === "Not Available"
                    ? "Re-Assign"
                    : "Assign Equipment"}
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </form>
  );
};

export default PopupModal;