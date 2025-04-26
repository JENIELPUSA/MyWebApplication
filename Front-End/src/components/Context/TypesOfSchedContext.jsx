import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "./AuthContext";

export const SchedDisplayContext = createContext();

export const SchedDisplayProvider = ({ children }) => {
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
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/TypesMaintenanceRequest`, {
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const TypesSchedData = res.data.data;
      setTypesMaintenance(TypesSchedData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
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
