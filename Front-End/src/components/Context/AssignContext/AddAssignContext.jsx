import React, { createContext, useState, useContext } from "react";
import axios from "axios";
<<<<<<< HEAD
import { AssignContext } from "../DisplayAssignContext.jsx";
=======
import { toast } from "react-toastify";
import { AssignContext } from "../DisplayAssignContext.jsx";
import "react-toastify/dist/ReactToastify.css";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { EquipmentDisplayContext } from "../EquipmentContext/DisplayContext.jsx";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest.jsx";
import { SchedDisplayContext } from "../TypesOfSchedContext.jsx";
import { AddTypeMaintenance } from "../TypesofMainten/addmaintenance.jsx";
<<<<<<< HEAD
=======
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import axiosInstance from "../../ReusableComponent/axiosInstance.jsx";
export const AddAssignContext = createContext();

export const AddAssignProvider = ({ children }) => {
  const { view } = useContext(RequestDisplayContext);
  const { UpdateType } = useContext(AddTypeMaintenance);
  const { TypesofMaintenance } = useContext(SchedDisplayContext);
  const [updateSched, setupdateSched] = useState();
  const { fetchAssignData } = useContext(AssignContext);
  const { fetchEquipmentData } = useContext(EquipmentDisplayContext);
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("token");
  const [confirm, setConfirm] = useState(null); // Initially null

  const addAssignEquipment = async (values) => {
    if (!token) {
<<<<<<< HEAD
=======
      toast.error("Authentication required.");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      return;
    }

    setLoading(true); // Show loading indicator when starting the request

    try {
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          Equipments: values.id, // Selected equipment
          Laboratory: values.Laboratory, // Laboratory to assign to
        },
<<<<<<< HEAD
        { headers: { Authorization: `Bearer ${token}` } },
=======
        { headers: { Authorization: `Bearer ${token}` } }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      );

      if (response.data.status === "success") {
        // Refresh equipment data and trigger re-fetch
        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${values.id}`,
          {
<<<<<<< HEAD
            status: "Not Available",
          },
          { headers: { Authorization: `Bearer ${token}` } },
        );
=======
            status:"Not Available"
         
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response)
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        fetchAssignData();
        fetchEquipmentData();
        setConfirm(true); // Optionally update confirm state to trigger UI changes
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
<<<<<<< HEAD
=======
      toast.error("Error submitting form");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    } finally {
      setLoading(false); // Set loading to false when request is finished
    }
  };

<<<<<<< HEAD
  const downloadPMSEquipmentHistory = async (laboratoryId) => {
    if (!laboratoryId) return console.error("Laboratory ID is required");

    setLoading(true);

    try {
      const response = await axios({
        // Naka-hardcode na dito ang endpoint na displayAssignHistory
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment/displayAssignHistory?laboratory=${laboratoryId}`,
        method: "GET",
        responseType: "blob",
        withCredentials: true,
      });

      // Download Logic
      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;

      // Dahil wala nang title prop, gagamit tayo ng default filename
      const filename = `Equipment_History_Report_${Date.now()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      // Cleanup
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF Download Error:", error);
      alert("No records found or unauthorized access.");
    } finally {
      setLoading(false);
    }
  };

  //para sa pag add ng scheduleMaintenance
  if (updateSched && view && TypesofMaintenance) {
    const specificMessages = view?.filter(
      (msg) => msg._id.toLowerCase() === updateSched?.toLowerCase(),
=======
  //para sa pag add ng scheduleMaintenance
  if (updateSched && view && TypesofMaintenance) {
    const specificMessages = view?.filter(
      (msg) => msg._id.toLowerCase() === updateSched?.toLowerCase()
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    );
    const equipmentId =
      specificMessages?.length > 0 ? specificMessages[0]?.EquipmentId : null;
    const Accomplishtime =
      specificMessages?.length > 0
        ? specificMessages[0]?.DateTimeAccomplish
        : null;
    const specificType = TypesofMaintenance?.filter(
<<<<<<< HEAD
      (msg) => msg.equipmentType.toLowerCase() === equipmentId?.toLowerCase(),
=======
      (msg) => msg.equipmentType.toLowerCase() === equipmentId?.toLowerCase()
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    );
    if (specificType && Accomplishtime) {
      UpdateType(specificType, Accomplishtime);
    }
  }
  return (
    <AddAssignContext.Provider
      value={{
        setupdateSched,
        addAssignEquipment,
        loading,
<<<<<<< HEAD
        confirm,downloadPMSEquipmentHistory
=======
        confirm,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      }}
    >
      {children}
    </AddAssignContext.Provider>
  );
};
