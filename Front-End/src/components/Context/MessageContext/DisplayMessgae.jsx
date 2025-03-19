import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";

export const MessageDisplayContext = createContext();

export const DisplayMessageProvider = ({ children }) => {
  const { authToken, role, userId } = useContext(AuthContext); // Retrieve token from AuthContext
  const [msg, setMessage] = useState([]);
  const [msgcount, setmsgCount] = useState([]);
  const [countPending, setCountPending]=useState([])
  useEffect(() => {
    if (!authToken) {
      setMessage(null);
      // Stop loading when there is no token
      return;
    }
    fetchDisplayMessgae();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchDisplayMessgae = async () => {
    try {
      const res = await axios.get(`http://127.0.0.1:3000/api/v1/MessageRequest`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      const MessageData = res.data.data;
  
      if (role === "user") {
        const SpecificMessages = MessageData.filter(
          (msg) => msg.EnchrageId === userId 
        );
        setMessage(SpecificMessages);
        setmsgCount(SpecificMessages.length);
      } else if (role === "Technician") {
        const SpecificMessages = MessageData.filter(
          (msg) => msg.TechnicianId === userId && msg.read === false
        );
        setCountPending(SpecificMessages.length)
        setMessage(SpecificMessages);
        setmsgCount(SpecificMessages.length);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
      setError("Failed to fetch data");
    }
  };
  

  return (
    <MessageDisplayContext.Provider
      value={{
        countPending,
        msg,
        msgcount,
        fetchDisplayMessgae
      }}
    >
      {children}
    </MessageDisplayContext.Provider>
  );
};
