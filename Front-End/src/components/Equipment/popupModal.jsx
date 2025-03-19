import React, { useState, useEffect, useContext } from "react";
import { Box, Stepper, Step, StepLabel, Button, Typography } from '@mui/material';
import axios from 'axios';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { AddAssignContext } from "../Context/AssignContext/AddAssignContext";

const PopupModal = ({ isOpen, onClose, onConfirm, equipment }) => {
  const [laboratories, setLaboratories] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [filteredLaboratories, setFilteredLaboratories] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  //import Parent Component
  const { addAssignEquipment } = useContext(AddAssignContext);
  const [values, setValues] = useState({
    id: '',
    brand: '',
    status: '',
    Laboratory: '',
    department: '',
  });
  const [departmentDropdownOpen, setDepartmentDropdownOpen] = useState(false);
  const [isBothSelected, setIsBothSelected] = useState(false); // Track both department and laboratory selection
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  const steps = [
    'Select Department',  // Department selection
    'Select Laboratory',  // Laboratory selection based on the department
    'Review & Submit',    // Review selected department and laboratory
  ];

  useEffect(() => {
    fetchInitialData();

    if (equipment) {
      setValues({
        id: equipment._id || '',
        serialNumber: equipment.SerialNumber || '',
        brand: equipment.Brand || '',
        status: equipment.status || '',
        Laboratory: equipment.Laboratory || '',
        department: '',
      });
    }
  }, [equipment]);

  // Fetch department and laboratory data
  const fetchInitialData = async () => {
    const fetchData = async (url, setState, errorMessage) => {
      if (!token) {
        navigate('/login');
        return;
      }

      try {
        const response = await axios.get(url, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data?.status === 'success') {
          setState(response.data.data);
        } else {
          toast.error(errorMessage || 'Unexpected response format');
        }
      } catch (error) {
        console.error(`Error fetching data from ${url}:`, error);
        toast.error(errorMessage || 'Error fetching data');
      }
    };

    fetchData('http://127.0.0.1:3000/api/v1/departments', setDepartments, 'Failed to fetch departments');
    fetchData('http://127.0.0.1:3000/api/v1/laboratory', setLaboratories, 'Failed to fetch laboratories');
  };

  // Handle department change and filter laboratories based on department selection
  const handleDepartmentChange = (e) => {
    const selectedDepartment = e.target.value;
    setValues((prev) => ({
      ...prev,
      department: selectedDepartment,
      Laboratory: '', // Reset laboratory when department changes
    }));

    // Filter laboratories based on the selected department
    const filtered = laboratories.filter((lab) => lab.department === selectedDepartment);
    setFilteredLaboratories(filtered); // Update filteredLaboratories
    setIsBothSelected(!!selectedDepartment && !!values.Laboratory); // Enable next if both are selected
    handleNext();  // Move to the next step after selecting department
  };

  // Handle laboratory change
  const handleLaboratoryChange = (e) => {
    const selectedLabId = e.target.value;
    setValues((prev) => ({
      ...prev,
      Laboratory: selectedLabId,
    }));

    // Enable/Disable next button based on selections
    setIsBothSelected(!!values.department && !!selectedLabId);
    handleNext(); // Move to the next step after laboratory selection
  };

  // Move to the next step in the stepper
  const handleNext = () => {
    setActiveStep((prev) => prev + 1);
  };

  // Submit the form after selection
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (equipment.status === "Not Available") {
        await ReassignEquipment();  // Reassign if the equipment is not available
      } else {
        await assignEquipment();    // Otherwise, assign to the selected department/laboratory
      }
    } catch (error) {
      console.error('Error during submission:', error);
      toast.error(error.response?.data?.message || 'Operation failed. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Reassign equipment if it’s not available
  const ReassignEquipment = async () => {
    const AssigId = equipment._id;  // Equipment ID to reassign
    console.log("Equipment ID:", AssigId);

    try {
      const response = await axios.get(`http://127.0.0.1:3000/api/v1/AssignEquipment/`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const fetchedData = response.data.data;
      console.log("Fetched Data:", fetchedData);

      const searchedData = fetchedData.filter(item => item.EquipmentID === AssigId);
      console.log("Filtered Data (using EquipmentID):", searchedData);
    } catch (error) {
      console.error('Error reassigning equipment:', error);
    }
  };

  // Assign equipment to the selected department and laboratory
  const assignEquipment = async () => {
    //nag send ng value sa parent Components
    await addAssignEquipment(values);
  };

  if (!isOpen) return null;

  return (
    <form onSubmit={handleSubmit}>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
        <div className="relative bg-white rounded-lg p-6 shadow-lg w-96">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
            aria-label="Close"
          >
            <i className="fas fa-times"></i>
          </button>

          <h2 className="text-lg font-bold mb-4">
            {values.status === "Not Available" ? "Re-Assign Equipment" : "Assign Equipment"}
          </h2>
          <Box sx={{ width: "100%" }}>
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((label, index) => (
                <Step key={label}>
                  <StepLabel>{label}</StepLabel>
                  {activeStep === index && (
                    <div>
                      {/* Step 1: Custom Department Dropdown */}
                      {index === 0 && (
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
                                  handleDepartmentChange({
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
                                    handleDepartmentChange({
                                      target: { name: "department", value: department.DepartmentName },
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
                      )}

                      {/* Step 2: Laboratory Selection */}
                      {index === 1 && (
                        <div>
                          <label className="block text-sm font-medium text-gray-700">Laboratory</label>
                          <select
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                            value={values.Laboratory}
                            onChange={handleLaboratoryChange}
                            disabled={!filteredLaboratories.length}
                          >
                            <option value="">Select Laboratory</option>
                            {filteredLaboratories.map((lab) => (
                              <option key={lab._id} value={lab._id}>
                                {lab.LaboratoryName}
                              </option>
                            ))}
                          </select>
                        </div>
                      )}

                      {/* Step 3: Review Selected Values */}
                      {index === 2 && (
                        <div className="p-4 bg-gray-50 rounded-lg">
                          <h3 className="text-lg font-semibold text-gray-800 mb-2">Review Your Inputs</h3>
                          <p className="text-sm text-gray-600">
                            <strong>Department:</strong> {values.department || "Not Selected"}
                          </p>
                          <p className="text-sm text-gray-600">
                            <strong>Laboratory:</strong>{" "}
                            {filteredLaboratories.find((lab) => lab._id === values.Laboratory)
                              ?.LaboratoryName || "Not Selected"}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </Step>
              ))}
            </Stepper>

            <div className="flex justify-end mt-6 space-x-2">
              <Button
                variant="outlined"
                onClick={() => setActiveStep((prev) => Math.max(prev - 1, 0))}
              >
                Back
              </Button>
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveStep((prev) => prev + 1)}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={isLoading}
                >
                  {isLoading
                    ? "Processing..."
                    : values.status === "Not Available"
                    ? "Re-Assign"
                    : "Assign Equipment"}
                </Button>
              )}
            </div>
          </Box>
        </div>
      </div>
    </form>
  );
};

export default PopupModal;
