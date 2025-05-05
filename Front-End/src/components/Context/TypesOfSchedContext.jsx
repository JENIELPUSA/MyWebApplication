import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../ReusableComponent/axiosInstance";

export const SchedDisplayContext = createContext();

export const SchedDisplayProvider = ({ children }) => {
  
const [error, setError] = useState(null);
  const [customError, setCustomError] = useState("");
  const { authToken } = useContext(AuthContext); // Retrieve token from AuthContext
  const [TypesofMaintenance, setTypesMaintenance] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  useEffect(() => {
    if (!authToken) {
        setTypesMaintenance(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchCategoryData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchCategoryData = async () => {
    if (!authToken) {
      console.log("No authToken available");
      return; // If no authToken, exit
    }
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
  
      const TypesSchedData = res.data.data;
      setTypesMaintenance(TypesSchedData); // Set the data in the state
    } catch (error) {
      // Handling errors from the API
      console.error("Fetch error:", error); // Log the full error to understand more
      if (error.response && error.response.data) {
        const errorData = error.response.data;
        const message =
          typeof errorData === "string"
            ? errorData
            : errorData.message || errorData.error || "Something went wrong.";
        setCustomError(message); // Set the error message
      } else if (error.request) {
        setCustomError("No response from the server."); // Network issue
      } else {
        setCustomError(error.message || "Unexpected error occurred."); // Other issues
      }
    }
  };
  

  
  return (
    <SchedDisplayContext.Provider
      value={{
        TypesofMaintenance
      }}
    >
      {children}
    </SchedDisplayContext.Provider>
  );
};
