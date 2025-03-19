import React, { useState, useEffect, useContext } from "react";
import { FaBell } from "react-icons/fa";
import { io } from "socket.io-client";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";
import { MessageDisplayContext } from "../MessageContext/DisplayMessgae";
import { AuthContext } from "../AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";

import socket from "../../../../../Back-End/Utils/socket";

const Notification = ({ toggleTechnicianModal }) => {
  const { role, authToken } = useContext(AuthContext);
  const { setSendPatch, setSendMsg, setSendPost } =
    useContext(MessagePOSTcontext);
  const {
    fetchRequestData,
    unread,
    fetchunreadRequestData,
    unreadcount,
    CountSpecificData,
  } = useContext(RequestDisplayContext);
  const { msg, msgcount, fetchDisplayMessgae } = useContext(
    MessageDisplayContext
  );

  const [isNotificationOpen, setIsNotificationOpen] = useState(false);

  const [values, setValues] = useState({
    feedback: ""
  });

  useEffect(() => {
    // ✅ WebSocket Connection
    socket.on("connect", () => {
      console.log("🟢 Connected to WebSocket server:", socket.id);
    });
  
    const updateNotifications = () => {
      fetchunreadRequestData();
      fetchDisplayMessgae();
      fetchRequestData();
    };
  
    // ✅ WebSocket Event Listeners
    const events = ["adminNotification", "SMSNotification", "newNotificationSent"];
    events.forEach(event => socket.on(event, updateNotifications));
  
    // ✅ Cleanup function to remove event listeners when component unmounts
    return () => {
      socket.off("connect");
      events.forEach(event => socket.off(event, updateNotifications));
    };
  }, [fetchRequestData]);
  
  const updateRequest = async ({ url, updateData, socketEvent, msgId }) => {
    try {
      const response = await axios.patch(url, updateData, {
        headers: { Authorization: `Bearer ${authToken}` },
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
      } else {
        toast.error("Failed to update request.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An unexpected error occurred."
      );
    }
  };




  const onSelectMessage =async(request, message) => {
    await setSendPatch(request);
    await setSendMsg(message);
    await fetchDisplayMessgae();
    await fetchRequestData();
  };

  const acceptVerification = async (req, msgId) => {
    
    const requestID=req.RequestID
    const feedbackData = { Status: "Success", feedback: values.feedback };
    const feedbackDataMsg = { read: true };
   
    await updateRequest({
      url: `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${requestID}`,
      updateData: feedbackData,
      socketEvent: "newRequest",
    });
  
    await updateRequest({
      url: `http://127.0.0.1:3000/api/v1/MessageRequest/${msgId}`,
      updateData: feedbackDataMsg,
      socketEvent: "newRequest",
    });
  
    setValues({ feedback: "" });
  
    // Manual refresh ng notification data
    fetchunreadRequestData();
    fetchDisplayMessgae();
    fetchRequestData();
  };
  
  
  const updatesendMsg = async (data) => {

    const feedbackDataMsg = {
      read:true
    };
    await updateRequest({
      url: `http://127.0.0.1:3000/api/v1/MessageRequest/${data}`,
      updateData: feedbackDataMsg, // Sending an object instead of just the text
      socketEvent: "newRequest",
    });
  };

  const acceptRemarks = async (data) => {
    await updateRequest({
      url: `http://127.0.0.1:3000/api/v1/MaintenanceRequest/${data.RequestID}`,
      updateData: { remarksread: true },
      socketEvent: "newRequest",
      msgId: data._id,
    });
  };

  return (
    <div className="relative text-white cursor-pointer">
      <FaBell
        className="w-6 h-6"
        onClick={() => setIsNotificationOpen(!isNotificationOpen)}
      />

      {(role === "admin" && unreadcount > 0) ||
      (role === "Technician" && CountSpecificData > 0) ||
      (role === "user" && msg?.length > 0) ? (
        <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full px-2">
          {role === "admin"
            ? unreadcount
            : role === "Technician"
            ? CountSpecificData
            : msg?.length}
        </span>
      ) : null}

      {isNotificationOpen && (
        <div className="absolute bg-white/30 backdrop-blur-md shadow-lg rounded-md w-80 top-full right-0 mt-4 p-4 text-black border border-white/20 max-h-80 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 dark:scrollbar-thumb-gray-600 dark:scrollbar-track-gray-800">
          {role === "admin" && unread?.length > 0 ? (
            [...unread]
              .reverse()
              .slice(0, 10) // Limits to 5 messages
              .map((req, index) => (
                <div key={index} className="mb-2">
                  <h1 className="text-lg font-bold text-gray-700">
                    {req.Department} / {req.laboratoryName}
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
                  <p className="text-gray-500">
                    has a Maintenance Request / Ref#:{" "}
                    <a
                      onClick={() => toggleTechnicianModal(req)}
                      className="text-blue-400 hover:underline"
                    >
                      {req.Ref || "Unknown Request"}
                    </a>
                  </p>
                  {index !== unread.length - 1 && (
                    <hr className="my-2 border-gray-400/50" />
                  )}
                </div>
              ))
          ) : (role === "Technician" && msgcount > 0) ||
            (role === "user" && msgcount > 0) ? (
            [...msg].reverse().map((req, index) => (
              <div key={index} className="mb-2">
                {/* Technician Validation */}
                {role === "Technician" && (
                  <div>
                    {/* Message for Technicians */}
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
                          Admin has assigned you to troubleshoot equipment in{" "}
                          {req.laboratoryName} / Ref#: {req.Ref}
                        </p>
                      </>
                    )}

                    {/* Accept Button for Pending Status */}
                    {req.message ===
                      "Admin Already Assign Technician to your Laboratory!" &&
                      req.Status === "Pending" && (
                        <button
                          onClick={() =>
                            onSelectMessage(req.RequestID, req._id)
                          }
                          type="button"
                          className="mt-3 inline-block rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                        >
                          Accept
                        </button>
                      )}
                  </div>
                )}

                {/* User Validation */}
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
                    {/* Message for Users */}
                    <p className="text-gray-500 font-bold">
                      {req.message}
                    </p>{" "}
                    {req.read === false &&
                    req.message ===
                      "I need your verification to approve a remark from the technician." ? (
                      <button
                        onClick={() => acceptRemarks(req)}
                        type="button"
                        className="mt-3 inline-block rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                      >
                        Approved
                      </button>
                    ) :req.read === false && req.message === "I need your Feedback to Accomplished a report." ? (
                      <div className="mt-3">
                        {/* Textarea for Remarks */}
                        <textarea
                          className="w-full p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                          rows="3"
                          placeholder="Enter your Feedback..."
                          value={values.feedback || ""}
                          onChange={(e) =>
                            setValues({ ...values, feedback: e.target.value })
                          }
                        ></textarea>
                    
                        {/* Approval Button */}
                        <button
                          onClick={() => acceptVerification(req,req._id)}
                          type="button"
                          className="mt-3 inline-block rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 hover:shadow-primary-2 focus:bg-primary-accent-300 focus:shadow-primary-2 focus:outline-none focus:ring-0 active:bg-primary-600 active:shadow-primary-2 motion-reduce:transition-none dark:shadow-black/30 dark:hover:shadow-dark-strong dark:focus:shadow-dark-strong dark:active:shadow-dark-strong"
                        >
                          Send FeedBack
                        </button>
                      </div>
                    )  : null}
                  </div>
                )}
              </div>
            ))
          ) : (
            <p>No Message Found!</p>
          )}
        </div>
      )}
    </div>
  );
};

export default Notification;
