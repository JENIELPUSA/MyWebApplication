import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const UserDisplayContext = createContext();

export const UserDisplayProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [users, setUsers] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  // Get token from localStorage
const [usersPerPage,setusersPerPage]=useState(6);
const [totalUsers, setTotalUser]=useState(0);
  useEffect(() => {
    if (!authToken) {
   
      setUsers(null);   
      setLoading(false); // Stop loading when there is no token
      return;
    }

    fetchUserData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchUserData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(
        `http://127.0.0.1:3000/api/v1/users`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      const userData =res.data.data;
      setUsers(userData);
      setTotalUser(userData.length)
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };
  return (
    <UserDisplayContext.Provider
      value={{
        users,
        loading,
        error,
        usersPerPage,
        setusersPerPage,
        currentPage,
        setCurrentPage,
        setUsers,
        fetchUserData
      }}
    >
      {children}
    </UserDisplayContext.Provider>
  );
};
