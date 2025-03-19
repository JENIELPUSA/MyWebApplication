import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import { io } from "socket.io-client";
import "react-toastify/dist/ReactToastify.css";
import { RequestDisplayContext } from "../Context/MaintenanceRequest/DisplayRequest";

function AddRequest({
  DepartmentID,
  EquipmentID,
  LaboratoryID,
  description,
  onClose,
  isOpen,
  onAddRequest,
}) {
  const { fetchRequestData } = useContext(RequestDisplayContext);

  if (!isOpen) return null;

  const token = localStorage.getItem("token");
  const socket = io("http://localhost:3000"); // Connect to the backend server

  const [values, setValues] = useState({
    Description: "",
  });

  const resetForm = () => {
    setValues({
      Description: "",
    });
  };

  const [isLoading, setIsLoading] = useState(false);

  // Emit 'newRequest' event after successful request creation
  const addDepartment = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:3000/api/v1/MaintenanceRequest",
        {
          Description: values.Description,
          Equipments: EquipmentID,
          Department: DepartmentID,
          Laboratory: LaboratoryID,
          Status:"Pending"
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data && response.data.status === "success") {
        toast.success("Description sent successfully");

        // Emit a socket event to notify the admin
        socket.emit("newRequest", {
          message: "A new maintenance request has been added!",
          data: response.data.data, // Pass request data
        });

        
        console.log(response.data.data);

        onAddRequest(response.data.data);
        fetchRequestData();
        setValues({ Description: "" }); // Clear form fields
      } else {
        toast.error("Failed to add description");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("An unexpected error occurred.");
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

    try {
      await addDepartment();
    } catch (error) {
      console.error("Error:", error);
      toast.error("Operation failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative flex flex-col rounded-xl bg-white px-6 py-6 w-full max-w-md shadow-lg">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-xl text-gray-500 hover:text-gray-700 transition"
          aria-label="Close"
        >
          <i className="fas fa-times"></i>
        </button>

        <h4 className="block text-2xl font-medium text-slate-800 mb-2">
          {description ? "Edit Description" : "Input Description"}
        </h4>

        <p className="text-slate-500 font-light mb-6">
          {description
            ? "Update the description details"
            : "Enter description details to send request."}
        </p>

        <form onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-col gap-4">
            <div className="w-full">
              <label className="block mb-1 text-sm text-slate-600">
                Description
              </label>
              <textarea
                type="text"
                className="w-full bg-transparent placeholder:text-slate-400 text-slate-700 text-sm border border-slate-200 rounded-md px-3 py-2"
                placeholder="Description"
                autoComplete="off"
                name="Description"
                onChange={handleInput}
                value={values.Description || ""}
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
            {description ? "Edit Description" : "Add Description"}
          </button>

          <ToastContainer />
        </form>
      </div>
    </div>
  );
}

export default AddRequest;
