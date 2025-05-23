import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { AuthContext } from "./AuthContext";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../ReusableComponent/axiosInstance";

export const AssignContext = createContext();

// Create the provider component (para ma inject doon sa app.js)
export const AssignProvider = ({ children }) => {
  const [Assignlaboratories, setAssignLaboratories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { authToken } = useContext(AuthContext); // Retrieve token from AuthContext

  // Fetching data
  useEffect(() => {
    if (!authToken) {
      // If no authToken, set loading to false and return null
      setLoading(false);
      setAssignLaboratories([]); // Assign null to the laboratories data if no token
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
    <AssignContext.Provider
      value={{
        Assignlaboratories,
        setAssignLaboratories,
        loading,
        error,
        fetchAssignData,
      }}
    >
      {children}
    </AssignContext.Provider>
  );
};
