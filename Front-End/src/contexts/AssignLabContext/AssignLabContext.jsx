// src/contexts/AssignLabContext/AssignLabContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "../AuthContext";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";

//  Add named export for AssignContext
export const AssignContext = createContext();

//  Also keep the default export for backward compatibility
export const AssignLabContext = AssignContext;

// Create the provider component
export const AssignLabProvider = ({ children }) => {
  const [Assignlaboratories, setAssignLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useContext(AuthContext);

  useEffect(() => {
    if (!authToken) {
      setLoading(false);
      setAssignLaboratories([]);
      return;
    }
    fetchAssignData();
  }, [authToken]);

  const fetchAssignData = async () => {
    if (!authToken) return;
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/AssignEquipment`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
      if (response.data && Array.isArray(response.data.data)) {
        setAssignLaboratories(response.data.data);
      } else {
        setError("Unexpected data format from the API.");
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AssignLabContext.Provider
      value={{
        Assignlaboratories,
        setAssignLaboratories,
        loading,
        error,
        fetchAssignData,
      }}
    >
      {children}
    </AssignLabContext.Provider>
  );
};