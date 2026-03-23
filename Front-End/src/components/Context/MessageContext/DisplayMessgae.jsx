import React, { createContext, useState, useEffect, useContext } from "react";
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
