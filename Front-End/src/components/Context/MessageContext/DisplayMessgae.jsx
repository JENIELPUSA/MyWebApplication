import React, { createContext, useState, useEffect, useContext } from "react";
<<<<<<< HEAD
=======
import axios from "axios";
import { toast } from "react-toastify";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { AuthContext } from "../AuthContext";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";

export const MessageDisplayContext = createContext();

export const DisplayMessageProvider = ({ children }) => {
  const { authToken, role, userId } = useContext(AuthContext); // Retrieve token from AuthContext
  const [msg, setMessage] = useState([]);
  const [msgcount, setmsgCount] = useState([]);
  const [countPending, setCountPending] = useState([]);
  const [ToAdmin, setToAdmin] = useState([]);
  const [ToAdminCount, setToAdminCount] = useState([]);
  useEffect(() => {
    if (!authToken) {
      setMessage([]);
      return;
    }
    fetchDisplayMessgae();
  }, [authToken]); // Dependencies to trigger effect when page or items per page change

  const fetchDisplayMessgae = async () => {
    if (!authToken) return;
<<<<<<< HEAD

    try {
      const res = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      const MessageData = res?.data.data || [];

      // 👉 Display ALL messages (walang filter)
      setMessage(MessageData);

      // 👉 Count unread messages
      const unreadMessages = MessageData.filter(
        (msg) => msg.read === false || msg.readonUser === false,
      );

      setmsgCount(unreadMessages.length);
      setCountPending(unreadMessages.length);
      setToAdmin(MessageData);
      setToAdminCount(unreadMessages.length);
    } catch (error) {
      console.error("Error fetching data:", error);
=======
    try {
      const res = await axiosInstance.get(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MessageRequest`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      const MessageData = res?.data.data;

      if (role === "User") {
        const SpecificMessages = MessageData?.filter(
          (msg) => msg.EnchrageId === userId && msg.role == "User"
        );
        setMessage(SpecificMessages);
        const unreadMessages = SpecificMessages?.filter(
          (msg) => msg.readonUser === false
        );
        setmsgCount(unreadMessages.length);
      } else if (role === "Technician") {
        const SpecificMessages = MessageData?.filter(
          (msg) => msg.TechnicianId === userId && msg.read === false
        );

        setCountPending(SpecificMessages?.length);
        setMessage(SpecificMessages);
        setmsgCount(SpecificMessages?.length);
      } else if (role === "Admin") {
        const SpecificMessagesAdmin = MessageData?.filter(
          (msg) => msg.role === "Admin"
        );
        setToAdmin(SpecificMessagesAdmin);

        // Count unread messages correctly
        const unreadCount = SpecificMessagesAdmin?.filter(
          (msg) => msg.readonUser === false
        );
        setToAdminCount(unreadCount);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
      toast.error("Failed to fetch data. Please try again later.");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  return (
    <MessageDisplayContext.Provider
      value={{
        setmsgCount,
        setMessage,
        ToAdminCount,
        ToAdmin,
        countPending,
        msg,
        msgcount,
        fetchDisplayMessgae,
      }}
    >
      {children}
    </MessageDisplayContext.Provider>
  );
};
