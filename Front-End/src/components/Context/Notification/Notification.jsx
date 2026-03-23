<<<<<<< HEAD
import React, { useState, useEffect, useContext, useCallback } from "react";
=======
import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
import { FaBell } from "react-icons/fa";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";
import { MessageDisplayContext } from "../MessageContext/DisplayMessgae";
import { AuthContext } from "../AuthContext";
<<<<<<< HEAD
import LoadingSpinner from "../../ReusableComponent/loadingSpiner";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";
import { motion, AnimatePresence } from "framer-motion";
import { PostEmailContext } from "../EmailContext/SendNotificationContext";
import { AddAssignContext } from "../AssignContext/AddAssignContext";
import socket from "../../../socket";
import axiosInstance from "../../ReusableComponent/axiosInstance";

const Notification = ({ toggleTechnicianModal }) => {
  const { role, authToken, userId, fullName } = useContext(AuthContext);
  const { triggerSendEmail, setToAdmin } = useContext(PostEmailContext);
  const { setSendPatch, setSendMsg, setSendPost } =
    useContext(MessagePOSTcontext);
  const { request, setRequest, fetchRequestData } = useContext(
    RequestDisplayContext,
  );
  const { ToAdminCount, ToAdmin, msg, fetchDisplayMessgae, msgcount } =
    useContext(MessageDisplayContext);

=======
import { toast } from "react-toastify";
import axios from "axios";
import LoadingSpinner from "../../ReusableComponent/loadingSpiner";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";
import {
  motion,
  AnimatePresence,
  useScroll,
  useTransform,
} from "framer-motion";
import { PostEmailContext } from "../EmailContext/SendNotificationContext";
import { AddAssignContext } from "../AssignContext/AddAssignContext";
import socket from "../../../socket";
//gagamit tayo nito kung gusto mo ng auto log out agad instead na axios ilagay
//mo siya sa reausable axiosInstances.jsx
import axiosInstance from "../../ReusableComponent/axiosInstance";

const Notification = ({ toggleTechnicianModal }) => {
  const { role, authToken, userId,fullName } = useContext(AuthContext);
  const { triggerSendEmail, setToAdmin } = useContext(PostEmailContext);
  const { setSendPatch, setSendMsg, setSendPost } =
    useContext(MessagePOSTcontext);
  const {
    AdminMsg,
    setAdminMsg,
    request,
    setRequest,
    CountSpecificData,
    setCountSpecificData,
    fetchRequestData,
  } = useContext(RequestDisplayContext);
  const {
    ToAdminCount,
    ToAdmin,
    msg,
    setMessage,
    msgcount,
    setmsgCount,
    fetchDisplayMessgae,
  } = useContext(MessageDisplayContext);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const [loading, setLoading] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());
  const hasUnread = msg?.some((message) => message.readonUser === false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { setupdateSched } = useContext(AddAssignContext);
<<<<<<< HEAD
  const [CountBadge, setCountBadge] = useState(0);
  const [TechBadge, setTechBadge] = useState(0);
=======
  const [CountBadge, setCountBadge] = useState([]);
  const [TechBadge, setTechBadge] = useState([]);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae

  const [values, setValues] = useState({
    feedback: "",
  });

<<<<<<< HEAD
  console.log("msg", msg);

  // --- LOGIC FOR BADGE COUNTING (No changes) ---
  useEffect(() => {
    if (role === "Admin") {
      const pendingRequests = (request || []).filter(
        (msg) => msg?.read === false,
      );
      setCountBadge(pendingRequests.length);
    } else if (role === "Technician") {
      const filteredList = (request || []).filter((item) => {
        const techName =
          typeof item.Technician === "string"
            ? item.Technician.trim().toLowerCase()
            : "";
        const targetName = fullName
          ? fullName.toString().trim().toLowerCase()
          : "";
        return (
          item.UserId && techName === targetName && item.Status === "Pending"
        );
      });
      setTechBadge(filteredList.length);
    }
  }, [request, userId, role, fullName]);

  // --- SOCKET IO LOGIC (No changes) ---
  useEffect(() => {
    const handleAddMaintenance = (data) => {
      setRequest((prev) => {
        const exists = prev.some(
          (item) => item._id?.toString() === data._id?.toString(),
        );
        return !exists ? [...prev, data] : prev;
      });
    };
    const hanleSMSnotification = () => fetchDisplayMessgae();
    const handleUpdateMaintenance = (data) => {
      setRequest((prev) => {
        const index = prev.findIndex(
          (item) => item._id?.toString() === data._id?.toString(),
=======
  useEffect(() => {
    if (role === "Admin") {
      // Filter to get only 'Pending' status items
      const pendingRequests = request?.filter((msg) => msg?.read === false);
      // Log or display the filtered result
      console.log("ADMIN",pendingRequests)
      setCountBadge(pendingRequests.length);
    } else if (role === "Technician") {
      const filteredList = request.filter((item) => {
        const techName = typeof item.Technician === "string" ? item.Technician.trim().toLowerCase() : "";
        const targetName = fullName.trim().toLowerCase();
        return item.UserId && techName === targetName && item.Status === "Pending";
      });

      console.log(userId);
      setTechBadge(filteredList.length);
      console.log(filteredList);
    }
  }, [request, userId, role]);

  //para sa soket io mag update ang badges kahit hindi kailangan e refresh ang buong component
  useEffect(() => {
    // ADD handler
    const handleAddMaintenance = (data) => {
      setRequest((prev) => {
        const exists = prev.some(
          (item) => item._id?.toString() === data._id?.toString()
        );
        if (!exists) {
          return [...prev, data];
        } else {
          console.log("Item already exists, skipping add:", data._id);
          return prev;
        }
      });
    };

    const hanleSMSnotification = (data) => {
      fetchDisplayMessgae();
    };

    // UPDATE handler
    const handleUpdateMaintenance = (data) => {
      setRequest((prev) => {
        const index = prev.findIndex(
          (item) => item._id?.toString() === data._id?.toString()
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        );
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
<<<<<<< HEAD
          return updated;
        }
        return prev;
      });
    };
    socket.on("Maintenance", handleAddMaintenance);
    socket.on("UpdateMaintenance", handleUpdateMaintenance);
    socket.on("SMSNotification", hanleSMSnotification);
    return () => {
      socket.off("Maintenance", handleAddMaintenance);
      socket.off("UpdateMaintenance", handleUpdateMaintenance);
      socket.off("SMSNotification", hanleSMSnotification);
    };
  }, [fetchDisplayMessgae, setRequest]);

  // --- READ STATUS UPDATE (No changes) ---
  useEffect(() => {
    if (isNotificationOpen) {
      if (role === "User" && msg?.length > 0 && hasUnread) {
        ReadOnUpdate(msg.map((item) => item._id));
      } else if (role === "Admin" && ToAdmin?.length > 0) {
        ReadOnUpdate(ToAdmin.map((item) => item._id));
=======
          console.log("Updated item:", data._id);
          return updated;
        }
        return prev; // If not found, no update
      });
    };

    // Bind socket events
    socket.on("Maintenance", handleAddMaintenance);
    socket.on("UpdateMaintenance", handleUpdateMaintenance);
    socket.on("SMSNotification", hanleSMSnotification);

    // Cleanup
    return () => {
      socket.off("AddMaintenance", handleAddMaintenance);
      socket.off("UpdateMaintenance", handleUpdateMaintenance);
      socket.off("SMSNotification", hanleSMSnotification);
    };
  }, []);

  useEffect(() => {
    if (isNotificationOpen) {
      if (role === "User" && msg.length > 0 && hasUnread) {
        const allLaboratoryIds = msg.map((item) => item._id);
        ReadOnUpdate(allLaboratoryIds);
      } else if (role === "Admin" && ToAdmin?.length > 0) {
        const allLaboratoryIds = ToAdmin.map((item) => item._id);
        ReadOnUpdate(allLaboratoryIds);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
      }
    }
  }, [isNotificationOpen, role, msg, hasUnread, ToAdmin]);

  const updateRequest = async ({ url, updateData, socketEvent, msgId }) => {
    try {
      const response = await axiosInstance.patch(url, updateData, {
<<<<<<< HEAD
        headers: { Authorization: `Bearer ${authToken}` },
      });
      if (response.status === 200 || response.data.status === "success") {
        if (socketEvent) {
          socket.emit(socketEvent, {
            message: "Update made!",
            data: response.data.data,
          });
          socket.emit("RequestMaintenance", response.data.data);
        }
        if (msgId) updatesendMsg(msgId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const onSelectMessage = async (requestID, message) => {
    if (loading) return;
    setLoading(requestID);
    try {
      await new Promise((res) => setTimeout(res, 1000));
      setSendPatch(requestID);
      setSendMsg(message);
      setClickedRows((prev) => new Set(prev).add(requestID));
    } finally {
      setLoading(null);
    }
  };

=======
        withCredentials: true,
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.status === 200 || response.data.status === "success") {
        if (socketEvent) {
          socket.emit(socketEvent, {
            message: "A new update has been made!",
            data: response.data.data, // Pass updated data
          });

          socket.emit("RequestMaintenance", response.data.data);
        }
        if (msgId) {
          updatesendMsg(msgId);
        }
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  const onSelectMessage = async (request, message) => {
    // Preventing further execution if already loading
    if (loading) return;

    console.log("Starting operation for RequestID:", request);
    setLoading(request); // Set loading state to specific request ID

    try {
      await new Promise((res) => setTimeout(res, 1000)); // Simulate some operation delay
      setSendPatch(request); // Set the data to be sent
      setSendMsg(message); // Set the message data
      setClickedRows((prev) => new Set(prev).add(request)); // Add to clicked rows
    } catch (error) {
      console.error("Error occurred during operation:", error);
    } finally {
      setLoading(null); // Reset loading state after operation completes
      console.log("Resetting loading state.");
    }
  };

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: { duration: 0.3, ease: "easeOut" },
    },
    exit: { opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.2 } },
  };
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  const getSpecificID = async (requestID) => {
    if (!authToken) return;
    try {
      const response = await axiosInstance.get(
<<<<<<< HEAD
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/getbyId/${requestID}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      if (response.data?.status === "success") {
        const requestInfo = response.data.data[0];
        setSendPost({
          ...response.data,
=======
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest/getbyId/${requestID}`,
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );

      if (response.data?.status === "success") {
        const result = response.data;
        const requestInfo = result.data[0]; // <- extract the actual object

        setSendPost({
          ...result,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
          message: `The assigned request in ${requestInfo.Department} / ${requestInfo.laboratoryName} has been completed!`,
          Status: "Accepted",
          role: "Admin",
        });
<<<<<<< HEAD
      }
    } catch (error) {
      console.error(error);
=======

        setValues({ Remarks: "" });
      } else {
        toast.error(
          response.data?.message || "Failed to update maintenance request"
        );
      }
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      toast.error(
        error.response?.data?.message ||
          "Error submitting form. Please try again."
      );
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  const acceptVerification = useCallback(
    async (req, msgId) => {
      if (loading) return;
<<<<<<< HEAD
      const requestID = req.RequestID;
      setLoading(req);
      try {
        setupdateSched(requestID);
        await getSpecificID(requestID);
        const feedbackData = {
          Status: "Success",
          feedback: values[requestID] || "",
          DateTimeAccomplish: new Date(),
        };
        await Promise.all([
          updateRequest({
            url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${requestID}`,
            updateData: feedbackData,
            socketEvent: "RequestMaintenance",
          }),
          updateRequest({
            url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${msgId}`,
            updateData: { read: true },
            socketEvent: "newRequest",
          }),
        ]);
        handlesend(req);
        setValues((prev) => ({ ...prev, [requestID]: "" }));
      } finally {
        setLoading(null);
      }
    },
    [values, loading, authToken],
=======
      setLoading(req);
      const requestID = req.RequestID;

      try {
        setupdateSched(requestID);
        await getSpecificID(requestID); // optionally await

        const feedbackData = {
          Status: "Success",
          feedback: values[requestID] || "", //Use per-request feedback
          DateTimeAccomplish: new Date(),
        };

        const feedbackDataMsg = { read: true };

        await Promise.all([
          updateRequest({
            url: `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/v1/MaintenanceRequest/${requestID}`,
            updateData: feedbackData,
            withCredentials: true,
            socketEvent: "RequestMaintenance",
          }),
          updateRequest({
            url: `${
              import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
            }/api/v1/MessageRequest/${msgId}`,
            updateData: feedbackDataMsg,
            withCredentials: true,
            socketEvent: "newRequest",
          }),
        ]);

        handlesend();
        // Clear textarea after submission
        setValues((prev) => ({
          ...prev,
          [requestID]: "",
        }));
      } catch (error) {
        console.error("Error occurred during operation:", error);
      } finally {
        setLoading(null); // Reset loading state
        console.log("Resetting loading state.");
      }
    },
    [values, updateRequest]
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  );

  const updatesendMsg = useCallback(
    async (data) => {
<<<<<<< HEAD
      await updateRequest({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${data}`,
        updateData: { read: true },
        socketEvent: "RequestMaintenance",
      });
    },
    [updateRequest],
=======
      const feedbackDataMsg = {
        read: true,
      };
      await updateRequest({
        url: `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MessageRequest/${data}`,
        updateData: feedbackDataMsg,
        withCredentials: true, // Sending an object instead of just the text
        socketEvent: "RequestMaintenance",
      });
    },
    [updateRequest]
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  );

  const handlesend = (data) => {
    setToAdmin(data);
<<<<<<< HEAD
    triggerSendEmail(`Hello Admin, completed.\nRef: ${data?.Ref}`);
=======
    const message = `Hello Admin, the assigned request has been completed.\nDetails:\nRequest Reference: ${data?.Ref}\nSend By: Technician`;
    triggerSendEmail(message);
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
  };

  const acceptRemarks = async (data) => {
    if (loading) return;
    setLoading(data);
    try {
      await updateRequest({
<<<<<<< HEAD
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${data.RequestID}`,
=======
        url: `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest/${data.RequestID}`,
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        updateData: { remarksread: true },
        socketEvent: "newRequest",
        msgId: data._id,
      });
<<<<<<< HEAD
    } finally {
      setLoading(null);
=======
    } catch (error) {
      console.error("Error occurred during operation:", error);
    } finally {
      setLoading(null); // Reset loading state after operation completes
      console.log("Resetting loading state.");
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
    }
  };

  async function ReadOnUpdate(Id) {
<<<<<<< HEAD
    if (!authToken || !Id.length) return;
    try {
      await axiosInstance.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        { laboratoryIds: Id, readonUpdate: true },
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
    } catch (error) {
      console.error(error);
    }
  }

  const dropdownVariants = {
    hidden: { opacity: 0, y: -10, scale: 0.95 },
    visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -10, scale: 0.95 },
  };

  return (
    <div className="relative text-blue-700 cursor-pointer">
      {/* Icon Color - Yellow on hover */}
      <FaBell
        className="w-6 h-6 hover:text-yellow-400 transition-colors"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      />

      {/* Badge Color - Yellow Bg, Blue Text */}
      {((role === "Admin" && CountBadge) ||
        ToAdminCount?.length > 0 ||
        (role === "Technician" && TechBadge > 0) ||
        (role === "User" && msgcount > 0)) && (
        <span className="absolute -top-1 -right-2 bg-yellow-400 text-blue-900 font-black text-[10px] rounded-full px-1.5 border border-blue-900">
          {role === "Admin"
            ? CountBadge + (ToAdminCount?.length || 0)
            : role === "Technician"
              ? TechBadge
              : msgcount}
        </span>
      )}

      <AnimatePresence onExitComplete={() => fetchDisplayMessgae()}>
=======
    if (!authToken) return;
    try {
      const response = await axiosInstance.patch(
        `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MessageRequest`,
        { laboratoryIds: Id, readonUpdate: true }, //Pasa bilang JSON body
        {
          withCredentials: true,
          headers: { Authorization: `Bearer ${authToken}` },
        }
      );
    } catch (error) {
      console.error("Error updating messages:", error);
      toast.error(error.response?.data?.message || "Error submitting request.");
    }
  }

  return (
    <div className="relative text-white cursor-pointer">
      <FaBell
        className="w-6 h-6"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      />

      {(role === "Admin" && CountBadge) ||
      ToAdminCount.length > 0 ||
      (role === "Technician" && TechBadge > 0) ||
      (role === "User" && msgcount > 0) ? (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {role === "Admin" && ToAdminCount
            ? CountBadge + ToAdminCount.length
            : role === "Technician"
            ? TechBadge
            : msgcount}
        </span>
      ) : null}
      <AnimatePresence
        //Purpose nito ay para once matapos nang ma open ang bill ay mag refresh siya
        onExitComplete={() => {
          fetchDisplayMessgae();
        }}
      >
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
        {isNotificationOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
<<<<<<< HEAD
            className="absolute bg-blue-900 shadow-2xl rounded-xl top-full right-0 mt-4 p-4 text-white border-2 border-yellow-400 w-72 lg:w-80 max-h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-yellow-400 scrollbar-track-blue-800"
          >
            <div className="flex justify-between items-center mb-3 border-b border-blue-700 pb-2">
              <span className="font-black uppercase text-xs tracking-widest text-yellow-400">
                Notifications
              </span>
              <span className="text-[10px] bg-blue-800 px-2 py-0.5 rounded text-blue-200">
                System
              </span>
            </div>

            {role === "Admin" &&
            (request?.length > 0 || ToAdmin?.length > 0) ? (
              <>
                {[...request, ...ToAdmin]
                  .filter((item) => item?.DateTime)
                  .sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime))
                  .slice(0, 30)
                  .map((req, index) => (
                    <div
                      key={index}
                      className="mb-4 bg-blue-800/50 p-3 rounded-lg border border-blue-700/50 hover:border-yellow-400/50 transition-all"
                    >
                      <h1 className="text-xs font-black text-yellow-400 uppercase">
                        {req.Department !== "N/A" &&
                        req.laboratoryName !== "N/A"
                          ? `${req.Department} / ${req.laboratoryName}`
                          : req.Department !== "N/A"
                            ? req.Department
                            : req.laboratoryName}
                      </h1>
                      <h4 className="text-[11px] font-bold text-white mt-1">
                        {req.CategoryName && req.EquipmentName
                          ? `${req.CategoryName} / ${req.EquipmentName}`
                          : req.CategoryName || req.EquipmentName}
                      </h4>
                      <time className="text-[9px] text-blue-300 block mt-1 italic">
                        {new Date(req.DateTime).toLocaleString()}
                      </time>
                      <p className="text-[11px] text-gray-200 mt-2 leading-relaxed">
                        {ToAdmin.includes(req) ? (
                          req.message
                        ) : req.read === false && req.Ref ? (
                          <>
                            Maintenance Request:{" "}
                            <span
                              onClick={() => toggleTechnicianModal(req)}
                              className="text-yellow-400 underline font-bold cursor-pointer"
                            >
                              {req.Ref}
                            </span>
                          </>
                        ) : (
                          req.message
                        )}
                      </p>
=======
            className="absolute bg-white/30 backdrop-blur-md shadow-lg rounded-md text-align: justify 
            xs:w-60 lg:w-80 top-full right-0 mt-4 p-4 text-black border border-white/20 
            max-h-[400px] overflow-y-auto 
            scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800
          "
          >
            {role === "Admin" &&
            (request?.length > 0 || ToAdmin?.length > 0) ? (
              <>
                {/*Merge and Sort All Notifications */}
                {[...request, ...ToAdmin]
                  .filter((item) => item?.DateTime) // Remove undefined/null DateTime
                  .sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime)) // Sort by latest DateTime
                  .slice(0, 30) // Get only the latest 30
                  .map((req, index) => (
                    <div key={index} className="mb-2">
                      {(req.Department !== "N/A" ||
                        req.laboratoryName !== "N/A") && (
                        <h1 className="xs:text-sm sm:text-lg lg:text-lg font-bold text-gray-700">
                          {req.Department !== "N/A" &&
                          req.laboratoryName !== "N/A"
                            ? `${req.Department} / ${req.laboratoryName}`
                            : req.Department !== "N/A"
                            ? req.Department
                            : req.laboratoryName}
                        </h1>
                      )}

                      {(req.CategoryName || req.EquipmentName) && (
                        <h4 className="xs:text-sm sm:text-lg lg:text-lg text-gray-700">
                          {req.CategoryName && req.EquipmentName
                            ? `${req.CategoryName} / ${req.EquipmentName}`
                            : req.CategoryName || req.EquipmentName}
                        </h4>
                      )}

                      <time className="text-sm text-gray-500 block">
                        {new Intl.DateTimeFormat("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "2-digit",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                          hour12: true,
                        }).format(new Date(req.DateTime))}
                      </time>
                      <p className="text-gray-500">
                        {ToAdmin.includes(req) ? (
                          req.message // If it's from ToAdmin, show message
                        ) : req.read === false && req.Ref ? (
                          <>
                            has a Maintenance Request / Ref#:{" "}
                            <a
                              onClick={() => toggleTechnicianModal(req)}
                              className="text-blue-400 hover:underline"
                            >
                              {req.Ref || "Unknown Request"}
                            </a>
                          </>
                        ) : (
                          req.message
                        )}{" "}
                      </p>

                      {index !== request.length - 1 && (
                        <hr className="my-2 border-gray-400/50" />
                      )}
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                    </div>
                  ))}
              </>
            ) : (role === "Technician" && msgcount > 0) || role === "User" ? (
<<<<<<< HEAD
              [...(msg || [])]
                .filter((item) => item?.DateTime)
                .sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime))
                .map((req, index) => (
                  <div
                    key={index}
                    className="mb-4 bg-blue-800/50 p-3 rounded-lg border border-blue-700"
                  >
                    <time className="text-[9px] text-blue-300 italic mb-1 block">
                      {new Date(req.DateTime).toLocaleString()}
                    </time>
                    <p className="text-[11px] text-white font-semibold">
                      {role === "Technician" &&
                      req.types === "AssignedTechnician"
                        ? `Admin assigned you to troubleshooting in ${req.laboratoryName} / Ref#: ${req.Ref}`
                        : req.message}
                    </p>

                    {/* Action Buttons: Yellow background, Blue text */}
                    {role === "Technician" &&
                      req.Status === "Pending" &&
                      req.types === "AssignedTechnician" && (
                        <button
                          onClick={() =>
                            onSelectMessage(req.RequestID, req._id)
                          }
                          disabled={
                            clickedRows.has(req.RequestID) ||
                            loading === req.RequestID
                          }
                          className="mt-3 w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-[10px] font-black uppercase py-2 rounded-lg transition-all shadow-md disabled:opacity-50"
                        >
                          {loading === req.RequestID ? (
                            <LoadingSpinner />
                          ) : (
                            "Accept Task"
                          )}
                        </button>
                      )}

                    {role === "User" && req.read === false && (
                      <div className="mt-2">
                        {req.message.includes("verification") ? (
                          <button
                            onClick={() => acceptRemarks(req)}
                            disabled={clickedRows.has(req) || loading === req}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-[10px] font-black uppercase py-2 rounded-lg transition-all"
                          >
                            {loading === req ? (
                              <LoadingSpinner />
                            ) : (
                              "Approve Remark"
                            )}
                          </button>
                        ) : req.message.includes("Feedback") ? (
                          <div className="space-y-2">
                            <textarea
                              className="w-full p-2 bg-blue-950 border border-blue-700 rounded-lg text-white text-[11px] focus:border-yellow-400 outline-none"
                              rows="2"
                              placeholder="Type feedback here..."
=======
              [...msg]
                .filter((item) => item?.DateTime) // Remove undefined/null DateTime
                .sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime)) // Sort by latest DateTime
                .map((req, index) => (
                  <div key={index} className="mb-2">
                    {/* Technician View */}
                    {role === "Technician" && (
                      <div>
                        {req.message ===
                          "Admin Already Assign Technician to your Laboratory!" && (
                          <>
                            <time className="text-sm text-gray-500 block">
                              {new Intl.DateTimeFormat("en-US", {
                                year: "numeric",
                                month: "long",
                                day: "2-digit",
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: true,
                              }).format(new Date(req.DateTime))}
                            </time>
                            <p className="text-gray-500 font-bold">
                              Admin has assigned you to troubleshoot equipment
                              in {req.laboratoryName} / Ref#: {req.Ref}
                            </p>
                          </>
                        )}

                        {req.message ===
                          "Admin Already Assign Technician to your Laboratory!" &&
                          req.Status === "Pending" && (
                            <button
                              onClick={() =>
                                onSelectMessage(req.RequestID, req._id)
                              }
                              type="button"
                              className={`mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10
                              ${
                                clickedRows.has(req.RequestID)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                              disabled={
                                clickedRows.has(req.RequestID) ||
                                loading === req.RequestID
                              }
                            >
                              {loading === req.RequestID ? (
                                <LoadingSpinner />
                              ) : (
                                "Accept"
                              )}
                            </button>
                          )}
                      </div>
                    )}

                    {/* User View */}
                    {role === "User" && (
                      <div>
                        <time className="text-sm text-gray-500 block">
                          {new Intl.DateTimeFormat("en-US", {
                            year: "numeric",
                            month: "long",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                            second: "2-digit",
                            hour12: true,
                          }).format(new Date(req.DateTime))}
                        </time>
                        <p className="text-gray-500 font-bold">{req.message}</p>
                        {req.read === false &&
                        req.message ===
                          "I need your verification to approve a remark from the technician." ? (
                          <button
                            onClick={() => acceptRemarks(req)}
                            type="button"
                            className={`mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10
                              ${
                                clickedRows.has(req)
                                  ? "opacity-50 cursor-not-allowed"
                                  : ""
                              }`}
                            disabled={clickedRows.has(req) || loading === req}
                          >
                            {loading === req ? <LoadingSpinner /> : "Approve"}
                          </button>
                        ) : req.read === false &&
                          req.message ===
                            "I need your Feedback to Accomplished a report." ? (
                          <div className="mt-3">
                            <textarea
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="3"
                              placeholder="Enter your Feedback..."
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                              value={values[req.RequestID] || ""}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  [req.RequestID]: e.target.value,
                                })
                              }
                            />
<<<<<<< HEAD
                            <button
                              onClick={() => acceptVerification(req, req._id)}
                              disabled={
                                !values[req.RequestID] || clickedRows.has(req)
                              }
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-[10px] font-black uppercase py-2 rounded-lg transition-all"
=======

                            <button
                              onClick={() => acceptVerification(req, req._id)}
                              type="button"
                              className={`mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10
    ${clickedRows.has(req) ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={
                                !values[req.RequestID] || clickedRows.has(req)
                              } // Disable if feedback is empty or if it's already clicked
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
                            >
                              {loading === req ? (
                                <LoadingSpinner />
                              ) : (
                                "Send Feedback"
                              )}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))
            ) : (
<<<<<<< HEAD
              <div className="py-10 text-center">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest italic">
                  No New Notifications
                </p>
              </div>
=======
              <p>No Message Found!</p>
>>>>>>> 90a7cad9f5fbbd108c3189d961894e853d157fae
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
