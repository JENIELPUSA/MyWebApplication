import React, { useState, useEffect, useContext, useCallback } from "react";
import { FaBell } from "react-icons/fa";
import { RequestDisplayContext } from "../MaintenanceRequest/DisplayRequest";
import { MessageDisplayContext } from "../MessageContext/DisplayMessgae";
import { AuthContext } from "../AuthContext";
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

  const [loading, setLoading] = useState(null);
  const [clickedRows, setClickedRows] = useState(new Set());
  const hasUnread = msg?.some((message) => message.readonUser === false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const { setupdateSched } = useContext(AddAssignContext);
  const [CountBadge, setCountBadge] = useState(0);
  const [TechBadge, setTechBadge] = useState(0);

  const [values, setValues] = useState({
    feedback: "",
  });

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
        );
        if (index !== -1) {
          const updated = [...prev];
          updated[index] = { ...updated[index], ...data };
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
      }
    }
  }, [isNotificationOpen, role, msg, hasUnread, ToAdmin]);

  const updateRequest = async ({ url, updateData, socketEvent, msgId }) => {
    try {
      const response = await axiosInstance.patch(url, updateData, {
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

  const getSpecificID = async (requestID) => {
    if (!authToken) return;
    try {
      const response = await axiosInstance.get(
        `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/getbyId/${requestID}`,
        { headers: { Authorization: `Bearer ${authToken}` } },
      );
      if (response.data?.status === "success") {
        const requestInfo = response.data.data[0];
        setSendPost({
          ...response.data,
          message: `The assigned request in ${requestInfo.Department} / ${requestInfo.laboratoryName} has been completed!`,
          Status: "Accepted",
          role: "Admin",
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const acceptVerification = useCallback(
    async (req, msgId) => {
      if (loading) return;
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
  );

  const updatesendMsg = useCallback(
    async (data) => {
      await updateRequest({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MessageRequest/${data}`,
        updateData: { read: true },
        socketEvent: "RequestMaintenance",
      });
    },
    [updateRequest],
  );

  const handlesend = (data) => {
    setToAdmin(data);
    triggerSendEmail(`Hello Admin, completed.\nRef: ${data?.Ref}`);
  };

  const acceptRemarks = async (data) => {
    if (loading) return;
    setLoading(data);
    try {
      await updateRequest({
        url: `${import.meta.env.VITE_REACT_APP_BACKEND_BASEURL}/api/v1/MaintenanceRequest/${data.RequestID}`,
        updateData: { remarksread: true },
        socketEvent: "newRequest",
        msgId: data._id,
      });
    } finally {
      setLoading(null);
    }
  };

  async function ReadOnUpdate(Id) {
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
        {isNotificationOpen && (
          <motion.div
            initial="hidden"
            animate="visible"
            exit="exit"
            variants={dropdownVariants}
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
                    </div>
                  ))}
              </>
            ) : (role === "Technician" && msgcount > 0) || role === "User" ? (
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
                              disabled={
                                !values[req.RequestID] || clickedRows.has(req)
                              }
                              className="w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 text-[10px] font-black uppercase py-2 rounded-lg transition-all"
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
              <div className="py-10 text-center">
                <p className="text-blue-300 text-xs font-bold uppercase tracking-widest italic">
                  No New Notifications
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Notification;
