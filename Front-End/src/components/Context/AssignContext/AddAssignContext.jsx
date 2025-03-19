import React, { createContext, useState, useContext } from "react";
import axios from 'axios';
import { toast } from "react-toastify";
import { AssignContext } from "../DisplayAssignContext.jsx";
import "react-toastify/dist/ReactToastify.css";
import { EquipmentDisplayContext } from "../EquipmentContext/DisplayContext.jsx";

export const AddAssignContext = createContext();

export const AddAssignProvider = ({ children }) => {
  const { fetchAssignData } = useContext(AssignContext); 
  const { fetchEquipmentData } = useContext(EquipmentDisplayContext); 
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem('token');
  const [confirm, setConfirm] = useState(null); // Initially null

  const addAssignEquipment = async (values) => {
    if (!token) {
      toast.error("Authentication required.");
      return;
    }

    setLoading(true); // Show loading indicator when starting the request

    try {
      const response = await axios.post(
        'http://127.0.0.1:3000/api/v1/AssignEquipment',
        {
          Equipments: values.id, // Selected equipment
          Laboratory: values.Laboratory, // Laboratory to assign to
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

        // Refresh equipment data and trigger re-fetch
        fetchAssignData();
        fetchEquipmentData()
        setConfirm(true); // Optionally update confirm state to trigger UI changes
    
    } catch (error) {
      console.error('Error assigning equipment:', error);
      toast.error('Error submitting form');
    } finally {
      setLoading(false); // Set loading to false when request is finished
    }
  };

  return (
    <AddAssignContext.Provider value={{ 
      addAssignEquipment, 
      loading, 
      confirm
       }}>
      {children}
    </AddAssignContext.Provider>
  );
};
