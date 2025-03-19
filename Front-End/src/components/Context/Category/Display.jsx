import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const CategoryDisplayContext = createContext();

export const CategoryDisplayProvider = ({ children }) => {
  const [category, setCategory] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const { authToken } = useContext(AuthContext);  // Get token from localStorage
  const [categoryPerPage, setDepartmentsPerPage] = useState(6);
  const [totalUsers, setTotalUser] = useState(0);
  useEffect(() => {
    if (!authToken) {
      setCategory(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchCategoryData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchCategoryData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/categorys`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      const categoryData = res.data.data;
      setCategory(categoryData);
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };
  return (
    <CategoryDisplayContext.Provider
      value={{
        category,
        loading,
        error,
        categoryPerPage,
        setDepartmentsPerPage,
        currentPage,
        setCurrentPage,
        setCategory,
      }}
    >
      {children}
    </CategoryDisplayContext.Provider>
  );
};
