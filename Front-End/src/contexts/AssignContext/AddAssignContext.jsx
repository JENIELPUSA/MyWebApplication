import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";
import { toast } from "react-toastify"; // ✅ Import toast

export const AddAssignContext = createContext();

export const AddAssignProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [confirm, setConfirm] = useState(null);

  // ==========================
  // ✅ TOAST HELPERS
  // ==========================
  const showSuccess = (message) => {
    toast.success(message || "Operation successful!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const showError = (message) => {
    toast.error(message || "Something went wrong!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  // ==========================
  // ✅ ADD / ASSIGN EQUIPMENT
  // ==========================
  const addAssignEquipment = async (values) => {
    if (!token) {
      showError("No token found. Please login again.");
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          Equipments: values.id,
          Laboratory: values.Laboratory,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        console.log("TRigger Context");
        setConfirm(true);
        showSuccess("Equipment assigned successfully! ✅"); // ✅ TOAST
      } else {
        showError(response.data.message || "Failed to assign equipment.");
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
      showError(
        error?.response?.data?.message || "Error assigning equipment."
      ); // ✅ TOAST
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // ✅ DOWNLOAD PDF
  // ==========================
  const downloadPMSEquipmentHistory = async (laboratoryId) => {
    if (!laboratoryId) {
      showError("Laboratory ID is required");
      return;
    }

    setLoading(true);

    try {
      const response = await axios({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment/displayAssignHistory?laboratory=${laboratoryId}`,
        method: "GET",
        responseType: "blob",
        withCredentials: true,
      });

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      const filename = `Equipment_History_Report_${Date.now()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showSuccess("PDF downloaded successfully! 📄"); // ✅ TOAST
    } catch (error) {
      console.error("PDF Download Error:", error);
      showError("No records found or unauthorized access."); // ✅ TOAST
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // ✅ RESET CONFIRM
  // ==========================
  const resetConfirm = () => setConfirm(null);

  return (
    <AddAssignContext.Provider
      value={{
        addAssignEquipment,
        loading,
        confirm,
        resetConfirm,
        downloadPMSEquipmentHistory,
        showSuccess, // ✅ expose para magamit sa ibang component
        showError,
      }}
    >
      {children}
    </AddAssignContext.Provider>
  );
};