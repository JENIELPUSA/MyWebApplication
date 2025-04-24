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
  const[ToAdmin,setToAdmin]=useState([]);
  const [ToAdminCount,setToAdminCount]=useState([])
  useEffect(() => {

    console.log("DISPLAY MESSAGE")
    if (!authToken) {
      setMessage(null);
      // Stop loading when there is no token
      return;
    }
    fetchDisplayMessgae();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchDisplayMessgae = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });
  
      const MessageData = res?.data.data;
  
      if (role === "user") {
        const SpecificMessages = MessageData.filter(  
          (msg) => msg.EnchrageId === userId  && msg.role=="user"
        );
        setMessage(SpecificMessages);
        const unreadMessages = SpecificMessages.filter(msg => msg.readonUser === false);
        setmsgCount(unreadMessages.length);
      } else if (role === "Technician") {
        const SpecificMessages = MessageData.filter(
          (msg) => msg.TechnicianId === userId && msg.read === false
        );

        setCountPending(SpecificMessages.length)
        setMessage(SpecificMessages);
        setmsgCount(SpecificMessages.length);
      }else if (role === "admin") {
  const SpecificMessagesAdmin = MessageData.filter((msg) => msg.role === "admin");
  setToAdmin(SpecificMessagesAdmin);

  // Count unread messages correctly
  const unreadCount = SpecificMessagesAdmin.filter(msg => msg.readonUser === false);
  setToAdminCount(unreadCount);
}

    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
    }
  };
  

  return (
    <MessageDisplayContext.Provider
      value={{
        ToAdminCount,
        ToAdmin,
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
