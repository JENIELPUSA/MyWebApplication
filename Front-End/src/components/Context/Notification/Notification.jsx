import React, {
  useState,
  useEffect,
  useContext,
  useRef,
  useCallback,
} from "react";
import { FaBell } from "react-icons/fa";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";
import { MessageDisplayContext } from "../MessageContext/DisplayMessgae";
import { AuthContext } from "../AuthContext";
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
  const { role, authToken } = useContext(AuthContext);
  const { triggerSendEmail, setToAdmin } = useContext(PostEmailContext);
  const { setSendPatch, setSendMsg, setSendPost } =
    useContext(MessagePOSTcontext);
  const {
    AdminMsg,
    request,
    fetchRequestData,
    CountSpecificData,
    addDescription,
  } = useContext(RequestDisplayContext);
  const { ToAdminCount, ToAdmin, msg, msgcount, fetchDisplayMessgae } =
    useContext(MessageDisplayContext);
  const [loading, setLoading] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());
  const hasUnread = msg?.some((message) => message.readonUser === false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { setupdateSched } = useContext(AddAssignContext);

  const [values, setValues] = useState({
    feedback: "",
  });

  //para sa soket io mag update ang badges kahit hindi kailangan e refresh ang buong component
  useEffect(() => {
    // WebSocket Connection
    socket.on("connect", () => {
      console.log("Connected to WebSocket server:", socket.id);
    });

    //dito siya automatic na makaka recieve
    const updateNotifications = () => {
      fetchDisplayMessgae(); // Load new messages
      fetchRequestData(); // Update related requests
    };

    // socket listeners
    const events = ["adminNotification", "SMSNotification"];

    events.forEach((event) => socket.on(event, updateNotifications));

    // importante ito para masarado ang socket io prvent a data leak
    return () => {
      socket.off("connect");
      events.forEach((event) => socket.off(event, updateNotifications));
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
      }
    }
  }, [isNotificationOpen, role, msg, hasUnread, ToAdmin]);

  const updateRequest = async ({ url, updateData, socketEvent, msgId }) => {
    try {
      const response = await axiosInstance.patch(url, updateData, {
        withCredentials: true,
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
      console.log("Operation completed for RequestID:", request);
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
  const getSpecificID = async (requestID) => {
    if (!authToken) return;
    try {
      const response = await axiosInstance.get(
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
          message: `The assigned request in ${requestInfo.Department} / ${requestInfo.laboratoryName} has been completed!`,
          Status: "Accepted",
          role: "Admin",
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

  const acceptVerification = useCallback(
    async (req, msgId) => {
      if (loading) return;
      setLoading(req);
      const requestID = req.RequestID;

      try {
        setupdateSched(requestID);
        await getSpecificID(requestID); // optionally await

        const feedbackData = {
          Status: "Success",
          feedback: values[requestID] || "", // ✅ Use per-request feedback
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
            socketEvent: "newRequest",
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
  );

  const updatesendMsg = useCallback(
    async (data) => {
      const feedbackDataMsg = {
        read: true,
      };
      await updateRequest({
        url: `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MessageRequest/${data}`,
        updateData: feedbackDataMsg,
        withCredentials: true, // Sending an object instead of just the text
        socketEvent: "newRequest",
      });
    },
    [updateRequest]
  );

  const handlesend = (data) => {
    setToAdmin(data);
    const message = `Hello Admin, the assigned request has been completed.\nDetails:\nRequest Reference: ${data.Ref}\nSend By: Technician`;
    triggerSendEmail(message);
  };

  const acceptRemarks = async (data) => {
    if (loading) return;
    setLoading(data);
    try {
      await updateRequest({
        url: `${
          import.meta.env.VITE_REACT_APP_BACKEND_BASEURL
        }/api/v1/MaintenanceRequest/${data.RequestID}`,
        updateData: { remarksread: true },
        socketEvent: "newRequest",
        msgId: data._id,
      });
    } catch (error) {
      console.error("Error occurred during operation:", error);
    } finally {
      setLoading(null); // Reset loading state after operation completes
      console.log("Resetting loading state.");
    }
  };

  async function ReadOnUpdate(Id) {
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

      {(role === "Admin" && AdminMsg) ||
      ToAdminCount.length > 0 ||
      (role === "Technician" && CountSpecificData > 0) ||
      (role === "User" && msgcount > 0) ? (
        <span className="absolute -top-1 -right-2 bg-red-500 text-white text-xs rounded-full px-2">
          {role === "Admin" && ToAdminCount
            ? AdminMsg + ToAdminCount.length
            : role === "Technician"
            ? CountSpecificData
            : msgcount}
        </span>
      ) : null}
      <AnimatePresence
        //Purpose nito ay para once matapos nang ma open ang bill ay mag refresh siya
        onExitComplete={() => {
          fetchDisplayMessgae();
        }}
      >
        {isNotificationOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
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
                    </div>
                  ))}
              </>
            ) : (role === "Technician" && msgcount > 0) || role === "User" ? (
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
                              value={values[req.RequestID] || ""}
                              onChange={(e) =>
                                setValues({
                                  ...values,
                                  [req.RequestID]: e.target.value,
                                })
                              }
                            />

                            <button
                              onClick={() => acceptVerification(req, req._id)}
                              type="button"
                              className={`mt-3 flex items-center justify-center rounded-full w-full bg-primary px-6 pb-2 pt-2.5 text-xs font-medium uppercase leading-normal text-white shadow-primary-3 transition duration-150 ease-in-out hover:bg-primary-accent-300 focus:outline-none h-10
    ${clickedRows.has(req) ? "opacity-50 cursor-not-allowed" : ""}`}
                              disabled={
                                !values[req.RequestID] || clickedRows.has(req)
                              } // Disable if feedback is empty or if it's already clicked
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
              <p>No Message Found!</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
