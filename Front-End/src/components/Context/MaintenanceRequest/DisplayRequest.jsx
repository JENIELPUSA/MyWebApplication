import React, { createContext, useState, useEffect,useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const RequestDisplayContext = createContext();

export const DisplayRequestProvider = ({ children }) => {
  const { authToken,role,userId } = useContext(AuthContext); // Retrieve token from AuthContext
  const [request, setRequest] = useState([]); // Initialize equipment state
  const [loading, setLoading] = useState(true); // Initialize loading state
  const [error, setError] = useState(null); // Initialize error state
  const [currentPage, setCurrentPage] = useState(1);
  const [unread, setunread] = useState([]);
  const [requestPerPages, setRequestPerPage] = useState(6);
  const [unreadcount, setcountunread] = useState([0])
  const [CountSpecificData, setCountSpecificData]=useState([])
  useEffect(() => {
    if (!authToken) {
        setRequest(null);
      setLoading(false); // Stop loading when there is no token
      return;
    }
    fetchunreadRequestData();
    fetchRequestData();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchRequestData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/MaintenanceRequest`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      const requestData = res.data?.data || []; // Ensure it's always an array
      if (role === "admin") {
        setRequest(requestData);
      } else if (role === "Technician"||role === "user" ) {
        const specificMessages = requestData.filter((msg) => msg?.UserId === userId);
        const CountSpecifiData = requestData.filter((msg)=> msg.Status==="Pending" && msg.UserId===userId)
        setCountSpecificData(CountSpecifiData.length)
        setRequest(specificMessages); // Set the filtered data to state
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Ensure loading is false after fetching
    }
  };
  
  const fetchunreadRequestData = async () => {
    setLoading(true); // Set loading to true before fetching data
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/MaintenanceRequest/unreadnotification`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if(role=="admin"){
        const unreads=res.data.data
        setunread(unreads)
        setcountunread(res.data.totalUnreadRequests)  

      }

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    } finally {
      setLoading(false); // Set loading to false after data fetching is complete
    }
  };

  
  return (
    <RequestDisplayContext.Provider
      value={{
        CountSpecificData,
        request,
        loading,
        error,
        requestPerPages,
        setRequestPerPage,
        currentPage,
        setCurrentPage,
        setRequest,
        fetchRequestData,
        fetchunreadRequestData,
        unread,
        unreadcount
      }}
    >
      {children}
    </RequestDisplayContext.Provider>
  );
};
