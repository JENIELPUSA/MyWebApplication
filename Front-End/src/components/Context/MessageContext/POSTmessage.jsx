<<<<<<< HEAD
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
=======
import React, { createContext, useState, useEffect, useContext,useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { AuthContext } from "../AuthContext";
import { io } from "socket.io-client";
import socket from "../../../socket";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";

// Create Context
export const MessagePOSTcontext = createContext();

// Initialize a single socket instance

<<<<<<< HEAD
=======

>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
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
<<<<<<< HEAD

=======
  
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  useEffect(() => {
    if (sendMsg) {
      updatesendMsg();
    }
  }, [sendMsg]);
  // Function to send a new maintenance request
  const fetchsendPost = async () => {
    if (!SendPost) return;
<<<<<<< HEAD

    try {
      // Kunin ang encharge/assigned technician ID
      const enchargeId = SendPost.data.Technician;

=======
    try {
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      const response = await axiosInstance.post(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        {
          Status: SendPost.Status,
          role: SendPost?.role,
          message: SendPost.message,
          Laboratory: SendPost.data.Laboratory,
<<<<<<< HEAD
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
=======
          Encharge: SendPost.data.Technician,
          RequestID: SendPost.data._id,
        },
        { withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data?.status === "success") {
        //  Emit socket event
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        socket.emit("newRequest", {
          message: "Admin Approved Your request!",
          data: response.data.data,
        });

<<<<<<< HEAD
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

=======
     
      } else {
        toast.error(response.data.message || "Failed to add description");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };
  const updatesendPost = async () => {
    if (!SendPatch) return;
  
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${SendPatch}`,
        { Status: "Under Maintenance" },
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
<<<<<<< HEAD
        },
      );

      if (response.data?.status === "success") {
        socket.emit("RequestMaintenance", response.data.data);
      }
    } catch (error) {
      console.error("Error updating request:", error);
    }
  };
=======
        }
      );
  
      if (response.data?.status === "success") {
        socket.emit("RequestMaintenance",response.data.data)
      } else {
        toast.error(response.data.message || "Failed to add description");
      }
    } catch (error) {
      console.error("Error updating request:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
    }
  };
  
  
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  // Function to update message request
  const updatesendMsg = async () => {
    if (!sendMsg) return;

    try {
      const response = await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${sendMsg}`,
        { Status: "Accepted" },
<<<<<<< HEAD
        { headers: { Authorization: `Bearer ${authToken}` } },
=======
        { headers: { Authorization: `Bearer ${authToken}` } }
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      );

      if (response.status === 200) {
        socket.emit("newRequest", {
          message: "Message successfully updated!",
          data: response.data.data,
        });
<<<<<<< HEAD
      }
    } catch (error) {
      console.error("Error updating message:", error);
=======
      } else {
        toast.error("Failed to update message.");
      }
    } catch (error) {
      console.error("Error updating message:", error);
      toast.error(error.response?.data?.message || "An unexpected error occurred.");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  return (
<<<<<<< HEAD
    <MessagePOSTcontext.Provider
      value={{ setSendMsg, setSendPatch, setSendPost }}
    >
=======
    <MessagePOSTcontext.Provider value={{ setSendMsg, setSendPatch, setSendPost }}>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      {children}
    </MessagePOSTcontext.Provider>
  );
};
