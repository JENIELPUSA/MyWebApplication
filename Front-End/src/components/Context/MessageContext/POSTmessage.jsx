import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { AuthContext } from "../AuthContext";
import { io } from "socket.io-client";
import socket from "../../../socket";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";

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
  // Function to send a new maintenance request
  const fetchsendPost = async () => {
    if (!SendPost) return;

    try {
      // Kunin ang encharge/assigned technician ID
      const enchargeId = SendPost.data.Technician;

      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        {
          Status: SendPost.Status,
          role: SendPost?.role,
          message: SendPost.message,
          Laboratory: SendPost.data.Laboratory,
          Encharge: SendPost.data.Technician, // Para sa backend
          RequestID: SendPost.data._id,
          types:"AssignedTechnician",
          // Sa viewers ilalagay natin ang encharge
          viewers: enchargeId
            ? [
                {
                  user: enchargeId,
                  isRead: false,
                },
              ]
            : [],
        },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (response.data?.status === "success") {
        // Emit socket event
        socket.emit("newRequest", {
          message: "Admin Approved Your request!",
          data: response.data.data,
        });

        console.log(
          "Message successfully sent and viewers set:",
          response.data.data,
        );
      }
    } catch (error) {
      console.error("Error:", error);
    }
  };

  const updatesendPost = async () => {
    if (!SendPatch) return;

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${SendPatch}`,
        { Status: "Under Maintenance" },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        },
      );

      if (response.data?.status === "success") {
        socket.emit("RequestMaintenance", response.data.data);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };

  // Function to update message request
  const updatesendMsg = async () => {
    if (!sendMsg) return;

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${sendMsg}`,
        { Status: "Accepted" },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );

      if (response.status === 200) {
        socket.emit("newRequest", {
          message: "Message successfully updated!",
          data: response.data.data,
        });
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  return (
    <MessagePOSTcontext.Provider
      value={{ setSendMsg, setSendPatch, setSendPost }}
    >
      {children}
    </MessagePOSTcontext.Provider>
  );
};
