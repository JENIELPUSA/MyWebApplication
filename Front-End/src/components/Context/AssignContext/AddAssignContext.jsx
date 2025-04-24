import React, { createContext, useState, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AssignContext } from "../DisplayAssignContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import { EquipmentDisplayContext } from "../EquipmentContext/DisplayContext.jsx";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest.jsx";
import { SchedDisplayContext } from "../TypesOfSchedContext.jsx";
import { AddTypeMaintenance } from "../TypesofMainten/addmaintenance.jsx";
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
      toast.error("Authentication required.");
      return;
    }

    setLoading(true); // Show loading indicator when starting the request

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          Equipments: values.id, // Selected equipment
          Laboratory: values.Laboratory, // Laboratory to assign to
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === "success") {
        // Refresh equipment data and trigger re-fetch
        const response = await axios.patch(
          `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/equipment/${values.id}`,
          {
            status:"Not Available"
         
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log(response)
        fetchAssignData();
        fetchEquipmentData();
        setConfirm(true); // Optionally update confirm state to trigger UI changes
      }
    } catch (error) {
      console.error("Error assigning equipment:", error);
      toast.error("Error submitting form");
    } finally {
      setLoading(false); // Set loading to false when request is finished
    }
  };

  //para sa pag add ng scheduleMaintenance
  if (updateSched && view && TypesofMaintenance) {
    const specificMessages = view?.filter(
      (msg) => msg._id.toLowerCase() === updateSched?.toLowerCase()
    );
    const equipmentId =
      specificMessages?.length > 0 ? specificMessages[0]?.EquipmentId : null;
    const Accomplishtime =
      specificMessages?.length > 0
        ? specificMessages[0]?.DateTimeAccomplish
        : null;
    const specificType = TypesofMaintenance?.filter(
      (msg) => msg.equipmentType.toLowerCase() === equipmentId?.toLowerCase()
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
        confirm,
      }}
    >
      {children}
    </AddAssignContext.Provider>
  );
};
