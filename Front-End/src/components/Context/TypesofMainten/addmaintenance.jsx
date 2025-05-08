import React, { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../ReusableComponent/SuccessandFailedModal";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";

export const AddTypeMaintenance = createContext();

export const AddTypeMaintenanceProvider = ({ children }) => {
  const [showModal, setShowModal] = useState(false);
const [modalStatus, setModalStatus] = useState("success"); // or "fail"
  const [displayData, setDisplayData] = useState([]);
  const [newEntries, setNewEntries] = useState(null);
   const { authToken } = useContext(AuthContext);

  // GET all type maintenance
  const fetchDisplayTypes = useCallback(async () => {
    if (!authToken) return;
    try {
      const res = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest`,
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        setDisplayData(res.data.data || []);
      }
    } catch (error) {
      console.error("Error fetching display types:", error);
      toast.error("Failed to load maintenance types.");
    }
  }, [authToken]);

  // Auto-fetch when token or new entries change
  useEffect(() => {
    fetchDisplayTypes();
  }, [fetchDisplayTypes, newEntries]);

  // ADD new type maintenance
  const Types = async (equipment, type, Laboratory,department) => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest`,
        {
          equipmentType: equipment._id,
          scheduleType: type,
          Laboratory: Laboratory.laboratoryId,
          Department:department
        },
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (res.data.status === "success") {
        setModalStatus("success");
        setNewEntries(res.data.data);
        setShowModal(true);
      }
     
    } catch (error) {
      console.error("Error assigning equipment:", error);
      setModalStatus("Failed");
      setShowModal(true);
    }
  };

  //UPDATE maintenance type (next date)
  const UpdateType = async (data, Time) => {
    const id = data?.[0]?.id;
    const scheduleType = data?.[0]?.scheduleType;

    let nextDate = new Date(Time);
    if (isNaN(nextDate)) {
      toast.error("Invalid date format.");
      return;
    }

    switch (scheduleType) {
      case "weekly":
        nextDate.setDate(nextDate.getDate() + 7);
        break;
      case "monthly":
        nextDate.setMonth(nextDate.getMonth() + 1);
        break;
      case "semi-annually":
        nextDate.setMonth(nextDate.getMonth() + 6);
        break;
      case "annually":
        nextDate.setFullYear(nextDate.getFullYear() + 1);
        break;
      default:
        nextDate.setDate(nextDate.getDate() + 7);
        break;
    }

    const payload = {
      lastMaintenanceDate: Time,
      nextMaintenanceDate: nextDate.toISOString(),
      notified: false,
    };

    try {
      if(!id)return
      await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest/${id}`,
        payload,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
    } catch (error) {
      console.error("Error updating schedule:", error);
      toast.error(error.response?.data?.message || "Update failed.");
    }
  };

  // DELETE maintenance type
  const DeleteType = async (equipment) => {
    const equipmentId = equipment?._id;
    const schedule = displayData.find((item) => item.equipmentType === equipmentId);

    if (!schedule) {
      toast.error("No matching schedule found.");
      return;
    }

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest/${schedule._id}`,
        { 
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if(response.data.status="success"){
        setModalStatus("success"); 
        setNewEntries(Date.now()); // re-trigger refresh
        setShowModal(true);
      }
    } catch (error) {
      console.error("Error deleting schedule:", error);
      setModalStatus("failed");
      setShowModal(true);
    }
  };

  return (
    <AddTypeMaintenance.Provider
      value={{
        displayData,
        Types,
        UpdateType,
        DeleteType,
      }}
    >
      {children}
        {/* Modal should be rendered here */}
    <StatusModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      status={modalStatus}
    />
    </AddTypeMaintenance.Provider>
  );
};
