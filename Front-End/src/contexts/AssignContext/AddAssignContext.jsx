import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

export const AddAssignContext = createContext();

export const AddAssignProvider = ({ children }) => {
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [confirm, setConfirm] = useState(null);

  const addAssignEquipment = async (values) => {
    if (!token) {
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
        { headers: { Authorization: `Bearer ${token}` } },
      );

      if (response.data.status === "success") {
        await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${values.id}`,
          {
            status: "Not Available",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
        setConfirm(true);
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPMSEquipmentHistory = async (laboratoryId) => {
    if (!laboratoryId) return console.error("Laboratory ID is required");

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
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("No records found or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AddAssignContext.Provider
      value={{
        addAssignEquipment,
        loading,
        confirm,
        downloadPMSEquipmentHistory,
      }}
    >
      {children}
    </AddAssignContext.Provider>
  );
};