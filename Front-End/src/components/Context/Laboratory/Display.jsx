import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext"; // Import AuthContext

export const LaboratoryDisplayContext = createContext();

export const LaboratoryDisplayProvider = ({ children }) => {
  const { authToken,role} = useContext(AuthContext); // Access token from AuthContext
  const [laboratories, setLaboratories] = useState([""]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [laboratoryPerPage, setLaboratoryPerPage] = useState(6);
  const [totalLaboratories, setTotalLaboratories] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!authToken) {
      setLaboratories(null);
      setLoading(false);
      return;
    }

    fetchLaboratoryData();
  }, [authToken, currentPage, laboratoryPerPage]); // Trigger when token, page or items per page change


  const fetchLaboratoryData = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `http://127.0.0.1:3000/api/v1/laboratory`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`, // Include the token in headers
          },
          params: {
            page: currentPage,
            limit: laboratoryPerPage,
          },
        }
      );

      const laboratoryData = res.data.data;
      setLaboratories(laboratoryData);
      setTotalLaboratories(res.data.total); // Assuming the API provides a 'total' value
    } catch (error) {
      if (error.response?.status === 401) {
        // Handle Unauthorized error
        toast.error("Unauthorized: Please log in again.");
        setError("Unauthorized: Please log in again.");
      } else {
        console.error("Error fetching data:", error);
        toast.error("Failed to fetch data. Please try again later.");
        setError("Failed to fetch data");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <LaboratoryDisplayContext.Provider
      value={{
        laboratories,
        loading,
        error,
        setLaboratories,
        setLaboratoryPerPage,
        laboratoryPerPage,
        currentPage,
        setCurrentPage,
        fetchLaboratoryData
      }}
    >
      {children}
    </LaboratoryDisplayContext.Provider>
  );
};
