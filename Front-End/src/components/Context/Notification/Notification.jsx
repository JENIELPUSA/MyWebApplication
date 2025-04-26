import React, { useState, useEffect, useContext,useRef } from "react";
import { FaBell } from "react-icons/fa";
import { io } from "socket.io-client";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";
import { MessageDisplayContext } from "../MessageContext/DisplayMessgae";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import LoadingSpinner from "../../ReusableComponent/loadingSpiner";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";
import { motion, AnimatePresence,useScroll,useTransform } from "framer-motion";
import socket from "../../../../../Back-End/Utils/socket";
import { PostEmailContext } from "../EmailContext/SendNotificationContext";
import { AddAssignContext } from "../AssignContext/AddAssignContext";
const Notification = ({ toggleTechnicianModal }) => {
  const { role, authToken } = useContext(AuthContext);
const {triggerSendEmail,setToAdmin}=useContext(PostEmailContext)
  const { setSendPatch, setSendMsg, setSendPost } =
    useContext(MessagePOSTcontext);
  const { AdminMsg, request, fetchRequestData, CountSpecificData,addDescription } = useContext(
    RequestDisplayContext
  );
  const { ToAdminCount, ToAdmin, msg, msgcount, fetchDisplayMessgae } =
    useContext(MessageDisplayContext);
  const [loading, setLoading] = useState(false);
  const hasUnread = msg?.some((message) => message.readonUser === false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const {setupdateSched}=useContext(AddAssignContext)


  const [values, setValues] = useState({
    feedback: "",
  });

  useEffect(() => {
    //  WebSocket Connection
    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket server:", socket.id);
    });

    
    const updateNotifications = () => {
      fetchDisplayMessgae();
      fetchRequestData();
    };

    if (isNotificationOpen && role === "user" && msg.length > 0 && hasUnread) {
      const allLaboratoryIds = msg?.map((item) => item._id);
      ReadOnUpdate(allLaboratoryIds);
      fetchDisplayMessgae();
    } else if (isNotificationOpen && role === "admin") {
      const allLaboratoryIds = ToAdmin?.map((item) => item._id);
      ReadOnUpdate(allLaboratoryIds);
      fetchDisplayMessgae();
    }

    //  WebSocket Event Listeners
    const events = [
      "adminNotification",
      "SMSNotification",
      "newNotificationSent",
    ];
    events.forEach((event) => socket.on(event, updateNotifications));

    // Cleanup function to remove event listeners when component unmounts
    return () => {
      socket.off("connect");
      events.forEach((event) => socket.off(event, updateNotifications));
    };
  }, [fetchRequestData, isNotificationOpen, role, msg, hasUnread]);

  
   

  
  const updateRequest = async ({ url, updateData, socketEvent, msgId }) => {
    try {
      const response = await axios.patch(url, updateData, {
        withCredentials: true,headers: { Authorization: `Bearer ${authToken}` },
      });

      if (response.status === 200 || response.data.status === "success") {
        if (socketEvent) {
          socket.emit(socketEvent, {
            message: "A new update has been made!",
            data: response.data.data, // Pass updated data
          });
        }

        if (msgId) {
          await updatesendMsg(msgId);
        }

        await fetchRequestData();
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };

  const onSelectMessage = async (request, message) => {
    await setSendPatch(request);
    await setSendMsg(message);
    await fetchDisplayMessgae();
    await fetchRequestData();
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
  const getSpecificID = async (requestID) => {
    if (!authToken) return;
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/getbyId/${requestID}`,
        { withCredentials: true ,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data?.status === "success") {
        const result = response.data;
        //ibig sabihin nito isinasama ang message sa result
        setSendPost({
          ...result,
          message: "The assigned request has been completed!",
          Status: "Accepted",
          role: "admin",
        });
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
    }
  };

  const acceptVerification = async (req, msgId) => {
    const requestID = req.RequestID;
    setupdateSched(req.RequestID);
    getSpecificID(requestID);
    const feedbackData = { Status: "Success", feedback: values.feedback,DateTimeAccomplish:new Date() };
    const feedbackDataMsg = { read: true };

    await updateRequest({
      url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${requestID}`,
      updateData: feedbackData,
      withCredentials: true,
      socketEvent: "newRequest",
    });

    await updateRequest({
      url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${msgId}`,
      updateData: feedbackDataMsg,
      withCredentials: true,
      socketEvent: "newRequest",
    });
    fetchDisplayMessgae();
    fetchRequestData();
  };

  const updatesendMsg = async (data) => {
    const feedbackDataMsg = {
      read: true,
    };
    await updateRequest({
      url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${data}`,
      updateData: feedbackDataMsg,
      withCredentials: true , // Sending an object instead of just the text
      socketEvent: "newRequest",
    });
  };


  const handlesend=(data)=>{
    setToAdmin(data);
    const message = `Hello Admin, the assigned request has been completed.\nDetails:\nRequest Reference: ${data.Ref}\nSend By: Technician`;
    triggerSendEmail(message)
  }

  
  const acceptRemarks = async (data) => {
   
    await updateRequest({
      url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${data.RequestID}`,
      updateData: { remarksread: true },
      socketEvent: "newRequest",
      msgId: data._id,
      
    });


  
  };

  async function ReadOnUpdate(Id) {
    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest`,
        { laboratoryIds: Id, readonUpdate: true }, //Pasa bilang JSON body
        { withCredentials: true ,
          headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.data?.status === "success") {
        toast.success(
          `Updated ${response.data.updatedCount} messages successfully!`
        );
      }
    } catch (error) {
      console.error("Error updating messages:", error);
      toast.error(error.response?.data?.message || "Error submitting request.");
    }
  }
  //purpose nito para makapag implement ako ng loading...
  const handleAccept = async (requestID, id) => {
    setLoading(true); // Show "Processing..."
    try {
      await onSelectMessage(requestID, id); // Call the function
    } finally {
      setLoading(false); // Reset after operation completes
    }
  };
  //purpose nito para makapag implement ako ng loading...
  const acceptaproved = async (req) => {
    setLoading(true);
    try {
      await acceptRemarks(req); // Call the function
    } finally {
      setLoading(false); // Reset after operation completes
    }
  };

  //purpose nito para makapag implement ako ng loading...
  const acceptfeedback = async (data, accpetID) => {
    setLoading(true);
    console.log("para sa Data",data)
    console.log("para sa Datas",accpetID)
    try {
      await acceptVerification(data, accpetID); // Call the function
      handlesend(data)
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative text-white cursor-pointer">
      <FaBell
        className="w-6 h-6"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      />

      {(role === "admin" && AdminMsg) ||
      ToAdminCount.length > 0 ||
      (role === "Technician" && CountSpecificData > 0) ||
      (role === "user" && msgcount > 0) ? (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2">
          {role === "admin" && ToAdminCount
            ? AdminMsg + ToAdminCount.length
            : role === "Technician"
            ? CountSpecificData
            : msgcount}
        </span>
      ) : null}
      <AnimatePresence>
        {isNotificationOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
            className="absolute bg-white/30 backdrop-blur-md shadow-lg rounded-md text-align: justify  xs:w-60 lg:w-80 top-full right-0 mt-4 p-4 text-black border border-white/20 h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800"
          >
            {role === "admin" &&
            (request?.length > 0 || ToAdmin?.length > 0) ? (
              <>
                {/*Merge and Sort All Notifications */}
                {[...request, ...ToAdmin]
                  .filter((item) => item?.DateTime) // Remove undefined/null DateTime
                  .sort((a, b) => new Date(b.DateTime) - new Date(a.DateTime)) // Sort by latest DateTime
                  .slice(0, 30) // Get only the latest 30
                  .map((req, index) => (
                    <div key={index} className="mb-2">
                      <h1 className="text-lg font-bold text-gray-700">
                        {req.Department
                          ? `${req.Department} / ${req.laboratoryName}`
                          : req.laboratoryName}
                      </h1>
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

                      {/*Ternary Operator Instead of if-else */}
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
                        {/* Default to message */}
                      </p>

                      {index !== request.length - 1 && (
                        <hr className="my-2 border-gray-400/50" />
                      )}
                    </div>
                  ))}
              </>
            ) : (role === "Technician" && msgcount > 0) || role === "user" ? (
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
                                handleAccept(req.RequestID, req._id)
                              }
                              type="button"
                              className="mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10"
                              disabled={loading}
                            >
                              {loading ? <LoadingSpinner /> : "Accept"}
                            </button>
                          )}
                      </div>
                    )}

                    {/* User View */}
                    {role === "user" && (
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

                        {/* Approval & Feedback Buttons */}
                        {req.read === false &&
                        req.message ===
                          "I need your verification to approve a remark from the technician." ? (
                          <button
                            onClick={() => acceptaproved(req)}
                            type="button"
                            className="mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10"
                          >
                            {loading ? <LoadingSpinner /> : "Approve"}
                          </button>
                        ) : req.read === false &&
                          req.message ===
                            "I need your Feedback to Accomplished a report." ? (
                          <div className="mt-3">
                            <textarea
                              className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                              rows="3"
                              placeholder="Enter your Feedback..."
                              value={values.feedback || ""}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  feedback: e.target.value,
                                })
                              }
                            ></textarea>

                            <button
                              onClick={() => acceptfeedback(req, req._id)}
                              type="button"
                              className="mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10"
                            >
                              {loading ? <LoadingSpinner /> : "Send Feedback"}
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )}
                  </div>
                ))
            ) : (
              <p>No Message Found!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
