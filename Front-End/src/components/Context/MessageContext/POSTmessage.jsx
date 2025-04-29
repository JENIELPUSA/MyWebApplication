import React, { createContext, useState, useEffect, useContext } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import { AuthContext } from "../AuthContext";
import { io } from "socket.io-client";
import socket from "../../../../../Back-End/Utils/socket";

// Create Context
export const MessagePOSTcontext = createContext();

// Initialize a single socket instance


export const MessagePostProvider = ({ children }) => {
  const { authToken } = useContext(AuthContext);
  const [SendPost, setSendPost] = useState(null);
  const [SendPatch, setSendPatch] = useState(null);
  const [sendMsg, setSendMsg] = useState(null);

  useEffect(() => {
    if (SendPost) {
      fetchsendPost();
    }
  }, [SendPost]);

  useEffect(() => {
    if (SendPatch) {
      updatesendPost();
    }
  }, [SendPatch]);

  useEffect(() => {
    if (sendMsg) {
      updatesendMsg();
    }
  }, [sendMsg]);
console.log("PARA SA SEND POST",SendPost)
  // Function to send a new maintenance request
  const fetchsendPost = async () => {
    if (!SendPost) return;
    try {
      const response = await axios.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        {
          Status: SendPost.Status,
          role: SendPost?.role,
          message: SendPost.message,
          Laboratory: SendPost.data.Laboratory,
          Encharge: SendPost.data.Technician,
          RequestID: SendPost.data._id,
        },
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data?.status === "success") {
        //  Emit socket event
        socket.emit("newRequest", {
          message: "Admin Approved Your request!",
          data: response.data.data,
        });
      } else {
        toast.error(response.data.message || "Failed to add description");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };

  // Function to update maintenance request
  const updatesendPost = async () => {
    if (!SendPatch) return;

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${SendPatch}`,
        { Status: "Under Maintenance" },
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200) {
        socket.emit("newRequest", {
          message: "Maintenance request updated!",
          data: response.data.data,
        });
      } else {
        toast.error("Failed to update request.");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };

  // Function to update message request
  const updatesendMsg = async () => {
    if (!sendMsg) return;

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${sendMsg}`,
        { Status: "Accepted" },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 200) {
        socket.emit("newRequest", {
          message: "Message successfully updated!",
          data: response.data.data,
        });
      } else {
        toast.error("Failed to update message.");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };

  return (
    <MessagePOSTcontext.Provider value={{ setSendMsg, setSendPatch, setSendPost }}>
      {children}
    </MessagePOSTcontext.Provider>
  );
};
