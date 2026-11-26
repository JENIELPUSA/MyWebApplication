// src/components/Context/MaintenanceRequest/MaintenanceRequestContext.jsx
import React, { createContext, useState, useEffect, useContext } from "react";
import { AuthContext } from "../AuthContext";
import StatusModal from "../../components/ReusableComponent/SuccessandFailedModal";
import axios from "axios";
import axiosInstance from "../../components/ReusableComponent/axiosInstance";
import { MessagePOSTcontext } from "../MessageContext/POSTmessage";

export const MaintenanceRequestContext = createContext();

const BASE_URL = import.meta.env.VITE_REACT_APP_BACKEND_BASEURL || "";

export const MaintenanceRequestProvider = ({ children }) => {
  const { authToken, role, userId } = useContext(AuthContext);
  const { fetchDisplayMessage } = useContext(MessagePOSTcontext);

  const [request, setRequest] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [unread, setunread] = useState([]);
  const [isNewData, setNewData] = useState();
  const [requestPerPages, setRequestPerPage] = useState(6);
  const [unreadcount, setcountunread] = useState([0]);
  const [CountSpecificData, setCountSpecificData] = useState([]);
  const [AdminMsg, setAdminMsg] = useState([]);
  const [view, setView] = useState();
  const [showModal, setShowModal] = useState(false);
  const [modalStatus, setModalStatus] = useState("success");
  const [customError, setCustomError] = useState("");

  // ========== TECHNICIAN TASK & SCHEDULE STATES ==========
  const [technicianTasks, setTechnicianTasks] = useState([]);
  const [technicianTaskSummary, setTechnicianTaskSummary] = useState(null);
  const [technicianTaskLoading, setTechnicianTaskLoading] = useState(false);
  const [technicianTaskError, setTechnicianTaskError] = useState(null);
  const [technicianSchedule, setTechnicianSchedule] = useState([]);

  const getAuthConfig = (extraConfig = {}) => ({
    withCredentials: true,
    ...extraConfig,
    headers: {
      ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      ...(extraConfig.headers || {}),
    },
  });

  useEffect(() => {
    if (!authToken) {
      setRequest([]);
      setTechnicianSchedule([]);
      setTechnicianTasks([]);
      setLoading(false);
      return;
    }

    fetchRequestData();
    fetchSchedule();
    fetchTechnicianTasks();
  }, [authToken, role, userId]);

  useEffect(() => {
    if (customError) {
      const timer = setTimeout(() => {
        setCustomError(null);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [customError]);

  const fetchRequestData = async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/api/v1/MaintenanceRequest`,
        getAuthConfig(),
      );

      const requestData = Array.isArray(res?.data?.data) ? res.data.data : [];
      setView(requestData);

      if (role === "Admin") {
        const specificAdminMsg = requestData.filter(
          (msg) => msg?.read === false,
        );
        setRequest(requestData);
        setAdminMsg(specificAdminMsg.length);
      } else if (role === "Technician" || role === "User") {
        const specificMessages = requestData.filter(
          (msg) => msg.UserId === userId,
        );
        const CountSpecifiData = requestData.filter(
          (msg) => msg.Status === "Pending" && msg.UserId === userId,
        );
        setCountSpecificData(CountSpecifiData);
        setRequest(specificMessages);
      } else {
        setRequest(requestData);
      }
    } catch (err) {
      console.error("Failed to fetch maintenance requests:", err);
      setError(err?.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  const fetchSchedule = async () => {
    if (!authToken) return;
    setLoading(true);
    setError(null);

    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/api/v1/MaintenanceRequest/DisplayCalendarSchedules`,
        getAuthConfig(),
      );

      const scheduleData = Array.isArray(res?.data?.data) ? res.data.data : [];
      setView(scheduleData);
      setTechnicianSchedule(scheduleData); // Inayos mula sa `setSchdeule` na nagka-ReferenceError
    } catch (err) {
      console.error("Failed to fetch schedule:", err);
      setError(err?.response?.data?.message || "Failed to fetch data");
    } finally {
      setLoading(false);
    }
  };

  // ========== TECHNICIAN TASK FUNCTIONS ==========
  const fetchTechnicianTasks = async () => {
    if (!authToken) return;
    setTechnicianTaskLoading(true);
    setTechnicianTaskError(null);

    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/api/v1/MaintenanceRequest/MaintenanceTask`,
        getAuthConfig(),
      );

      const data = res?.data?.data || {};
      fetchDisplayMessage();
      setTechnicianTasks(Array.isArray(data.technicians) ? data.technicians : []);
      setTechnicianTaskSummary(data.summary || null);
    } catch (err) {
      console.error("Failed to fetch technician tasks:", err);
      setTechnicianTaskError(
        err?.response?.data?.message || "Failed to fetch technician tasks",
      );
      setTechnicianTasks([]);
      setTechnicianTaskSummary(null);
    } finally {
      setTechnicianTaskLoading(false);
    }
  };

  const refreshTechnicianTasks = async () => {
    await fetchTechnicianTasks();
  };

  const fetchTechnicianSchedule = async () => {
    if (!authToken) return;

    setTechnicianTaskLoading(true);
    setTechnicianTaskError(null);

    try {
      const res = await axiosInstance.get(
        `${BASE_URL}/api/v1/MaintenanceRequest/DisplayCalendarSchedules`,
        getAuthConfig(),
      );

      const scheduleData = Array.isArray(res?.data?.data) ? res.data.data : [];
      setTechnicianSchedule(scheduleData);
    } catch (err) {
      console.error("Error fetching technician schedule:", err);
      setTechnicianTaskError(
        err?.response?.data?.message || "Failed to fetch technician schedule.",
      );
    } finally {
      setTechnicianTaskLoading(false);
    }
  };
  // ================================================

  const addDescription = async (formValues) => {
    try {

      console.log("formValues",formValues)
      const payload = {
        Description: formValues.Description,
        Equipments: formValues.Equipments,
        Department: formValues.Department,
        Laboratory: formValues.Laboratory,
        Status: "Pending",

        DepartmentHead: formValues.DepartmentHead?.trim() || "",
        ContactPerson: formValues.ContactPerson?.trim() || "",
        ContactEmail: formValues.ContactEmail?.trim().toLowerCase() || "",
        ContactPhone: formValues.ContactPhone?.trim() || "",
        location_areas: formValues.location_areas?.trim() || "",
        type_works: formValues.type_works?.trim() || "",
        Printed_name_requestor:
          formValues.Printed_name_requestor?.trim() || "",
        isConfirmed: false,
      };

      const response = await axiosInstance.post(
        `${BASE_URL}/api/v1/MaintenanceRequest`,
        payload,
        getAuthConfig(),
      );

      if (response.data && response.data.status === "success") {
        fetchRequestData();
        fetchDisplayMessage();
        setModalStatus("success");
        setShowModal(true);
        setNewData(response.data.data);
        return { success: true, data: response?.data.data };
      }

      setModalStatus("failed");
      setShowModal(true);
      return { success: false, error: "Unexpected response from server." };
    } catch (err) {
      const message =
        err?.response?.data && typeof err.response.data === "object"
          ? err.response.data.message ||
          err.response.data.error ||
          "Something went wrong."
          : typeof err?.response?.data === "string"
            ? err.response.data
            : err?.request
              ? "No response from the server."
              : err?.message || "Unexpected error occurred.";

      setCustomError(message);
      return { success: false, error: message };
    }
  };

  const downloadPMSreport = async (laboratoryId, title) => {
    if (!laboratoryId) {
      console.error("Laboratory ID is required");
      return;
    }

    const endpointMap = {
      "MAINTENANCE SCHEDULE": "DisplayRequestMaintenanceActvity",
      "MAINTENANCE RECORD": "DisplayMaintenanceHistory",
      "TOOLS RECORD": "DisplayToolsandMaintenance",
      "SCHEDULED REPAIR": "DisplayMaintenanceLogs",
      "UNSCHEDULED REPAIR": "DisplayUnscheduledRepair",
    };

    const urlPath = endpointMap[title];

    if (!urlPath) {
      alert("Invalid report type selected.");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.get(
        `${BASE_URL}/api/v1/MaintenanceRequest/${urlPath}?laboratory=${laboratoryId}`,
        getAuthConfig({ responseType: "blob" }),
      );

      const blob = new Blob([response.data], { type: "application/pdf" });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = url;
      const filename = `${title.replace(/\s+/g, "_")}_${Date.now()}.pdf`;
      link.setAttribute("download", filename);

      document.body.appendChild(link);
      link.click();

      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("PDF Download Error:", err);
      alert(
        "Dili ma-download ang PDF. Siguruha nga naay data para niini nga laboratory.",
      );
    } finally {
      setLoading(false);
    }
  };

  const UpdateAssignTechnician = async ({
    technicianId,
    RequestId,
    status,
    remarks,
    LaboratoryEnchargeId,
    feedback,
    action,
    SetSchedule,
    levelprioritized,
    MessageId = null,
  }) => {
    try {
      if (status === "Approved") {
        if (
          SetSchedule === undefined ||
          SetSchedule === null ||
          String(SetSchedule).trim() === ""
        ) {
          const message = "Please set a schedule before approving this request.";
          setModalStatus("failed");
          setShowModal(true);
          setCustomError(message);
          return { success: false, error: message };
        }

        const parsed = new Date(SetSchedule);
        if (isNaN(parsed.getTime())) {
          const message =
            "Invalid schedule date. Please provide a valid date.";
          setModalStatus("failed");
          setShowModal(true);
          setCustomError(message);
          return { success: false, error: message };
        }
      }

      if (
        levelprioritized !== undefined &&
        levelprioritized !== null &&
        !["Low", "Medium", "High"].includes(levelprioritized)
      ) {
        const message =
          "Invalid priority level. Allowed values: Low, Medium, High.";
        setModalStatus("failed");
        setShowModal(true);
        setCustomError(message);
        return { success: false, error: message };
      }

      const payload = {
        status,
        remarks,
        LaboratoryEnchargeId,
        feedback,
        action,
        technicianId,
        ...(MessageId ? { MessageId } : {}),
        ...(SetSchedule !== undefined &&
          SetSchedule !== null &&
          String(SetSchedule).trim() !== ""
          ? { SetSchedule }
          : {}),
        ...(levelprioritized !== undefined &&
          levelprioritized !== null &&
          String(levelprioritized).trim() !== ""
          ? { levelprioritized }
          : {}),
      };

      const response = await axios.patch(
        `${BASE_URL}/api/v1/MaintenanceRequest/updateDataAssignTechnician/${RequestId}`,
        payload,
        getAuthConfig({
          headers: { "Content-Type": "application/json" },
        }),
      );

      if (response.data?.success || response.data?.status === "success") {
        const updatedData = response.data.data;

        fetchRequestData();
        fetchDisplayMessage();
        fetchTechnicianTasks();
        fetchTechnicianSchedule();

        setModalStatus("success");
        setShowModal(true);

        setRequest((prev) =>
          Array.isArray(prev)
            ? prev.map((item) => (item._id === RequestId ? updatedData : item))
            : prev,
        );

        setView((prev) =>
          Array.isArray(prev)
            ? prev.map((item) => (item._id === RequestId ? updatedData : item))
            : prev,
        );

        return { success: true, data: updatedData };
      }

      const message = response.data?.message || "Failed to assign technician.";
      setModalStatus("failed");
      setShowModal(true);
      setCustomError(message);
      return { success: false, error: message };
    } catch (err) {
      console.error("UpdateAssignTechnician Error:", err.response?.data || err);
      const message =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        err?.message ||
        "Unexpected error occurred.";

      setModalStatus("failed");
      setShowModal(true);
      setCustomError(message);
      return { success: false, error: message };
    }
  };

  return (
    <MaintenanceRequestContext.Provider
      value={{
        setCountSpecificData,
        setAdminMsg,
        customError,
        view,
        isNewData,
        addDescription,
        AdminMsg,
        CountSpecificData,
        request,
        loading,
        error,
        requestPerPages,
        setRequestPerPage,
        currentPage,
        setCurrentPage,
        setRequest,
        fetchRequestData,
        fetchSchedule,
        unread,
        unreadcount,
        downloadPMSreport,
        UpdateAssignTechnician,
        // ========== TECHNICIAN TASK & SCHEDULE EXPORTS ==========
        technicianTasks,
        technicianTaskSummary,
        technicianTaskLoading,
        technicianTaskError,
        fetchTechnicianTasks,
        refreshTechnicianTasks,
        technicianSchedule,
        fetchTechnicianSchedule,
        // ======================================================
      }}
    >
      {children}

      <StatusModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        status={modalStatus}
      />
    </MaintenanceRequestContext.Provider>
  );
};