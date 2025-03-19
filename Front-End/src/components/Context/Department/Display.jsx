import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const DepartmentDisplayContext = createContext();

export const DepartmentDisplayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext); // Retrieve token from AuthContext
  const [department, setDepartment] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  
  const [departmentPerPage, setDepartmentsPerPage] = useState(6);
  useEffect(() => {
    if (!authToken) {
      setDepartment(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchCategoryData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchCategoryData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/departments`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const DepartmentData = res.data.data;
      setDepartment(DepartmentData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };
  return (
    <DepartmentDisplayContext.Provider
      value={{
        department,
        loading,
        error,
        departmentPerPage,
        setDepartmentsPerPage,
        currentPage,
        setCurrentPage,
        setDepartment,
      }}
    >
      {children}
    </DepartmentDisplayContext.Provider>
  );
};
